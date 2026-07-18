import FuelPrice from "../models/fuel.price.model.js";

const getCurrentFuelPrices = async (session = null) => {

    const [petrol, diesel, premium] = await Promise.all([
        FuelPrice.findOne({ fuelType: "PETROL" })
            .sort({ effectiveFrom: -1 })
            .session(session),

        FuelPrice.findOne({ fuelType: "DIESEL" })
            .sort({ effectiveFrom: -1 })
            .session(session),

        FuelPrice.findOne({ fuelType: "PREMIUM" })
            .sort({ effectiveFrom: -1 })
            .session(session),
    ]);

    return { PETROL: petrol, DIESEL: diesel, PREMIUM: premium };
};

export default getCurrentFuelPrices