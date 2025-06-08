export function getDateFromYoutubeDisplayTime(displayString) {
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
