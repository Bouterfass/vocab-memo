chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "translate-selected-word",
    title: 'Traduire "%s"',
    contexts: ["selection"],
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "translate-selected-word") {
    const selectedText = (info.selectionText || "").trim();

    if (!selectedText) return;

    // 1. On stocke le mot dans storage
    chrome.storage.local.set({ selectedWord: selectedText }, () => {
      // 2. On ouvre le popup
      chrome.action.openPopup().catch((err) => {
        console.error("Erreur openPopup :", err);
      });
    });
  }
});
