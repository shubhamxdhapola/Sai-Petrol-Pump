import mongoose from "mongoose";

const tankSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    fuelType: {
        type: String,
        enum: ['PETROL', 'DIESEL'],
        required: true,
        uppercase: true
    },
    capacity: {
        type: Number,
        required: true,
        min: 1
    },
    currentQuantity: {
        type: Number,
        required: true,
        min: 0,
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true })

const Tank = mongoose.model('Tank', tankSchema)
export default Tank;