// Listen for the "fetch" event to handle intercepted network requests
self.addEventListener('fetch', (event) => {
  // Handle intercepted fetch requests here
});

chrome.runtime.onMessageExternal.addListener(function(request, sender, sendResponse) {
  if (request.criteria && request.emailRecordId) {
    const criteria = request.criteria;
    const emailRecordId = request.emailRecordId;

    // Store the data in the extension's storage or perform any other required action
    console.log('Criteria received from the webpage:', criteria);
    console.log('emailRecordId received from the webpage:', emailRecordId);

    // Store the data in the extension's storage
    chrome.storage.local.set({ criteria: criteria, emailRecordId: emailRecordId }, function() {
      // Send a response back to the webpage
      sendResponse({ success: true });
    });
  }
});

chrome.runtime.onMessageExternal.addListener(function(request, sender, sendResponse) {

  if (request.message_greetings && request.message_body && request.message_regards) {
    const message_greetings = request.message_greetings;
    const message_body = request.message_body;
    const message_regards = request.message_regards;

    // Format the data as needed (replace newlines with '\\n')
    const formattedMessage = `${message_greetings},${message_body.replace(/\n/g, '\\n')},${message_regards.replace(/\n/g, '\\n')}`;

    // Store the data in the extension's storage
    chrome.storage.local.set({ twitterMessage: formattedMessage }, function() {
      console.log('Formatted message stored in storage:', formattedMessage);
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

// Function to reset the badge to its default state
function resetBadge() {
  // Reset the badge text and title
  chrome.action.setBadgeText({ text: '' });
  chrome.action.setTitle({ title: "AISMA" });
}

// Function to show the countdown timer in the extension badge
function showCountdownTimer(seconds) {
  // If the response status is 429, set the extension badge to "!"
  chrome.action.setBadgeBackgroundColor({ color: '#FF0000' });
  chrome.action.setTitle({ title: `Twitter says there are too many requests. Please wait...` });

  const interval = setInterval(() => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    // Update the extension badge title with the countdown timer message
    chrome.action.setTitle({ title: `Twitter says there are too many requests. Please wait for ${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds} minutes` });

    seconds = seconds - 5;

    if (seconds < 0) {
      clearInterval(interval);
      // Reset the badge after the countdown is complete
      resetBadge();
    }
  }, 5000);
}

// Listen for messages from the content script
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.error429) {
    // Show the countdown timer when scraping fails
    showCountdownTimer(300);
  }
});

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

// Function to open the uninstall page
function openUninstallPage() {
  const uninstallURL = "https://aisma.wr.io/uninstall/";
  chrome.runtime.setUninstallURL(uninstallURL).then(() => {
    console.log("Uninstall URL set successfully: ", uninstallURL);
  }).catch((error) => {
    console.error("Error setting uninstall URL: ", error);
  });
}

chrome.runtime.onInstalled.addListener(function(details) {
  // Check if the reason for onInstalled is "install"
  if (details.reason === "install") {
    const extensionId = chrome.runtime.id;
    // Open the desired website after the extension is installed
    chrome.tabs.create({ url: `https://aisma.wr.io/dashboard/?extensionId=${extensionId}` });

    // Set the uninstall URL when the extension is installed
    openUninstallPage();
  }
});
