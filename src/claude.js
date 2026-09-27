import Anthropic from "@anthropic-ai/sdk";
import { getSettings, FALLBACK_MODEL_LIST } from "./settings.js";
import { limitFor, overLimit } from "./xlength.js";
import { buildSystemPrompt, buildUserMessage, enforceHardRules, findBannedWords } from "./prompt.js";

// Server-side refusal fallbacks are supported on these models.
const FALLBACK_MODELS = new Set(["claude-opus-5", "claude-fable-5-1"]);
// Haiku 4.5 rejects the effort setting.
const NO_EFFORT_MODELS = /^claude-haiku-4-5/;

function client(apiKey) {
  return new Anthropic({ apiKey, dangerouslyAllowBrowser: true });
}

// Live list of models this API key can use, for the settings menu.
export async function listModels() {
  const { apiKey } = await getSettings();
  if (!apiKey) return FALLBACK_MODEL_LIST;
  try {
    const models = [];
    for await (const m of client(apiKey).models.list()) models.push({ id: m.id, name: m.display_name });
    return models.length ? models : FALLBACK_MODEL_LIST;
  } catch {
    return FALLBACK_MODEL_LIST;
  }
}

const MAX_SHORTEN_ROUNDS = 2;

export async function writePost(template, draft) {
  const { apiKey, model, premium, voice } = await getSettings();
  if (!apiKey) throw new Error("חסר מפתח. הכנס אותו בחלונית הצד, בלשונית הגדרות.");

  const limit = limitFor(premium);
  const messages = [{ role: "user", content: buildUserMessage(template, draft, limit, premium) }];
  const system = [{ type: "text", text: buildSystemPrompt(voice), cache_control: { type: "ephemeral" } }];

  let post = "";
  let over = [];
  for (let round = 0; round <= MAX_SHORTEN_ROUNDS; round++) {
    const response = await callClaude(apiKey, model, system, messages);
    const text = response.content
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("");
    if (!text.trim()) throw new Error("קלוד החזיר תשובה ריקה. נסה שוב.");

    post = enforceHardRules(text);
    over = overLimit(post, limit);
    if (!over.length) break;

    // Too long for X: ask Claude to shorten, keeping the conversation so it
    // edits its own draft instead of starting over.
    const details = over.map((p) => `post ${p.index} is ${p.length}`).join(", ");
    messages.push({ role: "assistant", content: response.content });
    messages.push({
      role: "user",
      content: `Too long for X: ${details} characters, and the limit is ${limit} per post. Rewrite it to fit, keeping the hook and the main point. Return only the post.`,
    });
  }

  return { post, banned: findBannedWords(post, voice), limit, over };
}

async function callClaude(apiKey, model, system, messages) {
  const params = {
    model,
    max_tokens: 16000,
    ...(NO_EFFORT_MODELS.test(model) ? {} : { output_config: { effort: "medium" } }),
    system,
    messages,
  };

  let response;
  try {
    response = FALLBACK_MODELS.has(model)
      ? await client(apiKey).beta.messages.create({ ...params, betas: ["server-side-fallback-2026-07-01"], fallbacks: "default" })
      : await client(apiKey).messages.create(params);
  } catch (error) {
    if (error instanceof Anthropic.NotFoundError) throw new Error("המודל שנבחר לא קיים. בחר מודל מהרשימה בלשונית הגדרות.");
    if (error instanceof Anthropic.AuthenticationError) throw new Error("המפתח לא התקבל. בדוק אותו בלשונית הגדרות.");
    if (error instanceof Anthropic.PermissionDeniedError) throw new Error("למפתח אין הרשאה למודל הזה. בחר מודל אחר בהגדרות.");
    if (error instanceof Anthropic.RateLimitError) throw new Error("יותר מדי בקשות. נסה שוב עוד רגע.");
    if (error instanceof Anthropic.APIConnectionError) throw new Error("אין חיבור לאנתרופיק. בדוק את האינטרנט ונסה שוב.");
    if (error instanceof Anthropic.APIError) throw new Error(`שגיאה מאנתרופיק (${error.status}): ${error.message}`);
    throw error;
  }
  if (response.stop_reason === "refusal") throw new Error("קלוד סירב לבקשה הזו.");
  return response;
}
