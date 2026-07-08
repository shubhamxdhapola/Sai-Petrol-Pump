import mongoose from "mongoose";
import Machine from "../models/machine.model.js";
import Nozzle from "../models/nozzle.model.js";

export const getMachines = async (req, res) => {
    try {
        const machines = await Machine.find();
        return res.status(200).json(machines);
    } catch (error) {
        console.log("Error in getMachines controller : ", error)
        return res.status(500).json({ message: "Internal server error" })
    }
}

export const getMachine = async (req, res) => {
    try {
        const machineId = req.params.id;

        if (!mongoose.Types.ObjectId.isValid(machineId)) {
            return res.status(400).json({ message: "Invalid machine id", });
        }

        const machine = await Machine.findById(machineId);

        if (!machine) {
            return res.status(404).json({ message: "Machine not found", });
        }
        return res.status(200).json(machine);
    } catch (error) {
        console.log("Error in getMachine controller : ", error)
        return res.status(500).json({ message: "Internal server error" })
    }
}

export const createMachine = async (req, res) => {
    try {
        const { name, machineNumber } = req.body;

        const existingMachine = await Machine.findOne({ machineNumber });

        if (existingMachine) {
            return res.status(409).json({ message: "Machine number already exists" });
        }

        const newMachine = await Machine.create({ name, machineNumber });

        return res.status(201).json({
            machine: newMachine,
            message: "Machine created successfully",
        });
    } catch (error) {
        console.log("Error in createMachine controller : ", error)
        return res.status(500).json({ message: "Internal server error" })
    }
}

export const updateMachine = async (req, res) => {
    try {
        const { name, machineNumber, isActive } = req.body;

        const machineId = req.params.id;

        if (!mongoose.Types.ObjectId.isValid(machineId)) {
            return res.status(400).json({ message: "Invalid machine id" });
        }

        const machine = await Machine.findById(machineId);

        if (!machine) {
            return res.status(404).json({ message: "Machine not found", });
        }

        const occupiedNozzle = await Nozzle.findOne({
            machineId, isOccupied: true
        })

        if (occupiedNozzle) {
            return res.status(409).json({
                message: "Cannot modify machine while one or more nozzles are occupied",
            });
        }

        const updates = {};

        if (machineNumber) {
            const existingMachine = await Machine.findOne({
                machineNumber, _id: { $ne: machineId },
            });

            if (existingMachine) {
                return res.status(409).json({ message: "Machine number already exists", });
            }
            updates.machineNumber = machineNumber;
        }

        if (name) updates.name = name;

        if (typeof isActive !== "undefined") {
            updates.isActive = isActive;
        }

        const updatedMachine = await Machine.findByIdAndUpdate(
            machineId, updates,
            { runValidators: true, returnDocument: "after", }
        );

        return res.status(200).json({
            machine: updatedMachine,
            message: "Machine updated successfully",
        });
    } catch (error) {
        console.log("Error in updateMachine controller : ", error)
        return res.status(500).json({ message: "Internal server error" })
    }
}

export const deleteMachine = async (req, res) => {
    try {
        const machineId = req.params.id;

        if (!mongoose.Types.ObjectId.isValid(machineId)) {
            return res.status(400).json({ message: "Invalid machine id" });
        }

        const machine = await Machine.findById(machineId);

        if (!machine) {
            return res.status(404).json({ message: "Machine not found" });
        }

        const occupiedNozzle = await Nozzle.findOne({
            machineId, isOccupied: true,
        });

        if (occupiedNozzle) {
            return res.status(409).json({
                message: "Cannot delete machine while one or more nozzles are occupied",
            });
        }

        const nozzleCount = await Nozzle.countDocuments({ machineId });

        if (nozzleCount > 0) {
            return res.status(409).json({
                message: "Remove all nozzles before deleting this machine",
            });
        }

        await Machine.findByIdAndDelete(machineId)
        return res.status(200).json({ message: "Machine deleted successfully" });

    } catch (error) {
        console.log("Error in deleteMachine controller : ", error)
        return res.status(500).json({ message: "Internal server error" })
    }
}
