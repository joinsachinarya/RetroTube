export function formatInputValueAndGetDate(value, unit) {
    const timeInMs = new Date().getTime();
    switch (unit) {
        case 'just now':
            return timeInMs;
        case 'minute':
            return timeInMs - value * 1000 * 60;
        case 'hour':
            return timeInMs - value * 1000 * 60 * 60;
        case 'day':
            return timeInMs - value * 1000 * 60 * 60 * 24;
        case 'week':
            return timeInMs - value * 1000 * 60 * 60 * 24 * 7;
        case 'month':
            return timeInMs - value * 1000 * 60 * 60 * 24 * 30;
        case 'year':
            return timeInMs - value * 1000 * 60 * 60 * 24 * 365;
    }
}