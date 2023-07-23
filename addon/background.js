// Listen for the "fetch" event to handle intercepted network requests
self.addEventListener('fetch', (event) => {
  // Handle intercepted fetch requests here
});

chrome.runtime.onMessageExternal.addListener(function(request, sender, sendResponse) {
  if (request.criteria && request.message_greetings && request.message_body && request.message_regards && request.emailRecordId) {
    const criteria = request.criteria;
    const message_greetings = request.message_greetings;
    const message_body = request.message_body;
    const message_regards = request.message_regards;
    const emailRecordId = request.emailRecordId;

    // Store the data in the extension's storage or perform any other required action
    console.log('Criteria received from the webpage:', criteria);
    console.log('message_greetings received from the webpage:', message_greetings);
    console.log('message_body received from the webpage:', message_body);
    console.log('message_regards received from the webpage:', message_regards);
    console.log('emailRecordId received from the webpage:', emailRecordId);

    // Format the data as needed (replace newlines with '\\n')
    const formattedMessage = `[[${message_greetings}][${message_body.replace(/\n/g, '\\n')}][${message_regards.replace(/\n/g, '\\n')}]]`;

    // Store the data in the extension's storage
    chrome.storage.local.set({ criteria: criteria, twitterMessage: formattedMessage, emailRecordId: emailRecordId }, function() {
      console.log('Data stored in storage:', criteria, formattedMessage, emailRecordId);
      // Send a response back to the webpage
      sendResponse({ success: true });
    });
  }
});


chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.openScanUrl) {
    const scanUrl = request.openScanUrl + "?scan";

    chrome.tabs.create({ url: scanUrl, active: false }, function (tab) {
      //console.log('Scan URL opened in a new tab:', scanUrl);
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


// Function to open the dashboard URL in a new tab
function openDashboard() {
  //const dashboardUrl = 'https://aisma.wr.io/sign_in/';
  //chrome.tabs.create({ url: dashboardUrl, active: true }, function (tab) {});
}

// Function to retrieve Twitter contacts and update the badge count
function updateBadgeCount() {
  chrome.storage.local.get('emailRecordId', function (result) {
    const emailRecordId = result.emailRecordId;

    // Check if the user is logged in (has emailRecordId stored)
    if (!emailRecordId) {
      // Open the dashboard URL in a new tab for the user to log in
      openDashboard();
      return;
    }

    // Retrieve the Twitter contacts from Airtable
    const apiUrl = `https://aisma-extension.wrio.workers.dev/api/getTwitterContacts?emailRecordId=${emailRecordId}`;

    fetch(apiUrl)
      .then(response => {

        if (!response.ok) {
          if (response.status === 500) {
            throw new Error('Please login at https://aisma.wr.io/dashboard/');
          } else {
            throw new Error(`Failed to retrieve Twitter contacts: ${response.status} ${response.statusText}`);
          }
        }
        return response.json();
      })
      .then(data => {
        if (data.error) {
          console.error(data.error);
          return;
        }

        const twitterContacts = data.twitterContacts || '';

        if (twitterContacts) {
          const contactsArray = twitterContacts.split(',');

          // Update the badge count with the number of Twitter contacts
          const badgeCount = contactsArray.length;
          chrome.action.setBadgeText({ text: badgeCount.toString() });
        } else {
          console.error('Failed to retrieve Twitter contacts: No contacts data found.');
        }
      })
      .catch(error => {
        console.error('Error retrieving Twitter contacts:', error);
      });
  });
}

// Call the updateBadgeCount function initially to set the badge count
updateBadgeCount();
