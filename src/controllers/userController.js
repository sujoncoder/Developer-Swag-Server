import createError from "http-errors";
import jwt from "jsonwebtoken";


import User from "../models/userModel.js"
import { successResponse } from "../helpers/responseController.js";
import { createJsonWebToken } from "../helpers/jsonWebToken.js";
import { clientUrl, jwtActivitionKey } from "../secret.js";
import { findUserById, findUsers, forgetPasswordByEmail, handleUserAction, resetPassword, updateUserPasswordById } from "../services/userService.js";
import checkUserExist from "../helpers/checkUserExist.js";
import sendEmail from "../helpers/sendEmail.js";
import { findWithId } from "../services/findItem.js";
import deleteImage from "../helpers/deleteImage.js";



// Get all user
export const handleGetUsers = async (req, res, next) => {
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
export const handleGetUserById = async (req, res, next) => {
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
        const user = await findWithId(User, id, options);

        await User.findByIdAndDelete({
            _id: id,
            isAdmin: false
        });

        if (user & user.image) {
            await deleteImage(user.image)
        };

        return successResponse(res, {
            statusCode: 200,
            message: "User was deleted successfully"
        })
    } catch (error) {
        next(error)
    }
}

// Process register
export const handleProcessRegister = async (req, res, next) => {
    try {
        const { name, email, password, phone, address } = req.body;

        const image = req.file.path;
        if (image && image.size > 1024 * 1024 * 2) {
            throw createError(400, "File too large it must be less than 2 MB")
        }

        if (!image) {
            throw createError(400, "Image is required")
        }

        if (image.size > 1024 * 1024 * 2) {
            throw new Error("File is too large. It must be less then 2 MB")
        }

        const userExists = await checkUserExist(email)

        if (userExists) {
            throw createError(409, "user with this email already exist. please login")
        }
        const tokenPayload = {
            name,
            email,
            password,
            phone,
            address,
        };

        if (image) {
            tokenPayload.image = image
        };

        // create token
        const token = createJsonWebToken(tokenPayload, jwtActivitionKey, "10m")

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
        sendEmail(emailData)

        return successResponse(res, {
            statusCode: 200,
            message: `Please go to your ${email} for completing your registration process.`,
            payload: token
        })
    } catch (error) {
        next(error)
    }
}

// Verify user account
export const handleActivateUserAccount = async (req, res, next) => {
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
        const options = { password: 0 };

        const user = await findWithId(User, userId, options);

        const updateOptions = { new: true, runValidators: true, context: "query" };

        let updates = {};
        const allowedFields = ["name", "password", "phone", "address"];

        // Validate fields
        for (const key in req.body) {
            if (allowedFields.includes(key)) {
                updates[key] = req.body[key];
            } else if (key === "email") {
                throw createError(400, "Email cannot be updated");
            }
        }

        // Handle file upload
        if (req.file) {
            const image = req.file.path;

            if (req.file.size > 1024 * 1024 * 2) {
                throw new Error("File too large. It must be less than 2 MB");
            }

            updates.image = image;

            if (user.image !== "default.jpeg") {
                deleteImage(user.image);
            }
        }

        const updatedUser = await User.findByIdAndUpdate(userId, updates, updateOptions).select("-password");

        if (!updatedUser) {
            throw createError(404, "User with this ID does not exist");
        }

        return successResponse(res, {
            statusCode: 200,
            message: "User was updated successfully",
            payload: updatedUser
        });

    } catch (error) {
        next(error);
    }
};


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

// Handle update password
export const handleUpdatePassword = async (req, res, next) => {
    try {
        const { email, oldPassword, newPassword, confirmedPassword } = req.body;

        const userId = req.params.id;

        const updatedUser = await updateUserPasswordById(userId, email, oldPassword, newPassword, confirmedPassword)

        return successResponse(res, {
            statusCode: 200,
            message: "User password updated successfully",
            payload: { updatedUser }
        })
    } catch (error) {
        next(error)
    }
}

// Handle forget user password
export const handleForgetPassword = async (req, res, next) => {
    try {
        const { email } = req.body;

        const token = await forgetPasswordByEmail(email)

        return successResponse(res, {
            statusCode: 200,
            message: `Please go to your ${email} to reset the password.`,
            payload: token,
        })
    } catch (error) {
        next(error)
    }
}

// Handle reset user password
export const handleResetPassword = async (req, res, next) => {
    try {
        const { token, password } = req.body;
        await resetPassword(token, password);

        return successResponse(res, {
            statusCode: 200,
            message: "Password reset successfully",
        })
    } catch (error) {
        next(error)
    }
}



