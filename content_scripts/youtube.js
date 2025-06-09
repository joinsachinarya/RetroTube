function getDateFromYoutubeDisplayTime(displayString) {
  // console.log('displayString101', displayString);
  const now = new Date();

  if (displayString === 'just now' || displayString.includes('watching') || displayString.includes('live')) return now;

  const regexps = [
    { re: /^.*(\d+)\s*minute[s]?\s*ago$/, unit: 'minute' },
    { re: /^.*(\d+)\s*hour[s]?\s*ago$/, unit: 'hour' },
    { re: /^.*(\d+)\s*day[s]?\s*ago$/, unit: 'day' },
    { re: /^.*(\d+)\s*week[s]?\s*ago$/, unit: 'week' },
    { re: /^.*(\d+)\s*month[s]?\s*ago$/, unit: 'month' },
    { re: /^.*(\d+)\s*year[s]?\s*ago$/, unit: 'year' },
    { re: /^.*(\d+)\s*second[s]?\s*ago$/, unit: 'second' },
  ];

  for (const { re, unit } of regexps) {
    const match = displayString.match(re);
    if (match) {
      const value = parseInt(match[1]);
      const date = new Date(now);

      switch (unit) {
        case 'second':
          date.setSeconds(date.getSeconds() - value);
          return date;
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

  const liveNode = Array.from(card.querySelectorAll('#metadata-line span')).find(span => span.textContent.includes('watching'));
  if (liveNode) { card.parentNode.style.display = 'none'; card.dataset.filtered = "1"; }

  if (!dateNode) return;
  const uploadedTime = getDateFromYoutubeDisplayTime(dateNode.textContent.trim());
  if (!uploadedTime) return;

  // console.log('uploadedTime', uploadedTime, timeFrom, timeTo, uploadedTime < timeFrom, uploadedTime > timeTo, card)
  if (uploadedTime < timeFrom || uploadedTime > timeTo) {
    card.parentNode.style.display = 'none';
  } else {
    card.parentNode.style.display = '';
  }

  card.dataset.filtered = "1";
}

function filterYouTubeVideos(timeFrom, timeTo) {
  const videoCards = document.querySelectorAll('#dismissible:not([data-filtered="1"])');
  videoCards.forEach(card => filterVideoCard(card, timeFrom, timeTo));
}

function applyOtherFilters() {
  chrome.storage.local.get(['hidePlaylists', 'liveStream', 'hideShorts'], (data) => {
    // console.log('data', data);
    // if (data.hidePlaylists) {
    //   const videoCards = document.querySelectorAll('#dismissible');
    //   console.log('videoCards', videoCards);
    //   videoCards.forEach((card) => {
    //     const updatedNode = Array.from(card.querySelectorAll('#metadata-line span')).find(span => span.textContent.includes('Updated'));
    //     console.log('updatedNode', updatedNode);
    //     if (updatedNode) {
    //       card.style.display = 'none';
    //     }
    //   })
    // }
    if (data.hideShorts) {
      const shortsHeading = document.querySelectorAll('#dismissible > div#rich-shelf-header-container')
      const sortVideos = document.querySelectorAll('#dismissible > div#contents-container')
      const searchedShorts = document.querySelectorAll('ytd-reel-shelf-renderer')
      // console.log('shortsHeading', shortsHeading);
      // console.log('sortVideos', sortVideos);
      shortsHeading.forEach(heading => heading.style.display = 'none');
      sortVideos.forEach(video => video.style.display = 'none');
      searchedShorts.forEach(short => short.style.display = 'none');
    }
    if (data.liveStream) {
      const liveNode = Array.from(document.querySelectorAll('#metadata-line span')).find(span => span.textContent.includes('watching'));
      if (liveNode) {
        const parentCard = liveNode.closest('#content');
        // if(parentCard.dataset.filtered === "1") return;
        // console.log('parentCard', parentCard);
        // if (parentCard) {
        //   parentCard.style.display = 'none';
        //   parentCard.dataset.filtered = "1";
        // }
      }
    }
  });
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
applyOtherFilters();

// Use observer for only newly added nodes
const observer = new MutationObserver((mutations) => {
  const addedNodes = [];
  mutations.forEach(mutation => {
    mutation.addedNodes && mutation.addedNodes.forEach(node => addedNodes.push(node));
  });
  if (addedNodes.length) {
    loadSettingsAndFilter(addedNodes);
    applyOtherFilters();
  }
});

observer.observe(document.body, { childList: true, subtree: true });

// Listen for storage changes (e.g., user updates filter)
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local' && (changes.timeFrom || changes.timeTo)) {
    // Remove filter marks to allow re-filtering all cards
    document.querySelectorAll('#dismissible[data-filtered="1"]').forEach(card => card.removeAttribute('data-filtered'));
    loadSettingsAndFilter();
    applyOtherFilters();
  }
});

