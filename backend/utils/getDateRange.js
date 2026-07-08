
const getDateRange = (period, startDate, endDate) => {

    // Custom Date Range
    if (startDate && endDate) {
        return {
            startDate: new Date(startDate),
            endDate: new Date(
                new Date(endDate).setHours(23, 59, 59, 999)
            )
        };
    }

    const now = new Date();

    // End of today
    const end = new Date(now);
    end.setHours(23, 59, 59, 999);

    let start = new Date(end);

    switch (period) {

        case "15":
            start.setDate(end.getDate() - 14);
            break;

        case "30":
            start.setDate(end.getDate() - 29);
            break;

        case "7":
        default:
            start.setDate(end.getDate() - 6);
            break;
    }

    start.setHours(0, 0, 0, 0);

    return {
        startDate: start,
        endDate: end
    };
};

export default getDateRange;