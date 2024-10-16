import createError from "http-errors";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";


import User from "../models/userModel.js"
import { successResponse } from "../helpers/responseController.js";
import { createJsonWebToken } from "../helpers/jsonWebToken.js";
import { clientUrl, jwtActivitionKey, jwtResetPasswordKey } from "../secret.js";
import checkUserExist from "../helpers/checkUserExist.js";
import sendEmail from "../helpers/sendEmail.js";
import { findWithId } from "../services/findItem.js";
import cloudinary from "../config/cloudinary.js";
import { publicIdWithOutExtention } from "../helpers/cloudinaryHelper.js";


// PROCESS REGISTER CONTROLLER
export const processRegister = async (req, res, next) => {
    try {
        const { name, email, password, phone, address } = req.body;

        if (!req.file) {
            throw createError(400, "Image is required");
        };

        const image = req.file.path;

        if (req.file.size > 2 * 1024 * 1024) {
            throw createError(400, "File too large. It must be less than 2 MB");
        };

        const userExists = await checkUserExist(email);

        if (userExists) {
            throw createError(409, "User with this email already exists. Please login.");
        };

        const tokenPayload = {
            name,
            email,
            password,
            phone,
            address,
            image,
        };

        // Create token
        const token = createJsonWebToken(tokenPayload, jwtActivitionKey, "10m");

        // Prepare email data
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
    </div>  `
        };

        // Send email using your email service
        await sendEmail(emailData);

        // Send success response
        return successResponse(res, {
            statusCode: 200,
            message: `Please check your ${email} to complete your registration process.`,
            payload: token
        });
    } catch (error) {
        next(error);
    }
};


// ACCOUNT ACTIVITION CONTROLLER
export const activateUserAccount = async (req, res, next) => {
    const token = req.body.token;

    if (!token) {
        return next(createError(404, "Token not found!"));
    };

    try {
        const decoded = jwt.verify(token, jwtActivitionKey);

        if (!decoded) {
            return next(createError(401, "User was not able to be verified."));
        };

        const userExist = await User.exists({ email: decoded.email });
        if (userExist) {
            return next(createError(409, "User with this email already exists, Please login."));
        };

        const image = decoded.image;

        if (image) {
            const response = await cloudinary.uploader.upload(image, {
                folder: "DeveloperSwags/users"
            });
            decoded.image = response.secure_url;
        };

        await User.create(decoded);

        return successResponse(res, {
            statusCode: 201,
            message: "User was registered successfully.",
        });
    } catch (error) {
        next(error);
    }
};


// GET ALL USERS ==> ADMIN
export const getAllUsers = async (req, res, next) => {
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
        };

        const options = { password: 0 };
        const users = await User.find(filter, options).limit(limit).skip((page - 1) * limit);

        const count = await User.find(filter).countDocuments();

        if (!users || users.length === 0) throw createError(404, "No user found !");

        return successResponse(res, {
            statusCode: 200,
            message: "User were returned successfully",
            payload: {
                users: users,
                pagination: {
                    totalPages: Math.ceil(count / limit),
                    currentPage: page,
                    previousPage: page - 1 > 0 ? page - 1 : null,
                    nextPage: page + 1 <= Math.ceil(count / limit) ? page + 1 : null
                }
            }
        });
    } catch (error) {
        next(error)
    }
};


// GET SINGLE USER BY ID
export const getSingleUser = async (req, res, next) => {
    try {
        const id = req.params.id;
        const options = { password: 0 };

        const user = await User.findById(id, options);

        if (!user) throw createError(404, "user was not found");

        return successResponse(res, {
            statusCode: 200,
            message: "User was returned successfully",
            payload: { user }
        });
    } catch (error) {
        next(error)
    }
};


// DELETE SINGLE USER BY ID
export const deleteUser = async (req, res, next) => {
    try {
        const id = req.params.id;
        const options = { password: 0 };
        const user = await findWithId(User, id, options);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Check and delete user's image if it exists
        if (user.image) {
            const publicId = await publicIdWithOutExtention(user.image);

            await cloudinary.uploader.destroy(`DeveloperSwags/users/${publicId}`);
        }

        // Delete user if not an admin
        const deletedUser = await User.findByIdAndDelete(id);

        if (!deletedUser || deletedUser.isAdmin) {
            return res.status(403).json({ message: "Cannot delete admin users" });
        };

        return successResponse(res, {
            statusCode: 200,
            message: "User was deleted successfully"
        });

    } catch (error) {
        next(error);
    }
};


// UPDATE USER BY ID
export const updateUser = async (req, res, next) => {
    try {
        const userId = req.params.id;
        const options = { password: 0 };

        // Find the user by ID
        const user = await findWithId(User, userId, options);
        if (!user) {
            throw createError(404, "User not found");
        }

        const updateOptions = { new: true, runValidators: true, context: "query" };
        let updates = {};
        const allowedFields = ["name", "password", "phone", "address"];  // Allowed fields for update

        // Validate and update allowed fields
        for (const key in req.body) {
            if (allowedFields.includes(key)) {
                updates[key] = req.body[key];
            } else if (key === "email") {
                throw createError(400, "Email cannot be updated");  // Prevent email update
            }
        };

        // Handle file upload (if an image is provided)
        const image = req.file?.path;
        if (image) {
            if (image.size > 1024 * 1024 * 2) {  // Check for file size (2MB limit)
                throw createError(400, "File too large. It must be less than 2 MB");
            }

            // Upload image to Cloudinary
            const response = await cloudinary.uploader.upload(image, { folder: "DeveloperSwags/users" });
            updates.image = response.secure_url;
        };

        // Update user with new data
        const updatedUser = await User.findByIdAndUpdate(userId, updates, updateOptions).select("-password");
        if (!updatedUser) {
            throw createError(404, "User with this ID does not exist");
        }

        // If the user had a previous image, delete it from Cloudinary
        if (user.image) {
            const publicId = await publicIdWithOutExtention(user.image);
            await cloudinary.uploader.destroy(`DeveloperSwags/users/${publicId}`);
        };

        return successResponse(res, {
            statusCode: 200,
            message: "User was updated successfully",
            payload: updatedUser
        });

    } catch (error) {
        next(error);
    }
};


// MANAGE USER STATUS BY ID == { BAN, UNBAN }==> ADMIN
export const manageUserStatus = async (req, res, next) => {
    try {
        const userId = req.params.id;
        const action = req.body.action;

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
        };

        const updateOptions = { new: true, runValidators: true, context: "query" };

        const updatedUser = await User.findByIdAndUpdate(userId, update, updateOptions).select("-password");

        if (!updatedUser) {
            throw createError(404, "user was not banned successfully.")
        };

        return successResponse(res, {
            statusCode: 200,
            message: successMessage,
        });

    } catch (error) {
        return (next)
    }
};


// UPDATE USER PASSWORD BY ID & EMAIL
export const updatePassword = async (req, res, next) => {
    try {
        const { email, oldPassword, newPassword, confirmedPassword } = req.body;

        const userId = req.params.id;

        const user = await User.findOne({ email: email });

        if (!user) {
            throw createError(404, "User is not found with this email.")
        };

        if (newPassword !== confirmedPassword) {
            throw createError(400, "New password and Confirm password did not match.")
        };

        // compare the password
        const isPasswordMatch = await bcrypt.compare(oldPassword, user.password)
        if (!isPasswordMatch) {
            throw createError(400, "Old password is incorrect")
        };


        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { password: newPassword },
            { new: true }
        ).select("-password");

        if (!updatedUser) {
            throw createError(400, "user was not updated successfully")
        };

        return successResponse(res, {
            statusCode: 200,
            message: "User password updated successfully",
            payload: { updatedUser }
        });
    } catch (error) {
        next(error)
    }
};


// FORGET PASSWORD USING EMAIL
export const forgetPassword = async (req, res, next) => {
    try {
        const { email } = req.body;

        const userData = await User.findOne({ email: email })

        if (!userData) {
            throw createError(404, "Email is incorrect. You have not verifyed your email address, please register first.")
        };

        // create token
        const token = createJsonWebToken({ email }, jwtResetPasswordKey, "10m");


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
                </div>
            </div>
        </div>
    </div>  `};

        // send mail with node mailer
        sendEmail(emailData)

        return successResponse(res, {
            statusCode: 200,
            message: `Please go to your ${email} to reset the password.`,
            payload: token,
        })
    } catch (error) {
        next(error)
    }
};


// RESET PASSWORD CONTROLLER
export const resetPassword = async (req, res, next) => {
    try {
        const { token, password } = req.body;
        const decoded = jwt.verify(token, jwtResetPasswordKey)

        if (!decoded) {
            throw createError(400, "Invalid or expired token")
        };

        const filter = { email: decoded.email };
        const update = { password: password };
        const options = { new: true }

        const updatedUser = await User.findOneAndUpdate(filter, update, options).select("-password")

        if (!updatedUser) {
            throw createError(400, "Password reset fail.")
        };

        return successResponse(res, {
            statusCode: 200,
            message: "Password reset successfully",
        });
    } catch (error) {
        next(error)
    }
};



