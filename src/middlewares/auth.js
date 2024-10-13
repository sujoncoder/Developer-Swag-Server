import createError from "http-errors";
import jwt from "jsonwebtoken"
import { jwtAccessKey } from "../secret.js";


// handle isLoggedin middleware
export const isLoggedIn = async (req, res, next) => {
    try {
        const accessToken = req.cookies.accessToken;
        if (!accessToken) {
            throw createError(401, "Access token not found. Please login")
        }

        const decoded = await jwt.verify(accessToken, jwtAccessKey)

        if (!decoded) {
            throw createError(401, "Invalid access token. Please login again")
        }
        req.user = decoded.user
        next()
    } catch (error) {
        return next(error)
    }
}


// Handle isLogout middleware
export const isLoggedOut = async (req, res, next) => {
    try {
        const accessToken = req.cookies.accessToken;
        if (accessToken) {
            try {
                const decoded = jwt.verify(accessToken, jwtAccessKey)
                if (decoded) {
                    throw createError(400, "User is already logged in")
                }
            } catch (error) {
                throw (error)
            }
        }

        next()
    } catch (error) {
        return next(error)
    }
}


// Handle isAdmin middleware
export const isAdmin = async (req, res, next) => {
    try {
        if (!req.user.isAdmin) {
            throw createError(403, "Forbidden. You must be an admin to access this resource")
        }
        next();
    } catch (error) {
        return next(error)
    }
}
