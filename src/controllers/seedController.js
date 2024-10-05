import User from "../models/userModel.js"
import data from "../data.js"
import Product from "../models/productModel.js"


// Users seed
export const seedUsers = async (req, res, next) => {
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

// Products seed
export const seedProducts = async (req, res, next) => {
    try {
        // deleting all existing data
        await Product.deleteMany({})

        // inserting all data from seed data
        const products = await Product.insertMany(data.products)

        return res.status(201).json(products)
    } catch (error) {
        next(error)

    }
}