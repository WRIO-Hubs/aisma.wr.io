// background.js

// Listen for the "fetch" event to handle intercepted network requests
self.addEventListener('fetch', (event) => {
  // Handle intercepted fetch requests here

});

chrome.runtime.onMessageExternal.addListener(function(request, sender, sendResponse) {
  if (request.criteria) {
    const criteria = request.criteria;
    // Store the criteria in the extension's storage or perform any other required action
    console.log('criteria received from the webpage:', criteria);

    // Store the criteria in the extension's storage
    chrome.storage.local.set({ criteria: criteria }, function() {
      console.log('Criteria stored in storage:', criteria);
      // Send a response back to the webpage
      sendResponse({ success: true });
    });
  }
});
