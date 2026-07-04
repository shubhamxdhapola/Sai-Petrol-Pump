import mongoose from "mongoose";

const nozzleSchema = new mongoose.Schema({
    machineId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Machine",
        required: true,
    },
    tankId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Tank",
        required: true,
    },
    nozzleNumber: {
        type: String,
        required: true,
        trim: true,
        minlength: [1, "Nozzle number is required"],
        maxlength: [20, "Nozzle number cannot exceed 20 characters"],
    },
    currentReading: {
        type: Number,
        required: true,
        min: [0, "Current reading cannot be negative"],
    },
    isOccupied: {
        type: Boolean,
        default: false,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
}, { timestamps: true, });

nozzleSchema.index({
    machineId: 1,
    nozzleNumber: 1,
}, { unique: true, });

const Nozzle = mongoose.model("Nozzle", nozzleSchema);

export default Nozzle;