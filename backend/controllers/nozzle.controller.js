import mongoose from "mongoose";
import Machine from "../models/machine.model.js";
import Nozzle from "../models/nozzle.model.js";
import Tank from "../models/tank.model.js";

export const getNozzles = async (req, res) => {
    try {
        const { machineId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(machineId)) {
            return res.status(400).json({ message: "Invalid machine id" });
        }

        const machine = await Machine.findById(machineId);
        if (!machine) {
            return res.status(404).json({ message: "Machine not found" });
        }

        const nozzles = await Nozzle.find({ machineId }).populate("tankId", "name tankNumber fuelType isActive");
        return res.status(200).json(nozzles);
    } catch (error) {
        console.log("Error in getNozzles controller :", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const getNozzle = async (req, res) => {
    try {
        const { machineId } = req.params;
        const nozzleId = req.params.id

        if (!mongoose.Types.ObjectId.isValid(machineId) ||
            !mongoose.Types.ObjectId.isValid(nozzleId)) {
            return res.status(400).json({ message: "Invalid id" });
        }

        const nozzle = await Nozzle.findOne({
            _id: nozzleId, machineId
        }).populate("tankId");

        if (!nozzle) {
            return res.status(404).json({ message: "Nozzle not found" });
        }
        return res.status(200).json(nozzle);
    } catch (error) {
        console.log("Error in getNozzle controller :", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const createNozzle = async (req, res) => {
    try {
        const { machineId } = req.params;

        const { nozzleNumber, tankId, currentReading } = req.body;

        if (!mongoose.Types.ObjectId.isValid(machineId)) {
            return res.status(400).json({ message: "Invalid machine id" });
        }

        if (!mongoose.Types.ObjectId.isValid(tankId)) {
            return res.status(400).json({ message: "Invalid tank id" });
        }

        const machine = await Machine.findById(machineId);

        if (!machine) {
            return res.status(404).json({ message: "Machine not found" });
        }

        if (!machine.isActive) {
            return res.status(400).json({ message: "Machine is inactive" });
        }

        const tank = await Tank.findById(tankId);

        if (!tank) {
            return res.status(404).json({ message: "Tank not found" });
        }

        if (!tank.isActive) {
            return res.status(400).json({ message: "Tank is inactive" });
        }

        const existingNozzle = await Nozzle.findOne({
            machineId, nozzleNumber
        });

        if (existingNozzle) {
            return res.status(409).json({ message: "Nozzle number already exists" });
        }

        const nozzle = await Nozzle.create({
            machineId, tankId, nozzleNumber, currentReading
        })

        await nozzle.populate([{
            path: "machineId",
            select: "name machineNumber",
        }, {
            path: "tankId",
            select: "name tankNumber fuelType",
        }],)

        return res.status(201).json({
            nozzle, message: "Nozzle created successfully"
        });
    } catch (error) {
        console.log("Error in createNozzle controller :", error);
        return res.status(500).json({ message: "Internal server error" });

    }
};

export const updateNozzle = async (req, res) => {
    try {

        const { machineId } = req.params;
        const nozzleId = req.params.id;

        const { nozzleNumber, tankId, isActive } = req.body;

        if (!mongoose.Types.ObjectId.isValid(machineId) ||
            !mongoose.Types.ObjectId.isValid(nozzleId)) {
            return res.status(400).json({ message: "Invalid id" });
        }
        
        const machine = await Machine.findById(machineId);

        if (!machine) {
            return res.status(404).json({ message: "Machine not found", });
        }

        const nozzle = await Nozzle.findOne({
            _id: nozzleId, machineId
        });

        if (!nozzle) {
            return res.status(404).json({ message: "Nozzle not found" });
        }

        if (nozzle.isOccupied) {
            return res.status(409).json({ message: "Cannot modify the occupied nozzle" })
        }

        const updates = {};

        if (nozzleNumber !== undefined) {
            const existingNozzle = await Nozzle.findOne({
                machineId, nozzleNumber, _id: { $ne: nozzleId }
            });

            if (existingNozzle) {
                return res.status(409).json({ message: "Nozzle number already exists" });
            }
            updates.nozzleNumber = nozzleNumber;
        }

        if (tankId !== undefined) {
            if (!mongoose.Types.ObjectId.isValid(tankId)) {
                return res.status(400).json({ message: "Invalid tank id" });
            }

            const tank = await Tank.findById(tankId);

            if (!tank) {
                return res.status(404).json({ message: "Tank not found" });
            }
            updates.tankId = tankId;
        }

        if (isActive !== undefined) {
            updates.isActive = isActive;
        }

        const updatedNozzle = await Nozzle.findByIdAndUpdate(
            { _id: nozzleId, isOccupied: false }, updates,
            { runValidators: true, returnDocument: "after" }
        );

        if (!updatedNozzle) {
            return res.status(409).json({ message: "Nozzle is occupied" });
        }

        return res.status(200).json({
            updatedNozzle, message: "Nozzle updated successfully"
        });
    } catch (error) {
        console.log("Error in updateNozzle controller :", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const deleteNozzle = async (req, res) => {
    try {
        const { machineId } = req.params;
        const nozzleId = req.params.id

        if (!mongoose.Types.ObjectId.isValid(machineId) ||
            !mongoose.Types.ObjectId.isValid(nozzleId)) {
            return res.status(400).json({ message: "Invalid id" });
        }

        const machine = await Machine.findById(machineId);

        if (!machine) {
            return res.status(404).json({ message: "Machine not found", });
        }

        const nozzle = await Nozzle.findById(nozzleId)

        if (!nozzle) {
            return res.status(404).json({ message: "Nozzle not found" });
        }
        if (nozzle.isOccupied) {
            return res.status(409).json({ message: "Cannot delete the occupied nozzle" })
        }

        const deletedNozzle = await Nozzle.findOneAndDelete({
            _id: nozzleId, machineId, isOccupied: false
        });

        if (!deletedNozzle) {
            return res.status(409).json({ message: "Cannot delete an occupied nozzle" });
        }

        return res.status(200).json({ message: "Nozzle deleted successfully" });
    } catch (error) {
        console.log("Error in deleteNozzle controller :", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
