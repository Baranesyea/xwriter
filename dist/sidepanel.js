(() => {
  // src/xlength.js
  var LIGHT_RANGES = [[0, 4351], [8192, 8205], [8208, 8223], [8242, 8247]];
  var URL_RE = /https?:\/\/\S+/g;
  var URL_WEIGHT = 23;
  var FREE_LIMIT = 280;
  var PREMIUM_LIMIT = 25e3;
  var limitFor = (premium) => premium ? PREMIUM_LIMIT : FREE_LIMIT;
  var segmenter = new Intl.Segmenter("en", { granularity: "grapheme" });
  function xLength(text) {
    const urls = text.match(URL_RE) || [];
    let count = urls.length * URL_WEIGHT;
    for (const { segment } of segmenter.segment(text.replace(URL_RE, ""))) {
      if (new RegExp("\\p{Extended_Pictographic}", "u").test(segment)) {
        count += 2;
        continue;
      }
      for (const ch of segment) {
        const cp = ch.codePointAt(0);
        count += LIGHT_RANGES.some(([a, b]) => cp >= a && cp <= b) ? 1 : 2;
      }
    }
    return count;
  }
  function splitPosts(text) {
    return text.split(/^\s*---\s*$/m).map((p) => p.trim()).filter(Boolean);
  }
  function overLimit(text, limit2) {
    return splitPosts(text).map((post, i) => ({ index: i + 1, length: xLength(post) })).filter((p) => p.length > limit2);
  }

  // src/settings.js
  var VOICE_FIELDS = ["voice_jargon", "voice_banned", "voice_rules", "voice_samples"];
  var SYNC_ITEM_LIMIT = chrome.storage.sync.QUOTA_BYTES_PER_ITEM;
  var DEFAULT_MODEL = "claude-opus-5";
  async function getSettings() {
    const stored = await chrome.storage.sync.get(["apiKey", "model", "premium", ...VOICE_FIELDS]);
    return {
      apiKey: stored.apiKey || "",
      model: stored.model || DEFAULT_MODEL,
      premium: Boolean(stored.premium),
      voice: Object.fromEntries(VOICE_FIELDS.map((k) => [k, stored[k] || ""]))
    };
  }

  // src/sidepanel.js
  var $ = (id) => document.getElementById(id);
  function setStatus(id, text, error = false) {
    $(id).textContent = text;
    $(id).classList.toggle("error", error);
  }
  document.querySelectorAll("nav button").forEach(
    (btn) => btn.addEventListener("click", () => {
      document.querySelectorAll("nav button, .tab").forEach((el) => el.classList.remove("active"));
      btn.classList.add("active");
      $(btn.dataset.tab).classList.add("active");
    })
  );
  var templates = [];
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
    if (!draft) return setStatus("write-status", "\u05DB\u05EA\u05D5\u05D1 \u05D8\u05D9\u05D5\u05D8\u05D4 \u05E7\u05D5\u05D3\u05DD.", true);
    $("generate").disabled = true;
    setStatus("write-status", "\u05DB\u05D5\u05EA\u05D1...");
    chrome.runtime.sendMessage({ type: "xw:write", templateId: $("template").value, draft }, (res) => {
      $("generate").disabled = false;
      if (!res?.ok) return setStatus("write-status", res?.error || "\u05DE\u05E9\u05D4\u05D5 \u05D4\u05E9\u05EA\u05D1\u05E9.", true);
      $("result").value = res.post;
      $("result-box").hidden = false;
      updateMeta(res.banned);
      setStatus("write-status", "");
    });
  });
  var limit = limitFor(false);
  function updateMeta(banned = []) {
    const text = $("result").value;
    const counts = splitPosts(text).map(xLength).map((n) => `${n}/${limit}`).join(", ");
    const warn = banned.length ? ` | \u05DC\u05D1\u05D3\u05D5\u05E7: ${banned.join(", ")}` : "";
    $("result-meta").textContent = `\u05EA\u05D5\u05D5\u05D9\u05DD: ${counts}${warn}`;
    $("result-meta").classList.toggle("error", overLimit(text, limit).length > 0);
  }
  $("result").addEventListener("input", () => updateMeta());
  $("insert").addEventListener("click", () => {
    chrome.runtime.sendMessage({ type: "xw:insertIntoComposer", text: $("result").value }, (res) => {
      setStatus("write-status", res?.ok ? "\u05D4\u05D5\u05DB\u05E0\u05E1." : res?.error || "\u05DC\u05D0 \u05D4\u05E6\u05DC\u05D7\u05EA\u05D9 \u05DC\u05D4\u05DB\u05E0\u05D9\u05E1.", !res?.ok);
    });
  });
  $("copy").addEventListener("click", async () => {
    await navigator.clipboard.writeText($("result").value);
    setStatus("write-status", "\u05D4\u05D5\u05E2\u05EA\u05E7.");
  });
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
        $("model").value = DEFAULT_MODEL;
        chrome.storage.sync.set({ model: DEFAULT_MODEL });
      }
    });
  }
  var saveTimer;
  document.querySelectorAll("[data-voice]").forEach(
    (el) => el.addEventListener("input", () => {
      clearTimeout(saveTimer);
      saveTimer = setTimeout(async () => {
        const size = new Blob([JSON.stringify(el.id) + JSON.stringify(el.value)]).size;
        if (size > SYNC_ITEM_LIMIT) return setStatus("voice-status", "\u05D4\u05E9\u05D3\u05D4 \u05D0\u05E8\u05D5\u05DA \u05DE\u05D3\u05D9 \u05DC\u05E1\u05E0\u05DB\u05E8\u05D5\u05DF (\u05DE\u05E7\u05E1\u05D9\u05DE\u05D5\u05DD \u05D1\u05E2\u05E8\u05DA 8 \u05D0\u05DC\u05E3 \u05EA\u05D5\u05D5\u05D9\u05DD).", true);
        try {
          await chrome.storage.sync.set({ [el.id]: el.value });
          setStatus("voice-status", "\u05E0\u05E9\u05DE\u05E8.");
        } catch (error) {
          setStatus("voice-status", error.message, true);
        }
      }, 600);
    })
  );
  $("save-settings").addEventListener("click", async () => {
    await chrome.storage.sync.set({
      apiKey: $("apiKey").value.trim(),
      model: $("model").value || DEFAULT_MODEL,
      premium: $("premium").checked
    });
    limit = limitFor($("premium").checked);
    setStatus("settings-status", "\u05E0\u05E9\u05DE\u05E8.");
    loadModels($("model").value);
  });
})();
