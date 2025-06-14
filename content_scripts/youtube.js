const { getDateFromYoutubeDisplayTime } = require('../utils/yt-date-format');
console.log('youtube.js loaded');

function filterVideoCard(card, before, after, filterMode) {
  const dateNode = Array.from(card.querySelectorAll('#metadata-line span')).find(span => span.textContent.includes('ago'));
  const liveNode = Array.from(card.querySelectorAll('#metadata-line span')).find(span => span.textContent.includes('watching'));

  if (liveNode) {
    card.parentNode.style.display = 'none';
    return;
  }
  if (!dateNode) return;
  const uploadedTimeStr = getDateFromYoutubeDisplayTime(dateNode.textContent.trim());
  if (!uploadedTimeStr) return;
  const uploadedTime = new Date(uploadedTimeStr);

  let show = true;
  if (filterMode === 'before') {
    show = uploadedTime <= before;
  } else if (filterMode === 'after') {
    show = uploadedTime >= after;
  } else if (filterMode === 'range') {
    show = uploadedTime >= after && uploadedTime <= before;
  }
  card.parentNode.style.display = show ? '' : 'none';
}

function filterYouTubeVideos(before, after) {
  const videoCards = document.querySelectorAll('#dismissible');
  let filterMode = 'all';
  let beforeDate = before ? new Date(before) : null;
  let afterDate = after ? new Date(after) : null;
  if (beforeDate && afterDate) filterMode = 'range';
  else if (beforeDate) filterMode = 'before';
  else if (afterDate) filterMode = 'after';
  videoCards.forEach(card => {
    if (filterMode === 'all') {
      card.parentNode.style.display = '';
    } else {
      filterVideoCard(card, beforeDate, afterDate, filterMode);
    }
  });
}

function applyOtherFilters() {
  chrome.storage.local.get(['hideShorts'], (data) => {

    // reset display
    const videoCards = document.querySelectorAll('#dismissible');
    videoCards.forEach(card => card.style.display = '');

    // if (data.hidePlaylists) {
    //   videoCards.forEach((card) => {
    //     const updatedNode = Array.from(card.querySelectorAll('#metadata-line span')).find(span => span.textContent.includes('Updated'));
    //     if (updatedNode) {
    //       card.style.display = 'none';
    //     }
    //   });
    // }
    if (data.hideShorts) {
      const shortsHeading = document.querySelectorAll('#dismissible > div#rich-shelf-header-container');
      const sortVideos = document.querySelectorAll('#dismissible > div#contents-container');
      const searchedShorts = document.querySelectorAll('ytd-reel-shelf-renderer');

      console.log('shortsHeading', shortsHeading, sortVideos, searchedShorts);
      shortsHeading.forEach(heading => heading.style.display = 'none');
      sortVideos.forEach(video => video.style.display = 'none');
      searchedShorts.forEach(short => short.style.display = 'none');
      // Shorts as video cards (sometimes appear as cards)
      videoCards.forEach(card => {
        if (card.innerHTML.toLowerCase().includes('shorts')) {
          card.style.display = 'none';
        }
      });
    }
  });
}

function loadSettingsAndFilter(targetNodes) {
  chrome.storage.local.get(['before', 'after'], (data) => {
    const before = data.before && data.before.trim() ? data.before : '';
    const after = data.after && data.after.trim() ? data.after : '';
    if (targetNodes && targetNodes.length) {
      // Only filter new/added nodes
      let filterMode = 'all';
      let beforeDate = before ? new Date(before) : null;
      let afterDate = after ? new Date(after) : null;
      if (beforeDate && afterDate) filterMode = 'range';
      else if (beforeDate) filterMode = 'before';
      else if (afterDate) filterMode = 'after';
      targetNodes.forEach(node => {
        if (node.nodeType === 1) {
          if (node.matches && node.matches('#dismissible')) {
            if (filterMode === 'all') {
              node.parentNode.style.display = '';
            } else {
              filterVideoCard(node, beforeDate, afterDate, filterMode);
            }
          } else {
            node.querySelectorAll && node.querySelectorAll('#dismissible').forEach(card => {
              if (filterMode === 'all') {
                card.parentNode.style.display = '';
              } else {
                filterVideoCard(card, beforeDate, afterDate, filterMode);
              }
            });
          }
        }
      });
    } else {
      // Full re-filter
      filterYouTubeVideos(before, after);
    }
  });
}

// Initial full filter on load
loadSettingsAndFilter();
applyOtherFilters();

// observer for newly added nodes
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

chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local') {
    loadSettingsAndFilter();
    applyOtherFilters();
  }
});

