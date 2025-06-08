// Constants for date values
const YOUTUBE_LAUNCH_DATE = '2005-04-24T03:31';
const STORAGE_KEYS = ['timeFrom', 'timeTo', 'hidePlaylists', 'hideLivestreams', 'hideShorts'];

// Get DOM elements once
const timeFromInput = document.getElementById('timeFrom');
const timeToInput = document.getElementById('timeTo');
const applyButton = document.getElementById('applyButton');
const hidePlaylists = document.getElementById('hidePlaylists');
const hideLivestreams = document.getElementById('hideLivestreams');
const hideShorts = document.getElementById('hideShorts');

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
        hideLivestreams.checked = !!data.hideLivestreams;
        hideShorts.checked = !!data.hideShorts;
    });
}

function applyFilter() {
    const timeFrom = timeFromInput.value;
    const timeTo = timeToInput.value;
    if (!timeFrom || !timeTo) {
        console.log('Please select both start and end times');
        return;
    }
    if (new Date(timeFrom) > new Date(timeTo)) {
        console.log('Start time cannot be after end time');
        return;
    }
    chrome.storage.local.set({
        timeFrom,
        timeTo,
        hidePlaylists: hidePlaylists.checked,
        hideLivestreams: hideLivestreams.checked,
        hideShorts: hideShorts.checked
    }, () => {
        if (chrome.runtime.lastError) {
            console.error('Error saving settings:', chrome.runtime.lastError);
            return;
        }
        console.log('Filter applied! Changes will be visible automatically.');
    });
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
function toggleHideLivestreams() {
    chrome.storage.local.set({ hideLivestreams: hideLivestreams.checked }, () => {
        if (chrome.runtime.lastError) {
            console.error('Error saving settings:', chrome.runtime.lastError);
            return;
        }
        console.log('Hide Livestreams setting saved:', hideLivestreams.checked);
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

document.addEventListener('DOMContentLoaded', () => {
    initializeInputs();
    loadSettings();
    applyButton.addEventListener('click', applyFilter);
    hidePlaylists.addEventListener('change', toggleHidePlaylists);
    hideLivestreams.addEventListener('change', toggleHideLivestreams);
    hideShorts.addEventListener('change', toggleHideShorts);
});
