import ai from "../configs/gemini.js";
import { generateResponse } from "../utils/buildPrompt.js";
import { detectIntent } from "../utils/detectIntent.js";
import getDateRange from "../utils/getDateRange.js";
import { getFuelSoldSummary, getOverviewCards, getRecentShifts, getTankStatus } from "./dashboard.service.js";
import { getEmployeePerformance, getTopEmployee } from "./employee.service.js";
import { getCurrentFuelPrices, getFuelPriceHistory } from "./fuel.price.service.js";
import { getTopMachine, getMachinePerformance } from "./machine.service.js";
import { generateDailyReport } from "./report.service.js";
import { getLastRefill, getRecentTankRefills, getTotalRefilled } from "./tank.refill.service.js";
import { getOngoingShifts, getCompletedShifts } from "./shift.service.js";

export const chatWithAI = async (message) => {
    const { intent, period, startDate, endDate } = await detectIntent(message);

    switch (intent) {
        case "TODAY_REVENUE":
        case "WEEKLY_SUMMARY":
        case "MONTHLY_SUMMARY": {
            let activePeriod = period;
            if (activePeriod === "none" || !activePeriod) {
                if (intent === "WEEKLY_SUMMARY") activePeriod = "7";
                else if (intent === "MONTHLY_SUMMARY") activePeriod = "30";
                else activePeriod = "today";
            }
            const { startDate: sDate, endDate: eDate } = getDateRange(activePeriod, startDate, endDate);
            const overview = await getOverviewCards(sDate, eDate);
            const fuelSold = await getFuelSoldSummary(sDate, eDate);
            return await generateResponse(
                message,
                { overview, fuelSold, period: activePeriod }
            );
        }

        case "TODAY_FUEL":
        case "TODAY_FUEL_SOLD": {
            const { startDate: sDate, endDate: eDate } = getDateRange(period === "none" ? "today" : period, startDate, endDate);
            const summary = await getFuelSoldSummary(sDate, eDate);
            return await generateResponse(
                message, summary
            );
        }

        case "TANK_STATUS":
        case "LOW_FUEL_TANKS": {
            const tanks = await getTankStatus();
            return await generateResponse(
                message, tanks
            );
        }

        case "TODAY_SHIFTS":
        case "ONGOING_SHIFTS":
        case "COMPLETED_SHIFTS": {
            const ongoing = await getOngoingShifts();
            const completed = await getCompletedShifts(period === "none" ? "today" : period, startDate, endDate);
            return await generateResponse(
                message,
                { ongoing, completed }
            );
        }

        case "CURRENT_FUEL_PRICE": {
            const prices = await getCurrentFuelPrices();
            return await generateResponse(
                message, prices
            );
        }

        case "FUEL_PRICE_HISTORY": {
            const history = await getFuelPriceHistory(period === "none" ? "7" : period, startDate, endDate);
            return await generateResponse(
                message, history
            );
        }

        case "RECENT_REFILLS": {
            const recentTankRefills = await getRecentTankRefills(period, startDate, endDate);
            return await generateResponse(
                message, recentTankRefills
            );
        }

        case "LAST_REFILL": {
            const lastRefill = await getLastRefill();
            return await generateResponse(
                message, lastRefill
            );
        }

        case "TOTAL_REFILLED": {
            const totalRefill = await getTotalRefilled(period, startDate, endDate);
            return await generateResponse(
                message, totalRefill
            );
        }

        case "DAILY_REPORT":
        case "REPORT": {
            const dailyReport = await generateDailyReport(period === "none" ? "today" : period, startDate, endDate);
            return await generateResponse(
                message, dailyReport
            );
        }

        case "TOP_EMPLOYEE": {
            let topEmp = await getTopEmployee(period === "none" ? "today" : period, startDate, endDate);
            if (!topEmp && (period === "today" || period === "none" || !period)) {
                // Fallback to last 30 days if no shifts completed today to ensure some results
                topEmp = await getTopEmployee("30");
            }
            return await generateResponse(
                message, topEmp
            );
        }

        case "EMPLOYEE_PERFORMANCE": {
            const User = (await import("../models/user.model.js")).default;
            const employees = await User.find({ role: "employee" });
            const matchedEmp = employees.find(emp =>
                message.toLowerCase().includes(emp.name.toLowerCase())
            );

            if (matchedEmp) {
                const performance = await getEmployeePerformance(matchedEmp._id, period === "none" ? "today" : period, startDate, endDate);
                return await generateResponse(
                    message,
                    { employee: matchedEmp.name, performance }
                );
            } else {
                const Shift = (await import("../models/shift.model.js")).default;
                const { startDate: sDate, endDate: eDate } = getDateRange(period === "none" ? "today" : period, startDate, endDate);
                const result = await Shift.aggregate([
                    {
                        $match: {
                            status: "COMPLETED",
                            endTime: { $gte: sDate, $lte: eDate }
                        }
                    },
                    {
                        $group: {
                            _id: "$employeeId",
                            revenue: { $sum: "$totalAmount" },
                            fuelSold: { $sum: "$totalFuelSold" },
                            shifts: { $sum: 1 }
                        }
                    },
                    {
                        $lookup: {
                            from: "users",
                            localField: "_id",
                            foreignField: "_id",
                            as: "employee"
                        }
                    },
                    { $unwind: "$employee" },
                    {
                        $project: {
                            _id: 0,
                            name: "$employee.name",
                            revenue: 1,
                            fuelSold: 1,
                            shifts: 1
                        }
                    }
                ]);
                return await generateResponse(message, result);
            }
        }

        case "TOP_MACHINE": {
            let topMachine = await getTopMachine(period === "none" ? "today" : period, startDate, endDate);
            if (!topMachine && (period === "today" || period === "none" || !period)) {
                // Fallback to last 30 days if no data today
                topMachine = await getTopMachine("30");
            }
            return await generateResponse(
                message, topMachine
            );
        }

        case "MACHINE_PERFORMANCE": {
            const Machine = (await import("../models/machine.model.js")).default;
            const machines = await Machine.find();
            const matchedMachine = machines.find(m =>
                message.toLowerCase().includes(m.name.toLowerCase()) ||
                message.toLowerCase().includes(m.machineNumber.toLowerCase())
            );

            if (matchedMachine) {
                const performance = await getMachinePerformance(matchedMachine._id, period === "none" ? "today" : period, startDate, endDate);
                return await generateResponse(
                    message,
                    { machine: matchedMachine.name, number: matchedMachine.machineNumber, performance }
                );
            } else {
                const Shift = (await import("../models/shift.model.js")).default;
                const { startDate: sDate, endDate: eDate } = getDateRange(period === "none" ? "today" : period, startDate, endDate);
                const result = await Shift.aggregate([
                    {
                        $match: {
                            status: "COMPLETED",
                            endTime: { $gte: sDate, $lte: eDate }
                        }
                    },
                    {
                        $group: {
                            _id: "$machineId",
                            revenue: { $sum: "$totalAmount" },
                            fuelSold: { $sum: "$totalFuelSold" },
                            shifts: { $sum: 1 }
                        }
                    },
                    {
                        $lookup: {
                            from: "machines",
                            localField: "_id",
                            foreignField: "_id",
                            as: "machine"
                        }
                    },
                    { $unwind: "$machine" },
                    {
                        $project: {
                            _id: 0,
                            name: "$machine.name",
                            machineNumber: "$machine.machineNumber",
                            revenue: 1,
                            fuelSold: 1,
                            shifts: 1
                        }
                    }
                ]);
                return await generateResponse(message, result);
            }
        }

        default:
            const response = await ai.models.generateContent({
                model: process.env.GEMINI_MODEL,
                contents: message,
            });
            return response.text;
    }
};