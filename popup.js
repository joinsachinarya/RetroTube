// Constants for date values
const YOUTUBE_LAUNCH_DATE = '2005-04-24T03:31';
const STORAGE_KEYS = ['timeFrom', 'timeTo'];

// Get DOM elements once
const timeFromInput = document.getElementById('timeFrom');
const timeToInput = document.getElementById('timeTo');
const applyButton = document.getElementById('applyButton');

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
        console.log('data loadSettings', data);
        if (chrome.runtime.lastError) {
            console.error('Error loading settings:', chrome.runtime.lastError);
            return;
        }
        
        timeFromInput.value = data.timeFrom || '';
        timeToInput.value = data.timeTo || '';
        console.log('Loaded settings:', data);
    });
}

// Apply filter
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

    chrome.storage.local.set({ timeFrom, timeTo }, () => {
        if (chrome.runtime.lastError) {
            console.error('Error saving settings:', chrome.runtime.lastError);
            return;
        }
        
        alert('Filter applied! Changes will be visible automatically.');
    });
}

// Initialize the popup
document.addEventListener('DOMContentLoaded', () => {
    initializeInputs();
    loadSettings();
    applyButton.addEventListener('click', applyFilter);
});