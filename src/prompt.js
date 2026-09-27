import playbook from "../prompts/playbook.md";
import defaultVoice from "../prompts/voice-profile.md";
import templates from "../prompts/templates.json";

export { templates };

// Words that must never appear, regardless of what the user adds.
const ALWAYS_BANNED = ["pre-recorded webinar", "pre recorded webinar", "prerecorded webinar"];

export function buildSystemPrompt(voice) {
  const userSections = [
    ["Jargon dictionary (user additions)", voice.voice_jargon],
    ["Banned words (user additions) - never use these", voice.voice_banned],
    ["Extra tone rules (user additions)", voice.voice_rules],
    ["Writing samples - match this voice", voice.voice_samples],
  ]
    .filter(([, text]) => text.trim())
    .map(([title, text]) => `## ${title}\n${text.trim()}`)
    .join("\n\n");

  return [
    "You write X (Twitter) posts for one founder. He drafts in Hebrew (sometimes mixed with English); you turn the draft into a ready-to-post English post in his voice.",
    "Always write the post in English. Never answer in Hebrew, even though the draft and these instructions may be in Hebrew.",
    "Return only the final post text - no preamble, no quotes around it, no notes, no hashtags unless the draft has them.",
    "Keep his meaning and his facts. Never invent numbers, customers, or claims that are not in the draft.",
    "# Voice profile\n" + defaultVoice,
    userSections && "# Voice profile - user additions (these override the defaults above)\n" + userSections,
    "# X writing playbook\n" + playbook,
  ]
    .filter(Boolean)
    .join("\n\n");
}

export function buildUserMessage(template, draft) {
  return [
    `Template: ${template.name}`,
    `How to shape it: ${template.instructions}`,
    `Example of this template (for shape only, do not copy its content):\n${template.example}`,
    `Draft:\n<draft>\n${draft}\n</draft>`,
  ].join("\n\n");
}

// Hard rules enforced in code, so they hold even if the model slips.
export function enforceHardRules(text) {
  return text
    .replace(/\s*[—–]\s*/g, " - ")
    .replace(/^ - /gm, "- ")
    .trim();
}

export function findBannedWords(text, voice) {
  const userBanned = voice.voice_banned
    .split(/[\n,]/)
    .map((w) => w.trim())
    .filter(Boolean);
  const lower = text.toLowerCase();
  return [...ALWAYS_BANNED, ...userBanned].filter((w) => lower.includes(w.toLowerCase()));
}
