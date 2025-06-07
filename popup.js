// Load previous values
document.addEventListener('DOMContentLoaded', () => {
    chrome.storage.sync.get(['fromYear', 'toYear'], (data) => {
        console.log('data', data);
        document.getElementById('fromYear').value = data.fromYear || '';
        document.getElementById('toYear').value = data.toYear || '';
    });
});

document.getElementById('saveBtn').addEventListener('click', () => {
    const fromYear = parseInt(document.getElementById('fromYear').value);
    const toYear = parseInt(document.getElementById('toYear').value);
    console.log('fromYear', fromYear);
    console.log('toYear', toYear);

    chrome.storage.sync.set({ fromYear, toYear }, () => {
        alert('Filter applied! Changes will be visible automatically.');
    });
});