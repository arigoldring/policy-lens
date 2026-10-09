chrome.action.onClicked.addListener(() => {
  const url = chrome.runtime.getURL("dist/index.html");
  chrome.tabs.create({ url });
});