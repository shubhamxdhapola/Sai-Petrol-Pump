import TankRefill from "../models/tank.refill.model.js";
import getDateRange from "../utils/getDateRange.js";

export const getRecentTankRefills = async (period = "today", startDate, endDate) => {

    const { startDate: sDate, endDate: eDate } = getDateRange(period, startDate, endDate);

    return await TankRefill.find({
        refillDate: {
            $gte: sDate,
            $lte: eDate,
        },
    })
        .populate("tankId", "name fuelType")
        .sort({
            refillDate: -1,
        });

};

export const getLastRefill = async () => {

    return await TankRefill.findOne()
        .populate("tankId", "name fuelType")
        .sort({
            refillDate: -1,
        });

};

export const getTotalRefilled = async (period = "today", startDate, endDate) => {

    const { startDate: sDate, endDate: eDate } = getDateRange(period, startDate, endDate);

    const result = await TankRefill.aggregate([
        {
            $match: {
                refillDate: {
                    $gte: sDate,
                    $lte: eDate,
                },
            },
        },
        {
            $lookup: {
                from: "tanks",
                localField: "tankId",
                foreignField: "_id",
                as: "tank",
            },
        },
        {
            $unwind: "$tank",
        },
        {
            $group: {
                _id: "$tank.fuelType",
                quantity: {
                    $sum: "$quantity",
                },
                amount: {
                    $sum: {
                        $multiply: ["$quantity", "$pricePerLitre"],
                    },
                },
            },
        },
    ]);

    const summary = {
        petrol: {
            quantity: 0,
            amount: 0,
        },
        diesel: {
            quantity: 0,
            amount: 0,
        },
        totalQuantity: 0,
        totalAmount: 0,
    };

    result.forEach((item) => {

        const fuelType = item._id.toLowerCase();

        summary[fuelType] = {
            quantity: item.quantity,
            amount: item.amount,
        };

        summary.totalQuantity += item.quantity;
        summary.totalAmount += item.amount;
    });

    return summary;

};