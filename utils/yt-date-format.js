export function getYoutubeDisplayTimeOnVideoCardFromDateString(dateString) {
    // input formate '2025-06-08T02:51'
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now - date;

    const minute = 60 * 1000;
    const hour = 60 * minute;
    const day = 24 * hour;
    const week = 7 * day;
    const month = 30 * day;
    const year = 365 * day;

    if (diffMs < minute) return 'just now';
    if (diffMs < hour) return `${Math.floor(diffMs / minute)} minute${Math.floor(diffMs / minute) > 1 ? 's' : ''} ago`;
    if (diffMs < day) return `${Math.floor(diffMs / hour)} hour${Math.floor(diffMs / hour) > 1 ? 's' : ''} ago`;
    if (diffMs < week) return `${Math.floor(diffMs / day)} day${Math.floor(diffMs / day) > 1 ? 's' : ''} ago`;
    if (diffMs < month) return `${Math.floor(diffMs / week)} week${Math.floor(diffMs / week) > 1 ? 's' : ''} ago`;
    if (diffMs < year) return `${Math.floor(diffMs / month)} month${Math.floor(diffMs / month) > 1 ? 's' : ''} ago`;
    return `${Math.floor(diffMs / year)} year${Math.floor(diffMs / year) > 1 ? 's' : ''} ago`;
}