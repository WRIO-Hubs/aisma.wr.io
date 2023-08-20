let previousMergedText = '';
let hoveredElement = null;
let timeoutId = null;


// Function to initialize IndexedDB
function initializeIndexedDB() {
  try {
    const request = indexedDB.open('AISMATwitter', 3);

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

  const request = indexedDB.open('AISMATwitter', 3);

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
function recordMatchedWords(userHandle, matchedWords, scanned, following, userFollow) {
  const request = indexedDB.open('AISMATwitter', 3);

  request.onsuccess = (event) => {
    const db = event.target.result;

    const transaction = db.transaction('scanRecords', 'readwrite');
    const objectStore = transaction.objectStore('scanRecords');

    const record = { userHandle, matchedWords, scanned, following, userFollow };

    const putRequest = objectStore.put(record);

    putRequest.onsuccess = () => {
      console.log('Matched words and scanned status updated successfully.');
    };

    putRequest.onerror = (error) => {
      console.error('Error updating matched words and scanned status:', error);
    };
  };

  request.onerror = (error) => {
    console.error('Error opening AISMATwitter:', error);
  };
}



function isUserScanned(userHandle, callback) {
  try {
    const request = indexedDB.open('AISMATwitter', 3);

    request.onsuccess = (event) => {
      const db = event.target.result;

      const transaction = db.transaction('scanRecords', 'readonly');
      const objectStore = transaction.objectStore('scanRecords');

      const getRequest = objectStore.get(userHandle);

      getRequest.onsuccess = (event) => {
        const result = event.target.result;
        const scanned = !!result; // Convert to boolean

        callback(scanned);
      };
    };

    request.onerror = (error) => {
      console.error('Error opening AISMATwitter:', error);
      callback(false); // Handle error by assuming user is not scanned
    };

  } catch (error) {
    console.error('Error in isUserScanned:', error);
    callback(false);
  }
}



const scannedElements = new Set();

function checkMatchWords(mergedText, link, matchWords) {
  const matchedWords = matchWords.filter((word) => mergedText.toLowerCase().includes(word.toLowerCase()));

  const userHandle = link.match(/\/([^/]+)$/)[1];

  recordMatchedWords(userHandle, matchedWords, false);

  if (matchedWords.length > 0 && hoveredElement) {

    const existingScanLink = hoveredElement.querySelector('[data-testid="scanLink"]');

    if (!existingScanLink) {
      hoveredElement.style.backgroundColor = 'lightgreen';

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
      scanLink.setAttribute('data-testid', 'scanLink');

      const targetElement = hoveredElement.querySelector('.css-1dbjc4n.r-1joea0r > .css-1dbjc4n.r-18u37iz.r-1ssbvtb.r-1wtj0ep');
      if (targetElement) {
        const parentElement = targetElement.parentNode;
        parentElement.insertBefore(scanLink, targetElement);
      }

      scanLink.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();

        const userHandle = link.match(/\/([^/]+)$/)[1];

        // Record the user's Twitter handle and timestamp in IndexedDB when they click on "Scan"
        recordMatchedWords(userHandle, matchedWords, true);

        // Open the scan URL in the extension
        chrome.runtime.sendMessage({ openScanUrl: link });

      });


    }

  }
}






function setHoveredElement(element) {
  if (hoveredElement) {
    clearTimeout(timeoutId);
    hoveredElement.removeAttribute('id');
  }

  hoveredElement = element;
  hoveredElement.setAttribute('id', 'hovered');
}

function findElement(event) {

  const tweetElements = document.querySelectorAll('a.css-4rbku5.css-18t94o4.css-1dbjc4n.r-1loqt21.r-1wbh5a2.r-dnmrzs.r-1ny4l3l');

  tweetElements.forEach((tweetElement) => {
    const link = tweetElement.getAttribute('href');
    const tweetAuthorMatch = link.match(/\/([^/]+)/);

    if (tweetAuthorMatch) {
    const tweetAuthor = tweetAuthorMatch[1];

    isUserScanned(tweetAuthor, (scanned) => {
      try {
        const request = indexedDB.open('AISMATwitter', 3);

        request.onsuccess = (event) => {
          const db = event.target.result;

          const transaction = db.transaction('scanRecords', 'readonly');
          const objectStore = transaction.objectStore('scanRecords');

          const getRequest = objectStore.get(tweetAuthor);

          getRequest.onsuccess = (event) => {
            const result = event.target.result;
            const matchedWords = result ? result.matchedWords : [];
            const userScanned = result ? result.scanned : false;

            if (!scanned) {
              // User not checked
              // Do nothing, no color change
            } else if (matchedWords && matchedWords.length === 0) {
              // User checked and no match
              tweetElement.style.backgroundColor = 'lightgrey';
            } else if (userScanned) {
              // User checked, matched, and scanned
              tweetElement.style.backgroundColor = 'green';
            } else {
              // User checked, matched, but not scanned
              tweetElement.style.backgroundColor = 'lightgreen';
            }

            const hoverCardParent = tweetElement.closest('[data-testid="hoverCardParent"]');
            if (hoverCardParent) {
              const followingElement = hoverCardParent.querySelector('.css-901oao.css-16my406.css-1hf3ou5.r-poiln3.r-a023e6.r-rjixqe.r-bcqeeo.r-qvutc0 > .css-901oao.css-16my406.r-poiln3.r-bcqeeo.r-qvutc0');

              if (followingElement) {
                const followingText = followingElement.innerText.trim().toLowerCase();
                const following = followingText === 'following';

                const userFollowIndicator = hoverCardParent.querySelector('[data-testid="userFollowIndicator"]');

                const userFollow = userFollowIndicator ? true : false;
                recordMatchedWords(tweetAuthor, matchedWords, userScanned, following, userFollow);

              }
            }
          };
        };

        request.onerror = (error) => {
          console.error('Error opening AISMATwitter:', error);
        };

      } catch (error) {
        console.error('Error in finding matched words:', error);
      }


    });
  }
});


  const cellInnerDivElements = document.querySelectorAll('.css-1dbjc4n.r-13qz1uu > [data-testid="cellInnerDiv"]');

  cellInnerDivElements.forEach((element) => {
    element.addEventListener('mouseover', () => {
      clearTimeout(timeoutId);
      setHoveredElement(element);
    });
  });

  const hoverCardElements = document.querySelectorAll('[data-testid="HoverCard"]');

  hoverCardElements.forEach((hoverCardElement) => {
    const linkElement = hoverCardElement.querySelector('a.css-4rbku5.css-18t94o4.css-1dbjc4n.r-1loqt21.r-1wbh5a2.r-dnmrzs.r-1ny4l3l');

    if (linkElement) {
      const link = 'https://twitter.com' + linkElement.getAttribute('href');

      const textElements = hoverCardElement.querySelectorAll('.css-901oao.r-18jsvk2.r-37j5jr.r-a023e6.r-16dba41.r-rjixqe.r-bcqeeo.r-qvutc0 > .css-901oao.css-16my406.r-poiln3.r-bcqeeo.r-qvutc0');

      let mergedText = '';

      textElements.forEach((textElement) => {
        const text = textElement.textContent;
        mergedText += text + ' ';
      });

      if (mergedText !== previousMergedText) {
        chrome.storage.local.get('criteria', function(result) {
          const criteria = result.criteria;
          const matchWords = criteria ? criteria.split(',').map(word => word.trim()) : [];

          checkMatchWords(mergedText, link, matchWords);
        });

        previousMergedText = mergedText;
      }
    }
  });
}

document.addEventListener('mouseover', (event) => {
  timeoutId = setTimeout(() => {
    findElement(event);
  }, 1000);
});

// Add an event listener to the "Following" button
document.addEventListener('click', (event) => {
  const followingButton = event.target.closest('.css-18t94o4.css-1dbjc4n.r-oelmt8.r-42olwf.r-sdzlij.r-1phboty.r-rs99b7.r-2yi16.r-1qi8awa.r-1ny4l3l.r-ymttw5.r-o7ynqc.r-6416eg.r-lrvibr');

  if (followingButton) {
    const hoverCardParent = followingButton.closest('[data-testid="hoverCardParent"]');
    if (hoverCardParent) {
      const tweetAuthorElement = hoverCardParent.querySelector('.css-901oao.css-16my406.r-poiln3.r-bcqeeo.r-qvutc0');
      if (tweetAuthorElement) {
        const tweetAuthor = tweetAuthorElement.innerText.trim();
        const following = followingButton.innerText.trim() === 'Following';
        updateFollowingStatus(tweetAuthor, following);
      }
    }
  }
});

// Function to update following status in IndexedDB
function updateFollowingStatus(userHandle, following) {
  const request = indexedDB.open('AISMATwitter', 3);

  request.onsuccess = (event) => {
    const db = event.target.result;

    const transaction = db.transaction('scanRecords', 'readwrite');
    const objectStore = transaction.objectStore('scanRecords');

    const getRequest = objectStore.get(userHandle);

    getRequest.onsuccess = (event) => {
      const result = event.target.result;
      if (result) {
        result.following = following;
        const putRequest = objectStore.put(result);

        putRequest.onsuccess = () => {
          console.log('Following status updated successfully.');
        };

        putRequest.onerror = (error) => {
          console.error('Error updating following status:', error);
        };
      }
    };
  };

  request.onerror = (error) => {
    console.error('Error opening AISMATwitter:', error);
  };
}
