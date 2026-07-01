import mongoose from "mongoose"
import User from "../models/user.model.js"

export const createUser = async (req, res) => {
    try {
        const { name, phone, password } = req.body

        const user = await User.findOne({ phone })
        if (user) {
            return res.status(409).json({ message: "Phone number already exists" })
        }

        const newUser = await User.create({
            name, phone, password, role: 'employee'
        })

        return res.status(201).json({
            user: {
                id: newUser?._id,
                name: newUser?.name,
                phone: newUser?.phone,
                role: newUser?.role,
                isActive: newUser?.isActive,
                createdAt: newUser?.createdAt
            }, message: "User created successfully"
        })
    } catch (error) {
        console.log("Error in createUser controller : ", error)
        return res.status(500).json({ message: "Internal server error" })
    }
}

export const getUser = async (req, res) => {
    try {
        const userId = req.params.id

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: "Invalid user id" });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" })
        }

        return res.status(200).json(user)

    } catch (error) {
        console.log("Error in getUser controller : ", error)
        return res.status(500).json({ message: "Internal server error" })
    }
}

export const getUsers = async (req, res) => {
    try {
        const users = await User.find({ role: 'employee' })
        return res.status(200).json(users)
    } catch (error) {
        console.log("Error in getUsers controller : ", error)
        return res.status(500).json({ message: "Internal server error" })
    }
}

export const updateUser = async (req, res) => {
    try {
        const { name, phone, isActive } = req.body
        const userId = req.params.id

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: "Invalid user id" });
        }

        if (phone) {
            const existingUser = await User.findOne({ phone, _id: { $ne: userId } })
            if (existingUser) {
                return res.status(409).json({ message: "Phone number already exists" })
            }
        }

        const updates = {}
        if (name) updates.name = name
        if (phone) updates.phone = phone
        if (isActive !== undefined) updates.isActive = isActive

        const updatedUser = await User.findByIdAndUpdate(
            userId, updates,
            { runValidators: true, returnDocument: 'after' }
        )

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" })
        }

        return res.status(200).json({ updatedUser, message: "User updated successfully" })
    } catch (error) {
        console.log("Error in updateUser controller : ", error)
        return res.status(500).json({ message: "Internal server error" })
    }
}

export const deleteUser = async (req, res) => {
    try {
        const userId = req.params.id

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: "Invalid user id" });
        }

        const user = await User.findByIdAndDelete(userId)
        if (!user) {
            return res.status(404).json({ message: "User not found" })
        }
        return res.status(200).json({ message: "User deleted successfully" })
    } catch (error) {
        console.log("Error in createUser controller : ", error)
        return res.status(500).json({ message: "Internal server error" })
    }
}
