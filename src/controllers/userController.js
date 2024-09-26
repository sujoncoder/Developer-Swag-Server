import createError from "http-errors";
import User from "../models/userModel.js"
import { successResponse } from "../helpers/responseController.js";
import { findWithId } from "../services/findItem.js";
import deleteImage from "../helpers/deleteImage.js";
import { createJsonWebToken } from "../helpers/jsonWebToken.js";
import { clientUrl, jwtActivitionKey } from "../secret.js";
import emailWithNodeMailer from "../helpers/email.js";


// Get all user
export const getUsers = async (req, res, next) => {
    try {
        const search = req.query.search || "";
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 5;

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

        if (!users) throw createError(404, "No user found !")

        return successResponse(res, {
            statusCode: 200,
            message: "User were returned successfully",
            payload: {
                users,
                pagination: {
                    totalPages: Math.ceil(count / limit),
                    currentPage: page,
                    previousPage: page - 1 > 0 ? page - 1 : null,
                    nextPage: page + 1 <= Math.ceil(count / limit) ? page + 1 : null
                }
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

        const user = await findWithId(User, id, options)

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
export const deleteUserById = async (req, res, next) => {
    try {
        const id = req.params.id;
        const options = { password: 0 };

        const user = await findWithId(User, id, options)

        const userImagePath = user.image;
        deleteImage(userImagePath)

        await User.findByIdAndDelete({
            _id: id,
            isAdmin: false
        })

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

        const userExist = await User.exists({ email: email });

        if (userExist) {
            throw createError(409, "user with this email already exist. please login")
        }

        // create token
        const token = createJsonWebToken({ name, email, password, phone, address }, jwtActivitionKey, "10m")


        // Prepare email
        const emailData = {
            email,
            subject: "Activate Your Developer Swags Account",
            html: `
    <div style="font-family: Arial, sans-serif; color: #333; padding: 20px; line-height: 1.6; background-color: #f4f4f4;">
        <div style="max-width: 600px; margin: auto; background-color: white; padding: 20px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);">
            <h2 style="color: #333;">Hello ${name},</h2>
            <p style="font-size: 16px; color: #555;">
                Welcome to Developer Swags! To activate your account and join our community, please click the button below:
            </p>
            <div style="text-align: center; margin: 20px 0;">
                <a href="${clientUrl}/api/v1/users/activate/${token}" target="_blank" style="display: inline-block; background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px;">
                    Activate Your Account
                </a>
            </div>
            <p style="font-size: 14px; color: #777;">
                If you didn’t sign up for a Developer Swags account, feel free to ignore this email.
            </p>
            <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
            <p style="font-size: 12px; color: #888; text-align: center;">
                &copy; 2024 Developer Swags. All rights reserved.
            </p>
        </div>
    </div>
    `
        };


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