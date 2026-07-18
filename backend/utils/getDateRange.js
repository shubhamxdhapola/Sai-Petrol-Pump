
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
    const nowUTC = new Date();
    const nowLocal = new Date(nowUTC.getTime() + OFFSET_MS);

    const endLocal = new Date(nowLocal);
    endLocal.setHours(23, 59, 59, 999);

    const end = new Date(endLocal.getTime() - OFFSET_MS);

    let startLocal = new Date(endLocal);
    switch (period) {
        case "today":
            break;
        case "15":
            startLocal.setDate(endLocal.getDate() - 14);
            break;
        case "30":
            startLocal.setDate(endLocal.getDate() - 29);
            break;
        case "7":
        default:
            startLocal.setDate(endLocal.getDate() - 6);
            break;
    }
    startLocal.setHours(0, 0, 0, 0);

    const start = new Date(startLocal.getTime() - OFFSET_MS);

    return {
        startDate: start,
        endDate: end
    };
};

export default getDateRange;