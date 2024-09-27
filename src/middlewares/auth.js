import createError from "http-errors";
import jwt from "jsonwebtoken"
import { jwtAccessKey } from "../secret.js";

const isLoggedIn = async (req, res, next) => {
    try {
        const token = req.cookies.accessToken;
        if (!token) {
            throw createError(401, "Access token not found. Please login")
        }

        const decoded = await jwt.verify(token, jwtAccessKey)

        if (!decoded) {
            throw createError(401, "Invalid access token. Please login again")
        }
        req.body.userId = decoded._id
        next()
    } catch (error) {
        return next(error)
    }
}

export default isLoggedIn;