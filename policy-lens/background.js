chrome.action.onClicked.addListener(() => {
  const fullAppUrl = "http://localhost:5173/"; // change if needed
  chrome.tabs.create({ url: fullAppUrl });
});