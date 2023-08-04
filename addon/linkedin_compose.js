let lnEnabled = false;

// Function to find all elements with the specified class
function findElementsByClass(className) {
  return document.getElementsByClassName(className);
}

// Function to append "Hi!" text to the target element's child <p> element
function appendHiToChildP(targetElement) {
  const hiText = document.createTextNode(' Hi!');
  const childP = targetElement.querySelector('p');
  if (childP) {
    childP.appendChild(hiText);
  }
}

// Function to create and append the "Ok" button to the target element
function appendOkButton(targetElement) {
  const okButton = document.createElement('button');
  okButton.textContent = 'Ok';
  okButton.addEventListener('click', () => {
    appendHiToChildP(targetElement);
  });

  // Check if the "Ok" button is not already appended to the target element
  if (!targetElement.hasAttribute('data-ok-button-appended')) {
    targetElement.appendChild(okButton);
    targetElement.setAttribute('data-ok-button-appended', true); // Add custom attribute to mark the appended "Ok" button
  }
}

// Function to append the "Ok" button to all target elements with class "comments-comment-box__form"
function appendOkButtonsToAll() {
  const targetElements = findElementsByClass('comments-comment-box__form');

  if (targetElements.length > 0) {
    for (const targetElement of targetElements) {
      // Check if the "Ok" button is not already appended to this element
      if (!targetElement.hasAttribute('data-ok-button-appended')) {
        appendOkButton(targetElement);
      }
    }
  }
}

// Function to try finding the elements and append the "Ok" button
function findElementsAndAppendOkButton() {
  appendOkButtonsToAll();
}

// Call the function once when the page content is loaded
document.addEventListener('DOMContentLoaded', findElementsAndAppendOkButton);

// Function to try finding the elements with a 1-second interval
function findElementsRepeatedly() {
  appendOkButtonsToAll(); // Append the "Ok" button to all target elements
}

setInterval(findElementsRepeatedly, 2500);

// Call the findElementsRepeatedly() function when the user scrolls the feed
window.addEventListener('scroll', findElementsRepeatedly);
