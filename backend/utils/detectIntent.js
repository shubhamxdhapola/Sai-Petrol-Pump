import ai from "../configs/gemini.js";

export const detectIntent = async (message) => {
    const prompt = `
        You are an intent classification engine for a Petrol Pump Management System.

        Your job is to classify the user's question into ONE of these intents.

        Return ONLY valid JSON.

        Available intents:

        TODAY_REVENUE
        TODAY_FUEL
        TODAY_SHIFTS
        TOP_EMPLOYEE
        EMPLOYEE_PERFORMANCE
        TOP_MACHINE
        MACHINE_PERFORMANCE
        TANK_STATUS
        TODAY_FUEL_SOLD
        CURRENT_FUEL_PRICE
        FUEL_PRICE_HISTORY
        RECENT_REFILLS
        LAST_REFILL
        TOTAL_REFILLED
        DAILY_REPORT
        LOW_FUEL_TANKS
        ONGOING_SHIFTS
        COMPLETED_SHIFTS
        WEEKLY_SUMMARY
        MONTHLY_SUMMARY
        REPORT
        UNKNOWN
    
        Also detect the time period if mentioned.
        If the user mentions a specific date or date range (e.g. "18 july", "18-07-2026", "between 15 and 18 july"), identify it and format the date as YYYY-MM-DD in the local IST context (assume the current year is 2026).

        Possible values for period:

        today
        yesterday
        week
        month
        custom
        none

        If the period is a specific date or date range, set "period": "custom" and extract "startDate" and "endDate" as "YYYY-MM-DD" strings. For a single date (e.g. "18 july"), set both "startDate" and "endDate" to that date.

        Response format:

        {
          "intent": "TODAY_REVENUE",
          "period": "custom",
          "startDate": "2026-07-18",
          "endDate": "2026-07-18"
        }

        Or if no specific dates are mentioned, omit the startDate and endDate fields:

        {
          "intent": "TODAY_REVENUE",
          "period": "today"
        }

        User Question:

        "${message}"
        `;

    const response = await ai.models.generateContent({
        model: process.env.GEMINI_MODEL,
        contents: prompt,
    });

    return JSON.parse(response.text);
};