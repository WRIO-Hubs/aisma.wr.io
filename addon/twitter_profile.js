function isWithinSevenDays(timeData) {
  const time = new Date(timeData);
  const currentDate = new Date();
  const timeDifference = currentDate.getTime() - time.getTime();
  const diffInDays = Math.floor(timeDifference / (1000 * 60 * 60 * 24));

  return diffInDays <= 7;
}

function scrapeData(attempt) {
  const targetElements = document.querySelectorAll('section[aria-labelledby^="accessible-list"] time[datetime]');
  const profileElement = document.querySelector('a.css-4rbku5.css-18t94o4.css-901oao.r-18jsvk2.r-1loqt21.r-37j5jr.r-a023e6.r-16dba41.r-rjixqe.r-bcqeeo.r-qvutc0');

  if (targetElements.length >= 2) {
    //console.log('length >= 2: true');
    const data = profileElement.textContent.trim();
    const timeDataElement = targetElements[1];
    const timeData = timeDataElement.getAttribute('datetime');
    const withinSevenDays = isWithinSevenDays(timeData);

    const directMessageElement = document.querySelector('div[aria-label="Message"]');
    const directMessage = directMessageElement ? true : false;

    /*console.log('Scraped data:', data);
    console.log('Within Seven Days:', withinSevenDays);
    console.log('Direct Message:', directMessage);

    chrome.storage.local.set({ profile_data: data, is_within_seven_days: withinSevenDays, direct_message: directMessage }, function() {
      console.log('Profile data stored');
    });*/

    if (withinSevenDays && directMessage) {
      const twitterHandle = window.location.pathname.split('/')[1];

      chrome.storage.local.get('emailRecordId', function(result) {
        const emailRecordId = result.emailRecordId;

        // Store the Twitter handle in Airtable
        const airtableUrl = `https://aisma-extension.wrio.workers.dev/api/storeTwitterHandle?emailRecordId=${emailRecordId}&twitterHandle=${encodeURIComponent(twitterHandle)}`;
        fetch(airtableUrl)
          .then(response => response.json())
          .then(data => {
            //console.log('Twitter handle stored in Airtable:', data);

            // Send a message to the background script to check the badge count
            chrome.runtime.sendMessage({ action: 'updateBadgeCount' });

            // Close the current tab
            chrome.runtime.sendMessage({ closeTab: true }, function(response) {
              console.log('Tab closed:', response);
            });
          })
          .catch(error => {
            console.error('Failed to store Twitter handle:', error);
              // Send a message to the background script to check the badge count
              chrome.runtime.sendMessage({ action: 'updateBadgeCount' });

              // Close the current tab
              chrome.runtime.sendMessage({ closeTab: true }, function(response) {
                console.log('Tab closed:', response);
              });
          });
      });
    } else {
      // Close the current tab
      chrome.runtime.sendMessage({ closeTab: true }, function(response) {
        console.log('Tab closed:', response);
      });
    }
  } else {
    if (attempt == 5) {
        const emptyStateHeaderTextElement = document.querySelector('[data-testid="empty_state_header_text"]');
        const childElement = emptyStateHeaderTextElement?.querySelector('.css-901oao.css-16my406.r-poiln3.r-bcqeeo.r-qvutc0');
        const textContent = childElement?.textContent.trim();

        if (textContent === 'These Tweets are protected') {
          console.log('These Tweets are protected. Unable to scrape data.');
          // Close the current tab since tweets are protected
          chrome.runtime.sendMessage({ closeTab: true }, function(response) {
            console.log('Tab closed:', response);
          });
        return; // Exit the function to prevent further scraping attempts
      }
    }
    if (attempt == 7) {
        window.scrollTo(0, document.body.scrollHeight);
    }
    if (attempt < 10) {
      console.log('Target elements not found or insufficient elements. Retrying in 1 second...');
      setTimeout(() => scrapeData(attempt + 1), 1000);
    } else {

        const error429Element = document.querySelector('.css-901oao.r-14j79pv.r-37j5jr.r-a023e6.r-16dba41.r-rjixqe.r-117bsoe.r-bcqeeo.r-q4m81j.r-qvutc0');
        const childElement = error429Element?.querySelector('.css-901oao.css-16my406.r-poiln3.r-bcqeeo.r-qvutc0');
        const textContent = childElement?.textContent.trim();

        if (textContent === 'Something went wrong. Try reloading.') {
          console.log('Encountered error 429 (Too Many Requests).');
          // Send a message to the background script indicating error 429 (Too Many Requests)
          chrome.runtime.sendMessage({ error429: true });

          // Close the current tab
          chrome.runtime.sendMessage({ closeTab: true }, function(response) {
            console.log('Tab closed:', response);
          });
          return; // Exit the function to prevent further scraping attempts
      } else {
        console.log('Maximum attempts reached or insufficient elements. Scraping failed.');

        // Send a message to the background script indicating scraping failure
        //chrome.runtime.sendMessage({ scrapingFailed: true });

        // Close the current tab
        chrome.runtime.sendMessage({ closeTab: true }, function(response) {
          console.log('Tab closed:', response);
        });
      }
    }
  }
}

// Check if the current URL has the "?scan" parameter
if (window.location.href.includes('?scan')) {
  scrapeData(1);
}
