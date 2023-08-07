function showDescriptionText(descriptionElement) {
  // Display the text content in the console
  console.log(descriptionElement.textContent.trim());
}

function observeDescriptionElements() {
  const descriptionContainer = document.querySelector(
    '.update-components-actor__description.t-black--light.update-components-actor--with-control-menu-and-hide-post'
  );

  if (descriptionContainer) {
    const descriptionElement = descriptionContainer.querySelector('.t-12.t-normal');
    if (descriptionElement) {
      showDescriptionText(descriptionElement);
    }
  }
}

function observeNewElements() {
  // Find all elements with the specified classes
  const targetElements = document.querySelectorAll('.update-components-actor__description.t-black--light.update-components-actor--with-control-menu-and-hide-post .t-12.t-normal');

  // Check if there are any new elements found
  if (targetElements.length > 0) {
    for (const targetElement of targetElements) {
      // Display the text content in the console for each new element
      showDescriptionText(targetElement);
    }
  }
}

// Call the function to show the description text on initial page load
observeDescriptionElements();

// Create a MutationObserver to observe changes to the DOM and call the observeNewElements() function when new elements are added
const mutationObserver = new MutationObserver(observeNewElements);

// Observe the body element and its descendants for additions of child elements
mutationObserver.observe(document.body, {
  childList: true,
  subtree: true,
});

// Call the observeNewElements() function on scroll event
window.addEventListener('scroll', observeNewElements);
