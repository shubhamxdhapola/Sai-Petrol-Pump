import Shift from "../models/shift.model.js";
import TankRefill from "../models/tank.refill.model.js";
import { exportRefillExcel, exportSalesExcel } from "../utils/exportExcelSheets.js";
import getDateRange from "../utils/getDateRange.js";

export const getSalesReport = async (req, res) => {
    try {
        const { period, startDate, endDate, download } = req.query;

        const {
            startDate: start,
            endDate: end
        } = getDateRange(period, startDate, endDate);

        const report = await Shift.aggregate([
            {
                $match: {
                    status: "COMPLETED",
                    endTime: {
                        $gte: start,
                        $lte: end
                    }
                }
            },

            { $unwind: "$nozzles" },

            {
                $group: {
                    _id: {
                        $dateToString: {
                            format: "%Y-%m-%d",
                            date: "$endTime"
                        }
                    },

                    petrolSold: {
                        $sum: {
                            $cond: [
                                { $eq: ["$nozzles.fuelType", "PETROL"] },
                                "$nozzles.fuelSold",
                                0
                            ]
                        }
                    },

                    dieselSold: {
                        $sum: {
                            $cond: [
                                { $eq: ["$nozzles.fuelType", "DIESEL"] },
                                "$nozzles.fuelSold",
                                0
                            ]
                        }
                    },

                    petrolRevenue: {
                        $sum: {
                            $cond: [
                                { $eq: ["$nozzles.fuelType", "PETROL"] },
                                "$nozzles.amount",
                                0
                            ]
                        }
                    },

                    dieselRevenue: {
                        $sum: {
                            $cond: [
                                { $eq: ["$nozzles.fuelType", "DIESEL"] },
                                "$nozzles.amount",
                                0
                            ]
                        }
                    }
                }
            },

            { $sort: { _id: 1 } }
        ]);

        const totals = {
            petrolSold: 0,
            dieselSold: 0,
            petrolRevenue: 0,
            dieselRevenue: 0,
            totalRevenue: 0
        };

        report.forEach(row => {

            row.date = row._id;
            delete row._id;

            row.totalRevenue = row.petrolRevenue + row.dieselRevenue;

            totals.petrolSold += row.petrolSold;
            totals.dieselSold += row.dieselSold;

            totals.petrolRevenue += row.petrolRevenue;
            totals.dieselRevenue += row.dieselRevenue;

            totals.totalRevenue += row.totalRevenue;
        });

        if (download === "true") {
            return await exportSalesExcel(
                res, report, totals, start, end
            );
        }

        return res.status(200).json({ report, totals });

    } catch (error) {
        console.log("Error in getSalesReport controller :", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const getRefillReport = async (req, res) => {
    try {
        const { period, startDate, endDate, download } = req.query;

        const {
            startDate: start,
            endDate: end
        } = getDateRange(period, startDate, endDate);

        const refills = await TankRefill.find({
            refillDate: { $gte: start, $lte: end }
        })
            .populate("tankId", "name tankNumber fuelType")
            .sort({ refillDate: 1 });

        const report = [];

        const totals = {
            quantity: 0,
            amount: 0
        };

        refills.forEach(refill => {

            const amount = refill.quantity * refill.pricePerLitre;

            report.push({
                date: refill.refillDate,
                tank: refill.tankId.name,
                fuelType: refill.tankId.fuelType,
                pricePerLitre : refill.pricePerLitre,
                quantity: refill.quantity,
                amount
            });

            totals.quantity += refill.quantity;
            totals.amount += amount;
        });

        if (download === "true") {
            return exportRefillExcel(
                res, report, totals, start, end
            );
        }

        return res.status(200).json({ report, totals });

    } catch (error) {
        console.log("Error in getRefillReport controller :", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};