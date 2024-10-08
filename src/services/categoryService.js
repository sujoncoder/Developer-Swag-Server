import slugify from "slugify";

import Category from "../models/categoryModel.js";

// create category service.
export const createCategory = async (name) => {
    const newCategory = await Category.create({
        name: name,
        slug: slugify(name)
    })
    return newCategory;
}

// Get categories service
export const getCategories = async () => {
    return await Category.find({}).select("name slug").lean();
}

// Gat category
export const getCategory = async (slug) => {
    return await Category.findOne({ slug }).select("name slug").lean();
}

// Update category
export const updateCategory = async (name, slug) => {
    const updateCategory = await Category.findOneAndUpdate({ slug }, { $set: { name: name, slug: slugify(name) } }, { new: true })

    return updateCategory;
}

// Delete category
export const deleteCategory = async (slug) => {
    const result = await Category.findOneAndDelete({ slug });

    return result;
}