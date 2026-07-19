import mongoose from "mongoose";
import User from "../models/user.model.js";
import { generateToken } from "../utils/generateToken.js";
import { saveCookie } from "../utils/saveCookie.js";

export const login = async (req, res) => {
    try {
        const { phone, password } = req.body;

        const user = await User.findOne({ phone })
            .select('+password +tokenVersion')

        if (!user) {
            return res.status(400).json({ message: "Invalid credentials" })
        }

        if (!user.isActive) {
            return res.status(403).json({ message: "Your account has been deactivated" });
        }

        const isPasswordCorrect = await user.comparePassword(password)

        if (!isPasswordCorrect) {
            return res.status(400).json({ message: "Invalid credentials" })
        }

        const token = generateToken(user._id, user?.tokenVersion)
        saveCookie(token, req, res)

        return res.status(200).json({
            user: {
                id: user?._id,
                name: user?.name,
                phone: user?.phone,
                role: user?.role,
                isActive: user?.isActive,
                createdAt: user?.createdAt
            }, message: "Logged in successfully"
        })

    } catch (error) {
        console.log("Error in login controller : ", error)
        return res.status(500).json({ message: "Internal server error" })
    }
}

export const logout = (req, res) => {
    try {
        const isLocalhost = req.headers.host.includes('localhost') || req.headers.host.includes('127.0.0.1');
        res.clearCookie('token', {
            httpOnly: true,
            secure: !isLocalhost,
            sameSite: isLocalhost ? "Lax" : "none",
        })
        res.status(200).json({ message: "Logged out successfully!" })
    } catch (error) {
        console.log("Error in logout controller : ", error)
        return res.status(500).json({ message: "Internal server error" })
    }
}

export const getUserInfo = (req, res) => {
    try {
        return res.status(200).json(req?.user)
    } catch (error) {
        console.log("Error in getUserInfo controller : ", error)
        return res.status(500).json({ message: "Internal server error" })
    }
}

export const changePassword = async (req, res) => {
    try {

        const { currentPassword, newPassword } = req.body;
        const userId = req.user._id

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: "Invalid user id" });
        }

        const user = await User.findById(userId)
            .select('+password +tokenVersion')

        if (!user) {
            return res.status(404).json({ message: "User not found" })
        }

        const isMatch = await user.comparePassword(currentPassword)
        if (!isMatch) {
            return res.status(400).json({ message: "Current password is incorrect" })
        }

        if (currentPassword === newPassword) {
            return res.status(400).json({ message: "New password must be different" });
        }

        user.password = newPassword
        user.tokenVersion += 1;
        await user.save();

        return res.status(200).json({ message: "Password updated successfully" })

    } catch (error) {
        console.log("Error in changePassword controller : ", error)
        return res.status(500).json({ message: "Internal server error" })
    }
}
