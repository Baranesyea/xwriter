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
      if (!el) return { ok: false, error: "\u05E4\u05EA\u05D7 \u05E7\u05D5\u05D3\u05DD \u05D0\u05EA \u05E9\u05D3\u05D4 \u05DB\u05EA\u05D9\u05D1\u05EA \u05D4\u05E4\u05D5\u05E1\u05D8 \u05D1\u05D0\u05D9\u05E7\u05E1." };
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
      toastEl.dir = "rtl";
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
          const warnings = [];
          if (message.over?.length) warnings.push(`\u05E2\u05D3\u05D9\u05D9\u05DF \u05D0\u05E8\u05D5\u05DA \u05DE\u05D4\u05DE\u05D2\u05D1\u05DC\u05D4 \u05E9\u05DC ${message.limit} \u05EA\u05D5\u05D5\u05D9\u05DD. \u05DB\u05D3\u05D0\u05D9 \u05DC\u05E7\u05E6\u05E8.`);
          if (message.banned?.length) warnings.push(`\u05DB\u05D3\u05D0\u05D9 \u05DC\u05D1\u05D3\u05D5\u05E7 \u05D0\u05EA \u05D4\u05DE\u05D9\u05DC\u05D9\u05DD: ${message.banned.join(", ")}`);
          toast(warnings.length ? `\u05DE\u05D5\u05DB\u05DF.
${warnings.join("\n")}` : "\u05DE\u05D5\u05DB\u05DF", { error: warnings.length > 0 });
        } else {
          navigator.clipboard.writeText(message.text).then(
            () => toast("\u05D4\u05D8\u05E7\u05E1\u05D8 \u05D4\u05DE\u05E1\u05D5\u05DE\u05DF \u05DC\u05D0 \u05D4\u05D9\u05D4 \u05D1\u05E9\u05D3\u05D4 \u05DB\u05EA\u05D9\u05D1\u05D4, \u05D0\u05D6 \u05D4\u05E2\u05EA\u05E7\u05EA\u05D9 \u05D0\u05EA \u05D4\u05E4\u05D5\u05E1\u05D8 \u05DC\u05DC\u05D5\u05D7."),
            () => toast("\u05DC\u05D0 \u05D4\u05E6\u05DC\u05D7\u05EA\u05D9 \u05DC\u05D4\u05DB\u05E0\u05D9\u05E1 \u05D0\u05D5 \u05DC\u05D4\u05E2\u05EA\u05D9\u05E7. \u05E0\u05E1\u05D4 \u05D3\u05E8\u05DA \u05D7\u05DC\u05D5\u05E0\u05D9\u05EA \u05D4\u05E6\u05D3.", { error: true })
          );
        }
        sendResponse({});
      } else if (message.type === "xw:insertComposer") {
        sendResponse(insertIntoComposer(message.text));
      }
    });
  })();
})();
