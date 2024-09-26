import createError from "http-errors";
import User from "../models/userModel.js"
import { successResponse } from "../helpers/responseController.js";
import { findWithId } from "../services/findItem.js";
import deleteImage from "../helpers/deleteImage.js";


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
