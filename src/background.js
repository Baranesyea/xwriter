import { templates } from "./prompt.js";
import { writePost } from "./claude.js";

const PARENT_ID = "xwriter";

function buildMenus() {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({ id: PARENT_ID, title: "xwriter", contexts: ["selection"] });
    for (const t of templates) {
      chrome.contextMenus.create({ id: `tpl:${t.id}`, parentId: PARENT_ID, title: t.nameHe, contexts: ["selection"] });
    }
  });
}

chrome.runtime.onInstalled.addListener(buildMenus);
chrome.runtime.onStartup.addListener(buildMenus);
chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });

// On pages without the declared content script, inject it on demand.
async function sendToTab(tabId, message) {
  try {
    return await chrome.tabs.sendMessage(tabId, message);
  } catch {
    await chrome.scripting.executeScript({ target: { tabId }, files: ["content.js"] });
    return chrome.tabs.sendMessage(tabId, message);
  }
}

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (!info.menuItemId.startsWith("tpl:") || !tab?.id) return;
  const template = templates.find((t) => `tpl:${t.id}` === info.menuItemId);

  // Read the selection from the page: info.selectionText drops line breaks.
  const captured = await sendToTab(tab.id, { type: "xw:capture" });
  const draft = captured?.text || info.selectionText;
  await sendToTab(tab.id, { type: "xw:toast", text: `Writing - ${template.name}...` });

  try {
    const { post, banned } = await writePost(template, draft);
    await sendToTab(tab.id, { type: "xw:insert", text: post, banned });
  } catch (error) {
    await sendToTab(tab.id, { type: "xw:toast", text: error.message, error: true });
  }
});

// Side panel requests go through here so there is one place that calls Claude.
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === "xw:write") {
    const template = templates.find((t) => t.id === message.templateId);
    writePost(template, message.draft)
      .then((result) => sendResponse({ ok: true, ...result }))
      .catch((error) => sendResponse({ ok: false, error: error.message }));
    return true;
  }
  if (message.type === "xw:templates") {
    sendResponse(templates);
  }
  if (message.type === "xw:insertIntoComposer") {
    chrome.tabs.query({ active: true, currentWindow: true }).then(async ([tab]) => {
      try {
        sendResponse(await sendToTab(tab.id, { type: "xw:insertComposer", text: message.text }));
      } catch {
        sendResponse({ ok: false, error: "Open x.com in the active tab first." });
      }
    });
    return true;
  }
});
