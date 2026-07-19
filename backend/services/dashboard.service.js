import Shift from "../models/shift.model.js";
import Tank from "../models/tank.model.js";

export const getOverviewCards = async (startDate, endDate) => {
    const overview = await Shift.aggregate([{
        $facet: {
            completed: [{
                $match: {
                    status: "COMPLETED",
                    endTime: { $gte: startDate, $lte: endDate }
                }
            }, {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: "$totalAmount" },
                    totalFuelSold: { $sum: "$totalFuelSold" },
                    completedShifts: { $sum: 1 }
                }
            }],
            ongoing: [{
                $match: { status: "ONGOING" }
            }, { $count: "ongoingShifts" }]
        }
    }]);

    const completed = overview[0].completed[0] || {
        totalRevenue: 0,
        totalFuelSold: 0,
        completedShifts: 0
    };
    const ongoing = overview[0].ongoing[0] || { ongoingShifts: 0 };

    return {
        totalRevenue: completed.totalRevenue,
        totalFuelSold: completed.totalFuelSold,
        completedShifts: completed.completedShifts,
        ongoingShifts: ongoing.ongoingShifts
    };
};

export const getTankStatus = async () => {
    const tanks = await Tank.find({ isActive: true })
        .select("name fuelType capacity currentQuantity")
        .sort({ fuelType: 1, name: 1 });

    return tanks.map(tank => {
        const percentage = tank.capacity === 0 ? 0 : Number((tank.currentQuantity / tank.capacity * 100).toFixed(1));
        return {
            tankId: tank._id,
            name: tank.name,
            fuelType: tank.fuelType,
            capacity: tank.capacity,
            remaining: tank.currentQuantity,
            percentage
        };
    });
};

export const getFuelSoldSummary = async (startDate, endDate) => {
    const result = await Shift.aggregate([{
        $match: {
            status: "COMPLETED",
            endTime: { $gte: startDate, $lte: endDate }
        }
    },
    { $unwind: "$nozzles" },
    {
        $group: {
            _id: "$nozzles.fuelType",
            sold: { $sum: "$nozzles.fuelSold" },
            revenue: { $sum: "$nozzles.amount" }
        }
    }]);

    const summary = {
        petrol: { sold: 0, revenue: 0 },
        diesel: { sold: 0, revenue: 0 },
        premium: { sold: 0, revenue: 0 },
        totalSold: 0,
        totalRevenue: 0
    };

    result.forEach(item => {
        if (item._id === "PETROL") {
            summary.petrol.sold = item.sold;
            summary.petrol.revenue = item.revenue;
        } else if (item._id === "DIESEL") {
            summary.diesel.sold = item.sold;
            summary.diesel.revenue = item.revenue;
        } else if (item._id === "PREMIUM") {
            summary.premium.sold = item.sold;
            summary.premium.revenue = item.revenue;
        }
        summary.totalSold += item.sold;
        summary.totalRevenue += item.revenue;
    });

    return summary;
};

export const getRevenueChart = async (startDate, endDate, period) => {
    const revenue = await Shift.aggregate([{
        $match: {
            status: "COMPLETED",
            endTime: { $gte: startDate, $lte: endDate }
        }
    }, {
        $group: {
            _id: {
                $dateToString: {
                    format: period === "today" ? "%H" : "%Y-%m-%d",
                    date: "$endTime",
                    timezone: "+05:30"
                }
            },
            revenue: { $sum: "$totalAmount" }
        }
    }]);

    const revenueMap = new Map();
    revenue.forEach(item => revenueMap.set(item._id, item.revenue));
    const chart = [];

    if (period === "today") {
        for (let hour = 0; hour < 24; hour++) {
            const key = String(hour).padStart(2, "0");
            const label = hour === 0 ? "12 AM" : hour < 12 ? `${hour} AM` : hour === 12 ? "12 PM" : `${hour - 12} PM`;
            chart.push({ label, revenue: revenueMap.get(key) || 0 });
        }
    } else {
        const days = Number(period);
        for (let i = days - 1; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, "0");
            const day = String(date.getDate()).padStart(2, "0");
            const key = `${year}-${month}-${day}`;
            chart.push({
                label: period === "7" ? date.toLocaleDateString("en-US", { weekday: "short" }) : date.toLocaleDateString("en-US", { day: "2-digit", month: "short" }),
                revenue: revenueMap.get(key) || 0
            });
        }
    }

    return chart;
};

export const getFuelSoldChart = async (startDate, endDate, period) => {
    const result = await Shift.aggregate([{
        $match: {
            status: "COMPLETED",
            endTime: { $gte: startDate, $lte: endDate }
        }
    },
    { $unwind: "$nozzles" }, {
        $group: {
            _id: {
                period: {
                    $dateToString: {
                        format: period === "today" ? "%H" : "%Y-%m-%d",
                        date: "$endTime",
                        timezone: "+05:30"
                    }
                },
                fuelType: "$nozzles.fuelType"
            },
            fuelSold: { $sum: "$nozzles.fuelSold" }
        }
    }]);

    const fuelMap = new Map();
    result.forEach(item => {
        const key = item._id.period;
        if (!fuelMap.has(key)) fuelMap.set(key, { petrol: 0, diesel: 0, premium: 0 });
        if (item._id.fuelType === "PETROL") fuelMap.get(key).petrol = item.fuelSold;
        else if (item._id.fuelType === "DIESEL") fuelMap.get(key).diesel = item.fuelSold;
        else if (item._id.fuelType === "PREMIUM") fuelMap.get(key).premium = item.fuelSold;
    });

    const chart = [];
    if (period === "today") {
        for (let hour = 0; hour < 24; hour++) {
            const key = String(hour).padStart(2, "0");
            const values = fuelMap.get(key) || { petrol: 0, diesel: 0, premium: 0 };
            const label = hour === 0 ? "12 AM" : hour < 12 ? `${hour} AM` : hour === 12 ? "12 PM" : `${hour - 12} PM`;
            chart.push({ label, petrol: values.petrol, diesel: values.diesel, premium: values.premium });
        }
    } else {
        const days = Number(period);
        for (let i = days - 1; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, "0");
            const day = String(date.getDate()).padStart(2, "0");
            const key = `${year}-${month}-${day}`;
            const values = fuelMap.get(key) || { petrol: 0, diesel: 0, premium: 0 };
            chart.push({
                label: period === "7" ? date.toLocaleDateString("en-US", { weekday: "short" }) : date.toLocaleDateString("en-US", { day: "2-digit", month: "short" }),
                petrol: values.petrol,
                diesel: values.diesel,
                premium: values.premium
            });
        }
    }

    return chart;
};

export const getRecentShifts = async () => {
    const shifts = await Shift.find()
        .populate("employeeId", "name")
        .populate("machineId", "name machineNumber")
        .sort({ startTime: -1 })
        .limit(5);

    return shifts.map(shift => ({
        id: shift._id,
        employee: shift.employeeId?.name || "-",
        machine: shift.machineId?.name || "-",
        fuelSold: shift.totalFuelSold,
        revenue: shift.totalAmount,
        status: shift.status,
        startTime: shift.startTime
    }));
};
