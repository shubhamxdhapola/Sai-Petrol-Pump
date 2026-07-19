import Shift from "../models/shift.model.js";
import getDateRange from "../utils/getDateRange.js";

export const getTopEmployee = async (period = "today", startDate, endDate) => {
    const { startDate: sDate, endDate: eDate } = getDateRange(period, startDate, endDate);

    const result = await Shift.aggregate([
        {
            $match: {
                status: "COMPLETED",
                endTime: {
                    $gte: sDate,
                    $lte: eDate,
                },
            },
        },
        {
            $group: {
                _id: "$employeeId",
                revenue: { $sum: "$totalAmount" },
                fuelSold: { $sum: "$totalFuelSold" },
                shifts: { $sum: 1 },
            },
        },
        {
            $sort: {
                revenue: -1,
            },
        },
        {
            $limit: 5,
        },
        {
            $lookup: {
                from: "users",
                localField: "_id",
                foreignField: "_id",
                as: "employee",
            },
        },
        {
            $unwind: "$employee",
        },
        {
            $project: {
                _id: 0,
                employeeId: "$employee._id",
                name: "$employee.name",
                revenue: 1,
                fuelSold: 1,
                shifts: 1,
            },
        },
    ]);

    return result.length > 0 ? {
        topEmployee: result[0],
        rankings: result,
        totalEmployeesCount: result.length
    } : null;
};

export const getEmployeePerformance = async (
    employeeId,
    period = "today",
    startDate,
    endDate
) => {
    const { startDate: sDate, endDate: eDate } = getDateRange(period, startDate, endDate);

    const result = await Shift.aggregate([
        {
            $match: {
                employeeId,
                status: "COMPLETED",
                endTime: {
                    $gte: sDate,
                    $lte: eDate,
                },
            },
        },
        {
            $group: {
                _id: null,
                revenue: { $sum: "$totalAmount" },
                fuelSold: { $sum: "$totalFuelSold" },
                shifts: { $sum: 1 },
            },
        },
    ]);

    if (!result.length) return null;

    return {
        revenue: result[0].revenue,
        fuelSold: result[0].fuelSold,
        shifts: result[0].shifts,
        averageRevenue:
            result[0].shifts > 0
                ? result[0].revenue / result[0].shifts
                : 0,
    };
};