
const getDateRange = (period, startDate, endDate) => {
    const OFFSET_MS = 5.5 * 60 * 60 * 1000; // India Offset (+05:30)

    if (startDate && endDate) {
        // Parse date strings in local time and convert to UTC
        const startLocalMidnight = new Date(startDate).getTime() - OFFSET_MS;
        const endLocalMidnight = new Date(endDate).getTime() - OFFSET_MS + (24 * 60 * 60 * 1000) - 1;

        return {
            startDate: new Date(startLocalMidnight),
            endDate: new Date(endLocalMidnight)
        };
    }

    // Relative Period calculations using local date boundaries:
    const now = new Date();
    // Shift current time by +5.5 hours to get the current date in IST
    const nowIST = new Date(now.getTime() + OFFSET_MS);
    
    // Extract year, month, date in IST
    const year = nowIST.getUTCFullYear();
    const month = nowIST.getUTCMonth();
    const date = nowIST.getUTCDate();

    let startIST;
    let endIST;

    switch (period) {
        case "today":
            startIST = Date.UTC(year, month, date, 0, 0, 0, 0);
            endIST = Date.UTC(year, month, date, 23, 59, 59, 999);
            break;
        case "yesterday":
            startIST = Date.UTC(year, month, date - 1, 0, 0, 0, 0);
            endIST = Date.UTC(year, month, date - 1, 23, 59, 59, 999);
            break;
        case "7":
        case "week":
            startIST = Date.UTC(year, month, date - 6, 0, 0, 0, 0);
            endIST = Date.UTC(year, month, date, 23, 59, 59, 999);
            break;
        case "15":
            startIST = Date.UTC(year, month, date - 14, 0, 0, 0, 0);
            endIST = Date.UTC(year, month, date, 23, 59, 59, 999);
            break;
        case "30":
        case "month":
            startIST = Date.UTC(year, month, date - 29, 0, 0, 0, 0);
            endIST = Date.UTC(year, month, date, 23, 59, 59, 999);
            break;
        default:
            // Default to last 7 days (including today)
            startIST = Date.UTC(year, month, date - 6, 0, 0, 0, 0);
            endIST = Date.UTC(year, month, date, 23, 59, 59, 999);
            break;
    }

    return {
        startDate: new Date(startIST - OFFSET_MS),
        endDate: new Date(endIST - OFFSET_MS)
    };
};

export default getDateRange;