import User from "../models/userModel.js"
import data from "../data.js"

const seedUser = async (req, res, next) => {
    try {
        // deleting all existing data
        await User.deleteMany({})

        // inserting all data from seed data
        const user = await User.insertMany(data.users)

        return res.status(201).json(user)

    } catch (error) {
        next(error)
    }
}

export default seedUser;