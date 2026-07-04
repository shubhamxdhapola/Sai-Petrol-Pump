import mongoose from "mongoose";

const machineSchema = new mongoose.Schema({
        name: {
            type: String,
            required: true,
            trim: true,
            minlength: [1, "Machine name is required"],
            maxlength: [20, "Machine name cannot exceed 20 characters"],
        },
        machineNumber: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            minlength: [1, "Machine number is required"],
            maxlength: [20, "Machine number cannot exceed 20 characters"],
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    }, { timestamps: true, });

const Machine = mongoose.model("Machine", machineSchema);

export default Machine;