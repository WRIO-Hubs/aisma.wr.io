function checkDMAssistPage() {
  const currentURL = window.location.href;
  let attempts = 0;
  let windowFocused = true; // Flag to track if the window is focused

  // Function to find and add text to the element
  function findAndAddTextToElement(userNameParam) {
    const dmComposerTextInput = document.querySelector('[data-testid="dmComposerTextInput"]');
    if (dmComposerTextInput) {
      dmComposerTextInput.click();
      dmComposerTextInput.focus();

      // Function to copy the text to the clipboard
      function copyToClipboard(text) {
        try {
          const textArea = document.createElement('textarea');
          textArea.value = text;
          document.body.appendChild(textArea);
          textArea.select();
          document.execCommand('copy');
          document.body.removeChild(textArea);
          //console.log('Text copied to clipboard successfully.');
        } catch (error) {
          //console.error('Failed to copy text to clipboard:', error);
        }
      }

      // Attempt to retrieve the twitterMessage from chrome.storage.local
      chrome.storage.local.get(['twitterMessage'], function (result) {
        const twitterMessage = result['twitterMessage'] || '';
        // Remove the square brackets []
        const messages = twitterMessage.slice(1, -1).split('],[');

        // Check if we have at least 3 message parts
        if (messages.length >= 3) {
          const messageParts1 = messages[0].split('][');
          const messageParts2 = messages[1].split('][');
          const messageParts3 = messages[2].split('][');

          // Randomly choose one part from each message part
          const randomIndex1 = Math.floor(Math.random() * messageParts1.length);
          const randomIndex2 = Math.floor(Math.random() * messageParts2.length);
          const randomIndex3 = Math.floor(Math.random() * messageParts3.length);

          // Modify the chosen message parts as needed and replace $UserName with userNameParam
          const modifiedMessage1 = messageParts1[randomIndex1].replace(/\\n/g, '\n').replace(/\$UserName/g, userNameParam);
          const modifiedMessage2 = messageParts2[randomIndex2].replace(/\\n/g, '\n').replace(/\$UserName/g, userNameParam);
          const modifiedMessage3 = messageParts3[randomIndex3].replace(/\\n/g, '\n').replace(/\$UserName/g, userNameParam);

          // Append the AI Social Media Assistant signature
          const signature = "---\nSent by AI Social Media Assistant\nAISMA.wr(dot)io";
          const formattedMessage =
            `${modifiedMessage1}\n${modifiedMessage2}\n${modifiedMessage3}\n${signature}`;

          // Copy the formattedMessage to the clipboard only if the window is focused
          if (windowFocused) {
            copyToClipboard(formattedMessage);
          }

          dmComposerTextInput.click();
          dmComposerTextInput.focus();
        }
      });
    } else {
      attempts++;
      if (attempts < 10) {
        setTimeout(() => findAndAddTextToElement(userNameParam), 1000);
      }
    }
  }

  // Get the value of the 'userName' parameter from the URL
  const userNameParam = getParameterByName('userName', currentURL);
  if (userNameParam && currentURL.endsWith('dm_assist')) {
    // Create a link element for the CSS file
    const cssLink = document.createElement('link');
    cssLink.rel = 'stylesheet';
    cssLink.type = 'text/css';
    cssLink.href = chrome.runtime.getURL('assets/css/tooltip.css');

    // Append the link element to the head of the page
    document.head.appendChild(cssLink);

    // Load the tooltip HTML from tooltip.html and add it to the body
    fetch(chrome.runtime.getURL('modules/tooltip.html'))
      .then(response => response.text())
      .then(html => {
        const parser = new DOMParser();
        const tooltipElement = parser.parseFromString(html, 'text/html').getElementById('helpTooltip');
        document.body.appendChild(tooltipElement);

        // Add event listeners to track window focus and blur events
        window.addEventListener('focus', () => {
          windowFocused = true;
          // Call findAndAddTextToElement with the userNameParam when the window is in focus
          findAndAddTextToElement(userNameParam);
        });

        window.addEventListener('blur', () => {
          windowFocused = false;
        });

        // Call findAndAddTextToElement with the userNameParam initially
        findAndAddTextToElement(userNameParam);
      });
  }
}

// Function to get the value of a URL parameter
function getParameterByName(name, url) {
  if (!url) url = window.location.href;
  name = name.replace(/[[\]]/g, '\\$&');
  const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`);
  const results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

// Function to continuously check if the URL has changed and call checkDMAssistPage
function handleURLChange() {
  let previousURL = window.location.href;

  setInterval(() => {
    const currentURL = window.location.href;
    if (currentURL !== previousURL) {
      checkDMAssistPage();
      previousURL = currentURL;
    }
  }, 1000);
}

// Call the function to check if the URL has "?dm_assist" initially
checkDMAssistPage();

// Call the function to start listening for URL changes
handleURLChange();
