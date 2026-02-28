chrome.action.onClicked.addListener((tab) => {
  // URL of full application
  const fullAppUrl = "https://www.youtube.com/watch?v=dQw4w9WgXcQ&list=RDdQw4w9WgXcQ&start_radio=1&pp=ygUXbmV2ZXIgZ29ubmEgZ2l2ZSB5b3UgdXCgBwHSBwkJvgoBhyohjO8%3D";

  chrome.tabs.create({ url: fullAppUrl });
});