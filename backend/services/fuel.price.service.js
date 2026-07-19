import FuelPrice from "../models/fuel.price.model.js";
import getDateRange from "../utils/getDateRange.js";

export const getCurrentFuelPrices = async () => {

    const prices = await FuelPrice.aggregate([
        {
            $sort: {
                effectiveFrom: -1
            }
        },
        {
            $group: {
                _id: "$fuelType",
                price: {
                    $first: "$price"
                },
                effectiveFrom: {
                    $first: "$effectiveFrom"
                }
            }
        }
    ]);

    const result = {};

    prices.forEach(price => {
        result[price._id.toLowerCase()] = {
            price: price.price,
            effectiveFrom: price.effectiveFrom
        };
    });

    return result;
};

export const getFuelPriceHistory = async (period = "7", startDate, endDate) => {

    const { startDate: sDate, endDate: eDate } = getDateRange(period, startDate, endDate);

    return await FuelPrice.find({
        effectiveFrom: {
            $gte: sDate,
            $lte: eDate
        }
    })
        .sort({
            effectiveFrom: -1
        });

};