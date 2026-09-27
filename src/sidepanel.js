import { limitFor, overLimit, splitPosts, xLength } from "./xlength.js";
import { VOICE_FIELDS, SYNC_ITEM_LIMIT, DEFAULT_MODEL, getSettings } from "./settings.js";

const $ = (id) => document.getElementById(id);

function setStatus(id, text, error = false) {
  $(id).textContent = text;
  $(id).classList.toggle("error", error);
}

// Tabs
document.querySelectorAll("nav button").forEach((btn) =>
  btn.addEventListener("click", () => {
    document.querySelectorAll("nav button, .tab").forEach((el) => el.classList.remove("active"));
    btn.classList.add("active");
    $(btn.dataset.tab).classList.add("active");
  }),
);

// Write tab
let templates = [];
chrome.runtime.sendMessage({ type: "xw:templates" }, (list) => {
  templates = list;
  $("template").innerHTML = list.map((t) => `<option value="${t.id}">${t.nameHe}</option>`).join("");
  showHint();
});
function showHint() {
  const t = templates.find((x) => x.id === $("template").value);
  $("template-hint").textContent = t?.whenToUse || "";
}
$("template").addEventListener("change", showHint);

$("generate").addEventListener("click", () => {
  const draft = $("draft").value.trim();
  if (!draft) return setStatus("write-status", "כתוב טיוטה קודם.", true);
  $("generate").disabled = true;
  setStatus("write-status", "כותב...");
  chrome.runtime.sendMessage({ type: "xw:write", templateId: $("template").value, draft }, (res) => {
    $("generate").disabled = false;
    if (!res?.ok) return setStatus("write-status", res?.error || "משהו השתבש.", true);
    $("result").value = res.post;
    $("result-box").hidden = false;
    updateMeta(res.banned);
    setStatus("write-status", "");
  });
});

let limit = limitFor(false);

function updateMeta(banned = []) {
  const text = $("result").value;
  const counts = splitPosts(text).map(xLength).map((n) => `${n}/${limit}`).join(", ");
  const warn = banned.length ? ` | לבדוק: ${banned.join(", ")}` : "";
  $("result-meta").textContent = `תווים: ${counts}${warn}`;
  $("result-meta").classList.toggle("error", overLimit(text, limit).length > 0);
}
$("result").addEventListener("input", () => updateMeta());

$("insert").addEventListener("click", () => {
  chrome.runtime.sendMessage({ type: "xw:insertIntoComposer", text: $("result").value }, (res) => {
    setStatus("write-status", res?.ok ? "הוכנס." : res?.error || "לא הצלחתי להכניס.", !res?.ok);
  });
});
$("copy").addEventListener("click", async () => {
  await navigator.clipboard.writeText($("result").value);
  setStatus("write-status", "הועתק.");
});

// Voice tab - autosave each field to sync storage
getSettings().then(({ apiKey, model, premium, voice }) => {
  $("premium").checked = premium;
  limit = limitFor(premium);
  for (const k of VOICE_FIELDS) $(k).value = voice[k];
  $("apiKey").value = apiKey;
  loadModels(model);
});

function loadModels(selected) {
  chrome.runtime.sendMessage({ type: "xw:models" }, (models) => {
    $("model").innerHTML = models.map((m) => `<option value="${m.id}">${m.name}</option>`).join("");
    if (models.some((m) => m.id === selected)) {
      $("model").value = selected;
    } else {
      // A saved model that no longer exists (e.g. a typo) is replaced by the default.
      $("model").value = DEFAULT_MODEL;
      chrome.storage.sync.set({ model: DEFAULT_MODEL });
    }
  });
}

let saveTimer;
document.querySelectorAll("[data-voice]").forEach((el) =>
  el.addEventListener("input", () => {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(async () => {
      const size = new Blob([JSON.stringify(el.id) + JSON.stringify(el.value)]).size;
      if (size > SYNC_ITEM_LIMIT) return setStatus("voice-status", "השדה ארוך מדי לסנכרון (מקסימום בערך 8 אלף תווים).", true);
      try {
        await chrome.storage.sync.set({ [el.id]: el.value });
        setStatus("voice-status", "נשמר.");
      } catch (error) {
        setStatus("voice-status", error.message, true);
      }
    }, 600);
  }),
);

// Settings tab
$("save-settings").addEventListener("click", async () => {
  await chrome.storage.sync.set({
    apiKey: $("apiKey").value.trim(),
    model: $("model").value || DEFAULT_MODEL,
    premium: $("premium").checked,
  });
  limit = limitFor($("premium").checked);
  setStatus("settings-status", "נשמר.");
  loadModels($("model").value);
});
