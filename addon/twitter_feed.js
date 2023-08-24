


// Function to initialize IndexedDB
function initializeIndexedDB() {
  try {
    const request = indexedDB.open('AISMATwitter', 4);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      if (!db.objectStoreNames.contains('scanRecords')) {
        const objectStore = db.createObjectStore('scanRecords', { keyPath: 'userHandle' });
        // You can add indexes if needed
      }
      // Define other object stores if necessary
    };

    request.onsuccess = (event) => {
      //console.log('IndexedDB initialized successfully.');
    };

    request.onerror = (error) => {
      console.error('Error opening AISMATwitter:', error);
    };
  } catch (error) {
    console.error('An error occurred while initializing IndexedDB:', error);
  }
}



function retryOpenIndexedDB(retries) {
  if (retries <= 0) {
    console.error('Unable to open IndexedDB after retries.');
    return;
  }

  const request = indexedDB.open('AISMATwitter', 4);

  request.onsuccess = (event) => {
    //console.log('IndexedDB initialized successfully.');
  };

  request.onerror = (error) => {
    console.error('Error opening AISMATwitter:', error);
    // Retry opening the database with a delay
    setTimeout(() => retryOpenIndexedDB(retries - 1), 1000);
  };
}


// Call this function to start opening the database
retryOpenIndexedDB(3); // You can adjust the number of retries


// Call the function to initialize IndexedDB
initializeIndexedDB();


// Function to record matched words in IndexedDB
function updateIndexedDB(userHandle, updatedProperties) {
  const request = indexedDB.open('AISMATwitter', 4);

  request.onsuccess = (event) => {
    const db = event.target.result;

    const transaction = db.transaction('scanRecords', 'readwrite');
    const objectStore = transaction.objectStore('scanRecords');

    // Retrieve the existing record
    const getRequest = objectStore.get(userHandle);

    getRequest.onsuccess = (event) => {
      const existingRecord = event.target.result;
      const currentTime = new Date().getTime(); // Get the current timestamp

      if (existingRecord) {
        // Update the specified properties
        for (const prop in updatedProperties) {
          if (updatedProperties.hasOwnProperty(prop)) {
            existingRecord[prop] = updatedProperties[prop];
          }
        }

        if (updatedProperties.scanned) {
          // Update the scanned_timestamp if scanned property is updated
          existingRecord.scanned_timestamp = currentTime;
        }

        if (updatedProperties.lastTimeReplied) {
          // Update the lastTimeReplied if lastTimeReplied property is updated
          existingRecord.lastTimeReplied = currentTime;
        }

        // Put the updated record back into the database
        const putRequest = objectStore.put(existingRecord);

        putRequest.onsuccess = () => {
          //console.log('Record updated successfully.');
        };

        putRequest.onerror = (error) => {
          console.error('Error updating record:', error);
        };
      } else {
        // Create a new record with the updated properties and recorded_timestamp
        const newRecord = {
          userHandle,
          recorded_timestamp: currentTime,
          lastTimeReplied: updatedProperties.lastTimeReplied || null,
          ...updatedProperties
        };
        const addRequest = objectStore.add(newRecord);

        addRequest.onsuccess = () => {
          //console.log('New record added successfully.');
        };

        addRequest.onerror = (error) => {
          console.error('Error adding new record:', error);
        };
      }
    };

    getRequest.onerror = (error) => {
      console.error('Error getting record:', error);
    };
  };

  request.onerror = (error) => {
    console.error('Error opening AISMATwitter:', error);
  };
}






function DBChecking(userHandle, callback) {
  try {
    const request = indexedDB.open('AISMATwitter', 4);

    request.onsuccess = (event) => {
      const db = event.target.result;

      const transaction = db.transaction('scanRecords', 'readonly');
      const objectStore = transaction.objectStore('scanRecords');

      const getRequest = objectStore.get(userHandle);

      getRequest.onsuccess = (event) => {
        const result = event.target.result;
        //const dbChecked = !!result; // Convert to boolean

        callback(result);
      };
    };

    request.onerror = (error) => {
      console.error('Error opening AISMATwitter:', error);
      callback(false); // Handle error by assuming user is not checked
    };

  } catch (error) {
    console.error('Error in DBChecking:', error);
    callback(false);
  }
}


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
    const existingLink1 = document.querySelector('link[href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.1/dist/css/bootstrap.min.css"]');
    if (!existingLink1) {
      const linkElement1 = document.createElement('link');
      linkElement1.rel = 'stylesheet';
      linkElement1.href = 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.1/dist/css/bootstrap.min.css';
      document.head.appendChild(linkElement1);
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

              if (dbChecked.lastTimeReplied !== null) {
                const lastTimeRepliedDifference = currentTime - dbChecked.lastTimeReplied;
                const formattedLastTimeReplied = formatTimeDifference(lastTimeRepliedDifference);
                lastTimeRepliedElement.textContent = `Last Reply: ${formattedLastTimeReplied}`;
              } else {
                lastTimeRepliedElement.textContent = 'Last Reply: Never';
              }

              lastTimeRepliedParentElement.insertBefore(lastTimeRepliedElement, lastTimeRepliedTargetElement);



              // Following?
                const followingElement = document.createElement('div');
                followingElement.textContent = dbChecked.following ? 'Following' : 'Not Following';
                followingElement.style.backgroundColor = dbChecked.following ? 'lightgreen' : 'lightgrey';
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

                // Create the <i> element for the bookmarks icon
                const bookmarksIcon = document.createElement('i');
                bookmarksIcon.classList.add('bi', 'bi-arrow-repeat');
                bookmarksIcon.style.float = 'right';
                bookmarksIcon.style.fontSize = '16px'; // Adjust the size as needed

                // Insert the <i> element after the following status
                followingParentElement.insertBefore(bookmarksIcon, followingElement.nextSibling);


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

                     const updatedProperties = {
                       scanned: true,
                       scanned_timestamp: new Date().getTime() // Get the current timestamp
                     };
                     updateIndexedDB(tweetAuthor, updatedProperties);

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


    });

    findHoverCard();
  }


  function findHoverCard() {
    const hoverCard = document.querySelector('[data-testid="HoverCard"]:not(.checked)');
    if (hoverCard) {
      const tweetahref = hoverCard.querySelector('a.css-4rbku5.css-18t94o4.css-1dbjc4n.r-1loqt21.r-1wbh5a2.r-dnmrzs.r-1ny4l3l');
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
