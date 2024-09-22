import mongoose from "mongoose";
import { dbUrl } from "../secret.js";

const connectDB = async (options = {}) => {
    try {
        const db = await mongoose.connect(dbUrl, options)
        if (db) {
            console.log("Database Connect Successfull. 😎")
        }
    } catch (error) {
        console.log("Database Connection Failed. 🥵")
    }
}

export default connectDB;