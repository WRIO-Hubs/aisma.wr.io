function checkDMPage() {
  const currentURL = window.location.href;
  let attempts = 0;

  // Function to find the "Message" button and click it
  function findAndClickMessageButton() {
    const messageButton = document.querySelector('[data-testid="sendDMFromProfile"]');
    const userNameElement = document.querySelector('[data-testid="UserName"]');
    const nonDirectChild = userNameElement && userNameElement.querySelector('.css-901oao.css-16my406.r-poiln3.r-bcqeeo.r-qvutc0');

    if (messageButton && userNameElement && nonDirectChild) {
      const fullName = nonDirectChild.textContent.trim();
      const firstSpaceIndex = fullName.indexOf(' ');
      const firstName = firstSpaceIndex !== -1 ? fullName.substring(0, firstSpaceIndex) : fullName;
      messageButton.click();

      // Replace "?dm" with "?dm_assist&userName=<firstName>" in the URL after clicking the "Message" button
      if (currentURL.endsWith('?dm')) {
        const newURL = currentURL.replace('?dm', `?userName=${encodeURIComponent(firstName)}&dm_assist`);
        window.history.replaceState({}, document.title, newURL);
      }
    } else {
      attempts++;
      if (attempts < 10) {
        setTimeout(findAndClickMessageButton, 1000);
      }
    }
  }

  // Check if the URL ends with "?dm"
  if (currentURL.endsWith('?dm')) {
    findAndClickMessageButton();
  }
}

// Function to continuously check if the user is on the Twitter profile page with "?dm" in the URL
function handleURLChange() {
  let previousURL = window.location.href;

  setInterval(() => {
    const currentURL = window.location.href;
    if (currentURL !== previousURL) {
      checkDMPage();
      previousURL = currentURL;
    }
  }, 1000);
}

// Call the function to check if the user is on the Twitter profile page with "?dm" in the URL initially
checkDMPage();

// Call the function to start listening for URL changes
handleURLChange();
