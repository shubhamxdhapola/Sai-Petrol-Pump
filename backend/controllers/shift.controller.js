import mongoose from "mongoose";
import Shift from "../models/shift.model.js";
import User from "../models/user.model.js";
import Machine from "../models/machine.model.js";
import Nozzle from "../models/nozzle.model.js";
import Tank from "../models/tank.model.js";
import FuelPrice from "../models/fuel.price.model.js";
import getCurrentFuelPrices from "../utils/getCurrentFuelPrices.js";

export const startShift = async (req, res) => {

    const session = await mongoose.startSession();

    try {
        const employeeId = req.user._id;
        const { machineId, nozzleIds } = req.body;

        if (!mongoose.Types.ObjectId.isValid(machineId)) {
            return res.status(400).json({ message: "Invalid machine id" });
        }

        nozzleIds.forEach(nozzleId => {
            if (!mongoose.Types.ObjectId.isValid(nozzleId)) {
                return res.status(400).json({ message: "Invalid nozzle id" });
            }
        })

        // Verify if duplicate nozzle ids received
        if (new Set(nozzleIds).size !== nozzleIds.length) {
            return res.status(400).json({ message: "Duplicate nozzle selected" });
        }

        session.startTransaction();

        const employee = await User.findById(employeeId).session(session);

        if (!employee) {
            await session.abortTransaction();
            return res.status(404).json({ message: "Employee not found" });
        }

        if (!employee.isActive) {
            await session.abortTransaction();
            return res.status(400).json({ message: "Employee is inactive" });
        }

        // Verify if employee has already a ongoing shift
        const existingShift = await Shift.findOne({
            employeeId, status: "ONGOING"
        }).session(session);

        if (existingShift) {
            await session.abortTransaction();
            return res.status(409).json({ message: "Employee already has an ongoing shift" });
        }

        const machine = await Machine.findById(machineId)
            .session(session);

        if (!machine) {
            await session.abortTransaction();
            return res.status(404).json({ message: "Machine not found" });
        }

        if (!machine.isActive) {
            await session.abortTransaction();
            return res.status(400).json({ message: "Machine is inactive" });
        }

        // Verify if the selected nozzles are exists
        const nozzles = await Nozzle.find({
            _id: { $in: nozzleIds }
        }).session(session);

        if (nozzles.length !== nozzleIds.length) {
            await session.abortTransaction();
            return res.status(404).json({ message: "One or more nozzles not found" });
        }

        for (const nozzle of nozzles) {

            // Verify if the selected nozzles does belongs to selected machine?
            if (nozzle.machineId.toString() !== machineId) {
                await session.abortTransaction();
                return res.status(400).json({
                    message: `Nozzle ${nozzle.nozzleNumber} does not belong to selected machine`
                });
            }

            // Verify if nozzle is active or not
            if (!nozzle.isActive) {
                await session.abortTransaction();
                return res.status(400).json({
                    message: `Nozzle ${nozzle.nozzleNumber} is inactive`
                });
            }

            // If the nozzle is already occupied by other employee
            if (nozzle.isOccupied) {
                await session.abortTransaction();
                return res.status(400).json({
                    message: `Nozzle ${nozzle.nozzleNumber} is already occupied`
                });
            }
        }

        // Assign the opening reading to each nozzle
        const shiftNozzles = nozzles.map(nozzle => ({
            nozzleId: nozzle._id,
            openingReading: nozzle.currentReading
        }));

        const shift = await Shift.create([{
            employeeId,
            machineId,
            nozzles: shiftNozzles
        }],
            { session }
        );

        // Mark all selected nozzles as occupied
        await Nozzle.updateMany({
            _id: { $in: nozzleIds }
        },
            { $set: { isOccupied: true } },
            { session }
        );

        await session.commitTransaction();

        await shift[0].populate([
            {
                path: "employeeId",
                select: "name phone"
            },
            {
                path: "machineId",
                select: "name machineNumber"
            },
            {
                path: "nozzles.nozzleId",
                select: "nozzleNumber currentReading"
            }
        ]);

        return res.status(201).json({
            shift: shift[0],
            message: "Shift started successfully"
        });

    } catch (error) {
        await session.abortTransaction();
        console.log("Error in startShift controller :", error);
        return res.status(500).json({ message: "Internal server error" });

    } finally {
        await session.endSession();
    }
};

export const endShift = async (req, res) => {

    const session = await mongoose.startSession();

    try {
        const shiftId = req.params.id;
        const { readings } = req.body;

        if (!mongoose.Types.ObjectId.isValid(shiftId)) {
            return res.status(400).json({ message: "Invalid shift id" });
        }

        readings.forEach((reading) => {
            if (!mongoose.Types.ObjectId.isValid(reading.nozzleId)) {
                return res.status(400).json({ message: "Invalid nozzle id" });
            }
        })

        session.startTransaction();

        const shift = await Shift.findById(shiftId)
            .session(session);

        if (!shift) {
            await session.abortTransaction();
            return res.status(404).json({ message: "Shift not found" });
        }

        if (shift.status === "COMPLETED") {
            await session.abortTransaction();
            return res.status(400).json({ message: "Shift already completed" });
        }

        // Ensure that closing reading must be provided for each selected nozzles during the shift creation
        if (readings.length !== shift.nozzles.length) {
            await session.abortTransaction();
            return res.status(400).json({
                message: "Closing reading is required for every assigned nozzle"
            });
        }

        // Find the nozzles id of each nozzle selected during the shift creation
        const nozzleIds = shift.nozzles.map(
            nozzle => nozzle.nozzleId
        );

        // Find all nozzles selected during shift creation and their tankId(connected to which tank) to get the fuel type of a nozzle
        const nozzles = await Nozzle.find({
            _id: {
                $in: nozzleIds
            }
        }).populate("tankId").session(session);

        const { PETROL, DIESEL } = await getCurrentFuelPrices(session); // Get the lastest fuel prices

        const priceMap = new Map([ // Create a mapping of latest fuel prices e.g - FuelType : Price
            ["PETROL",  PETROL.price],
            ["DIESEL", DIESEL.price],
        ]);

        const tankDeductions = new Map(); // This will be used to deduct the total sold fuel during the shift from each nozzle

        let totalFuelSold = 0; // Total fuel sold during a shift
        let totalAmount = 0; // Total amount

        for (const reading of readings) {

            const shiftNozzle = shift.nozzles.find(
                n => n.nozzleId.toString() === reading.nozzleId
            ); // Verify that the nozzles selected during the shift must be equal to nozzles given at the end of the shift

            if (!shiftNozzle) {
                await session.abortTransaction();
                return res.status(400).json({ message: "This nozzle was not selected during shift creation" });
            }

            const nozzle = nozzles.find( // Verify the nozzle must exist in nozzle collection
                n => n._id.toString() === reading.nozzleId
            );

            if (!nozzle) {
                await session.abortTransaction();
                return res.status(404).json({ message: "Nozzle not found" });
            }

            // The closing reading must be greater or equal to the opening reading
            if (reading.closingReading < shiftNozzle.openingReading) {
                await session.abortTransaction();
                return res.status(400).json({
                    message: `Closing reading cannot be less than opening reading for nozzle ${nozzle.nozzleNumber}`
                });

            }
            const fuelSold = reading.closingReading - shiftNozzle.openingReading; // Calculate fuel sold by individual nozzle
            const pricePerLitre = priceMap.get(nozzle.tankId.fuelType); // Get the latest price of fuel

            if (pricePerLitre === undefined) {
                await session.abortTransaction();
                return res.status(400).json({ message: `Fuel price not found for ${nozzle.tankId.fuelType}` });
            }
            const amount = fuelSold * pricePerLitre; // Calculate amount for each nozzle

            // Update the fields on each nozzle in shift schema
            shiftNozzle.fuelSold = fuelSold;
            shiftNozzle.amount = amount;
            shiftNozzle.pricePerLitre = pricePerLitre;
            shiftNozzle.closingReading = reading.closingReading;

            // Calculate the total fuel sold and total amount during a shift
            totalFuelSold += fuelSold;
            totalAmount += amount;

            nozzle.currentReading = reading.closingReading; // Update the current reading of nozzle
            nozzle.isOccupied = false; // Free the nozzle

            await nozzle.save({ session }); // Save nozzle

            // Calculate the total fuel sold during shift from each tank
            const tankId = nozzle.tankId._id.toString();
            if (tankDeductions.has(tankId)) {
                tankDeductions.set(
                    tankId,
                    tankDeductions.get(tankId) + fuelSold
                )
            } else {
                tankDeductions.set(
                    tankId,
                    fuelSold
                );
            }
        }

        // Decrease the total fuel sold during shift from each tank
        for (const [tankId, quantity] of tankDeductions) {
            const tank = await Tank.findById(tankId)
                .session(session);

            if (!tank) {
                await session.abortTransaction();
                return res.status(404).json({ message: "Tank not found" });
            }

            if (tank.currentQuantity < quantity) { // If total fuel sold is more than the actual available fuel in tank
                await session.abortTransaction();
                return res.status(400).json({
                    message: `${tank.name} does not have enough fuel`
                });
            }

            tank.currentQuantity -= quantity; // Update the current fuel quantity of the tank
            await tank.save({ session });
        }

        // Update shift fields
        shift.totalFuelSold = totalFuelSold;
        shift.totalAmount = totalAmount;
        shift.status = "COMPLETED"; // Mark shift as completed
        shift.endTime = new Date();

        await shift.save({ session });
        await session.commitTransaction();

        await shift.populate([
            {
                path: "employeeId",
                select: "name phone"
            },
            {
                path: "machineId",
                select: "name machineNumber"
            },
            {
                path: "nozzles.nozzleId",
                select: "nozzleNumber"
            }

        ]);

        return res.status(200).json({
            shift,
            message: "Shift completed successfully"
        });

    } catch (error) {
        await session.abortTransaction();
        console.log("Error endShift controller : ", error);
        return res.status(500).json({ message: "Internal server error" });

    } finally {
        await session.endSession();
    }
}

export const getShifts = async (req, res) => {
    try {

        let { status, employeeId, machineId, startDate, endDate } = req.query;

        status = status.toUpperCase();
        const filter = {};

        if (req.user.role === 'employee') {
            filter.employeeId = req.user._id
        } else {
            if (employeeId) {
                if (!mongoose.Types.ObjectId.isValid(employeeId)) {
                    return res.status(400).json({ message: "Invalid employee id" });
                }
                filter.employeeId = employeeId;
            }
        }

        if (startDate || endDate) {
            filter.startTime = {};

            if (startDate) {
                filter.startTime.$gte = new Date(startDate);
            }
            if (endDate) {
                filter.startTime.$lte = new Date(endDate);
            }
        }

        if (status) {
            const validStatus = ["ONGOING", "COMPLETED"];
            if (!validStatus.includes(status)) {
                return res.status(400).json({ message: "Invalid status" });
            }
            filter.status = status;
        }

        if (machineId) {
            if (!mongoose.Types.ObjectId.isValid(machineId)) {
                return res.status(400).json({ message: "Invalid machine id" });
            }
            filter.machineId = machineId;
        }

        const shifts = await Shift.find(filter)
            .populate("employeeId", "name phone")
            .populate("machineId", "name machineNumber")
            .sort({ startTime: -1 })
            .lean();

        return res.status(200).json(shifts);

    } catch (error) {
        console.log("Error in getShifts controller :", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const getShift = async (req, res) => {

    try {
        const shiftId = req.params.id;

        if (!mongoose.Types.ObjectId.isValid(shiftId)) {
            return res.status(400).json({ message: "Invalid shift id" });
        }

        const shift = await Shift.findById(shiftId);

        if (!shift) {
            return res.status(404).json({
                message: "Shift not found"
            });
        }

        if (
            req.user.role === "employee" &&
            shift.employeeId.toString() !== req.user._id.toString()
        ) {
            return res.status(403).json({
                message: "You are not authorized to view this shift"
            });
        }

        await shift.populate([
            {
                path: "employeeId",
                select: "name phone"
            },
            {
                path: "machineId",
                select: "name machineNumber"
            },
            {
                path: "nozzles.nozzleId",
                select: "nozzleNumber tankId",
                populate: {
                    path: "tankId",
                    select: "name tankNumber fuelType"
                }
            }
        ]);

        return res.status(200).json(shift);
    } catch (error) {
        console.log("Error in getShift controller :", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
