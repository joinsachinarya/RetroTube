import { formatInputValueAndGetDate } from './constant/timeDateMapping.js';
const STORAGE_KEYS = ['before', 'after', 'hideShorts', 'hidePlaylists'];
// dom elements
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


function showAlert(message) {
    const dialog = document.getElementById('alertDialog');
    const msg = document.getElementById('alertMessage');
    if (dialog && msg) {
        msg.textContent = message;
        dialog.showModal();
        document.getElementById('closeAlert').onclick = () => dialog.close();
    }
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
        } else {
            window.close();
            chrome.tabs.reload();
        }
    });
}

function applyFilter() {
    const before = beforeMonthSelect.value && beforeYearSelect.value ? `${beforeMonthSelect.value} ${beforeYearSelect.value}` : '';
    const after = afterMonthSelect.value && afterYearSelect.value ? `${afterMonthSelect.value} ${afterYearSelect.value}` : '';

    // Get current month and year
    const now = new Date();
    const currentMonth = now.getMonth(); 
    const currentYear = now.getFullYear();

    // Helper to check if a date is in the future
    function isFuture(monthStr, yearStr) {
        if (!monthStr || !yearStr) return false;
        const monthIdx = months.findIndex(m => m.toLowerCase() === monthStr.toLowerCase());
        const yearNum = parseInt(yearStr, 10);
        if (yearNum > currentYear) return true;
        if (yearNum === currentYear && monthIdx > currentMonth) return true;
        return false;
    }

    // Check for future dates
    if (isFuture(beforeMonthSelect.value, beforeYearSelect.value)) {
        showAlert("We don't support time travel to the future yet:)");
        return;
    }
    if (isFuture(afterMonthSelect.value, afterYearSelect.value)) {
        showAlert("We don't support time travel to the future yet:)");
        return;
    }

    if (before && after && new Date(after) > new Date(before)) {
        showAlert("'After' should be lesser than 'Before'");
        return;
    }
    saveSettings(before, after, hideShorts.checked, hidePlaylists.checked);
}

function loadInitialFilters() {
    chrome.storage.local.get(STORAGE_KEYS, (data) => {
        if (chrome.runtime.lastError) {
            showAlert('Something went wrong! Please try again.');
            return;
        }
        // Set dropdowns for before
        if (data?.before) {
            const [month, year] = data.before.split(' ');
            beforeMonthSelect.value = month || '';
            beforeYearSelect.value = year || '';
        } else {
            beforeMonthSelect.value = '';
            beforeYearSelect.value = '';
        }
        // Set dropdowns for after
        if (data?.after) {
            const [month, year] = data.after.split(' ');
            afterMonthSelect.value = month || '';
            afterYearSelect.value = year || '';
        } else {
            afterMonthSelect.value = '';
            afterYearSelect.value = '';
        }
        hidePlaylists.checked = !!data?.hidePlaylists;
        hideShorts.checked = !!data?.hideShorts;
        clearBeforeDropdown.disabled = !(data?.before && data.before.trim());
        clearAfterDropdown.disabled = !(data?.after && data.after.trim());
        applyButton.disabled = true;
    });
}

function handleClearBeforeDropdown() {
    beforeMonthSelect.value = '';
    beforeYearSelect.value = '';
    applyButton.disabled = false;
}

function handleClearAfterDropdown() {
    afterMonthSelect.value = '';
    afterYearSelect.value = '';
    applyButton.disabled = false;
}

// populate dropdowns
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

    // save on apply
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

    // enable apply on toggling 
    hideShorts.addEventListener('change', () => {
        applyButton.disabled = false;
    });
    hidePlaylists.addEventListener('change', () => {
        applyButton.disabled = false;
    });

    // show popup
    setTimeout(() => {
        document.body.classList.add('popup-visible');
    }, 10);
});
