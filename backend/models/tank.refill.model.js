import mongoose from "mongoose";

const tankRefillSchema = new mongoose.Schema({
    tankId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Tank",
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
        min: [1, "Quantity must be greater than 0"],
    },
    pricePerLitre : {
        type : Number,
        required : true
    },
    refillDate: {
        type: Date,
        default: Date.now,
    },
    remarks: {
        type: String,
        trim: true,
        maxlength: [200, "Remarks cannot exceed 200 characters"],
    },
}, { timestamps: true, });

const TankRefill = mongoose.model("TankRefill", tankRefillSchema);

export default TankRefill;