import createError from "http-errors";
import User from "../models/userModel.js";

const handleUserAction = async (action, userId) => {
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

export default handleUserAction;