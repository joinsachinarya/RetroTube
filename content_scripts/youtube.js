const monthMap = {
  0: 'january', 1: 'february', 2: 'march', 3: 'april', 4: 'may', 5: 'june',
  6: 'july', 7: 'august', 8: 'september', 9: 'october', 10: 'november', 11: 'december'
};

function getDateFromYoutubeDisplayTime(displayString) {
  const now = new Date();

  if (
    displayString === 'just now' ||
    displayString.includes('watching') ||
    displayString.includes('live')
  ) {
    return `${monthMap[now.getMonth()]} ${now.getFullYear()}`;
  }

  const regexps = [
    { re: /^(\d+)\s*second[s]?\s*ago$/, unit: 'second' },
    { re: /^(\d+)\s*minute[s]?\s*ago$/, unit: 'minute' },
    { re: /^(\d+)\s*hour[s]?\s*ago$/, unit: 'hour' },
    { re: /^(\d+)\s*day[s]?\s*ago$/, unit: 'day' },
    { re: /^(\d+)\s*week[s]?\s*ago$/, unit: 'week' },
    { re: /^(\d+)\s*month[s]?\s*ago$/, unit: 'month' },
    { re: /^(\d+)\s*year[s]?\s*ago$/, unit: 'year' }
  ];

  for (const { re, unit } of regexps) {
    const match = displayString.match(re);
    if (match) {
      const value = parseInt(match[1], 10);
      const date = new Date(now);

      switch (unit) {
        case 'second':
          date.setSeconds(date.getSeconds() - value);
          break;
        case 'minute':
          date.setMinutes(date.getMinutes() - value);
          break;
        case 'hour':
          date.setHours(date.getHours() - value);
          break;
        case 'day':
          date.setDate(date.getDate() - value);
          break;
        case 'week':
          date.setDate(date.getDate() - value * 7);
          break;
        case 'month':
          date.setMonth(date.getMonth() - value);
          break;
        case 'year':
          date.setFullYear(date.getFullYear() - value);
          break;
      }

      return `${monthMap[date.getMonth()]} ${date.getFullYear()}`;
    }
  }

  const tryDate = new Date(displayString);
  if (!isNaN(tryDate.getTime())) {
    return `${monthMap[tryDate.getMonth()]} ${tryDate.getFullYear()}`;
  }

  console.error("Unrecognized display string: " + displayString);
  return `${monthMap[now.getMonth()]} ${now.getFullYear()}`;;
}

console.log('youtube.js loaded');

function filterVideoCard(card, before, after, filterMode) {
  const dateNode = Array.from(card.querySelectorAll('#metadata-line span')).find(span => span.textContent.includes('ago'));
  const liveNode = Array.from(card.querySelectorAll('#metadata-line span')).find(span => span.textContent.includes('watching'));

  if (liveNode) {
    const richItemRenderer = card.closest('ytd-rich-item-renderer');
    if (richItemRenderer) {
      richItemRenderer.style.display = 'none';
      return;
    }
    const compactRenderer = card.closest('ytd-compact-video-renderer');
    if (compactRenderer) {
      compactRenderer.style.display = 'none';
      return;
    }
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
  const richItemRenderer = card.closest('ytd-rich-item-renderer');
  if (richItemRenderer) {
    richItemRenderer.style.display = show ? '' : 'none';
  }
  const compactRenderer = card.closest('ytd-compact-video-renderer');
  if (compactRenderer) {
    compactRenderer.style.display = show ? '' : 'none';
  }
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
  const videoCards = document.querySelectorAll('#dismissible');
  const collectionThumbnailViewModels = document.querySelectorAll('.yt-collection-thumbnail-view-model');
  chrome.storage.local.get(['hideShorts', 'hidePlaylists'], (data) => {

    // reset display
    videoCards.forEach(card => card.style.display = '');

    if (data.hidePlaylists) {
      collectionThumbnailViewModels.forEach((card) => {
        if (card) {
          const richItemRenderer = card.closest('ytd-rich-item-renderer');
          if (richItemRenderer && richItemRenderer.getAttribute('aria-hidden') !== 'true') {
            richItemRenderer.style.display = 'none';
            richItemRenderer.setAttribute('aria-hidden', 'true');
          }
        }
      });
    }
    if (data.hideShorts) {
      const shortsHeading = document.querySelectorAll('#dismissible > div#rich-shelf-header-container');
      const sortVideos = document.querySelectorAll('#dismissible > div#contents-container');
      const searchedShorts = document.querySelectorAll('ytd-reel-shelf-renderer');
      const shortsNavigationTab = document.querySelector('#items > ytd-mini-guide-entry-renderer:nth-child(2)');

      console.log('shortsHeading', shortsHeading, sortVideos, searchedShorts);
      shortsHeading.forEach(heading => heading.style.display = 'none');
      sortVideos.forEach(video => video.style.display = 'none');
      searchedShorts.forEach(short => short.style.display = 'none');
      if (shortsNavigationTab && shortsNavigationTab.getAttribute('aria-hidden') !== 'true') {
        shortsNavigationTab.style.display = 'none';
        shortsNavigationTab.setAttribute('aria-hidden', 'true');
      }
      videoCards.forEach(card => {
        if (card.innerHTML.toLowerCase().includes('shorts')) {
          card.style.display = 'none';
        }
      });
    }
  });
}

function loadSettingsAndFilter(targetNodes) {
  chrome.storage.local.get(['before', 'after', 'hideShorts', 'hidePlaylists'], (data) => {
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

// debounce utility
function debounce(fn, delay) {
  let timer = null;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

// observer for newly added nodes (debounced)
const debouncedFilter = debounce(() => {
  loadSettingsAndFilter();
  applyOtherFilters();
}, 10);

const observer = new MutationObserver((mutations) => {
  debouncedFilter();
});

observer.observe(document.body, { childList: true, subtree: true });

chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local') {
    loadSettingsAndFilter();
    applyOtherFilters();
  }
});

