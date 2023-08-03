// popup.js

function checkLogin() {


    // Check if the emailRecordId exists in chrome.storage.local
    chrome.storage.local.get(['emailRecordId'], function (result) {

      const emailRecordId = result.emailRecordId;
      console.log("emailRecordId:", emailRecordId);
      if (emailRecordId) {
        // If emailRecordId exists, remove the display: none style to show the logged element
        document.getElementById('loginForm').style.display = 'none';
        document.getElementById('logged').style.display = 'block';

        // Add an event listener for the "click" event on the "logout" button
        const logoutButton = document.getElementById('logout');
        logoutButton.addEventListener('click', function () {
          // Clear the emailRecordId from chrome.storage.local
          chrome.storage.local.remove('emailRecordId', function () {
            checkLogin();
          });
        });

      } else {
        // If emailRecordId exists, remove the display: none style to show the logged element
        document.getElementById('loginForm').style.display = 'block';
        document.getElementById('logged').style.display = 'none';

        const loginButton = document.getElementById('submitButton');
        loginButton.addEventListener('click', function () {
          const indicatorLabel = submitButton.querySelector('.indicator-label');
          const indicatorProgress = submitButton.querySelector('.indicator-progress');
          // Change the text to "Saving" and show the spinner
          indicatorLabel.textContent = '';
          indicatorProgress.style.display = 'inline-block';

          const emailInput = document.getElementById('emailInput').value;
          const passwordInput = document.getElementById('passwordInput').value;
          const extensionId = chrome.runtime.id;

          fetch(`https://aisma-extension-signin.wrio.workers.dev/?email=${emailInput}&password=${passwordInput}&extensionId=${extensionId}`)
            .then(response => response.text())
            .then(data => {
                indicatorLabel.textContent = 'Submit';
                indicatorProgress.style.display = 'none';
              if (data !== 'NOT_FOUND') {
                // Store the emailRecordId in chrome.storage.local
                chrome.storage.local.set({ emailRecordId: data }, function () {
                  // Open the dashboard URL with the emailRecordId as a query parameter
                  const extensionId = chrome.runtime.id;
                  window.open(`https://aisma.wr.io/connect/?extensionId=${extensionId}`, '_blank');
                  checkLogin();
                });
              } else {
                // Show an error message
                const errorMessage = document.getElementById('errorMessage');
                errorMessage.style.display = 'block';
                // Fade away the error message after 2 seconds
                setTimeout(() => {
                  errorMessage.style.opacity = '0';
                  setTimeout(() => {
                    errorMessage.style.display = 'none';
                    errorMessage.style.opacity = '1';
                  }, 500);
                }, 2000);
              }
            })
            .catch(err => {
              console.error('Error:', err);
            });
        });
      }


    });


}

document.addEventListener('DOMContentLoaded', function () {
  checkLogin();

  const openDashboardButton = document.getElementById('openDashboardButton');
  openDashboardButton.addEventListener('click', function () {
    // Use the chrome.tabs.create method to open a new tab with the dashboard URL
    chrome.tabs.create({ url: 'https://aisma.wr.io/dashboard/' }, function (tab) {
      // Handle any errors that might occur while creating the tab
      if (chrome.runtime.lastError) {
        console.error('Error opening dashboard tab:', chrome.runtime.lastError);
      }
    });
  });

});
