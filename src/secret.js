import dotenv from "dotenv"
dotenv.config()

export const port = process.env.SERVER_PORT || 3002;
export const dbUrl = process.env.MONGODB_URI;