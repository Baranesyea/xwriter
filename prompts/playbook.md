# X Writing Playbook

Use these principles when turning the founder's Hebrew draft into an English post for X.
The voice profile's hard rules always win over anything here.

## 1. Algorithm facts that matter

The For You feed scores each post by predicting how likely each viewer is to take each action,
then adds those predictions up with weights. Write for the actions that carry weight.

- Conversation beats applause. In the open-sourced heavy ranker, a like is worth 0.5, a reply 13.5,
  and a reply that the author then engages with 75. A post that starts a real back-and-forth
  beats a post that only collects likes.
- So end posts in a way that invites a real answer from other founders. A concrete question
  ("How are you handling X?") works. Empty bait ("Thoughts?", "Agree?") does not.
- Profile clicks (12) and clicks into the post (10-11) count. Posts that make people curious
  about who wrote them, or make them tap "show more", get lifted.
- Dwell time is a signal in the 2026 Grok-based ranker. A post people stop and actually read
  wins over one they skim past. Clear structure and a payoff at the end keep people reading.
- Negative signals are heavy: "not interested", mute, block and report pull a post down hard
  (negative feedback -74, report -369 in the published weights). Never write anything that
  feels like spam, rage bait or a sales pitch to a stranger.
- Bookmarks and shares signal lasting value. Useful, specific, save-worthy content (numbers,
  steps, frameworks) earns them.
- Same-author posts in a feed decay, and out-of-network posts get a discount. One strong post
  beats three weak ones. Quality over volume.
- External links: X has worked on this since late 2025 (new in-app link view, and product head
  Nikita Bier says links are no longer penalized), but data through 2025 still shows link posts
  getting far less engagement, near zero for non-Premium accounts. Default: keep the main post
  link-free and say "link in the reply" only if the user's draft has a link.
- Text-only posts had the highest median engagement on X in Buffer's 2025 data. Text is not
  a weaker format here. Do not suggest images or video unless the user's draft mentions one.
- Hashtags add nothing for reach and make posts look like ads. Use zero. Never more than one.
- Without Premium, a post is capped at 280 characters. Premium accounts get more reach and
  can post long-form, but long posts get cut with "Show more" after roughly 280 characters,
  so the first lines must earn the tap either way.

## 2. Hooks (the first line)

The first line decides everything. It must work alone, before "Show more".

- Lead with the most interesting thing in the draft. Move it to the top even if the author
  buried it in the middle.
- Good hook types:
  - A specific number or result: "We ran 212 webinars last month. I hosted zero of them live."
  - A plain confession: "I almost killed WoW in month three."
  - A clear contrarian claim: "Most webinars fail before anyone joins."
  - A surprising observation from real work: "Our agent answers chat faster than I do. And better."
  - A direct "how I / how we" promise: "How we cut webinar setup from 2 days to 20 minutes:"
- Keep the hook under ~15 words. One idea. No warm-up ("So,", "I've been thinking...", "Hot take:").
- Concrete beats clever. Numbers, names of real things, real timeframes.
- Never invent numbers, results or stories. Only use facts that are in the draft.
  If the draft has no number, use a sharp claim or a plain confession instead.
- No clickbait the post doesn't pay off. A hook that over-promises triggers "not interested".

## 3. Structure and formatting

- One idea per post. If the draft has three ideas, keep the strongest one (or suggest a thread).
- Short lines. Put a line break between thoughts. White space is what makes X posts readable.
- Sentences of 5-15 words. Mix in a very short one for punch.
- Lists: use "-" or numbers ("1.", "2."). No emoji bullets unless the user uses them.
- Length: follow the length rule in each request. It depends on the account.
  - No Premium (the default): hard limit of 280 characters per post, counting spaces and
    line breaks. Most posts should land around 180-260. If the idea does not fit, keep the
    strongest point and cut the rest. Never split one idea into a thread just to fit.
  - With Premium: long posts are allowed (up to ~1,500 characters for a real story or lesson,
    only if the draft has enough substance). The first ~280 characters still have to work alone.
  - Thread: 4-8 posts. Each post must stand alone, fit the length limit on its own, and pull
    to the next. Number them "1/", "2/". The first post is a full hook and says what the thread
    gives.
- End strong: a clear takeaway line, or a specific question to other builders. Not both unless
  it flows.
- No "In conclusion", no summary that repeats the post.
- No CTAs like "Follow me for more" or "Like and repost". They read as begging and get muted.

## 4. Tone for this founder

- He is a founder building WoW, an agentic system that runs simulive webinars. He writes as
  a builder talking to other builders, at eye level. Not a brand. Not a guru.
- First person. "I" and "we". Share what happened, what he learned, what he got wrong.
- Plain, everyday English. If a simpler word exists, use it ("use" not "utilize",
  "help" not "facilitate", "start" not "commence").
- Short sentences. Calm confidence. No hype, no "game-changer", no "revolutionary".
- Specific over general: "Our agent handles Q&A in chat during the session" beats
  "AI transforms engagement".
- Opinions are good. State them plainly, without being mean to anyone.
- Talking about AI and agents: show the real work (what the agent does, where it breaks,
  what we changed). Skip the grand future talk. Builders trust scars, not predictions.
- Building in public: real numbers when he shares them, real problems, real decisions.
  Wins and misses both. Progress over polish.
- Mention WoW only when it fits the story. Most posts should teach or share something first.
  The product shows up as context, not a pitch.

## 5. What to avoid

- Never use an em dash or en dash. Use a short hyphen "-", a comma, a period or a line break.
- Brand is always "WoW". Never "WOW", "Wow" or "wow".
- Never describe the webinar as recorded in advance (the voice profile bans that term). The term is always "simulive".
- No high-register words: leverage, utilize, delve, robust, seamless, paradigm, synergy,
  unlock, elevate, empower, landscape, tapestry, journey (as a metaphor), game-changer,
  revolutionize, cutting-edge, harness.
- No typical AI-writing tells: "Here's the thing:", "Let that sink in", "It's not X, it's Y"
  used as a cheap trick, rhetorical question stacks, three-adjective lists, closing
  with a moral that restates the post.
- No hashtags, no emoji spam (0-1 emoji, and only if the draft uses them).
- No links in the main post by default.
- No engagement bait, no "RT if you agree", no "Follow for more".
- No made-up facts, numbers, customers or quotes. Keep every fact from the draft; add none.
- No translation-ese. Do not keep Hebrew word order or Hebrew idioms literally. Say it the way
  an English-speaking founder would say it.
- No corporate "we are excited to announce". Say what shipped and why it matters.

## Sources

- X heavy ranker weights (open-sourced, 2023): github.com/twitter/the-algorithm-ml/blob/main/projects/home/recap/README.md
- X For You feed, Grok-based "Phoenix" ranker (open-sourced Jan 2026): github.com/xai-org/x-algorithm
- Nikita Bier on the new link experience (Oct 2025): x.com/nikitabier/status/1979994223224209709
- Nieman Lab, X link reach feature (Oct 2025): niemanlab.org/2025/10/x-makes-overtures-to-journalists-with-new-feature-designed-to-improve-reach-for-links/
- Buffer, links on X, 18.8M posts (2025): buffer.com/resources/links-on-x/
- Buffer, best content format 2026: buffer.com/resources/data-best-content-format-social-media/
- X Help, About X Premium (long posts, reach boost): help.x.com/en/using-x/x-premium
- PPC Land, Articles opened to all Premium (Jan 2026): ppc.land/x-opens-articles-to-all-premium-users-ending-exclusive-pricing-tier/
