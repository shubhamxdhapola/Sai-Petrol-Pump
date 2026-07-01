import mongoose from "mongoose";

const tankSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        minlength: [1, 'Name must be at least 1 characters'],
        maxlength: [20, "Name cannot exceed 20 characters"]
    },
    tankNumber: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: [1, 'Tank number must be at least 1 characters']
    },
    fuelType: {
        type: String,
        enum: ['PETROL', 'DIESEL'],
        required: true,
        uppercase: true,
        trim: true
    },
    capacity: {
        type: Number,
        required: true,
        min: [1, 'Capacity must be greater than 0']
    },
    currentQuantity: {
        type: Number,
        required: true,
        min: [0, 'Current quantity cannot be negative']
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true })

const Tank = mongoose.model('Tank', tankSchema)
export default Tank;