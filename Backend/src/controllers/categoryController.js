import createError from "http-errors";
import slugify from "slugify";

import Category from "../models/categoryModel.js";
import { successResponse } from "../helpers/responseController.js"


// CREATE CATEGORY CONTROLLER
export const createCategory = async (req, res, next) => {
    try {
        const { name } = req.body;

        // Check if category with the same name exists
        const existingCategory = await Category.findOne({ name });

        if (existingCategory) {
            throw createError(400, "Category with this name already exists")
        };

        await Category.create({
            name: name,
            slug: slugify(name)
        });

        return successResponse(res, {
            statusCode: 201,
            message: "Category was created successfully",
        });

    } catch (error) {
        next(error)
    }
};


// GET ALL CATEGORIES
export const getAllCategories = async (req, res, next) => {
    try {
        const categories = await Category.find({}).select("name slug").lean();

        return successResponse(res, {
            statusCode: 200,
            message: "Categories were fetched successfully",
            payload: categories,
        });
    } catch (error) {
        next(error)
    }
};


// GET CATEGORY BY SLUG
export const getSingleCategory = async (req, res, next) => {
    try {
        const { slug } = req.params;

        const category = await Category.findOne({ slug }).select("name slug").lean();

        if (!category) {
            throw createError(404, "Category not found");
        };

        return successResponse(res, {
            statusCode: 200,
            message: "Category was fetched successfully",
            payload: category
        });

    } catch (error) {
        next(error);
    }
};


// GET UPDATE CATEGORY BY NAME AND SLUG
export const updateCategory = async (req, res, next) => {
    try {
        const { name } = req.body;
        const { slug } = req.params;

        const updateCategory = await Category.findOneAndUpdate({ slug }, { $set: { name: name, slug: slugify(name) } }, { new: true });


        if (!updateCategory) {
            throw createError(404, "No category was found with this slug")
        };

        return successResponse(res, {
            statusCode: 200,
            message: "Category was updated successfully",
            payload: updateCategory
        });

    } catch (error) {
        next(error)
    }
};


// DELETE CATEGORY BY SLUG
export const deleteCategory = async (req, res, next) => {
    try {
        const { slug } = req.params;

        const result = await Category.findOneAndDelete({ slug });

        if (!result) {
            throw createError(404, "No category found")
        };

        return successResponse(res, {
            statusCode: 200,
            message: "Category delete successfully",
            payload: result
        });
    } catch (error) {
        next(error)
    }
};