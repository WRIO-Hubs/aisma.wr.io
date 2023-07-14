
// Send a message to the background script to retrieve the saved link
chrome.runtime.sendMessage({ action: 'getSavedLink' }, function (response) {
  if (response && response.link) {
    displayLink(response.link);
  }
});

// Display the link in the popup
function displayLink(link) {
  const linkContainer = document.getElementById('linkContainer');
  if (linkContainer) {
    const linkElement = document.createElement('a');
    linkElement.href = link;
    linkElement.target = '_blank';
    linkElement.textContent = link;
    linkContainer.appendChild(linkElement);
  }
}
