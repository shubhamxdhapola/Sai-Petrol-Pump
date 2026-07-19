import Tank from "../models/tank.model.js";

export const getLowFuelTanks = async () => {
    const tanks = await Tank.find({
        isActive: true,
    });

    return tanks
        .map((tank) => ({
            id: tank._id,
            name: tank.name,
            fuelType: tank.fuelType,
            capacity: tank.capacity,
            remaining: tank.currentQuantity,
            percentage: Number(
                (
                    (tank.currentQuantity / tank.capacity) *
                    100
                ).toFixed(1)
            ),
        }))
        .filter((tank) => tank.percentage <= 20);
};

export const getTankByFuelType = async (fuelType) => {
    return await Tank.findOne({
        fuelType: fuelType.toUpperCase(),
        isActive: true,
    }).select("name fuelType capacity currentQuantity");
};