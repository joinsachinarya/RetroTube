// Utility: extract year from "X years ago" or date string
function getYearFromText(text) {
  const now = new Date();
  if (/(\d+)\s*years?\s*ago/.test(text)) {
    return now.getFullYear() - parseInt(RegExp.$1);
  } else if (/(\d+)\s*months?\s*ago/.test(text)) {
    const monthsAgo = parseInt(RegExp.$1);
    const date = new Date(now.getFullYear(), now.getMonth() - monthsAgo, 1);
    return date.getFullYear();
  } else if (/(\d{4})/.test(text)) {
    return parseInt(RegExp.$1);
  }
  return null;
}

// Filter function for all video cards
function filterYouTubeVideos(fromYear, toYear) {
  const videoCards = document.querySelectorAll('ytd-video-renderer, ytd-grid-video-renderer, ytd-compact-video-renderer');
  videoCards.forEach(card => {
    // Find the node that contains the date info
    const dateNode = Array.from(card.querySelectorAll('#metadata-line span'))
      .find(span => /\d/.test(span.textContent));
    if (!dateNode) return;

    const year = getYearFromText(dateNode.textContent.trim());
    if (year && (year < fromYear || year > toYear)) {
      card.style.display = 'none';
    } else {
      card.style.display = '';
    }
  });
}

// Load user settings
function loadSettingsAndFilter() {
  chrome.storage.sync.get(['fromYear', 'toYear'], (data) => {
    if (data.fromYear && data.toYear) {
      filterYouTubeVideos(data.fromYear, data.toYear);
    }
  });
}

// Initial run
loadSettingsAndFilter();

// Setup MutationObserver to auto-reapply filter as videos load dynamically
const observer = new MutationObserver((mutations) => {
  // Optionally, you can be even more efficient and only process nodes with added video cards
  loadSettingsAndFilter();
});

observer.observe(document.body, {
  childList: true,
  subtree: true
});

// Optional: re-apply filter when user updates settings via popup (real-time update)
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'sync' && (changes.fromYear || changes.toYear)) {
    loadSettingsAndFilter();
  }
});
