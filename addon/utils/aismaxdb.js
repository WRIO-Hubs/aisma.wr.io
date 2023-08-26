// Function to initialize IndexedDB
function initializeIndexedDB() {
  try {
    const request = indexedDB.open('aismadb');

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      console.log("Creating 'profileRecords' object store...");
      const objectStore = db.createObjectStore('profileRecords', { keyPath: 'userHandle' });
      // You can add indexes if needed
    };

    request.onsuccess = (event) => {
      //console.log('IndexedDB initialized successfully');
    };

    request.onerror = (error) => {
      console.error('Error opening AISMAXDB:', error);
    };
  } catch (error) {
    console.error('An error occurred while initializing IndexedDB:', error);
  }
}

// Call the function to initialize IndexedDB
initializeIndexedDB();

function retryOpenIndexedDB(retries) {
  if (retries <= 0) {
    console.error('Unable to open IndexedDB after retries.');
    return;
  }

  const request = indexedDB.open('aismadb');

  request.onsuccess = (event) => {
    //console.log('IndexedDB reopened successfully');
  };

  request.onerror = (error) => {
    console.error('Error opening AISMAXDB:', error);
    // Retry opening the database with a delay
    setTimeout(() => retryOpenIndexedDB(retries - 1), 1000);
  };
}


// Call this function to start opening the database
retryOpenIndexedDB(3); // You can adjust the number of retries


// Function to record matched words in IndexedDB
function updateIndexedDB(userHandle, updatedProperties) {
  const request = indexedDB.open('aismadb', 1);

  request.onsuccess = (event) => {
    const db = event.target.result;

    const transaction = db.transaction('profileRecords', 'readwrite');
    const objectStore = transaction.objectStore('profileRecords');

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
    console.error('Error opening AISMAXDB:', error);
  };
}



function DBChecking(userHandle, callback) {
  try {
    const request = indexedDB.open('aismadb');

    request.onsuccess = (event) => {
      const db = event.target.result;

      const transaction = db.transaction('profileRecords', 'readonly');
      const objectStore = transaction.objectStore('profileRecords');

      const getRequest = objectStore.get(userHandle);

      getRequest.onsuccess = (event) => {
        const result = event.target.result;
        // const dbChecked = !!result; // Convert to boolean

        callback(result);
      };
    };

    request.onerror = (error) => {
      console.error('Error opening AISMAXDB:', error);
      callback(false); // Handle error by assuming user is not checked
    };

  } catch (error) {
    console.error('Error in DBChecking:', error);
    callback(false);
  }
}
