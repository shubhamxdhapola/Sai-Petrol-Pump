import FuelPrice from "../models/fuel.price.model.js"

export const getCurrentPrices = async (req, res) => {
    try {
        const [petrol, diesel] = await Promise.all([

            FuelPrice.findOne({ fuelType: "PETROL" })
                .sort({ effectiveFrom: -1 }),

            FuelPrice.findOne({ fuelType: "DIESEL" })
                .sort({ effectiveFrom: -1 }),
        ]);

        const fuelPrices = {
            petrolPrice: petrol,
            dieselPrice: diesel
        }

        return res.status(200).json(fuelPrices)
    } catch (error) {
        console.log("Error in getCurrentPrice controller : ", error)
        return res.status(500).json({ message: "Internal server error" })
    }
}

export const createPrice = async (req, res) => {
    try {
        const { price, fuelType } = req.body

        const latestPrice = await FuelPrice.findOne({
            fuelType,
        }).sort({ effectiveFrom: -1 });

        if (latestPrice && latestPrice.price === price) {
            return res.status(409).json({
                message: `${fuelType} price is already ₹${price}`,
            });
        }

        const fuelPrice = await FuelPrice.create({ price, fuelType })

        return res.status(201).json({
            fuelPrice,
            message: `${fuelType} price updated successfully`
        })
    } catch (error) {
        console.log("Error in createPrice controller : ", error)
        return res.status(500).json({ message: "Internal server error" })
    }
}

export const getPriceHistory = async (req, res) => {
    try {
        let { fuelType } = req.query;

        if(fuelType) fuelType = fuelType.toUpperCase()

        if(fuelType !== 'PETROL' && fuelType !== 'DIESEL') {
            return res.status(400).json({message : "Invalid fuel type"})
        }

        const filter = {};
        if (fuelType) {
            filter.fuelType = fuelType;
        }

        const priceHistory = await FuelPrice.find(filter)
            .sort({ effectiveFrom: -1 });

        return res.status(200).json({ priceHistory });
    } catch (error) {
        console.log("Error in getPriceHistory controller:", error);
        return res.status(500).json({ message: "Internal server error", });
    }
}