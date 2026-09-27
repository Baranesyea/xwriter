// All user content lives in chrome.storage.sync so it follows the Chrome
// profile across computers. Each voice field is its own key because sync
// storage caps a single item at 8 KB.
export const VOICE_FIELDS = ["voice_jargon", "voice_banned", "voice_rules", "voice_samples"];
export const SYNC_ITEM_LIMIT = chrome.storage.sync.QUOTA_BYTES_PER_ITEM;

export const DEFAULT_MODEL = "claude-opus-5";

// Shown in the model menu when the live list from Anthropic can't be loaded.
export const FALLBACK_MODEL_LIST = [
  { id: "claude-opus-5", name: "Claude Opus 5" },
  { id: "claude-opus-5-5", name: "Claude Opus 5.5" },
  { id: "claude-sonnet-5", name: "Claude Sonnet 5" },
  { id: "claude-haiku-4-5", name: "Claude Haiku 4.5" },
];

export async function getSettings() {
  const stored = await chrome.storage.sync.get(["apiKey", "model", ...VOICE_FIELDS]);
  return {
    apiKey: stored.apiKey || "",
    model: stored.model || DEFAULT_MODEL,
    voice: Object.fromEntries(VOICE_FIELDS.map((k) => [k, stored[k] || ""])),
  };
}
