let lnEnabled = false;
let postTextMap = {}; // Object to store the scraped text for each post

function sendWebhook(prompt, postText, postId) {
  const webhookUrl = 'https://aisma-post-reply.wrio.workers.dev/';
  fetch(webhookUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ prompt: prompt, postText: postText }),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error('Webhook request failed');
      }
      return response.text(); // Parse the response body as text
    })
    .then((data) => {
      console.log('prompt', prompt);
        console.log('postText', postText);
      const sanitizedResponse = sanitizeResponse(data); // Remove double quotes from the beginning and end

        const targetElement = document.querySelector(`[data-id="urn:li:activity:${postId}"]`);
        if (targetElement) {
          // Find the .ql-editor.ql-blank class within the target element
          const qlEditorBlankElement = targetElement.querySelector('.ql-editor.ql-blank');

          if (qlEditorBlankElement) {
            // Create a new p element to hold the sanitized response
            const responseTextElement = qlEditorBlankElement.querySelector('p');

            // Append the AI Social Media Assistant signature
            const signature = "\n\n⚡ by aisma.wr.​io";
            const textWithSignature = sanitizedResponse + signature;

            responseTextElement.textContent = textWithSignature;
          }
        }

    })
    .catch((error) => {
      console.error('Failed to send webhook:', error);
    });
}

function sanitizeResponse(response) {
  // Check if the response is a string and not empty
  if (typeof response === 'string' && response.trim() !== '') {
    // Remove double quotes from the beginning and end of the response
    response = response.replace(/^"/, '').replace(/"$/, '');
  }
  return response;
}

// Function to find all elements with the specified class
function findElementsByClass(className) {
  return document.getElementsByClassName(className);
}

// Function to create and append the input field and submit button to the target element
function appendInputFieldAndSubmitButton(targetElement, postId) {
  const inputField = document.createElement('input');
  inputField.type = 'text';
  inputField.id = `webhookPrompt_${postId}`;
  inputField.placeholder = 'Write a funny comment';
  inputField.style.marginTop = '10px';

  const submitButton = document.createElement('button');
  submitButton.textContent = 'Submit';
  submitButton.style.marginTop = '10px';
  submitButton.style.padding = '5px 10px';
  submitButton.style.backgroundColor = '#4CAF50';
  submitButton.style.color = 'white';
  submitButton.style.border = 'none';
  submitButton.style.borderRadius = '4px';
  submitButton.style.cursor = 'pointer';

  submitButton.addEventListener('click', () => {
    handleWebhookSubmit(postId);
  });

  targetElement.appendChild(inputField);
  targetElement.appendChild(submitButton);
}


// Function to append the input field and submit button to all target elements with class "comments-comment-box__form"
function appendInputFieldsAndSubmitButtonsToAll() {
  const targetElements = findElementsByClass('comments-comment-box__form');

  if (targetElements.length > 0) {
    for (const targetElement of targetElements) {
      const postIdAttribute = targetElement.closest('[data-id]').getAttribute('data-id'); // Update the attribute selector to match the element's data-id attribute
      // Extract the numeric postId from the data-id attribute
      const postId = postIdAttribute.match(/\d+/)[0];
      // Check if the input field and submit button are not already appended to this element
      if (!targetElement.hasAttribute('data-input-field-appended')) {
        appendInputFieldAndSubmitButton(targetElement, postId);
        targetElement.setAttribute('data-input-field-appended', true); // Add custom attribute to mark the appended input field and submit button
      }
    }
  }
}

// Function to try finding the elements and append the input field and submit button
function findElementsAndAppendInputFieldAndSubmitButton() {
  appendInputFieldsAndSubmitButtonsToAll();

  // Scrape and store the text of each post
  const postElements = document.querySelectorAll('[data-id] [data-test-selector="message-entity-view"] span');
  if (postElements.length > 0) {
    for (const postElement of postElements) {
      const postId = postElement.closest('[data-id]').getAttribute('data-id');
      postTextMap[postId] = postElement.textContent.trim();
    }
  }
}

// Call the function once when the page content is loaded
document.addEventListener('DOMContentLoaded', findElementsAndAppendInputFieldAndSubmitButton);

// Function to handle the submit event when the user clicks the submit button
async function handleWebhookSubmit(postId) {
  const webhookPromptInput = document.getElementById(`webhookPrompt_${postId}`);
  if (webhookPromptInput) {
    let prompt = webhookPromptInput.value.trim(); // Trim the input value to remove leading and trailing spaces

    const postText = postTextMap[postId] || ''; // Use default value if postTextMap doesn't have a value for the postId

    // Check if the prompt is empty, and if so, assign the default value
    if (prompt === '') {
      prompt = 'Write a funny comment';
    }

    try {
      const response = await sendWebhook(prompt, postText, postId);
    } catch (error) {
      console.error('Error sending webhook:', error);
    }
  } else {
    console.error(`Webhook prompt input not found for postId ${postId}`);
  }
}



// Function to try finding the elements with a 1-second interval
function findElementsRepeatedly() {
  appendInputFieldsAndSubmitButtonsToAll(); // Append the input field and submit button to all target elements

  // Scrape and store the text of each post
  const postElements = document.querySelectorAll('[data-id]');

  if (postElements.length > 0) {
    for (const postElement of postElements) {
      const postIdAttribute = postElement.getAttribute('data-id');
      // Extract the numeric postId from the data-id attribute
      const postId = postIdAttribute.match(/\d+/)[0];

      const commentaryElement = postElement.querySelector('.feed-shared-update-v2__commentary span');

      if (commentaryElement) {
        const spanElements = commentaryElement.querySelectorAll('span');
        let scrapedText = '';
        for (const spanElement of spanElements) {
          scrapedText += spanElement.textContent.trim() + ' ';
        }
        postTextMap[postId] = scrapedText.trim(); // Store the combined text content in the postTextMap
        /*console.log('scrapedText:', scrapedText);
        console.log('postId:', postId);*/

      } else {
        //console.log(`No commentary element found for postId ${postId}`);
        postTextMap[postId] = ''; // Set an empty string as the value for the postId if the element is not found
      }
    }
  }
}


// Function to call findElementsRepeatedly() on scroll event
function handleScrollEvent() {
  findElementsRepeatedly();
  // Add any additional logic or action you want to perform on scroll here
}

// Call the findElementsRepeatedly() function when the user scrolls the feed
window.addEventListener('scroll', handleScrollEvent);

// Create a MutationObserver to observe changes to the DOM and call the appendInputFieldsAndSubmitButtonsToAll() function when new elements are added
const mutationObserver = new MutationObserver(appendInputFieldsAndSubmitButtonsToAll);

// Observe the body element and its descendants for additions of child elements
mutationObserver.observe(document.body, {
  childList: true,
  subtree: true,
});

// Call the appendInputFieldsAndSubmitButtonsToAll() function on initial page load
appendInputFieldsAndSubmitButtonsToAll();
