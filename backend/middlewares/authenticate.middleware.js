import jwt from 'jsonwebtoken'
import User from '../models/user.model.js';

export const authenticate = async (req, res, next) => {
    try {
        let token = req.cookies.token;
        if (!token && req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
            token = req.headers.authorization.split(" ")[1];
        }
        if (!token) {
            return res.status(401).json({ message: "Unauthorized - No token provided" })
        }

        jwt.verify(token, process.env.JWT_SECRET, async (err, decodedToken) => {
            if (err) {
                return res.status(401).json({ message: "Unauthorized - Invalid token" })
            }
            const user = await User.findById(decodedToken.userId).select('+tokenVersion');

            if (decodedToken.tokenVersion !== user.tokenVersion) {
                return res.status(401).json({ message: "Session expired, Login again" })
            }

            req.user = user;
            next()
        })
    } catch (error) {
        console.log("Error in authenticate middleware : ", error)
        res.status(500).json({ message: "Internal server error!" })
    }
}

export const isAdmin = (req, res, next) => {
    try {
        if (req.user && req.user.role == 'admin') next()
        else res.status(403).json({ message: "Not authorized as admin" })
    } catch (error) {
        console.log("Error in isAdmin middleware : ", err)
        res.status(500).json({ message: "Internal server error!" })
    }
}