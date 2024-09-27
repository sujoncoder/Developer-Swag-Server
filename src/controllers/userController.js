import createError from "http-errors";
import User from "../models/userModel.js"
import { successResponse } from "../helpers/responseController.js";
import { findWithId } from "../services/findItem.js";
import deleteImage from "../helpers/deleteImage.js";
import { createJsonWebToken } from "../helpers/jsonWebToken.js";
import { clientUrl, jwtActivitionKey } from "../secret.js";
import emailWithNodeMailer from "../helpers/email.js";
import jwt from "jsonwebtoken"


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

        const imageBufferString = req.file.buffer.toString("base64")

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
