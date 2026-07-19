import { getFuelSoldChart, getFuelSoldSummary, getOverviewCards, getRecentShifts, getRevenueChart, getTankStatus } from '../services/dashboard.service.js';
import getDateRange from '../utils/getDateRange.js'

export const getDashboardData = async (req, res) => {
    try {
        const { period = "today" } = req.query;
        const { startDate, endDate } = getDateRange(period);

        const overview = await getOverviewCards(startDate, endDate);
        const revenueChart = await getRevenueChart(startDate, endDate, period);
        const fuelSoldChart = await getFuelSoldChart(startDate, endDate, period);
        const fuelSoldSummary = await getFuelSoldSummary(startDate, endDate);
        const tankStatus = await getTankStatus();
        const recentShifts = await getRecentShifts();

        return res.status(200).json({
            overview,
            revenueChart,
            fuelSoldChart,
            fuelSoldSummary,
            tankStatus,
            recentShifts
        });
    } catch (error) {
        console.log("Error in getDashboard controller :", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

