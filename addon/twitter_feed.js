function getInitialMatchWords(callback) {
  chrome.storage.local.get('criteria', function(result) {
    try {
      const initialCriteria = result.criteria;
      const initialMatchWords = initialCriteria ? initialCriteria.split(',').map(word => word.trim()) : [];

      if (initialMatchWords.length === 0) {
        console.log('Initial Criteria is empty.');
      } else {
        //console.log('Initial Criteria:', initialMatchWords);
      }

      callback(initialMatchWords);
    } catch (error) {
      console.error('Error while processing initial criteria:', error);
      callback([]);
    }
  });
}


  function formatTimeDifference(timeDifference) {
    const seconds = Math.floor(timeDifference / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const weeks = Math.floor(days / 7);
    const months = Math.floor(days / 30);

    if (months >= 1) {
      return months === 1 ? '1 month ago' : `${months} months ago`;
    } else if (weeks >= 1) {
      return weeks === 1 ? '1 week ago' : `${weeks} weeks ago`;
    } else if (days >= 1) {
      return days === 1 ? '1 day ago' : `${days} days ago`;
    } else if (hours >= 1) {
      return hours === 1 ? '1 hour ago' : `${hours} hours ago`;
    } else if (minutes >= 1) {
      return minutes === 1 ? '1 minute ago' : `${minutes} minutes ago`;
    } else {
      return 'Just now';
    }
  }




  // Function to find tweet elements and check if user is scanned
  function findElement() {

    const tweetElements = document.querySelectorAll('[data-testid="tweet"]:not(.db_checked)');

    tweetElements.forEach((tweetElement) => {

      // Find the target element using its class names
      const avatarTargetElement = tweetElement.querySelector('[data-testid="Tweet-User-Avatar"]');

      const tweetahref = tweetElement.querySelector('a.css-4rbku5.css-18t94o4.css-1dbjc4n.r-1loqt21.r-1wbh5a2.r-dnmrzs.r-1ny4l3l');

      if (tweetahref) {
        const link = tweetahref.getAttribute('href');
        const tweetAuthorMatch = link.match(/\/([^/]+)/);
        const tweetAuthor = tweetAuthorMatch[1]; // Define tweetAuthor here

        if (tweetAuthorMatch) {
        DBChecking(tweetAuthor, (dbChecked) => {
          const topMenu = tweetElement.querySelector('.css-1dbjc4n.r-1iusvr4.r-16y2uox.r-1777fci.r-kzbkwu');

          // Check if matchedWordsContainer already exists, otherwise create it
          let matchedWordsContainer = tweetElement.querySelector('.matched-words-container');
          if (topMenu && !matchedWordsContainer) {
            // Create matchedWordsContainer element
            matchedWordsContainer = document.createElement('div'); // Remove 'const' here
            matchedWordsContainer.classList.add('matched-words-container', 'fs-13', 'mb-10', 'r-a023e6', 'css-901oao', 'css-1hf3ou5', 'r-1sw30gj', 'r-sqpuna', 'r-14j79pv', 'r-37j5jr', 'r-majxgm', 'r-56xrmm', 'r-bcqeeo', 'r-s1qlax', 'r-1vvnge1', 'r-qvutc0');

            // Append the matchedWordsContainer to the tweet element
            topMenu.insertBefore(matchedWordsContainer, topMenu.firstChild);
          }

          if (dbChecked) {
            tweetElement.classList.add('db_checked'); // Add the class to mark as checked
            const linkElement = 'https://twitter.com/' + tweetAuthor;


            let matchedWords = [];
            let isMatch = false;

            if (dbChecked.matchedWords && dbChecked.matchedWords.length > 0) {
              matchedWords = dbChecked.matchedWords;
              isMatch = true;
            }



          const existingTopElement = tweetElement.querySelector('.topMenu');
          if (!existingTopElement) {



            // Function to add a stylesheet link to the <head> element
            function addStylesheetLink(href) {const styleLink = document.createElement('link');styleLink.rel = 'stylesheet';styleLink.href = href;document.head.appendChild(styleLink);}

            // Apply the external stylesheets to the fetched menu content
            fetch(chrome.runtime.getURL('modules/tweet_menu.html'))
              .then(response => response.text())
              .then(html => {
                // Add external stylesheets
                addStylesheetLink(chrome.runtime.getURL('modules/styles.css'));
                addStylesheetLink('https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.2.1/css/fontawesome.min.css');

                // Create a temporary container to hold the fetched HTML
                const tempContainer = document.createElement('div');
                tempContainer.innerHTML = html;

                // Get the content from the temporary container
                const menuContent = tempContainer.querySelector('.menuContainer');

                // Find the target element and its parent
                const targetElement = tweetElement.querySelector('.matched-words-container');
                const parentElement = targetElement.parentNode;

                // Insert the fetched menu content before the target element
                parentElement.insertBefore(menuContent, targetElement);
              });






              // Create the element and add the class
              const topMenuElement = document.createElement('div');
              topMenuElement.classList.add('topMenu');
              matchedWordsContainer.parentNode.insertBefore(topMenuElement, matchedWordsContainer);


            const existingFollowingElement = tweetElement.querySelector('.followingElement');
            if (!existingFollowingElement) {

              // Create the element and add the class
              const followingElement = document.createElement('div');
              followingElement.classList.add('followingElement');

              // Create the <svg> element for the icon
              const followingSvgElement = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
              followingSvgElement.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
              followingSvgElement.setAttribute('height', '1.25em');
              followingSvgElement.setAttribute('viewBox', '0 0 512 512');
              followingSvgElement.innerHTML = '<path d="M256 0a256 256 0 1 0 0 512A256 256 0 1 0 256 0zM376.9 294.6L269.8 394.5c-3.8 3.5-8.7 5.5-13.8 5.5s-10.1-2-13.8-5.5L135.1 294.6c-4.5-4.2-7.1-10.1-7.1-16.3c0-12.3 10-22.3 22.3-22.3l57.7 0 0-96c0-17.7 14.3-32 32-32l32 0c17.7 0 32 14.3 32 32l0 96 57.7 0c12.3 0 22.3 10 22.3 22.3c0 6.2-2.6 12.1-7.1 16.3z"/>'; // Add your SVG path data here

              // Append the <svg> element to the followingElement
              followingElement.appendChild(followingSvgElement);

              // Set the tooltip text using the title attribute
              followingElement.title = dbChecked.following ? 'Following' : 'Not following';
              followingSvgElement.style.fill = dbChecked.following ? '#1D9BF0' : '#536471';

              matchedWordsContainer.parentNode.insertBefore(followingElement, matchedWordsContainer);
            }/* else {
              // If the element already exists, change SVG fill color based on following status
              const followingSvgElement = existingFollowingElement.querySelector('svg');
              followingSvgElement.style.fill = dbChecked.following ? '#1D9BF0' : '#536471';
            }*/




            const existingFollowsYouElement = tweetElement.querySelector('.followsYouElement');
            if (!existingFollowsYouElement) {
                // Following? Create the <div> element for following status
                const followsYouElement = document.createElement('div');
                followsYouElement.classList.add('followsYouElement');
                const followsYouSvgElement = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                followsYouSvgElement.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
                followsYouSvgElement.setAttribute('height', '1.25em');
                followsYouSvgElement.setAttribute('viewBox', '0 0 512 512');
                followsYouSvgElement.innerHTML = '<path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM135.1 217.4l107.1-99.9c3.8-3.5 8.7-5.5 13.8-5.5s10.1 2 13.8 5.5l107.1 99.9c4.5 4.2 7.1 10.1 7.1 16.3c0 12.3-10 22.3-22.3 22.3H304v96c0 17.7-14.3 32-32 32H240c-17.7 0-32-14.3-32-32V256H150.3C138 256 128 246 128 233.7c0-6.2 2.6-12.1 7.1-16.3z"/>'; // Add your SVG path data here
                // Append the <svg> element to the followsYouElement
                followsYouElement.appendChild(followsYouSvgElement);

                // Set the tooltip text using the title attribute
                followsYouElement.title = dbChecked.userFollow ? 'Follows you' : 'Not following you';
                followsYouSvgElement.style.fill = dbChecked.userFollow ? '#1D9BF0' : '#536471'; // Change color based on userFollow status

                matchedWordsContainer.parentNode.insertBefore(followsYouElement, matchedWordsContainer);

              }/* else {
                // If the element already exists, change SVG fill color based on userFollow status
                const followsYouSvgElement = existingFollowsYouElement.querySelector('svg');
                followsYouSvgElement.style.fill = dbChecked.userFollow ? '#1D9BF0' : '#536471';
              }*/



              const retryInterval = 250; const maxRetries = 25; let retryCount = 0;

              function loadingTopMenuHTML() {
                const menuContainerElement = tweetElement.querySelector('.menuContainer');

                if (!menuContainerElement && retryCount < maxRetries) { // checking if menu-container is available and we can populate the top menu
                  retryCount++;
                  setTimeout(loadingTopMenuHTML, retryInterval);
                  return;
                }

                  const currentTime = new Date().getTime();

                  const lastTimeRepliedElement = tweetElement.querySelector('.lastTimeReplied');
                  if (dbChecked.lastTimeReplied !== null) {
                    const lastTimeRepliedDifference = currentTime - dbChecked.lastTimeReplied;
                    const formattedLastTimeReplied = formatTimeDifference(lastTimeRepliedDifference);
                    lastTimeRepliedElement.innerHTML = `${formattedLastTimeReplied}`;
                  } else {
                    lastTimeRepliedElement.innerHTML = 'Never';
                  }
                  tweetElement.querySelector('.lastTimeRepliedTooltip').title = 'Last time, you replied to the user';

                  const prescannedElement = tweetElement.querySelector('.prescanned');
                  if (dbChecked.recorded_timestamp !== null) {
                    // Calculate the time difference between now and the stored timestamp
                    const timeDifference = currentTime - dbChecked.recorded_timestamp;
                    // Format the time difference in a human-readable format
                    const formattedTime = formatTimeDifference(timeDifference);
                    prescannedElement.innerHTML = `${formattedTime}`;
                  }

                  const recordedTimestamp = new Date(dbChecked.recorded_timestamp);
                  const options = { year: 'numeric', month: 'long', day: 'numeric' };
                  const formattedDate = recordedTimestamp.toLocaleDateString('en-US', options);
                  tweetElement.querySelector('.lastTimeScannedTooltip').title = `Time the profile was scanned · ${formattedDate}`;

              }

              loadingTopMenuHTML();



              // has Direct Message?
              if (dbChecked.directMessage !== undefined) {
                const directMessageElement = document.createElement('div');
                directMessageElement.textContent = 'DM: ' + dbChecked.directMessage;
                directMessageElement.style.backgroundColor = dbChecked.directMessage ? 'lightgreen' : 'lightgrey';
                directMessageElement.style.color = '#536471';
                directMessageElement.classList.add('css-901oao', 'r-1awozwy', 'r-jwli3a', 'r-6koalj', 'r-18u37iz', 'r-16y2uox', 'r-37j5jr', 'r-a023e6', 'r-b88u0q', 'r-1777fci', 'r-rjixqe', 'r-bcqeeo', 'r-q4m81j', 'r-qvutc0');

                const directMessageTargetElement = tweetElement.querySelector('.matched-words-container');
                const directMessageParentElement = directMessageTargetElement.parentNode;
                directMessageParentElement.insertBefore(directMessageElement, directMessageTargetElement);
              }



            }


            if (isMatch) {
              matchedWordsContainer.textContent = '✔️ ' + matchedWords.join(', ');
              tweetElement.querySelector('.matched-words-container').title = 'List of words that matched the given profile';

              const existingScanLink = tweetElement.querySelector('[data-testid="scanLink"]');

                 if (!existingScanLink) {

                   const scanLink = document.createElement('a');
                   scanLink.setAttribute('href', linkElement);
                   scanLink.innerText = dbChecked.scanned ? 'Rescan' : 'Scan'; // Toggle between "Scan" and "Rescan"
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
                   scanLink.classList.add('r-kzbkwu', 'css-901oao', 'r-1awozwy', 'r-jwli3a', 'r-6koalj', 'r-18u37iz', 'r-16y2uox', 'r-37j5jr', 'r-a023e6', 'r-b88u0q', 'r-1777fci', 'r-rjixqe', 'r-bcqeeo', 'r-q4m81j', 'r-qvutc0');
                   scanLink.setAttribute('data-testid', 'scanLink');

                   const targetElement = tweetElement.querySelector('.css-1dbjc4n.r-1joea0r > .css-1dbjc4n.r-18u37iz.r-1ssbvtb.r-1wtj0ep');
                   if (targetElement) {
                     const parentElement = targetElement.parentNode;
                     parentElement.insertBefore(scanLink, targetElement);
                   }

                   scanLink.addEventListener('click', (event) => {
                     event.preventDefault();
                     event.stopPropagation();
                     scanLink.innerText = 'Rescan';

                     // Open the scan URL in the extension
                     chrome.runtime.sendMessage({ openScanUrl: linkElement });

                   });

                 }
            } else {
              matchedWordsContainer.textContent = '✖️ Not a match';
              matchedWordsContainer.style.color = '#536471';
              tweetElement.querySelector('.matched-words-container').title = 'The list of words can be configured at https://aisma.wr.io/dashboard/';
            }



          } else {
            matchedWordsContainer.textContent = '👇 Hover over the username to prescan';
            matchedWordsContainer.style.color = 'grey';
          }


        });
      }
      }

    });

    findHoverCard();
  }


  function findHoverCard() {
    const hoverCard = document.querySelector('[data-testid="HoverCard"]:not(.checked)');
    if (hoverCard) {

      const tweetahref = hoverCard.querySelector('a.css-4rbku5.css-18t94o4.css-1dbjc4n.r-1loqt21.r-1wbh5a2.r-dnmrzs.r-1ny4l3l');
      if (tweetahref) {


        const link = tweetahref.getAttribute('href');
        const tweetAuthorMatch = link.match(/\/([^/]+)/);
        const tweetAuthor = tweetAuthorMatch[1]; // Get the username (captured group)

        hoverCard.classList.add('checked'); // Add the class to mark as checked

        const followingElement = hoverCard.querySelector('.css-901oao.css-16my406.css-1hf3ou5.r-poiln3.r-a023e6.r-rjixqe.r-bcqeeo.r-qvutc0');
        if (followingElement) {
          const followingText = followingElement.innerText.trim().toLowerCase();
          const following = followingText === 'following';

          const userFollowIndicator = hoverCard.querySelector('[data-testid="userFollowIndicator"]');
          const userFollow = userFollowIndicator !== null;

          const descriptionTextElement = document.querySelector('.css-901oao.r-18jsvk2.r-37j5jr.r-a023e6.r-16dba41.r-rjixqe.r-bcqeeo.r-qvutc0 > .css-901oao.css-16my406.r-poiln3.r-bcqeeo.r-qvutc0');
          if (descriptionTextElement) {
            getInitialMatchWords(function(initialMatchWords) {
              const text = descriptionTextElement.textContent.toLowerCase();
              const matchedWords = initialMatchWords.filter((word) => text.includes(word));
              if (matchedWords.length > 0) {

              }

              const updatedProperties = {
                matchedWords: matchedWords,
                following: following,
                userFollow: userFollow
              };

              updateIndexedDB(tweetAuthor, updatedProperties);
            });
          }
        }


      }


    }
  }



  // Function to find elements on page load and when scrolling
  function findElementsOnLoadAndScroll() {
    setTimeout(() => {
      findElement();
    }, 1000);

    // Add event listener to the tweet buttons
    const tweetButtons = document.querySelectorAll('[data-testid="tweetButton"], [data-testid="tweetButtonInline"]');
    tweetButtons.forEach((button) => {
      button.addEventListener('click', () => {
        const updatedProperties = {
          lastTimeReplied: new Date().getTime() // Update lastTimeReplied with the current timestamp
        };

        // Assuming tweetAuthorHandler contains the full tweet author including the "@" symbol
        const tweetAuthorHandler = document.querySelector('.css-901oao.css-1hf3ou5.r-14j79pv.r-18u37iz.r-37j5jr.r-1wvb978.r-a023e6.r-16dba41.r-rjixqe.r-bcqeeo.r-qvutc0 > .css-901oao.css-16my406.r-poiln3.r-bcqeeo.r-qvutc0');
        const tweetAuthorMatch = tweetAuthorHandler.textContent.match(/@([^/]+)/);

        if (tweetAuthorMatch) {
          const tweetAuthor = tweetAuthorMatch[1]; // Extract the tweet author without the "@"
          updateIndexedDB(tweetAuthor, updatedProperties);

          // Update the lastTimeRepliedElement if it exists
          /*const lastTimeRepliedElement = document.querySelector(`.matched-words-container[data-author="${tweetAuthor}"] + .last-time-replied`);
          if (lastTimeRepliedElement) {
            const lastTimeRepliedDifference = new Date().getTime() - updatedProperties.lastTimeReplied;
            lastTimeRepliedElement.textContent = `Last Replied: ${formatTimeDifference(lastTimeRepliedDifference)}`;
          }*/
        }
      });
    });

  }

  // Add event listeners to trigger the findElement function
  window.addEventListener('load', findElementsOnLoadAndScroll);
  window.addEventListener('scroll', findElementsOnLoadAndScroll);
  document.addEventListener('mouseover', findElementsOnLoadAndScroll);
