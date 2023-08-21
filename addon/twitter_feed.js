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
      console.log('IndexedDB initialized successfully.');
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

      if (existingRecord) {
        // Update the specified properties
        for (const prop in updatedProperties) {
          if (updatedProperties.hasOwnProperty(prop)) {
            existingRecord[prop] = updatedProperties[prop];
          }
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
        //console.error('Existing record not found for user:', userHandle);
        // Create a new record with the updated properties
        const newRecord = { userHandle, ...updatedProperties };
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



// Function to find tweet elements and check if user is scanned
function findElement() {
  const tweetElements = document.querySelectorAll('[data-testid="tweet"]:not(.db_checked)');

  tweetElements.forEach((tweetElement) => {

    const tweetahref = tweetElement.querySelector('a.css-4rbku5.css-18t94o4.css-1dbjc4n.r-1loqt21.r-1wbh5a2.r-dnmrzs.r-1ny4l3l');
    const link = tweetahref.getAttribute('href');
    const tweetAuthorMatch = link.match(/\/([^/]+)/);
    const tweetAuthor = tweetAuthorMatch[1]; // Define tweetAuthor here

    if (tweetAuthorMatch) {
      DBChecking(tweetAuthor, (dbChecked) => {
        const topMenu = tweetElement.querySelector('.css-1dbjc4n.r-1iusvr4.r-16y2uox.r-1777fci.r-kzbkwu');

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

            if (dbChecked.matchedWords.length > 0) {
              matchedWordsContainer.textContent = '✔️ ' + dbChecked.matchedWords.join(', ');
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
                        scanned: true
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
}

// Add event listeners to trigger the findElement function
window.addEventListener('load', findElementsOnLoadAndScroll);
window.addEventListener('scroll', findElementsOnLoadAndScroll);
document.addEventListener('mouseover', findElementsOnLoadAndScroll);
