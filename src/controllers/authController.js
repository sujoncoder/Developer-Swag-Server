import createError from "http-errors";
import User from "../models/userModel.js"
import { successResponse } from "../helpers/responseController.js";
import bcrypt from "bcryptjs";
import { createJsonWebToken } from "../helpers/jsonWebToken.js";
import { jwtAccessKey } from "../secret.js";

export const handleLogin = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            throw createError(404, "User does not exist with this email. Please register first.")
        }

        const isPasswordMatch = await bcrypt.compare(password, user.password)

        if (!isPasswordMatch) {
            throw createError(401, "Creadential did not match")
        };

        if (user.isBanned) {
            throw createError(403, "You are Banned. Please contact authority.")
        }


        const accessToken = createJsonWebToken({ user }, jwtAccessKey, "15m"
        )

        res.cookie("accessToken", accessToken, {
            maxAge: 15 * 60 * 1000,  // 15 min
            httpOnly: true,
            // secure: true,
            sameSite: "none"
        })

        const userWithOutPassword = await User.findOne({ email }).select("-password");

        return successResponse(res, {
            statusCode: 200,
            message: "User loggedin successfully.",
            payload: { userWithOutPassword }
        })
    } catch (error) {
        next(error)
    }
};

// Handle logout
export const handleLogout = async (req, res, next) => {
    try {
        res.clearCookie("accessToken")
        return successResponse(res, {
            statusCode: 200,
            message: "User logout Successfully",
            payload: {}
        })
    } catch (error) {
        next(error)
    }
};