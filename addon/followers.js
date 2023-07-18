// Check if the current URL matches the followers page pattern
function checkFollowersPage() {
  const currentURL = window.location.href;

  const followersPagePattern = /^https?:\/\/twitter\.com\/([^/]+)\/followers(\/\w+)?$/;
  const match = currentURL.match(followersPagePattern);

  if (match) {
    const username = match[1];
    console.log('Followers page for:', username);

    // Function to check elements and apply styles
    function checkElements(criteria) {
      console.log('criteriaN:', criteria);
      const elements = document.querySelectorAll('[data-testid="UserCell"]');
      elements.forEach((element) => {
        const textElements = element.querySelectorAll('.css-901oao.css-16my406.r-poiln3.r-bcqeeo.r-qvutc0');
        let mergedText = '';
        textElements.forEach((textElement) => {
          const text = textElement.textContent;
          mergedText += text + ' ';
        });
        console.log('mergedText:', mergedText);

        const hasMatch = criteria.some((word) => mergedText.toLowerCase().includes(word.toLowerCase()));

        if (hasMatch) {
          element.style.border = '1px solid green';
          element.style.backgroundColor = 'lightgreen';
        } else {
          element.style.border = 'none';
          element.style.backgroundColor = 'initial';
        }
      });
    }

    // Function to continuously try finding elements
  function tryFindingElements() {
    const elements = document.querySelectorAll('[data-testid="cellInnerDiv"]');
    if (elements.length > 0) {
      clearInterval(intervalId);

      chrome.storage.local.get('criteria', function(result) {
        const initialCriteria = result.criteria;
        console.log('Retrieved criteria from storage:', initialCriteria);
        // Use the criteria in your code as needed
        //const initialCriteria = localStorage.getItem('criteria');
        const initialMatchWords = initialCriteria ? initialCriteria.split(',').map(word => word.trim()) : [];
        console.log('Initial Criteria:', initialMatchWords);
        checkElements(initialMatchWords);
      });
    }
  }

  // Function to handle scroll event
  function handleScroll() {
    clearInterval(intervalId);
    intervalId = setInterval(tryFindingElements, 1000);
  }

  // Perform the initial check on elements
  let intervalId;
  intervalId = setInterval(tryFindingElements, 1000);

  // Add scroll event listener
  window.addEventListener('scroll', handleScroll);
  }
}

// Call the function to start checking on the followers page
checkFollowersPage();
