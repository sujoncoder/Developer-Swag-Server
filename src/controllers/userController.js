import createError from "http-errors";
import bcrypt from "bcryptjs";


import User from "../models/userModel.js"
import { successResponse } from "../helpers/responseController.js";
import { findWithId } from "../services/findItem.js";
import { createJsonWebToken } from "../helpers/jsonWebToken.js";
import { clientUrl, jwtActivitionKey } from "../secret.js";
import emailWithNodeMailer from "../helpers/email.js";
import jwt from "jsonwebtoken"
import { deleteUserById, findUserById, findUsers, handleUserAction, updateUserById } from "../services/userService.js";




// Get all user
export const getUsers = async (req, res, next) => {
    try {
        const search = req.query.search || "";
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 5;

        const { users, pagination } = await findUsers(search, limit, page)

        return successResponse(res, {
            statusCode: 200,
            message: "User were returned successfully",
            payload: {
                users: users,
                pagination: pagination
            }
        })
    } catch (error) {
        next(error)
    }
}


// Get a single user by ID
export const getUserById = async (req, res, next) => {
    try {
        const id = req.params.id;
        const options = { password: 0 };

        const user = await findUserById(id, options)

        return successResponse(res, {
            statusCode: 200,
            message: "User was returned successfully",
            payload: { user }
        })
    } catch (error) {

        next(error)
    }
}


// Delete single user by ID
export const handleDeleteUserById = async (req, res, next) => {
    try {
        const id = req.params.id;
        const options = { password: 0 };

        await deleteUserById(id, options)

        return successResponse(res, {
            statusCode: 200,
            message: "User was deleted successfully"
        })
    } catch (error) {
        next(error)
    }
}


// Process register
export const processRegister = async (req, res, next) => {
    try {
        const { name, email, password, phone, address } = req.body;

        const image = req.file;

        if (!image) {
            throw createError(400, "Image is required")
        }

        if (image.size > 1024 * 1024 * 2) {
            throw new Error("File is too large. It must be less then 2 MB")
        }

        const imageBufferString = image.buffer.toString("base64")

        const userExist = await User.exists({ email: email });

        if (userExist) {
            throw createError(409, "user with this email already exist. please login")
        }

        // create token
        const token = createJsonWebToken({ name, email, password, phone, address, image: imageBufferString }, jwtActivitionKey, "10m")


        // Prepare email
        // Prepare email
        const emailData = {
            email,
            subject: "🚀 Welcome to Developer Swags! Activate Your Account Now",
            html: `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f9f9f9; padding: 30px; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 25px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);">
            <div style="text-align: center; margin-bottom: 20px;">
                <img src="https://cdn-icons-png.flaticon.com/512/4997/4997543.png" alt="Developer Swags" style="width: 120px; margin-bottom: 10px;">
                <h1 style="color: #007bff; font-size: 24px;">Welcome to Developer Swags!</h1>
            </div>

            <p style="font-size: 16px; color: #555; line-height: 1.6;">
                Hello <strong>${name}</strong>,
            </p>
            <p style="font-size: 16px; color: #555; line-height: 1.6;">
                We're excited to have you on board! You're just one step away from joining our vibrant community of developers. Please click the button below to activate your account and start exploring the best swags for coders.
            </p>
            <div style="text-align: center; margin: 30px 0;">
                <a href="${clientUrl}/api/v1/users/activate/${token}" target="_blank" style="display: inline-block; background-color: #007bff; color: white; font-size: 16px; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                    Activate Your Account
                </a>
            </div>
            <p style="font-size: 14px; color: #888; line-height: 1.6;">
                If you did not sign up for this account, please ignore this email or contact our support.
            </p>

            <hr style="border: none; border-top: 1px solid #ddd; margin: 40px 0;">
            
            <div style="text-align: center;">
                <p style="font-size: 12px; color: #aaa;">Need help? Contact us at <a href="mailto:support@developerswags.com" style="color: #007bff; text-decoration: none;">support@developerswags.com</a></p>
                <p style="font-size: 12px; color: #aaa;">&copy; 2024 Developer Swags. All Rights Reserved.</p>
                <div style="margin-top: 10px;">
                    <a href="https://facebook.com/developerswags" target="_blank">
                        <img src="https://icon-url/facebook.png" alt="Facebook" style="width: 24px; margin: 0 5px;">
                    </a>
                    <a href="https://twitter.com/developerswags" target="_blank">
                        <img src="https://icon-url/twitter.png" alt="Twitter" style="width: 24px; margin: 0 5px;">
                    </a>
                    <a href="https://instagram.com/developerswags" target="_blank">
                        <img src="https://icon-url/instagram.png" alt="Instagram" style="width: 24px; margin: 0 5px;">
                    </a>
                </div>
            </div>
        </div>
    </div>  `};


        // send mail with node mailer
        try {
            await emailWithNodeMailer(emailData)
        } catch (emailError) {
            next(createError(500, "Failed to send verification email"))
            return;
        }

        return successResponse(res, {
            statusCode: 200,
            message: `Please go to your ${email} for completing your registration process.`,
            payload: { token }
        })
    } catch (error) {
        next(error)
    }
}


// Verify user account
export const activateUserAccount = async (req, res, next) => {
    const token = req.body.token;

    if (!token) {
        return next(createError(404, "Token not found!"));
    }

    try {
        const decoded = jwt.verify(token, jwtActivitionKey);

        if (!decoded) {
            return next(createError(401, "User was not able to be verified."));
        }

        const userExist = await User.exists({ email: decoded.email });
        if (userExist) {
            return next(createError(409, "User with this email already exists, Please login."));
        }

        await User.create(decoded);

        return successResponse(res, {
            statusCode: 201,
            message: "User was registered successfully.",
        });
    } catch (error) {
        if (error.name === "TokenExpiredError") {
            return next(createError(401, "Token has expired"));
        } else if (error.name === "JsonWebTokenError") {
            return next(createError(401, "Invalid Token"));
        } else {
            return next(error); // Ensure the error gets passed to the error-handling middleware
        }
    }
};


// Update user by Id
export const handleUpdateUserById = async (req, res, next) => {
    try {
        const userId = req.params.id;

        const updateddUser = await updateUserById(userId, req)
        return successResponse(res, {
            statusCode: 200,
            message: "User was updated successfully",
            payload: updateddUser
        })

    } catch (error) {
        next(error)
    }
}

// Handle manage user status by id
export const handleManageUserStatusById = async (req, res, next) => {
    try {
        const userId = req.params.id;
        const action = req.body.action;

        const successMessage = await handleUserAction(action, userId)

        return successResponse(res, {
            statusCode: 200,
            message: successMessage,
        })

    } catch (error) {
        return (next)
    }
}

// handle update password
export const handleUpdatePassword = async (req, res, next) => {
    try {
        const { oldPassword, newPassword } = req.body;

        const userId = req.params.id;
        const user = await findWithId(User, userId)

        // compare the password
        const isPasswordMatch = await bcrypt.compare(oldPassword, user.password)
        if (!isPasswordMatch) {
            throw createError(400, "Old password is not correct")
        }

        // const filter = { userId };
        // const update = { $set: { password: newPassword } }
        // const updateOptions = { new: true }

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { password: newPassword },
            { new: true }

        ).select("-password")

        if (!updatedUser) {
            throw createError(400, "user was not updated successfully")
        }

        return successResponse(res, {
            statusCode: 200,
            message: "User password updated successfully",
            payload: { updatedUser }
        })
    } catch (error) {
        next(error)
    }
}




