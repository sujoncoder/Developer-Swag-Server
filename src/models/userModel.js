import { Schema, model } from "mongoose";
import bcrypt from "bcryptjs";
import { defaultUserImagePath } from "../secret.js";


const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

const userSchema = new Schema({
    name: {
        type: String,
        required: [true, "User name is required."],
        trim: true,
        minLength: [3, "The length of user name can be minimum 3 characters"],
        maxLength: [30, "The length of user name can be maximum 30 characters"]
    },
    email: {
        type: String,
        required: [true, "User email is required."],
        trim: true,
        unique: true,
        lowercase: true,
        validate: {
            validator: function (v) {
                return emailRegex.test(v)
            },
            message: "Please enter a valid email"
        }
    },
    password: {
        type: String,
        required: [true, "User password is required."],
        minLength: [6, "The length of user password can be minimum 6 characters"],
        set: (v) => bcrypt.hashSync(v, bcrypt.genSaltSync(10))
    },
    image: {
        type: Buffer,
        contentType: String,
        required: [true, "User image is required"]
    },
    address: {
        type: String,
        required: [true, "User address is required."],
        minlength: [3, "The length of the user address can be minimum 3 characters"]
    },
    phone: {
        type: String,
        required: [true, "User phone is required."],
    },
    isAdmin: {
        type: Boolean,
        default: false,
    },
    isBanned: {
        type: Boolean,
        default: false,
    }
}, { timestamps: true });

const User = model("Users", userSchema);

export default User;