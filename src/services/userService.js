import createError from "http-errors";
import User from "../models/userModel.js";
import { successResponse } from "../helpers/responseController.js";



// Handle find users
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
        throw (error)
    }
}
