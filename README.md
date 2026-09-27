# xwriter

Chrome extension that turns Hebrew drafts into ready-to-post English X posts, in your voice.

## Install

1. Open `chrome://extensions`, turn on Developer mode.
2. Click "Load unpacked" and pick the `dist` folder.
3. Click the xwriter icon to open the side panel, go to Settings, paste your Anthropic API key.

Settings and your voice profile are stored in `chrome.storage.sync`, so they follow your Chrome profile to every computer.

## Use

- On X: select your draft in the post field, right-click, xwriter, pick a template. The finished post replaces the selection.
- In the side panel: write the draft, pick a template, click write, then "insert into X".

## Where things live

- `prompts/playbook.md` - viral writing principles for X (research, with sources)
- `prompts/voice-profile.md` - built-in voice rules
- `prompts/templates.json` - the templates shown in the menu
- `src/` - extension source. Run `npm install && npm run build` to rebuild `dist/`.

Hard rules (no em/en dashes) are also enforced in code after every response, in `src/prompt.js`.
