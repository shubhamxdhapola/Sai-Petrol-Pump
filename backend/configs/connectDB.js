import mongoose from "mongoose";

export default async function connectDB() {
    try {
        await mongoose.connect(process.env.DATABASE_URL);
        console.log("Connected to Database");
    } catch (error) {
        console.error("Error connecting to Database:", error.message);
        throw error;
    }
}
