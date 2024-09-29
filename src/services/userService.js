import createError from "http-errors";
import User from "../models/userModel.js";
import deleteImage from "../helpers/deleteImage.js";
import mongoose from "mongoose";



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

        if (!users) throw createError(404, "No user found !")

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

        for (let key in req.body) {
            if (["name", "password", "phone", "address"].includes(key)) {
                updates[key] = req.body[key];
            } else if (["email"].includes(key)) {
                throw new Error("Email can not be updated")
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
