import { Schema, model } from "mongoose";

import { defaultImagePath } from "../secret.js";

const productSchema = new Schema(
    {
        name: {
            type: String,
            required: [true, "Product name is required"],
            trim: true,
            minlength: [3, "Product length will be minimum 3 characters"],
            maxlength: [150, "Product length will be maximum 150 characters"],
        },
        slug: {
            type: String,
            required: [true, "Product slug is required"],
            lowercase: true,
            unique: true
        },
        description: {
            type: String,
            required: [true, "Product description is required"],
            trim: true,
            minlength: [3, "product description length will be minimum 3 characters"],
        },
        price: {
            type: Number,
            required: [true, "Product price is required"],
            trim: true,
            validate: {
                validator: (v) => v > 0,
                message: (props) =>
                    `${props.value} is not a valid price, price must be greater than 0`
            },
        },
        quantity: {
            type: Number,
            required: [true, "Product quantity is required"],
            trim: true,
            validate: {
                validator: (v) => v > 0,
                message: (props) =>
                    `${props.value} is not a valid quantity, must be greater than 0`
            },
        },
        sold: {
            type: Number,
            required: [true, "Product sold is required"],
            trim: true,
            default: 0,
        },
        shipping: {
            type: Number,
            default: 0
        },
        image: {
            type: String,
            default: defaultImagePath
        },
        category: {
            type: Schema.Types.ObjectId,
            ref: "Category",
            required: true
        }
    }, { timestamps: true }
)

const Product = model("Product", productSchema);

export default Product;