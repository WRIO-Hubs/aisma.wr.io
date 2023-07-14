// background.js

// Listen for the "fetch" event to handle intercepted network requests
self.addEventListener('fetch', (event) => {
  // Handle intercepted fetch requests here

});

chrome.runtime.onMessageExternal.addListener(function(request, sender, sendResponse) {
  if (request.criteria) {
    const criteria = request.criteria;
    chrome.storage.local.set({ criteria: criteria }, function() {
      sendResponse({ success: true });
    });
  }
});
