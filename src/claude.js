import Anthropic from "@anthropic-ai/sdk";
import { getSettings } from "./settings.js";
import { buildSystemPrompt, buildUserMessage, enforceHardRules, findBannedWords } from "./prompt.js";

// Server-side refusal fallbacks are supported on these models.
const FALLBACK_MODELS = new Set(["claude-opus-5", "claude-opus-5-5", "claude-fable-5-1"]);

export async function writePost(template, draft) {
  const { apiKey, model, voice } = await getSettings();
  if (!apiKey) throw new Error("Add your Anthropic API key in the xwriter side panel (Settings).");

  const client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true });
  const params = {
    model,
    max_tokens: 16000,
    output_config: { effort: "medium" },
    system: [{ type: "text", text: buildSystemPrompt(voice), cache_control: { type: "ephemeral" } }],
    messages: [{ role: "user", content: buildUserMessage(template, draft) }],
  };

  let response;
  try {
    response = FALLBACK_MODELS.has(model)
      ? await client.beta.messages.create({ ...params, betas: ["server-side-fallback-2026-07-01"], fallbacks: "default" })
      : await client.messages.create(params);
  } catch (error) {
    if (error instanceof Anthropic.AuthenticationError) throw new Error("Your Anthropic API key was rejected. Check it in Settings.");
    if (error instanceof Anthropic.RateLimitError) throw new Error("Rate limited by Anthropic - try again in a moment.");
    if (error instanceof Anthropic.APIError) throw new Error(`Anthropic API error ${error.status}: ${error.message}`);
    throw error;
  }

  if (response.stop_reason === "refusal") throw new Error("Claude declined this request.");
  const text = response.content
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("");
  if (!text.trim()) throw new Error("Claude returned an empty response.");

  const post = enforceHardRules(text);
  return { post, banned: findBannedWords(post, voice) };
}
