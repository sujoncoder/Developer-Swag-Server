import createError from "http-errors";
import slugify from "slugify";

import Category from "../models/categoryModel.js";
import { successResponse } from "../helpers/responseController.js"
import { createCategory, deleteCategory, getCategories, getCategory, updateCategory } from "../services/categoryService.js";


// Create category
export const handleCreateCategory = async (req, res, next) => {
    try {
        const { name } = req.body;

        await createCategory(name);

        return successResponse(res, {
            statusCode: 201,
            message: "Category was created successfully",
        })
    } catch (error) {
        next(error)
    }
}

// Get categories
export const handleGetCategories = async (req, res, next) => {
    try {
        const categories = await getCategories();
        return successResponse(res, {
            statusCode: 200,
            message: "Categories were fetched successfully",
            payload: categories,
        })
    } catch (error) {
        next(error)
    }
}

// Get category
export const handleGetCategory = async (req, res, next) => {
    try {
        const { slug } = req.params;
        const category = await getCategory(slug);

        if (!category) {
            throw createError(404, "Category not found")
        }

        return successResponse(res, {
            statusCode: 200,
            message: "Category were fetched successfully",
            payload: category
        })
    } catch (error) {
        next(error)
    }
}

// Get update category
export const handleUpdateCategory = async (req, res, next) => {
    try {
        const { name } = req.body;
        const { slug } = req.params;
        const updatedCategory = await updateCategory(name, slug);

        if (!updatedCategory) {
            throw createError(404, "No category was found with this slug")
        }
        return successResponse(res, {
            statusCode: 200,
            message: "Category was updated successfully",
            payload: updatedCategory
        })
    } catch (error) {
        next(error)
    }
}

// delete category
export const handleDeleteCategory = async (req, res, next) => {
    try {
        const { slug } = req.params;
        const result = await deleteCategory(slug);

        if (!result) {
            throw createError(404, "No category found")
        }

        return successResponse(res, {
            statusCode: 200,
            message: "Category delete successfully",
            payload: result
        })
    } catch (error) {
        next(error)
    }
}