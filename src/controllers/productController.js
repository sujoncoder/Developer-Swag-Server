import createError from "http-errors";
import slugify from "slugify";

import { successResponse } from "../helpers/responseController.js"
import Product from "../models/productModel.js";
import cloudinary from "../config/cloudinary.js";
import { publicIdWithOutExtention } from "../helpers/cloudinaryHelper.js";


// Handle Create Product
export const handleCreateProduct = async (req, res, next) => {
    try {
        // Extract product data from req.body
        const { name, description, price, category, shipping, quantity } = req.body;

        // Get image path from req.file
        const image = req.file?.path;

        // Check if the file size is too large
        if (image && image.size > 2 * 1024 * 1024) {
            throw createError(400, "File too large. Must be under 2 MB");
        };

        let imageUrl;

        if (image) {
            const response = await cloudinary.uploader.upload(image, {
                folder: "DeveloperSwags/products",
            });

            if (response?.secure_url) {
                imageUrl = response.secure_url;
            } else {
                throw createError(500, "Failed to upload image to Cloudinary");
            }
        }

        const productExists = await Product.exists({ name });
        if (productExists) {
            throw createError(409, "Product with this name already exists.");
        }

        const product = await Product.create({
            name,
            description,
            price,
            category,
            shipping,
            quantity,
            image: imageUrl,
            slug: slugify(name),
        });

        return successResponse(res, {
            statusCode: 201,
            message: "Product created successfully",
            payload: product,
        });
    } catch (error) {
        next(error);
    }
};

// Handle Get All Products
export const handleGetAllProducts = async (req, res, next) => {
    try {
        const search = req.query.search || "";
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 4;

        const searchRegExp = new RegExp(".*" + search + ".*", "i");

        const filter = {
            $or: [
                { name: { $regex: searchRegExp } },
            ]
        }

        const products = await Product.find(filter)
            .populate("category")
            .skip((page - 1) * limit)
            .limit(limit)
            .sort({ createdAt: -1 })

        if (!products) {
            throw createError(404, "No products found")
        };

        const count = await Product.find(filter).countDocuments();

        return successResponse(res, {
            statusCode: 200,
            message: "Product was returned successfully",
            payload: {
                products: products,
                pagination: {
                    totalPage: Math.ceil(count / limit),
                    currentPage: page,
                    previousPage: page - 1,
                    nextPage: page + 1,
                    totalNumbersOfProducts: count
                }
            }
        });
    } catch (error) {
        next(error)
    }
};

// Handle get single product
export const handleGetProduct = async (req, res, next) => {
    try {
        const { slug } = req.params;
        const product = await Product.findOne({ slug }).populate("category")

        if (!product) {
            throw createError(404, "No product found")
        };

        return successResponse(res, {
            statusCode: 202,
            message: "Product was returned successfully",
            payload: { product }
        });
    } catch (error) {
        next(error)
    }
};

// Handle delete single product
export const handleDeleteProduct = async (req, res, next) => {
    try {
        const { slug } = req.params;

        // Find the product by slug and delete it
        const product = await Product.findOneAndDelete({ slug });

        if (!product) {
            throw createError(404, "Product not found");
        }

        if (product.image) {
            const publicId = await publicIdWithOutExtention(product.image);

            await cloudinary.uploader.destroy(`DeveloperSwags/products/${publicId}`);
        }

        return successResponse(res, {
            statusCode: 200,
            message: "Product was deleted",
        });
    } catch (error) {
        next(error);
    }
};

// Update user by Id
export const handleUpdateProduct = async (req, res, next) => {
    try {
        const { slug } = req.params;
        const updateOptions = { new: true, runValidators: true, context: "query" };

        let updates = {};
        const allowedFields = ["name", "description", "price", "sold", "quantity", "shipping"];

        // Prepare the updates based on allowed fields
        for (const key in req.body) {
            if (allowedFields.includes(key)) {
                if (key === "name") {
                    updates.slug = slugify(req.body[key]);
                }
                updates[key] = req.body[key];
            }
        };

        // Find the product first to check the current image
        const product = await Product.findOne({ slug });
        if (!product) {
            throw createError(404, "Product with this slug does not exist");
        };

        // Handle file upload (if a new image is uploaded)
        const image = req.file?.path;

        if (image) {

            if (image.size > 1024 * 1024 * 2) {
                throw createError(400, "File too large. It must be less than 2 MB");
            };

            const response = await cloudinary.uploader.upload(image, { folder: "DeveloperSwags/products" });

            updates.image = response.secure_url;
        };

        const updatedProduct = await Product.findOneAndUpdate({ slug }, updates, updateOptions);

        if (!updatedProduct) {
            throw createError(404, "Product with this slug does not exist");
        };

        if (product.image) {
            const publicId = await publicIdWithOutExtention(product.image);
            await cloudinary.uploader.destroy(`DeveloperSwags/products/${publicId}`);
        };

        return successResponse(res, {
            statusCode: 200,
            message: "Product updated successfully",
            payload: updatedProduct,
        });

    } catch (error) {
        next(error);
    }
};
