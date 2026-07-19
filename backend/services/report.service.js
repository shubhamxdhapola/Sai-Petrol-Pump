import getDateRange from "../utils/getDateRange.js";
import { getOverviewCards, getFuelSoldSummary, getTankStatus, } from "./dashboard.service.js";
import { getTopEmployee } from "./employee.service.js";
import { getTopMachine } from "./machine.service.js";
import { getCurrentFuelPrices } from "./fuel.price.service.js";
import { getRecentTankRefills, getTotalRefilled, } from "./tank.refill.service.js";

export const generateDailyReport = async (period = "today", startDate, endDate) => {

    const { startDate: sDate, endDate: eDate } = getDateRange(period, startDate, endDate);

    const [
        overview,
        fuelSummary,
        tankStatus,
        topEmployee,
        topMachine,
        fuelPrices,
        recentRefills,
        totalRefilled
    ] = await Promise.all([

        getOverviewCards(sDate, eDate),
        getFuelSoldSummary(sDate, eDate),
        getTankStatus(),
        getTopEmployee(period, startDate, endDate),
        getTopMachine(period, startDate, endDate),
        getCurrentFuelPrices(),
        getRecentTankRefills(period, startDate, endDate),
        getTotalRefilled(period, startDate, endDate)

    ]);

    return {
        generatedAt: new Date(),
        period,
        startDate: sDate,
        endDate: eDate,
        overview,
        fuelSummary,
        tankStatus,
        fuelPrices,
        recentRefills,
        totalRefilled,
        topEmployee,
        topMachine
    };

};