// Listen for the "fetch" event to handle intercepted network requests
self.addEventListener('fetch', (event) => {
  // Handle intercepted fetch requests here
});

chrome.runtime.onMessageExternal.addListener(function(request, sender, sendResponse) {
  if (request.criteria && request.emailRecordId) {
    const criteria = request.criteria;
    const emailRecordId = request.emailRecordId;

    // Store the criteria and emailRecordId in the extension's storage or perform any other required action
    console.log('criteria received from the webpage:', criteria);
    console.log('emailRecordId received from the webpage:', emailRecordId);

    // Store the criteria and emailRecordId in the extension's storage
    chrome.storage.local.set({ criteria: criteria, emailRecordId: emailRecordId }, function() {
      console.log('Criteria and emailRecordId stored in storage:', criteria, emailRecordId);
      // Send a response back to the webpage
      sendResponse({ success: true });
    });
  }
});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.openScanUrl) {
    const scanUrl = request.openScanUrl + "?scan";

    chrome.tabs.create({ url: scanUrl, active: false }, function (tab) {
      console.log('Scan URL opened in a new tab:', scanUrl);
    });

    // Send a response back to the content script
    sendResponse({ success: true });
  }

  if (request.closeTab) {
    chrome.tabs.remove(sender.tab.id, function () {
      sendResponse('Tab closed');
    });
    return true; // Indicates that the response will be sent asynchronously
  }

  if (request.action === 'updateBadgeCount') {
    // Update the badge count
    updateBadgeCount();
  }
});

// Function to retrieve Twitter contacts and update the badge count
function updateBadgeCount() {
  chrome.storage.local.get('emailRecordId', function(result) {
    const emailRecordId = result.emailRecordId;

    // Retrieve the Twitter contacts from Airtable
    const apiUrl = `https://aisma-extension.wrio.workers.dev/api/getTwitterContacts?emailRecordId=${emailRecordId}`;

    console.log("1");

    fetch(apiUrl)
      .then(response => response.json())
      .then(data => {
        const twitterContacts = data.twitterContacts || '';

        if (twitterContacts) {
          const contactsArray = twitterContacts.split(',');

          // Update the badge count with the number of Twitter contacts
          const badgeCount = contactsArray.length;
          chrome.action.setBadgeText({ text: badgeCount.toString() });
        } else {
          console.error('Failed to retrieve Twitter contacts:', data);
        }
      })
      .catch(error => {
        console.error('Error retrieving Twitter contacts:', error);
      });
  });
}

// Call the updateBadgeCount function initially to set the badge count
updateBadgeCount();
