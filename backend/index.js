import express from 'express'
import connectDB from './configs/connectDB.js';
import 'dotenv/config'
import cors from 'cors'
import cookieParser from 'cookie-parser';
import authRoutes from './routes/auth.routes.js'

const app = express();
const PORT = process.env.PORT

app.use(express.json());
app.use(cookieParser())
app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true
}))

app.use('/api/auth', authRoutes)

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
