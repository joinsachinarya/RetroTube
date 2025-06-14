import { formatInputValueAndGetDate } from './constant/timeDateMapping.js';
// Constants for date values
const STORAGE_KEYS = ['before', 'after', 'hidePlaylists', 'hideShorts', 'hideLiveStream'];

// Get DOM elements
const beforeMonthSelect = document.getElementById('beforeMonthSelect');
const beforeYearSelect = document.getElementById('beforeYearSelect');
const afterMonthSelect = document.getElementById('afterMonthSelect');
const afterYearSelect = document.getElementById('afterYearSelect');
const applyButton = document.getElementById('applyButton');
const hidePlaylists = document.getElementById('hidePlaylists');
const hideShorts = document.getElementById('hideShorts');
// const hideLiveStream = document.getElementById('hideLiveStream');
const clearBeforeDropdown = document.getElementById('clearBeforeDropdown');
const clearAfterDropdown = document.getElementById('clearAfterDropdown');

// Helper: Month name to number (0-based)
const monthMap = {
    january: 0, february: 1, march: 2, april: 3, may: 4, june: 5,
    july: 6, august: 7, september: 8, october: 9, november: 10, december: 11
};

function showAlert(message) {
    const dialog = document.getElementById('alertDialog');
    const msg = document.getElementById('alertMessage');
    if (dialog && msg) {
        msg.textContent = message;
        dialog.showModal();
        document.getElementById('closeAlert').onclick = () => dialog.close();
    }
}


function setValueInLocalStorage(key, value) {
    chrome.storage.local.set({
        [key]: value
    }, () => {
        if (chrome.runtime.lastError) {
            showAlert('Something went wrong! Please try again.');
        }
    });
    applyButton.disabled = false;
}


function saveSettings(before, after, hideShorts, hidePlaylists) {
    chrome.storage.local.set({
        before,
        after,
        hideShorts,
        hidePlaylists,
    }, () => {
        if (chrome.runtime.lastError) {
            showAlert('Something went wrong! Please try again.');
        }
    });
}

function applyFilter() {
    const before = `${beforeMonthSelect.value} ${beforeYearSelect.value}`;
    const after = `${afterMonthSelect.value} ${afterYearSelect.value}`;

    if (new Date(after) > new Date(before)) {
        showAlert("'After' should be lesser than 'Before'");
        return;
    }
    saveSettings(before, after, hideShorts.checked, hidePlaylists.checked);
}

function loadInitialFilters() {
    chrome.storage.local.get(STORAGE_KEYS, (data) => {
        console.log("data", data);
        if (chrome.runtime.lastError) {
            showAlert('Something went wrong! Please try again.');
            return;
        }
        setValueInLocalStorage('before', data?.before || '');
        setValueInLocalStorage('after', data?.after || '');

        setValueInLocalStorage('hidePlaylists', data?.hidePlaylists || false);
        setValueInLocalStorage('hideShorts', data?.hideShorts || false);
        // setValueInLocalStorage('hideLiveStream', data?.hideLiveStream || false);

        applyButton.disabled = true;
        if (!data?.before.trim()) clearBeforeDropdown.disabled = true;
        if (!data?.after.trim()) clearAfterDropdown.disabled = true;
    });
}



function handleClearBeforeDropdown() {
    beforeMonthSelect.value = '';
    beforeYearSelect.value = '';
    setValueInLocalStorage('before', '');
}

function handleClearAfterDropdown() {
    afterMonthSelect.value = '';
    afterYearSelect.value = '';
    setValueInLocalStorage('after', '');
}

function toggleHidePlaylists() {
    setValueInLocalStorage('hidePlaylists', !hidePlaylists.checked);
}
function toggleHideShorts() {
    setValueInLocalStorage('hideShorts', !hideShorts.checked);
}
// function toggleHideLiveStream() {
//     setValueInLocalStorage('hideLiveStream', !hideLiveStream.checked);
// }




// populate dropdowns helper functions
const currentYear = new Date().getFullYear();
const years = [];
const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];
for (let y = currentYear; y >= 2005; y--) years.push(y);

function populateMonthSelect(select) {
    if (!select) return;
    select.innerHTML = '<option value="" selected style="opacity: 0.5;" >Select...</option>' + months.map(m => `<option value="${m.toLowerCase()}">${m}</option>`).join(' ');
}
function populateYearSelect(select) {
    if (!select) return;
    select.innerHTML = '<option value="" selected style="opacity: 0.5;" >Select...</option>' + years.map(y => `<option value="${y}">${y}</option>`).join(' ');
}


document.addEventListener('DOMContentLoaded', () => {
    // populate dropdowns
    populateMonthSelect(document.getElementById('beforeMonthSelect'));
    populateMonthSelect(document.getElementById('afterMonthSelect'));
    populateYearSelect(document.getElementById('beforeYearSelect'));
    populateYearSelect(document.getElementById('afterYearSelect'));

    // load settings
    loadInitialFilters();

    // apply button
    applyButton.addEventListener('click', applyFilter);

    // other event listeners
    clearBeforeDropdown.addEventListener('click', handleClearBeforeDropdown);
    clearAfterDropdown.addEventListener('click', handleClearAfterDropdown);

    hidePlaylists.addEventListener('change', toggleHidePlaylists);
    hideShorts.addEventListener('change', toggleHideShorts);
    // hideLiveStream.addEventListener('change', toggleHideLiveStream());
    [beforeMonthSelect, beforeYearSelect, afterMonthSelect, afterYearSelect].forEach((select) => {
        select.addEventListener('change', () => {
            const isBeforeMonthSelected = !!beforeMonthSelect.value.trim();
            const isBeforeYearSelected = !!beforeYearSelect.value.trim();
            const isAfterMonthSelected = !!afterMonthSelect.value.trim();
            const isAfterYearSelected = !!afterYearSelect.value.trim();

            const beforeSelected = isBeforeMonthSelected && isBeforeYearSelected;
            const afterSelected = isAfterMonthSelected && isAfterYearSelected;

            if (
                (beforeSelected && afterSelected) ||
                (beforeSelected && !isAfterMonthSelected && !isAfterYearSelected) ||
                (afterSelected && !isBeforeMonthSelected && !isBeforeYearSelected)
            ) {
                applyButton.disabled = false;
            } else {
                applyButton.disabled = true;
            }
        })
    })

    // show popup
    setTimeout(() => {
        document.body.classList.add('popup-visible');
    }, 10);
});
