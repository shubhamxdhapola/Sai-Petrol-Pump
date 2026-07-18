import mongoose from "mongoose";

const fuelPriceSchema = new mongoose.Schema({
    fuelType: {
        type: String,
        enum: ['PETROL', 'DIESEL', 'PREMIUM'],
        required: true,
        uppercase: true,
        trim: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    effectiveFrom: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true })

const FuelPrice = mongoose.model('FuelPrice', fuelPriceSchema)
export default FuelPrice