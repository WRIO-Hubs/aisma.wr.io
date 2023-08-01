// Check if the current URL matches the followers page pattern
function checkFollowersPage() {
  const currentURL = window.location.href;

  const followersPagePattern = /^https?:\/\/twitter\.com\/([^/]+)\/followers(\/\w+)?$/;
  const match = currentURL.match(followersPagePattern);

  if (match) {
    const username = match[1];

    // Function to check elements and apply styles
    function checkElements(criteria) {
      const elements = document.querySelectorAll('[data-testid="UserCell"]');
      elements.forEach((element) => {
        const textElements = element.querySelectorAll('.css-901oao.css-16my406.r-poiln3.r-bcqeeo.r-qvutc0');
        let mergedText = '';
        textElements.forEach((textElement) => {
          const text = textElement.textContent;
          mergedText += text + ' ';
        });

        const hasMatch = criteria.some((word) => mergedText.toLowerCase().includes(word.toLowerCase()));

        if (hasMatch && !element.dataset.scanLinkAdded) {
          element.style.border = '1px solid green';
          element.style.backgroundColor = 'lightgreen';

          const linkElement = element.querySelector('a.css-4rbku5.css-18t94o4.css-1dbjc4n.r-1loqt21.r-1wbh5a2.r-dnmrzs.r-1ny4l3l');
          if (linkElement) {
            const link = 'https://twitter.com' + linkElement.getAttribute('href');

            const scanLink = document.createElement('a');
            scanLink.setAttribute('href', link);
            scanLink.innerText = 'Scan';
            // Apply the updated styles
            scanLink.style.margin = '4px';
            scanLink.style.padding = '0 16px';
            scanLink.style.color = 'white';
            scanLink.style.fontSize = '14px';
            scanLink.style.textDecoration = 'none';
            scanLink.style.fontWeight = 'bold';
            scanLink.style.backgroundColor = 'rgb(15, 20, 25)';
            scanLink.style.minHeight = '32px';
            scanLink.style.borderRadius = '9999px';
            // Add the CSS classes
            scanLink.classList.add('css-901oao', 'r-1awozwy', 'r-jwli3a', 'r-6koalj', 'r-18u37iz', 'r-16y2uox', 'r-37j5jr', 'r-a023e6', 'r-b88u0q', 'r-1777fci', 'r-rjixqe', 'r-bcqeeo', 'r-q4m81j', 'r-qvutc0');

            const targetElement = element.querySelector('.r-o7ynqc.r-6416eg.r-lrvibr');
            if (targetElement) {
              const parentElement = targetElement.parentNode;
              parentElement.insertBefore(scanLink, targetElement);
              element.dataset.scanLinkAdded = true;
            }

            scanLink.addEventListener('click', (event) => {
              event.preventDefault();
              event.stopPropagation();
              chrome.runtime.sendMessage({ openScanUrl: link });
            });
          }
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
          //console.log('Retrieved criteria from storage:', initialCriteria);
          // Use the criteria in your code as needed
          //const initialCriteria = localStorage.getItem('criteria');
          const initialMatchWords = initialCriteria ? initialCriteria.split(',').map(word => word.trim()) : [];
          //console.log('Initial Criteria:', initialMatchWords);
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

// Listen for URL changes and call checkFollowersPage when needed
function handleURLChange() {
  let previousURL = window.location.href;

  setInterval(() => {
    const currentURL = window.location.href;
    if (currentURL !== previousURL) {
      checkFollowersPage();
      previousURL = currentURL;
    }
  }, 1000);
}

handleURLChange();
