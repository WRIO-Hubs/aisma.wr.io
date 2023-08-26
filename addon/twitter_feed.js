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

    // Add the following code in the head section of your HTML document
    const existingLink1 = document.querySelector('link[href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.2.1/css/fontawesome.min.css"]');
    if (!existingLink1) {
      document.head.insertAdjacentHTML('beforeend','<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.2.1/css/fontawesome.min.css">');
      /*const linkElement1 = document.createElement('link');
      linkElement1.rel = 'stylesheet';
      linkElement1.href = 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.1/dist/css/bootstrap.min.css';
      document.head.appendChild(linkElement1);*/
    }
    /*const existingLink2 = document.querySelector('link[href="https://bizcom.wr.io/assets/css/style.bundle.css"]');
    if (!existingLink2) {
      const linkElement2 = document.createElement('link');
      linkElement2.rel = 'stylesheet';
      linkElement2.href = 'https://bizcom.wr.io/assets/css/style.bundle.css';
      document.head.appendChild(linkElement2);
    }*/

    const tweetElements = document.querySelectorAll('[data-testid="tweet"]:not(.db_checked)');

    tweetElements.forEach((tweetElement) => {

      const tweetahref = tweetElement.querySelector('a.css-4rbku5.css-18t94o4.css-1dbjc4n.r-1loqt21.r-1wbh5a2.r-dnmrzs.r-1ny4l3l');

      if (tweetahref) {
        const link = tweetahref.getAttribute('href');
        const tweetAuthorMatch = link.match(/\/([^/]+)/);
        const tweetAuthor = tweetAuthorMatch[1]; // Define tweetAuthor here

        if (tweetAuthorMatch) {
        DBChecking(tweetAuthor, (dbChecked) => {
          const topMenu = tweetElement.querySelector('.css-1dbjc4n.r-1iusvr4.r-16y2uox.r-1777fci.r-kzbkwu');

          /*let followStatusParent = topMenu.querySelector('.follow-status-parent');
          if (!followStatusParent) {
            followStatusParent = document.createElement('div');
            followStatusParent.classList.add('css-1dbjc4n', 'r-1kbdv8c', 'r-18u37iz', 'r-1wtj0ep', 'r-1s2bzr4', 'r-hzcoqn', 'follow-status-parent');
            topMenu.appendChild(followStatusParent);
          }*/

          // Check if matchedWordsContainer already exists, otherwise create it
          let matchedWordsContainer = tweetElement.querySelector('.matched-words-container');
          if (!matchedWordsContainer) {
            // Create matchedWordsContainer element
            matchedWordsContainer = document.createElement('div'); // Remove 'const' here
            matchedWordsContainer.classList.add('matched-words-container', 'r-a023e6', 'css-901oao', 'css-1hf3ou5', 'r-1sw30gj', 'r-sqpuna', 'r-14j79pv', 'r-37j5jr', 'r-1gkfh8e', 'r-majxgm', 'r-56xrmm', 'r-bcqeeo', 'r-s1qlax', 'r-1vvnge1', 'r-qvutc0');
            matchedWordsContainer.style.fontSize = '13px';
            matchedWordsContainer.style.lineHeight = '12px';
            matchedWordsContainer.style.padding = '4px';

            // Append the matchedWordsContainer to the tweet element
            topMenu.insertBefore(matchedWordsContainer, topMenu.firstChild);
          }

          if (dbChecked) {
            tweetElement.classList.add('db_checked'); // Add the class to mark as checked
            const linkElement = 'https://twitter.com/' + tweetAuthor;

            let matchedWords = [];
            let isMatch = false;

            if (dbChecked.matchedWords.length > 0) {
              matchedWords = dbChecked.matchedWords;
              isMatch = true;
            }

            const existingTimestampElement = tweetElement.querySelector('.recorded-timestamp');
            if (!existingTimestampElement) {
              // Calculate the time difference between now and the stored timestamp
              const currentTime = new Date().getTime();
              const timeDifference = currentTime - dbChecked.recorded_timestamp;

              // Format the time difference in a human-readable format
              const formattedTime = formatTimeDifference(timeDifference);

              const timestampElement = document.createElement('div');
              timestampElement.textContent = `Recorded: ${formattedTime}`;
              timestampElement.style.float = 'right';
              timestampElement.style.fontSize = '12px';
              timestampElement.style.color = '#536471';
              timestampElement.classList.add('css-1dbjc4n', 'r-1kbdv8c', 'r-18u37iz', 'r-1wtj0ep', 'r-1s2bzr4', 'r-hzcoqn', 'recorded-timestamp');

              const timestampTargetElement = tweetElement.querySelector('.matched-words-container');
              const timestampParentElement = timestampTargetElement.parentNode;
              timestampParentElement.insertBefore(timestampElement, timestampTargetElement);


              // Calculate the time difference between now and the stored lastTimeReplied timestamp
              const lastTimeRepliedElement = document.createElement('div');
              lastTimeRepliedElement.style.float = 'right';
              lastTimeRepliedElement.style.fontSize = '12px';
              lastTimeRepliedElement.style.color = '#536471';
              lastTimeRepliedElement.classList.add('css-901oao', 'r-1awozwy', 'r-jwli3a', 'r-6koalj', 'r-18u37iz', 'r-16y2uox', 'r-37j5jr', 'r-a023e6', 'r-b88u0q', 'r-1777fci', 'r-rjixqe', 'r-bcqeeo', 'r-q4m81j', 'r-qvutc0', 'last-time-replied');

              const lastTimeRepliedTargetElement = tweetElement.querySelector('.matched-words-container');
              const lastTimeRepliedParentElement = lastTimeRepliedTargetElement.parentNode;



              // Create the parent <div> element with the specified CSS classes
              const parentDiv = document.createElement('div');
              parentDiv.classList.add('css-1dbjc4n', 'r-1kbdv8c', 'r-18u37iz', 'r-1wtj0ep', 'r-1s2bzr4', 'r-hzcoqn');

              //
              // Create the <svg> element
              const svgElement = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
              svgElement.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
              svgElement.setAttribute('height', '1.25em');
              svgElement.setAttribute('viewBox', '0 0 640 512');

              // Add the SVG path data and attributes
              svgElement.innerHTML = '<path d="M168.2 384.9c-15-5.4-31.7-3.1-44.6 6.4c-8.2 6-22.3 14.8-39.4 22.7c5.6-14.7 9.9-31.3 11.3-49.4c1-12.9-3.3-25.7-11.8-35.5C60.4 302.8 48 272 48 240c0-79.5 83.3-160 208-160s208 80.5 208 160s-83.3 160-208 160c-31.6 0-61.3-5.5-87.8-15.1zM26.3 423.8c-1.6 2.7-3.3 5.4-5.1 8.1l-.3 .5c-1.6 2.3-3.2 4.6-4.8 6.9c-3.5 4.7-7.3 9.3-11.3 13.5c-4.6 4.6-5.9 11.4-3.4 17.4c2.5 6 8.3 9.9 14.8 9.9c5.1 0 10.2-.3 15.3-.8l.7-.1c4.4-.5 8.8-1.1 13.2-1.9c.8-.1 1.6-.3 2.4-.5c17.8-3.5 34.9-9.5 50.1-16.1c22.9-10 42.4-21.9 54.3-30.6c31.8 11.5 67 17.9 104.1 17.9c141.4 0 256-93.1 256-208S397.4 32 256 32S0 125.1 0 240c0 45.1 17.7 86.8 47.7 120.9c-1.9 24.5-11.4 46.3-21.4 62.9zM144 272a32 32 0 1 0 0-64 32 32 0 1 0 0 64zm144-32a32 32 0 1 0 -64 0 32 32 0 1 0 64 0zm80 32a32 32 0 1 0 0-64 32 32 0 1 0 0 64z"/>';

              parentDiv.classList.add('r-37j5jr');

              const svgTargetElement = tweetElement.querySelector('.matched-words-container');
              const svgParentElement = svgTargetElement.parentNode;
              svgParentElement.insertBefore(svgElement, svgTargetElement);

              if (dbChecked.lastTimeReplied !== null) {
                const lastTimeRepliedDifference = currentTime - dbChecked.lastTimeReplied;
                const formattedLastTimeReplied = formatTimeDifference(lastTimeRepliedDifference);
                lastTimeRepliedElement.textContent = `${formattedLastTimeReplied}`;
              } else {
                lastTimeRepliedElement.textContent = 'Never';
              }

              lastTimeRepliedParentElement.insertBefore(lastTimeRepliedElement, lastTimeRepliedTargetElement);

              // has Direct Message?
              if (dbChecked.directMessage !== undefined) {
                const directMessageElement = document.createElement('div');
                directMessageElement.textContent = 'DM: ' + dbChecked.directMessage;
                directMessageElement.style.backgroundColor = dbChecked.directMessage ? 'lightgreen' : 'lightgrey';
                directMessageElement.style.float = 'right';
                directMessageElement.style.fontSize = '12px';
                directMessageElement.style.color = '#536471';
                directMessageElement.classList.add('css-901oao', 'r-1awozwy', 'r-jwli3a', 'r-6koalj', 'r-18u37iz', 'r-16y2uox', 'r-37j5jr', 'r-a023e6', 'r-b88u0q', 'r-1777fci', 'r-rjixqe', 'r-bcqeeo', 'r-q4m81j', 'r-qvutc0');

                const directMessageTargetElement = tweetElement.querySelector('.matched-words-container');
                const directMessageParentElement = directMessageTargetElement.parentNode;
                directMessageParentElement.insertBefore(directMessageElement, directMessageTargetElement);
              }

              // Following?
                const followingElement = document.createElement('div');
                followingElement.textContent = dbChecked.directMessage ? 'Following' : 'Not Following';
                followingElement.style.backgroundColor = dbChecked.directMessage ? 'lightgreen' : 'lightgrey';
                followingElement.style.float = 'right';
                followingElement.style.fontSize = '12px';
                followingElement.style.color = '#536471';
                followingElement.classList.add('css-901oao', 'r-1awozwy', 'r-jwli3a', 'r-6koalj', 'r-18u37iz', 'r-16y2uox', 'r-37j5jr', 'r-a023e6', 'r-b88u0q', 'r-1777fci', 'r-rjixqe', 'r-bcqeeo', 'r-q4m81j', 'r-qvutc0');

                const followingTargetElement = tweetElement.querySelector('.matched-words-container');
                const followingParentElement = followingTargetElement.parentNode;
                followingParentElement.insertBefore(followingElement, followingTargetElement);


                const followStatusElement = document.createElement('div');
                followStatusElement.classList.add('follow-status');
                followStatusElement.style.display = 'flex';
                followStatusElement.style.alignItems = 'center';
                followStatusElement.style.float = 'right';
                followStatusElement.style.fontSize = '12px';
                followStatusElement.style.color = '#536471';
                followingParentElement.insertBefore(followStatusElement, followingTargetElement);

                followStatusElement.textContent = 'Following';




              // Follows you?
                const userFollowElement = document.createElement('div');
                userFollowElement.textContent = dbChecked.userFollow ? 'Follows you' : 'Not following you';
                userFollowElement.style.backgroundColor = dbChecked.userFollow ? 'lightgreen' : 'lightgrey';
                userFollowElement.style.float = 'right';
                userFollowElement.style.fontSize = '12px';
                userFollowElement.style.color = '#536471';
                userFollowElement.classList.add('css-901oao', 'css-1hf3ou5', 'r-1sw30gj', 'r-sqpuna', 'r-14j79pv', 'r-37j5jr', 'r-1gkfh8e', 'r-majxgm', 'r-56xrmm', 'r-13hce6t', 'r-bcqeeo', 'r-s1qlax', 'r-1vvnge1', 'r-qvutc0');

                const userFollowTargetElement = tweetElement.querySelector('.matched-words-container');
                const userFollowParentElement = userFollowTargetElement.parentNode;
                userFollowParentElement.insertBefore(userFollowElement, userFollowTargetElement);

            }

            if (isMatch) {
              matchedWordsContainer.textContent = '✔️ ' + matchedWords.join(', ');
              matchedWordsContainer.style.color = 'green';
              matchedWordsContainer.style.backgroundColor = 'lightgreen';

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
                   scanLink.classList.add('css-901oao', 'r-1awozwy', 'r-jwli3a', 'r-6koalj', 'r-18u37iz', 'r-16y2uox', 'r-37j5jr', 'r-a023e6', 'r-b88u0q', 'r-1777fci', 'r-rjixqe', 'r-bcqeeo', 'r-q4m81j', 'r-qvutc0');
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
          const lastTimeRepliedElement = document.querySelector(`.matched-words-container[data-author="${tweetAuthor}"] + .last-time-replied`);
          if (lastTimeRepliedElement) {
            const lastTimeRepliedDifference = new Date().getTime() - updatedProperties.lastTimeReplied;
            lastTimeRepliedElement.textContent = `Last Replied: ${formatTimeDifference(lastTimeRepliedDifference)}`;
          }
        }
      });
    });

  }

  // Add event listeners to trigger the findElement function
  window.addEventListener('load', findElementsOnLoadAndScroll);
  window.addEventListener('scroll', findElementsOnLoadAndScroll);
  document.addEventListener('mouseover', findElementsOnLoadAndScroll);
