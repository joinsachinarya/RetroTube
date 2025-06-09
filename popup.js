// Constants for date values
const YOUTUBE_LAUNCH_DATE = '2005-04-24T03:31';
const STORAGE_KEYS = ['timeFrom', 'timeTo', 'hidePlaylists', 'hideShorts'];

// Get DOM elements once
const timeFromInput = document.getElementById('timeFrom');
const timeToInput = document.getElementById('timeTo');
const applyButton = document.getElementById('applyButton');
const hidePlaylists = document.getElementById('hidePlaylists');
const hideShorts = document.getElementById('hideShorts');
const clearTimeFrom = document.getElementById('clearTimeFrom');
const clearTimeTo = document.getElementById('clearTimeTo');

// Initialize inputs
function initializeInputs() {
    const now = new Date().toISOString().slice(0, 16);
    timeFromInput.setAttribute('max', now);
    timeToInput.setAttribute('max', now);
    timeFromInput.setAttribute('min', YOUTUBE_LAUNCH_DATE);
    timeToInput.setAttribute('min', YOUTUBE_LAUNCH_DATE);
}

// Load saved settings
function loadSettings() {
    chrome.storage.local.get(STORAGE_KEYS, (data) => {
        if (chrome.runtime.lastError) {
            console.error('Error loading settings:', chrome.runtime.lastError);
            return;
        }
        timeFromInput.value = data.timeFrom || '';
        timeToInput.value = data.timeTo || '';
        hidePlaylists.checked = !!data.hidePlaylists;
        hideShorts.checked = !!data.hideShorts;
    });
}

function applyFilter() {
    const timeFrom = timeFromInput.value;
    const timeTo = timeToInput.value;
    if (!timeFrom || !timeTo) {
        alert('Please select both start and end times');
        return;
    }
    if (new Date(timeFrom) > new Date(timeTo)) {
        alert('Start time cannot be after end time');
        return;
    }
    chrome.storage.local.set({
        timeFrom,
        timeTo,
        hidePlaylists: hidePlaylists.checked,
        hideShorts: hideShorts.checked
    }, () => {
        if (chrome.runtime.lastError) {
            console.error('Error saving settings:', chrome.runtime.lastError);
            return;
        }
        console.log('Filter applied! Changes will be visible automatically.');
    });

    // hide popup and refresh the page 
    document.getElementById('popup').style.display = 'none';
    location.reload();
}

function toggleHidePlaylists() {
    chrome.storage.local.set({ hidePlaylists: hidePlaylists.checked }, () => {
        if (chrome.runtime.lastError) {
            console.error('Error saving settings:', chrome.runtime.lastError);
            return;
        }
        console.log('Hide Playlists setting saved:', hidePlaylists.checked);
    });
}

function toggleHideShorts() {
    chrome.storage.local.set({ hideShorts: hideShorts.checked }, () => {
        if (chrome.runtime.lastError) {
            console.error('Error saving settings:', chrome.runtime.lastError);
            return;
        }
        console.log('Hide Shorts setting saved:', hideShorts.checked);
    });
}

function handleClearTimeFrom() {
    timeFromInput.value = '';
    chrome.storage.local.set({ timeFrom: '' }, () => {
        if (chrome.runtime.lastError) {
            console.error('Error saving settings:', chrome.runtime.lastError);
            return;
        }
        console.log('Time From cleared');
    });
}
function handleClearTimeTo() {
    timeToInput.value = '';
    chrome.storage.local.set({ timeTo: '' }, () => {
        if (chrome.runtime.lastError) {
            console.error('Error saving settings:', chrome.runtime.lastError);
            return;
        }
        console.log('Time To cleared');
    });
}



document.addEventListener('DOMContentLoaded', () => {
    initializeInputs();
    loadSettings();
    applyButton.addEventListener('click', applyFilter);
    hidePlaylists.addEventListener('change', toggleHidePlaylists);
    hideShorts.addEventListener('change', toggleHideShorts);
    clearTimeFrom.addEventListener('click', handleClearTimeFrom);
    clearTimeTo.addEventListener('click', handleClearTimeTo);
});
