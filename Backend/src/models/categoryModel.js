import { Schema, Types, model } from "mongoose";


// CATEGORY SCHEMA
const categorySchema = new Schema(
    {
        name: {
            type: String,
            required: [true, "Category name is required"],
            trim: true,
            unique: true,
            minlength: [3, "Minimum category length will be 3 characters"],
        },
        slug: {
            type: String,
            required: [true, "Category slug is required"],
            lowercase: true,
            unique: true
        }
    }, { timestamps: true }
)

// CATEGORY MODEL
const Category = model("Category", categorySchema);

export default Category;