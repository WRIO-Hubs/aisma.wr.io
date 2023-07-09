let intervalID = null;

// Check if the current URL matches the followers page pattern
function checkFollowersPage() {
  const currentURL = window.location.href;
  console.log('currentURL:', currentURL);

  const followersPagePattern = /^https?:\/\/twitter\.com\/([^/]+)\/followers(\/\w+)?$/;
  const match = currentURL.match(followersPagePattern);

  if (match) {
    const username = match[1];
    console.log('Followers page for:', username);

    // Check elements and text for matches
    const elements = document.querySelectorAll('[data-testid="cellInnerDiv"] .css-901oao.r-18jsvk2.r-37j5jr.r-a023e6.r-16dba41.r-rjixqe.r-bcqeeo.r-1h8ys4a.r-1jeg54m.r-qvutc0');
    elements.forEach((element) => {
      const textElements = element.querySelectorAll('.css-901oao.css-16my406.r-poiln3.r-bcqeeo.r-qvutc0');
      let mergedText = '';
      textElements.forEach((textElement) => {
        const text = textElement.textContent;
        mergedText += text + ' ';
      });
      console.log('mergedText:', mergedText);

      const matchWords = ['founder', 'saas', 'business'];
      const hasMatch = matchWords.some((word) => mergedText.toLowerCase().includes(word.toLowerCase()));

      if (hasMatch) {
        console.log('MATCH!!!');
        element.style.border = '4px solid green';
      } else {
        element.style.border = 'none';
      }
    });
  }
}

// Restart the intervalID on user action
function restartInterval() {
  clearInterval(intervalID);
  intervalID = setInterval(checkFollowersPage, 5000);
}

// Run the initial check
checkFollowersPage();

// Listen for user actions to restart the interval
window.addEventListener('mousemove', restartInterval);
// Add more event listeners as needed for other user actions

// Start the interval
intervalID = setInterval(checkFollowersPage, 5000);
