import { getDateFromYoutubeDisplayTime } from "../utils/get-ytv-uploaded-time";

function filterYouTubeVideos(fromYear, toYear) {
  const videoCards = document.querySelectorAll('style-scope ytd-rich-grid-renderer');
  videoCards.forEach(card => {
    const dateNode = Array.from(card.querySelectorAll('#metadata-line span')).find(span => /\d/.test(span.textContent));
    console.log('dateNode', dateNode)
    if (!dateNode) return;

    const uploadedTime = getDateFromYoutubeDisplayTime(dateNode.textContent.trim());

    console.log('uploadedTime', uploadedTime)
    if (uploadedTime && (uploadedTime.getFullYear() < fromYear || uploadedTime.getFullYear() > toYear)) {
      card.style.display = 'none';
    } else {
      card.style.display = '';
    }
  });
}

function loadSettingsAndFilter() {
  chrome.storage.sync.get(['timeFrom', 'timeTo'], (data) => {
    console.log('data loadSettingsAndFilter', data);
    if (data.timeFrom && data.timeTo) {
      filterYouTubeVideos(data.timeFrom, data.timeTo);
    }
  });
}

loadSettingsAndFilter();

const observer = new MutationObserver(() => {
  loadSettingsAndFilter();
})

observer.observe(document.body, {
  childList: true,
  subtree: true
})

chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'sync' && (changes.timeFrom || changes.timeTo)) {
    loadSettingsAndFilter();
  }
});
