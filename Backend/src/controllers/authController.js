import createError from "http-errors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import User from "../models/userModel.js"
import { successResponse } from "../helpers/responseController.js";
import { createJsonWebToken } from "../helpers/jsonWebToken.js";
import { jwtAccessKey, jwtRefreshKey } from "../secret.js";
import { setAccessTokenCookie, setRefreshTokenCookie } from "../helpers/cookies.js";


// Handle login
export const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            throw createError(404, "User does not exist with this email. Please register first.")
        };

        const isPasswordMatch = await bcrypt.compare(password, user.password);

        if (!isPasswordMatch) {
            throw createError(401, "Creadential did not match")
        };

        if (user.isBanned) {
            throw createError(403, "You are Banned. Please contact authority.")
        };

        // create access token
        const accessToken = createJsonWebToken({ user }, jwtAccessKey, "5m"
        );

        setAccessTokenCookie(res, accessToken)

        // create refresh token
        const refreshToken = createJsonWebToken({ user }, jwtRefreshKey, "7d"
        );

        setRefreshTokenCookie(res, refreshToken);


        const userWithOutPassword = user.toObject();
        delete userWithOutPassword.password;

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
export const logout = async (req, res, next) => {
    try {
        res.clearCookie("accessToken")
        res.clearCookie("refreshToken")
        return successResponse(res, {
            statusCode: 200,
            message: "User logout Successfully",
            payload: {}
        });
    } catch (error) {
        next(error)
    }
};

// Handle refresh token
export const refreshToken = async (req, res, next) => {
    try {
        const oldRefreshToken = req.cookies.refreshToken;
        // verify the old refresh token
        const decodedToken = jwt.verify(oldRefreshToken, jwtRefreshKey);

        if (!decodedToken) {
            throw createError(401, "Invalid refresh token. Please login")
        };

        // create access token
        const accessToken = createJsonWebToken(
            decodedToken.user,
            jwtAccessKey,
            "5m"
        );

        setAccessTokenCookie(res, accessToken);

        return successResponse(res, {
            statusCode: 200,
            message: "New access token is generated",
            payload: {}
        });
    } catch (error) {
        next(error)
    }
};

// Handle protected route
export const protectedRoute = async (req, res, next) => {
    try {
        const accessToken = req.cookies.accessToken;
        const decodedToken = jwt.verify(accessToken, jwtAccessKey);

        if (!decodedToken) {
            throw createError(401, "Invalid access token. Please login first")
        };

        return successResponse(res, {
            statusCode: 200,
            message: "Protected resources accessed successfull",
            payload: {}
        });

    } catch (error) {
        next(error)
    }
};