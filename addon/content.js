let previousMergedText = '';
let hoveredElement = null;
let timeoutId = null;

function checkMatchWords(mergedText, link, matchWords) {
  const matchedWords = matchWords.filter((word) => mergedText.toLowerCase().includes(word.toLowerCase()));

  if (matchedWords.length > 0) {
    //console.log('A match! Stored:', link);
    //console.log('Matched words:', matchedWords);
    hoveredElement.style.border = '1px solid green';
    hoveredElement.style.backgroundColor = 'lightgreen';
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
  const cellInnerDivElements = document.querySelectorAll('[data-testid="cellInnerDiv"]');

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
