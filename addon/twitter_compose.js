let tooltipEnabled = false;
let tweetTextFound = false; // Variable to track whether the tweet text element is found
let tooltipElement; // Variable to store the tooltip element

function sendWebhook(prompt, tweetText) {
  const webhookUrl = 'https://aisma-twitter-reply.wrio.workers.dev/';
  fetch(webhookUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ prompt: prompt, tweetText: tweetText }),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error('Webhook request failed');
      }
      return response.text(); // Parse the response body as text
    })
    .then((data) => {
      const tooltipTextElement = tooltipElement ? tooltipElement.querySelector('#tooltipResponse') : null;
      if (tooltipTextElement) {
        tooltipTextElement.textContent = data;

        document.querySelector('#copyToClipboardBtn').style.display = "block";
      }
    })
    .catch((error) => {
      console.error('Failed to send webhook:', error);
    });
}

// Function to copy the text to the clipboard
function copyToClipboard(elementId) {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with ID '${elementId}' not found.`);
    return;
  }

  const text = element.textContent;

  // Create a temporary textarea to copy the text to the clipboard
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'absolute';
  textarea.style.left = '-9999px';
  document.body.appendChild(textarea);

  // Copy the text from the textarea to the clipboard using the Clipboard API
  textarea.select();
  document.execCommand('copy');

  // Remove the temporary textarea
  document.body.removeChild(textarea);
}

// Function to show the tooltip with Webhook response data
function showTooltip(data) {
  if (!tooltipElement) {
    // Fetch the tooltip CSS file and add the tooltip HTML to the body
    fetch(chrome.runtime.getURL('assets/css/tooltip.css'))
      .then((response) => response.text())
      .then((css) => {
        const styleElement = document.createElement('style');
        styleElement.innerHTML = css;
        document.head.appendChild(styleElement);
      })
      .then(() => {
        fetch(chrome.runtime.getURL('modules/tooltip-compose.html'))
          .then((response) => response.text())
          .then((html) => {
            const parser = new DOMParser();
            tooltipElement = parser.parseFromString(html, 'text/html').getElementById('helpTooltip');
          })
          .then(() => {
            document.body.appendChild(tooltipElement);
            showTooltipContent(data);
          });
      });
  } else {
    showTooltipContent(data);
  }
}


// Function to create the "Copy to Clipboard" button and handle its click event
function createCopyButton(data) {
  const container = document.createElement('div');
  container.style.position = 'relative';

  const container_response = document.createElement('div');
  container_response.id = 'tooltipResponse';
  container_response.style.margin = '10px 0 0';
  container_response.style.width = '320px';

  const copyButton = document.createElement('button');
  copyButton.textContent = 'Copy to Clipboard';
  copyButton.id = 'copyToClipboardBtn';
  copyButton.style.marginTop = '10px';
  copyButton.style.padding = '5px 10px';
  copyButton.style.backgroundColor = '#4CAF50';
  copyButton.style.color = 'white';
  copyButton.style.border = 'none';
  copyButton.style.borderRadius = '4px';
  copyButton.style.cursor = 'pointer';
  copyButton.style.display = 'none';

  copyButton.addEventListener('click', () => {
    copyToClipboard('tooltipResponse'); // Pass the element ID here
    console.log('Webhook response copied to clipboard successfully.');
  });

  container.appendChild(container_response);
  container.appendChild(copyButton);

  return container;
}

// Function to handle the submit event when the user clicks the submit button
async function handleWebhookSubmit() {
  document.querySelector('#tooltipResponse').textContent = "Please wait, the response is generating..."

  const webhookPromptInput = document.getElementById('webhookPrompt');
  if (webhookPromptInput) {
    let prompt = webhookPromptInput.value.trim(); // Trim the input value to remove leading and trailing spaces

    const tweetTextElement = document.querySelector('[data-testid="tweetText"] span');

    //tweetTextFound = true;
    const tweetText = tweetTextElement.textContent;
    //console.log("tweetText:", tweetText);

    // Check if the prompt is empty, and if so, assign the default value
    if (prompt === '') {
      prompt = 'Write a funny reply';
    }

    try {
      await sendWebhook(prompt, tweetText);
    } catch (error) {
      console.error('Error sending webhook:', error);
    }
  }
}

// Function to show the tooltip content
function showTooltipContent(data) {
  const tooltipTextElement = tooltipElement ? tooltipElement.querySelector('.tooltip-text') : null;
  if (tooltipTextElement) {
    tooltipTextElement.textContent = data;
    tooltipElement.style.display = 'block';

    // Add the form for custom prompt and submit button
    const formElement = document.createElement('div');
    formElement.className = 'tooltip-form';

    const promptInput = document.createElement('input');
    promptInput.type = 'text';
    promptInput.id = 'webhookPrompt';
    promptInput.placeholder = 'Write a funny reply';
    formElement.appendChild(promptInput);

    const submitButton = document.createElement('button');
    submitButton.textContent = 'Submit';
    submitButton.id = 'submitWebhookBtn';
    submitButton.addEventListener('click', handleWebhookSubmit); // Add the event listener here
    formElement.appendChild(submitButton);

    // Add the "Copy to Clipboard" button after the prompt input field
    const copyButtonContainer = createCopyButton(data);
    formElement.appendChild(copyButtonContainer);

    tooltipTextElement.appendChild(formElement);
  } else {
    console.error('Tooltip text element not found.');
  }
}


// Function to find the "reply" button and attach the click event listener
function findReplyButton() {

  // Find the "reply" button
  const replyButton = document.querySelector('[data-testid="reply"]');

  if (replyButton && !tweetTextFound) {

    // Create and append the <span> element
    /*const spanElement = document.createElement('span');
    spanElement.innerHTML = 'AISMA<br><sup>powered</sup>';
    spanElement.style.position = 'absolute';
    spanElement.style.whiteSpace = 'nowrap';
    spanElement.style.right = '25px';
    spanElement.style.top = '15px';
    spanElement.style.fontWeight = 'bold';
    spanElement.style.fontFamily = 'sans-serif';
    spanElement.style.fontSize = 'small';
    spanElement.style.textAlign = 'center';
    spanElement.style.lineHeight = '10px';
    replyButton.appendChild(spanElement);*/

    //replyButton.addEventListener('click', showTooltip); // Show the tooltip onclick
    showTooltip("A prompt for AISMA's tweet reply");

    tooltipEnabled = true;

  }
}


let previousURL = window.location.href;

setInterval(() => {
  const currentURL = window.location.href;
  // Check if the URL has changed
  if (currentURL !== previousURL) {
    previousURL = currentURL; // Update the previous URL to the current URL
    const hasStatusKeyword = currentURL.includes('status');
    const hasComposeKeyword = currentURL.includes('compose');

    if (hasStatusKeyword || hasComposeKeyword) {
      if (!tooltipEnabled) {
        findReplyButton();
      }
    } else {
      tooltipEnabled = false;
      const helpTooltipElement = document.querySelector('#helpTooltip');
      if (helpTooltipElement) {
        helpTooltipElement.style.display = 'none';
      }
    }
  }

}, 2500);
