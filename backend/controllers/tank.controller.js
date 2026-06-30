import Tank from "../models/tank.model.js"

export const getTanks = async (req, res) => {
    try {
        const tanks = await Tank.find()
        return res.status(200).json(tanks)
    } catch (error) {
        console.log("Error in getTanks controller : ", error)
        return res.status(500).json({ message: "Internal server error" })
    }
}

export const getTank = async (req, res) => {
    try {
        const tankId = req.params.id
        if (!tankId) {
            return res.status(400).json({ message: "Tank id not provided" })
        }

        const tank = await Tank.findById(tankId);
        if (!tank) {
            return res.status(404).json({ message: "Tank not found" })
        }
        return res.status(200).json(tank)
    } catch (error) {
        console.log("Error in getTank controller : ", error)
        return res.status(500).json({ message: "Internal server error" })
    }
}

export const createTank = async (req, res) => {
    try {
        const { name, fuelType, capacity, currentQuantity } = req.body

        if (!name || !fuelType || !capacity || !currentQuantity) {
            return res.status(400).json({ message: "All fields are required" })
        }

        if (currentQuantity > capacity) {
            return res.status(400).json({ 
                message: "Current quantity shouldn't exceed the capacity" 
            })
        }

        const tank = await Tank.create({ name, fuelType, capacity, currentQuantity })
        return res.status(201).json({ tank, message: "Tank created successfully" })

    } catch (error) {
        console.log("Error in createTank controller : ", error)
        return res.status(500).json({ message: "Internal server error" })
    }
}

export const updateTank = async (req, res) => {
    try {
        const { name, capacity, isActive } = req.body;
        const tankId = req.params.id

        const tank = await Tank.findById(tankId)
        if (!tank) {
            return res.status(404).json({ message: "Tank not found" });
        }

        if (capacity && capacity < tank?.currentQuantity) {
            return res.status(400).json({
                message: "Capacity cannot be less than the current fuel quantity"
            })
        }

        const updates = {}

        if (name) updates.name = name;
        if (capacity) updates.capacity = capacity
        if (typeof isActive != 'undefined') updates.isActive = isActive

        const updatedTank = await Tank.findByIdAndUpdate(
            tankId, updates,
            { runValidators: true, returnDocument: 'after' }
        )

        if (updatedTank) {
            return res.status(200).json({ 
                updatedTank, message: "Tank updated successfully" 
            })
        }

    } catch (error) {
        console.log("Error in updateTank controller : ", error)
        return res.status(500).json({ message: "Internal server error" })
    }
}

export const deleteTank = async (req, res) => {
    try {
        const tankId = req.params.id
        if(!tankId) {
            return res.status(400).json({message : "Tank not found"})
        }

        const tank = await Tank.findByIdAndDelete(tankId)
        if(!tank) {
            return res.status(404).json({message : "Tank not found"})
        }
        return res.status(200).json({message : "Tank deleted successfully"})

    } catch (error) {
        console.log("Error in deleteTank controller : ", error)
        return res.status(500).json({ message: "Internal server error" })
    }
}