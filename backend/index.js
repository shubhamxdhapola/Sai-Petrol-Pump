import express from 'express'
import connectDB from './configs/connectDB.js';
import 'dotenv/config'
import cors from 'cors'
import cookieParser from 'cookie-parser';
import authRoutes from './routes/auth.routes.js'
import userRoutes from './routes/user.routes.js'
import tankRoutes from './routes/tank.routes.js'
import fuelPriceRoutes from './routes/fuel.price.route.js'

const app = express();
const PORT = process.env.PORT

app.use(express.json());
app.use(cookieParser())
app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true
}))

app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/tanks', tankRoutes)
app.use('/api/fuel-prices', fuelPriceRoutes)

app.use((req, res) => {
    return res.status(404).json({ 
        message: "Route not found" 
    })
})

async function startServer() {
    try {
        await connectDB();
        app.listen(PORT, () => {
            console.log(`Server is running at PORT: ${PORT}`)
        })
    } catch (error) {
        console.error("Failed to start server:", error);
        process.exit(1);
    }
}

startServer();
