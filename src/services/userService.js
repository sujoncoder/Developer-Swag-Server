import createError from "http-errors";
import User from "../models/userModel.js";
import deleteImage from "../helpers/deleteImage.js";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { createJsonWebToken } from "../helpers/jsonWebToken.js";
import { clientUrl, jwtResetPasswordKey } from "../secret.js";
import emailWithNodeMailer from "../helpers/email.js";
import sendEmail from "../helpers/sendEmail.js";



// Handle find all users for admin.
export const findUsers = async (search, limit, page) => {
    try {
        const searchRegExp = new RegExp(".*" + search + ".*", "i");

        const filter = {
            isAdmin: { $ne: true },
            $or: [
                { name: { $regex: searchRegExp } },
                { email: { $regex: searchRegExp } },
                { phone: { $regex: searchRegExp } },
            ]
        }

        const options = { password: 0 };
        const users = await User.find(filter, options).limit(limit).skip((page - 1) * limit);

        const count = await User.find(filter).countDocuments();

        if (!users || users.length === 0) throw createError(404, "No user found !")

        return {
            users,
            pagination: {
                totalPages: Math.ceil(count / limit),
                currentPage: page,
                previousPage: page - 1 > 0 ? page - 1 : null,
                nextPage: page + 1 <= Math.ceil(count / limit) ? page + 1 : null
            }
        }

    } catch (error) {
        throw error
    }
}

// Handle find user by id for admin.
export const findUserById = async (id, options = {}) => {
    try {
        const user = await User.findById(id, options)
        if (!user) throw createError(404, "user was not found")
        return user
    } catch (error) {
        if (error instanceof mongoose.Error, castError) {
            throw createError(400, "Invalid ID")
        }
        throw error
    }
}

// Handle update user by ID.
export const updateUserById = async (userId, req) => {
    try {
        const options = { password: 0 }
        await findUserById(userId, options)

        const updateOptions = { new: true, runValidators: true, context: "query" }

        let updates = {}
        const allowedFields = ["name", "password", "phone", "address"];

        for (const key in req.body) {
            if (allowedFields.includes(key)) {
                updates[key] = req.body[key];
            } else if (key === "email") {
                throw createError(400, "Email can not be updated")
            }
        }

        const image = req.file;

        if (image) {
            if (image.size > 1024 * 1024 * 2) {
                throw new Error("File too large. It nust be less then 2 MB")
            }
            updates.image = image.buffer.toString("base64")
        }

        const updatedUser = await User.findByIdAndUpdate(userId, updates, updateOptions).select("-password")

        if (!updatedUser) {
            throw createError(404, "User with this Id does not exist")
        }

        return updatedUser;
    } catch (error) {
        if (error instanceof mongoose.Error, castError) {
            throw createError(400, "Invalid ID")
        }
        throw error
    }
}

// Handle delete user by ID
export const deleteUserById = async (id, options = {}) => {
    try {
        const user = await User.findByIdAndDelete({
            _id: id,
            isAdmin: false
        })

        if (user && user.image) {
            await deleteImage(user.image)
        }
    } catch (error) {
        if (error instanceof mongoose.Error, castError) {
            throw createError(400, "Invalid ID")
        }
        throw error
    }
}

// handle user password update by Id
export const updateUserPasswordById = async (userId, email, oldPassword, newPassword, confirmedPassword) => {
    try {
        const user = await User.findOne({ email: email })

        if (!user) {
            throw createError(404, "User is not found with this email.")
        }

        if (newPassword !== confirmedPassword) {
            throw createError(400, "New password and Confirm password did not match.")
        }

        // compare the password
        const isPasswordMatch = await bcrypt.compare(oldPassword, user.password)
        if (!isPasswordMatch) {
            throw createError(400, "Old password is incorrect")
        }


        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { password: newPassword },
            { new: true }

        ).select("-password")

        if (!updatedUser) {
            throw createError(400, "user was not updated successfully")
        }

        return updatedUser;
    } catch (error) {
        throw error
    }
}


// Handle user forget password by id
export const forgetPasswordByEmail = async (email) => {
    try {
        const userData = await User.findOne({ email: email })

        if (!userData) {
            throw createError(404, "Email is incorrect. You have not verifyed your email address, please register first.")
        }

        // create token
        const token = createJsonWebToken({ email }, jwtResetPasswordKey, "10m")


        // Prepare email
        const emailData = {
            email,
            subject: "🔒 Reset Your Developer Swags Password",
            html: `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f9f9f9; padding: 30px; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 25px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);">
            <div style="text-align: center; margin-bottom: 20px;">
                <img src="https://cdn-icons-png.flaticon.com/512/4997/4997543.png" alt="Developer Swags" style="width: 120px; margin-bottom: 10px;">
                <h1 style="color: #007bff; font-size: 24px;">Reset Your Password</h1>
            </div>

            <p style="font-size: 16px; color: #555; line-height: 1.6;">
                Hello <strong>${userData.name}</strong>,
            </p>
            <p style="font-size: 16px; color: #555; line-height: 1.6;">
                We received a request to reset your Developer Swags account password. If you did not make this request, please ignore this email.
            </p>
            <p style="font-size: 16px; color: #555; line-height: 1.6;">
                To reset your password, click the button below:
            </p>
            <div style="text-align: center; margin: 30px 0;">
                <a href="${clientUrl}/api/v1/users/reset-password/${token}" target="_blank" style="display: inline-block; background-color: #007bff; color: white; font-size: 16px; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                    Reset Password
                </a>
            </div>
            <p style="font-size: 14px; color: #888; line-height: 1.6;">
                If you did not request a password reset, please ignore this email or contact our support.
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
        sendEmail(emailData)

        return token;
    } catch (error) {
        throw error
    }
}


// handle reset user password
export const resetPassword = async (token, password) => {
    try {
        const decoded = jwt.verify(token, jwtResetPasswordKey)

        if (!decoded) {
            throw createError(400, "Invalid or expired token")
        }

        const filter = { email: decoded.email };
        const update = { password: password };
        const options = { new: true }

        const updatedUser = await User.findOneAndUpdate(filter, update, options).select("-password")

        if (!updatedUser) {
            throw createError(400, "Password reset fail.")
        }

        return updatedUser;
    } catch (error) {
        throw error
    }
}

// Handle user action.
export const handleUserAction = async (action, userId) => {
    try {
        let update = {};
        let successMessage;

        if (action === "ban") {
            update = { isBanned: true }
            successMessage = "User was banned successfully"
        } else if (action === "unban") {
            update = { isBanned: false }
            successMessage = "User was Unbanned successfully"
        } else {
            throw createError(400, 'Invalid action use "ban" or "unban" ')
        }


        const updateOptions = { new: true, runValidators: true, context: "query" }

        const updatedUser = await User.findByIdAndUpdate(userId, update, updateOptions).select("-password")

        if (!updatedUser) {
            throw createError(404, "user was not banned successfully.")
        }

        return successMessage;

    } catch (error) {
        if (error instanceof mongoose.Error, castError) {
            throw createError(400, "Invalid ID")
        }
        throw (error)
    }
}
