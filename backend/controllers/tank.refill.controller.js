import mongoose from "mongoose";
import Tank from "../models/tank.model.js";
import TankRefill from "../models/tank.refill.model.js";

export const getRefills = async (req, res) => {
    try {
        const { tankId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(tankId)) {
            return res.status(400).json({ message: "Invalid tank id" });
        }

        const tank = await Tank.findById(tankId);
        if (!tank) {
            return res.status(404).json({ message: "Tank not found", });
        }

        const refills = await TankRefill.find({ tankId }).sort({ refillDate: -1 });
        return res.status(200).json(refills);

    } catch (error) {
        console.log("Error in getRefills controller : ", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const getRefill = async (req, res) => {
    try {
        const { tankId } = req.params;
        const refillId = req.params.id

        if (!mongoose.Types.ObjectId.isValid(tankId) ||
            !mongoose.Types.ObjectId.isValid(refillId)) {
            return res.status(400).json({ message: "Invalid id" });
        }

        const refill = await TankRefill.findOne({
            _id: refillId, tankId,
        }).populate("tankId", "name tankNumber fuelType");

        if (!refill) {
            return res.status(404).json({ message: "Refill not found" });
        }
        return res.status(200).json(refill);

    } catch (error) {
        console.log("Error in getRefill controller : ", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const createRefill = async (req, res) => {

    const session = await mongoose.startSession();

    try {
        const { tankId } = req.params;
        const { quantity, refillDate, pricePerLitre, remarks } = req.body;

        if (!mongoose.Types.ObjectId.isValid(tankId)) {
            return res.status(400).json({ message: "Invalid tank id", });
        }

        session.startTransaction();

        const tank = await Tank.findById(tankId).session(session);

        if (!tank) {
            return res.status(404).json({ message: "Tank not found", });
        }

        if (!tank.isActive) {
            return res.status(400).json({ message: "Tank is inactive" });
        }

        if (tank.currentQuantity + quantity > tank.capacity) {
            return res.status(400).json({ message: "Refill exceeds tank capacity" });
        }

        const refill = await TankRefill.create(
            [{ tankId, quantity, pricePerLitre, refillDate, remarks }],
            { session }
        );

        await Tank.findByIdAndUpdate(
            tankId, {
            $inc: {
                currentQuantity: quantity,
            },
        }, { session, runValidators: true }
        );

        await session.commitTransaction();

        await refill[0].populate(
            "tankId",
            "name tankNumber fuelType"
        );

        return res.status(201).json({
            refill: refill[0],
            message: "Tank refilled successfully",
        });

    } catch (error) {
        await session.abortTransaction();
        console.log("Error in createRefill controller : ", error);
        return res.status(500).json({ message: "Internal server error", });

    } finally {
        await session.endSession();
    }
};

export const updateRefill = async (req, res) => {

    const session = await mongoose.startSession();

    try {
        const { tankId } = req.params;
        const refillId = req.params.id
        const { quantity, refillDate, pricePerLitre, remarks } = req.body;

        if (!mongoose.Types.ObjectId.isValid(tankId) ||
            !mongoose.Types.ObjectId.isValid(refillId)) {
            return res.status(400).json({ message: "Invalid id", });
        }

        session.startTransaction();

        const refill = await TankRefill.findOne({
            _id: refillId, tankId,
        }).session(session);

        if (!refill) {
            return res.status(404).json({ message: "Refill not found", });
        }

        const tank = await Tank.findById(tankId)
            .session(session);

        if (!tank) {
            return res.status(404).json({ message: "Tank not found" })
        }

        const updates = {};

        if (quantity !== undefined) {

            const difference = quantity - refill.quantity;
            const newQuantity = tank.currentQuantity + difference;

            if (newQuantity > tank.capacity) {
                return res.status(400).json({ message: "Refill exceeds tank capacity" });
            }
            if (newQuantity < 0) {
                return res.status(400).json({ message: "Tank quantity cannot become negative" });
            }

            tank.currentQuantity = newQuantity;
            await tank.save({ session })
            updates.quantity = quantity;
        }

        if (pricePerLitre !== undefined) {
            updates.pricePerLitre = pricePerLitre
        }

        if (refillDate !== undefined)
            updates.refillDate = refillDate;

        if (remarks !== undefined)
            updates.remarks = remarks;

        const updatedRefill = await TankRefill.findByIdAndUpdate(
            refillId, updates, {
            runValidators: true,
            returnDocument: "after",
            session,
        });

        await session.commitTransaction();

        return res.status(200).json({
            refill: updatedRefill,
            message: "Refill updated successfully",
        });

    } catch (error) {
        await session.abortTransaction();
        console.log("Error in updateRefill controller :", error);
        return res.status(500).json({ message: "Internal server error", });

    } finally {
        await session.endSession();
    }
};

export const deleteRefill = async (req, res) => {

    const session = await mongoose.startSession();

    try {
        const { tankId } = req.params;
        const refillId = req.params.id

        if (!mongoose.Types.ObjectId.isValid(tankId) ||
            !mongoose.Types.ObjectId.isValid(refillId)) {
            return res.status(400).json({ message: "Invalid id", });
        }

        session.startTransaction();

        const tank = await Tank.findById(tankId)
            .session(session);

        if (!tank) {
            return res.status(404).json({ message: "Tank not found" })
        }

        const refill = await TankRefill.findOne({
            _id: refillId, tankId,
        }).session(session);

        if (!refill) {
            return res.status(404).json({ message: "Refill not found", });
        }

        if (tank.currentQuantity < refill.quantity) {
            return res.status(400).json({ message: "Tank quantity cannot become negative" });
        }

        tank.currentQuantity -= refill.quantity
        await tank.save({ session })

        await TankRefill.findByIdAndDelete(
            refillId, { session }
        );

        await session.commitTransaction();
        return res.status(200).json({ message: "Refill deleted successfully", });

    } catch (error) {
        await session.abortTransaction();
        console.log("Error in deleteRefill controller : ", error);
        return res.status(500).json({ message: "Internal server error", });

    } finally {
        await session.endSession();
    }
};