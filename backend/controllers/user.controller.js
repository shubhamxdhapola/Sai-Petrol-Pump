import User from "../models/User.js"

export const createUser = async (req, res) => {
    try {
        const { name, phone, password } = req.body

        if (!name || !phone || !password) {
            return res.status(400).json({ message: "All fields are required" })
        }

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

        if (!userId) {
            return res.status(401).json({ message: "No user id provided" })
        }

        const user = await User.findById(userId).select('-password -tokenVersion');
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
        const users = await User.find({ role: 'employee' }).select('-password -tokenVersion')
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

        if (phone) {
            const existingUser = await User.findOne({ phone, _id: { $ne: userId } })
            if (existingUser) {
                return res.status(409).json({ message: "Phone number already exists" })
            }
        }

        const updates = {}
        if (name) updates.name = name
        if (phone) updates.phone = phone
        if (isActive && typeof isActive !== 'undefined') updates.isActive = isActive

        const updatedUser = await User.findByIdAndUpdate(
            userId, updates,
            { runValidators: true, returnDocument: 'after' }
        ).select('-password -tokenVersion')

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
        if (!userId) {
            return res.status(401).json({ message: "No user id provided" })
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
