export const monthMap = {
    0: 'january', 1: 'february', 2: 'march', 3: 'april', 4: 'may', 5: 'june',
    6: 'july', 7: 'august', 8: 'september', 9: 'october', 10: 'november', 11: 'december'
};

export function getDateFromYoutubeDisplayTime(displayString) {
    const now = new Date();

    if (
        displayString === 'just now' ||
        displayString.includes('watching') ||
        displayString.includes('live')
    ) {
        return `${monthMap[now.getMonth()]} ${now.getFullYear()}`;
    }

    const regexps = [
        { re: /^(\d+)\s*second[s]?\s*ago$/, unit: 'second' },
        { re: /^(\d+)\s*minute[s]?\s*ago$/, unit: 'minute' },
        { re: /^(\d+)\s*hour[s]?\s*ago$/, unit: 'hour' },
        { re: /^(\d+)\s*day[s]?\s*ago$/, unit: 'day' },
        { re: /^(\d+)\s*week[s]?\s*ago$/, unit: 'week' },
        { re: /^(\d+)\s*month[s]?\s*ago$/, unit: 'month' },
        { re: /^(\d+)\s*year[s]?\s*ago$/, unit: 'year' }
    ];

    for (const { re, unit } of regexps) {
        const match = displayString.match(re);
        if (match) {
            const value = parseInt(match[1], 10);
            const date = new Date(now);

            switch (unit) {
                case 'second':
                    date.setSeconds(date.getSeconds() - value);
                    break;
                case 'minute':
                    date.setMinutes(date.getMinutes() - value);
                    break;
                case 'hour':
                    date.setHours(date.getHours() - value);
                    break;
                case 'day':
                    date.setDate(date.getDate() - value);
                    break;
                case 'week':
                    date.setDate(date.getDate() - value * 7);
                    break;
                case 'month':
                    date.setMonth(date.getMonth() - value);
                    break;
                case 'year':
                    date.setFullYear(date.getFullYear() - value);
                    break;
            }

            return `${monthMap[date.getMonth()]} ${date.getFullYear()}`;
        }
    }

    const tryDate = new Date(displayString);
    if (!isNaN(tryDate.getTime())) {
        return `${monthMap[tryDate.getMonth()]} ${tryDate.getFullYear()}`;
    }

    console.error("Unrecognized display string: " + displayString);
    return `${monthMap[now.getMonth()]} ${now.getFullYear()}`;;
}

