import ai from "../configs/gemini.js";

// Helper to format any Date objects or ISO date strings in the payload to Indian Standard Time (IST)
export const formatDatesToIST = (obj, visited = new WeakSet()) => {
    if (obj === null || obj === undefined) return obj;

    // Fast-path for primitive types
    if (typeof obj !== "object") return obj;

    // Handle Date instances
    if (obj instanceof Date) {
        return obj.toLocaleString("en-IN", {
            timeZone: "Asia/Kolkata",
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true
        }) + " (IST)";
    }

    // Handle MongoDB ObjectIds (convert to plain string representation)
    if (obj._bsontype === 'ObjectID' || (obj.constructor && (obj.constructor.name === 'ObjectID' || obj.constructor.name === 'ObjectId'))) {
        return obj.toString();
    }

    // Guard against circular references
    if (visited.has(obj)) {
        return "[Circular]";
    }
    visited.add(obj);

    // Convert Mongoose Documents to plain objects to strip out Mongoose internal circular fields
    if (typeof obj.toObject === 'function') {
        obj = obj.toObject();
    }

    if (Array.isArray(obj)) {
        return obj.map(item => formatDatesToIST(item, visited));
    }

    const formatted = {};
    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            const val = obj[key];
            if (typeof val === "string" && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(val)) {
                const date = new Date(val);
                if (!isNaN(date.getTime())) {
                    formatted[key] = date.toLocaleString("en-IN", {
                        timeZone: "Asia/Kolkata",
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true
                    }) + " (IST)";
                    continue;
                }
            }
            formatted[key] = formatDatesToIST(val, visited);
        }
    }
    return formatted;
};

export const generateResponse = async (question, data) => {
    // Convert all dates in the payload to local IST strings
    const formattedData = formatDatesToIST(data);

    const prompt = `
        You are an AI assistant for a Petrol Pump Management System.

        Instructions:
        - Use ONLY the provided business data.
        - Never invent numbers.
        - Keep answers concise.
        - Use ₹ for money.
        - Use litres for fuel.
        - If data is missing, say you couldn't find it.

        Business Data:
        ${JSON.stringify(formattedData, null, 2)}

        Question:
        ${question}
        `;

    const response = await ai.models.generateContent({
        model: process.env.GEMINI_MODEL,
        contents: prompt,
    });

    return response.text;
};