let previousMergedText = '';

function logTextAndLink(text, link) {
  console.log('Text:', text);
  console.log('Link:', link);
}

function checkMatchWords(mergedText, link) {
  const matchWords = ['founder', 'saas', 'business'];
  const hasMatch = matchWords.some((word) => mergedText.toLowerCase().includes(word.toLowerCase()));

  if (hasMatch) {
    console.log('A match! Stored:', link);
  }
}

function findElement(event) {
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
        logTextAndLink(mergedText, link);
        checkMatchWords(mergedText, link);
        previousMergedText = mergedText;
      }
    }
  });
}

document.addEventListener('mouseover', findElement);
