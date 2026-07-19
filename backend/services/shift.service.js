import Shift from "../models/shift.model.js";
import getDateRange from "../utils/getDateRange.js";

export const getOngoingShifts = async () => {
    return await Shift.find({
        status: "ONGOING",
    })
        .populate("employeeId", "name")
        .populate("machineId", "name machineNumber")
        .sort({
            startTime: -1,
        });
};

export const getCompletedShifts = async (period = "today", startDate, endDate) => {
    const { startDate: sDate, endDate: eDate } = getDateRange(period, startDate, endDate);

    return await Shift.find({
        status: "COMPLETED",
        endTime: {
            $gte: sDate,
            $lte: eDate,
        },
    })
        .populate("employeeId", "name")
        .populate("machineId", "name machineNumber")
        .sort({
            endTime: -1,
        });
};