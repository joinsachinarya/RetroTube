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

function filterYouTubeVideos(timeFrom, timeTo) {
  const videoCards = document.querySelectorAll('#dismissible');
  // const shortVideoCards = document.querySelectorAll('.shortsLockupViewModelHost');

  videoCards.forEach(card => {
    const dateNode = Array.from(card.querySelectorAll('#metadata-line span')).find(span => span.textContent.includes('ago'));
    const uploadedTime = getDateFromYoutubeDisplayTime(dateNode.textContent.trim());
    if (!dateNode || !uploadedTime) return;

    // console.log('uploadedTime2', uploadedTime, timeFrom, timeTo, uploadedTime < timeFrom, uploadedTime > timeTo, card)
    if (uploadedTime.getTime() < timeFrom.getTime() || uploadedTime.getTime() > timeTo.getTime()) {
      console.log('result, none')
      card.style.display = 'none';
    } else {
      console.log('result, block')
      card.style.display = '';
    }
  });
  // shortVideoCards.forEach(()=>{
  // })
}

function loadSettingsAndFilter() {
  chrome.storage.local.get(['timeFrom', 'timeTo'], (data) => {
    // console.log('data loadSettingsAndFilter', data);
    if (data.timeFrom && data.timeTo && new Date(data.timeFrom) < new Date(data.timeTo)) {
      filterYouTubeVideos(new Date(data.timeFrom), new Date(data.timeTo));
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
  if (area === 'local' && (changes.timeFrom || changes.timeTo)) {
    loadSettingsAndFilter();
  }
});
