import slugify from "slugify";

import Category from "../models/categoryModel.js";



// CREATE CATEGORY
export const createCategory = async (name) => {
    const newCategory = await Category.create({
        name: name,
        slug: slugify(name)
    })
    return newCategory;
};


// GET ALL CATEGORIES
export const getCategories = async () => {
    return await Category.find({}).select("name slug").lean();
};


// GET SINGLE CATEGORY BY SLUG
export const getCategory = async (slug) => {
    return await Category.findOne({ slug }).select("name slug").lean();
};


// UPDATE CATEGORY
export const updateCategory = async (name, slug) => {
    const updateCategory = await Category.findOneAndUpdate({ slug }, { $set: { name: name, slug: slugify(name) } }, { new: true })

    return updateCategory;
};


// DELETE CATEGORY
export const deleteCategory = async (slug) => {
    const result = await Category.findOneAndDelete({ slug });

    return result;
};