import FuelPrice from "../models/fuel.price.model.js"
import getCurrentFuelPrices from "../utils/getCurrentFuelPrices.js";

export const getCurrentPrices = async (req, res) => {
    try {
        const prices = await getCurrentFuelPrices();
        return res.status(200).json(prices);
    } catch (error) {
        console.log("Error in getCurrentPrice controller : ", error)
        return res.status(500).json({ message: "Internal server error" })
    }
}

export const createPrice = async (req, res) => {
    try {
        const { price, fuelType, effectiveFrom } = req.body

        const latestPrice = await FuelPrice.findOne({ fuelType }).sort({ effectiveFrom: -1 });
        if (latestPrice && latestPrice.price === price) {
            return res.status(409).json({ message: `${fuelType} price is already Rs ${price}` });
        }

        const fuelPrice = await FuelPrice.create({ price, fuelType, ...(effectiveFrom ? { effectiveFrom } : {}) })
        return res.status(201).json({ fuelPrice, message: `${fuelType} price updated successfully` })
    } catch (error) {
        console.log("Error in createPrice controller : ", error)
        return res.status(500).json({ message: "Internal server error" })
    }
}

export const getPriceHistory = async (req, res) => {
    try {
        let { fuelType } = req.query;
        if (fuelType) fuelType = fuelType.toUpperCase()

        if (fuelType && fuelType !== 'PETROL' && fuelType !== 'DIESEL' && fuelType !== 'PREMIUM') {
            return res.status(400).json({ message: "Invalid fuel type" })
        }

        const filter = {};
        if (fuelType) filter.fuelType = fuelType;

        const priceHistory = await FuelPrice.find(filter).sort({ effectiveFrom: -1 });
        return res.status(200).json({ priceHistory });
    } catch (error) {
        console.log("Error in getPriceHistory controller:", error);
        return res.status(500).json({ message: "Internal server error", });
    }
}

