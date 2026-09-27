(() => {
  // src/content.js
  (() => {
    if (window.__xwriter) return;
    window.__xwriter = true;
    let savedRange = null;
    let savedEditable = null;
    function editableOf(node) {
      const el = node?.nodeType === Node.ELEMENT_NODE ? node : node?.parentElement;
      return el?.closest('[contenteditable="true"], textarea, input') || null;
    }
    function capture() {
      const active = document.activeElement;
      if (active && (active.tagName === "TEXTAREA" || active.tagName === "INPUT")) {
        savedEditable = active;
        savedRange = { start: active.selectionStart, end: active.selectionEnd };
        return active.value.slice(active.selectionStart, active.selectionEnd);
      }
      const sel = window.getSelection();
      if (!sel.rangeCount) return "";
      savedRange = sel.getRangeAt(0).cloneRange();
      savedEditable = editableOf(savedRange.commonAncestorContainer);
      return sel.toString();
    }
    function insertIntoContentEditable(el, text) {
      el.focus();
      const data = new DataTransfer();
      data.setData("text/plain", text);
      const paste = new ClipboardEvent("paste", { clipboardData: data, bubbles: true, cancelable: true });
      const handled = !el.dispatchEvent(paste);
      if (!handled) document.execCommand("insertText", false, text);
    }
    function insert(text) {
      if (!savedEditable || !savedEditable.isConnected) return false;
      if (savedEditable.tagName === "TEXTAREA" || savedEditable.tagName === "INPUT") {
        savedEditable.focus();
        savedEditable.setSelectionRange(savedRange.start, savedRange.end);
        document.execCommand("insertText", false, text);
        return true;
      }
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(savedRange);
      insertIntoContentEditable(savedEditable, text);
      return true;
    }
    function composer() {
      return document.querySelector('[data-testid="tweetTextarea_0"]');
    }
    function insertIntoComposer(text) {
      const el = composer();
      if (!el) return { ok: false, error: "Open the post composer on X first." };
      el.focus();
      const sel = window.getSelection();
      if (!sel.rangeCount || !el.contains(sel.anchorNode)) {
        const range = document.createRange();
        range.selectNodeContents(el);
        range.collapse(false);
        sel.removeAllRanges();
        sel.addRange(range);
      }
      insertIntoContentEditable(el, text);
      return { ok: true };
    }
    let toastEl = null;
    function toast(text, { error = false, sticky = false } = {}) {
      toastEl?.remove();
      toastEl = document.createElement("div");
      toastEl.textContent = text;
      Object.assign(toastEl.style, {
        position: "fixed",
        bottom: "24px",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 2147483647,
        padding: "10px 16px",
        borderRadius: "10px",
        maxWidth: "80vw",
        font: "14px/1.4 system-ui, sans-serif",
        color: "#fff",
        whiteSpace: "pre-wrap",
        background: error ? "#c0392b" : "#1d9bf0",
        boxShadow: "0 4px 16px rgba(0,0,0,.25)"
      });
      document.body.appendChild(toastEl);
      const mine = toastEl;
      if (!sticky) setTimeout(() => mine.remove(), error ? 8e3 : 4e3);
    }
    chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
      if (message.type === "xw:capture") {
        sendResponse({ text: capture() });
      } else if (message.type === "xw:toast") {
        toast(message.text, { error: message.error, sticky: !message.error });
        sendResponse({});
      } else if (message.type === "xw:insert") {
        if (insert(message.text)) {
          toast(message.banned?.length ? `Done - check these words: ${message.banned.join(", ")}` : "Done", {
            error: Boolean(message.banned?.length)
          });
        } else {
          navigator.clipboard.writeText(message.text).then(
            () => toast("Copied to clipboard - the selection was not in a text field."),
            () => toast("Could not insert or copy - open the xwriter panel to see the post.", { error: true })
          );
        }
        sendResponse({});
      } else if (message.type === "xw:insertComposer") {
        sendResponse(insertIntoComposer(message.text));
      }
    });
  })();
})();
