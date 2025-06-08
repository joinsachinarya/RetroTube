function getDateFromYoutubeDisplayTime(displayString) {
  const now = new Date();

  if (displayString === 'just now') return now;

  const regexps = [
    { re: /^(\d+)\s*minute[s]?\s*ago$/, unit: 'minute' },
    { re: /^(\d+)\s*hour[s]?\s*ago$/, unit: 'hour' },
    { re: /^(\d+)\s*day[s]?\s*ago$/, unit: 'day' },
    { re: /^(\d+)\s*week[s]?\s*ago$/, unit: 'week' },
    { re: /^(\d+)\s*month[s]?\s*ago$/, unit: 'month' },
    { re: /^(\d+)\s*year[s]?\s*ago$/, unit: 'year' },
  ];

  for (const { re, unit } of regexps) {
    const match = displayString.match(re);
    if (match) {
      const value = parseInt(match[1]);
      const date = new Date(now);

      switch (unit) {
        case 'minute':
          date.setMinutes(date.getMinutes() - value);
          return date;
        case 'hour':
          date.setHours(date.getHours() - value);
          return date;
        case 'day':
          date.setDate(date.getDate() - value);
          return date;
        case 'week':
          date.setDate(date.getDate() - value * 7);
          return date;
        case 'month':
          date.setMonth(date.getMonth() - value);
          return date;
        case 'year':
          date.setFullYear(date.getFullYear() - value);
          return date;
      }
    }
  }

  const tryDate = new Date(displayString);
  if (!isNaN(tryDate.getTime())) return tryDate;

  console.error("Unrecognized display string: " + displayString);
}

function filterVideoCard(card, timeFrom, timeTo) {
  if (card.dataset.filtered === "1") return;
  // const shortVideoCards = document.querySelectorAll('.shortsLockupViewModelHost');

  const dateNode = Array.from(card.querySelectorAll('#metadata-line span')).find(span => span.textContent.includes('ago'));
  if (!dateNode) return;
  const uploadedTime = getDateFromYoutubeDisplayTime(dateNode.textContent.trim());
  if (!uploadedTime) return;

  console.log('uploadedTime', uploadedTime, timeFrom, timeTo, uploadedTime < timeFrom, uploadedTime > timeTo, card)
  if (uploadedTime < timeFrom || uploadedTime > timeTo) {
    card.style.display = 'none';
  } else {
    card.style.display = '';
  }

  card.dataset.filtered = "1";
}

function filterYouTubeVideos(timeFrom, timeTo) {
  const videoCards = document.querySelectorAll('#dismissible:not([data-filtered="1"])');
  videoCards.forEach(card => filterVideoCard(card, timeFrom, timeTo));
}

function loadSettingsAndFilter(targetNodes) {
  chrome.storage.local.get(['timeFrom', 'timeTo'], (data) => {
    if (data.timeFrom && data.timeTo && new Date(data.timeFrom) < new Date(data.timeTo)) {
      const timeFrom = new Date(data.timeFrom);
      const timeTo = new Date(data.timeTo);
      if (targetNodes && targetNodes.length) {
        // Only filter new/added nodes
        targetNodes.forEach(node => {
          if (node.nodeType === 1) { // ELEMENT_NODE
            // If this node itself is a video card, or contains video cards
            if (node.matches && node.matches('#dismissible')) {
              filterVideoCard(node, timeFrom, timeTo);
            } else {
              node.querySelectorAll && node.querySelectorAll('#dismissible').forEach(card => filterVideoCard(card, timeFrom, timeTo));
            }
          }
        });
      } else {
        // Full re-filter
        filterYouTubeVideos(timeFrom, timeTo);
      }
    }
  });
}

// Initial full filter on load
loadSettingsAndFilter();

// Use observer for only newly added nodes
const observer = new MutationObserver((mutations) => {
  const addedNodes = [];
  mutations.forEach(mutation => {
    mutation.addedNodes && mutation.addedNodes.forEach(node => addedNodes.push(node));
  });
  if (addedNodes.length) {
    loadSettingsAndFilter(addedNodes);
  }
});

observer.observe(document.body, { childList: true, subtree: true });

// Listen for storage changes (e.g., user updates filter)
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local' && (changes.timeFrom || changes.timeTo)) {
    // Remove filter marks to allow re-filtering all cards
    document.querySelectorAll('#dismissible[data-filtered="1"]').forEach(card => card.removeAttribute('data-filtered'));
    loadSettingsAndFilter();
  }
});

