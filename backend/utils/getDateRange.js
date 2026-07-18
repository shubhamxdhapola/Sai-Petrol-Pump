
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

    // Construct the end of today in IST
    const endIST = Date.UTC(year, month, date, 23, 59, 59, 999);
    const end = new Date(endIST - OFFSET_MS);

    // Calculate days offset
    let daysOffset = 0;
    switch (period) {
        case "today":
            daysOffset = 0;
            break;
        case "15":
            daysOffset = 14;
            break;
        case "30":
            daysOffset = 29;
            break;
        case "7":
        default:
            daysOffset = 6;
            break;
    }

    // Construct the start of the period in IST
    const startIST = Date.UTC(year, month, date - daysOffset, 0, 0, 0, 0);
    const start = new Date(startIST - OFFSET_MS);

    return {
        startDate: start,
        endDate: end
    };
};

export default getDateRange;