let previousMergedText = '';
let hoveredElement = null;
let timeoutId = null;

function checkMatchWords(mergedText, link, matchWords) {
  const matchedWords = matchWords.filter((word) => mergedText.toLowerCase().includes(word.toLowerCase()));

  if (matchedWords.length > 0 && hoveredElement) {
    const existingScanLink = hoveredElement.querySelector('[data-testid="scanLink"]');

    if (!existingScanLink) {
      hoveredElement.style.border = '1px solid green';
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

      const targetElement = hoveredElement.querySelector('.css-1dbjc4n.r-1joea0r > .css-1dbjc4n.r-1awozwy.r-6koalj.r-18u37iz');
      if (targetElement) {
        const parentElement = targetElement.parentNode;
        parentElement.insertBefore(scanLink, targetElement);
      }

      scanLink.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
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
