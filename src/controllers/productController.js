import createError from "http-errors";
import { successResponse } from "../helpers/responseController.js"
import Product from "../models/productModel.js";
import { createProduct } from "../services/productService.js";
import deleteImage from "../helpers/deleteImage.js";
import slugify from "slugify";


// Handle Create Product
export const handleCreateProduct = async (req, res, next) => {
    try {
        const image = req.file?.path;

        const product = await createProduct(req.body, image);

        return successResponse(res, {
            statusCode: 201,
            message: "Product was created successfully",
            payload: product
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

        const product = await Product.findOneAndDelete({ slug });

        if (!product) {
            throw createError(404, "Product not found")
        }

        if (product.image) {
            await deleteImage(product.image)
        }

        return successResponse(res, {
            statusCode: 200,
            message: "Productd was deleted"
        })
    } catch (error) {
        next(error)
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
        }

        // Find the product first to check the current image
        const product = await Product.findOne({ slug });
        if (!product) {
            throw createError(404, "Product with this slug does not exist");
        }

        // Handle file upload (if a new image is uploaded)
        if (req.file) {
            const image = req.file.path;

            if (req.file.size > 1024 * 1024 * 2) {
                throw createError(400, "File too large. It must be less than 2 MB");
            }

            updates.image = image;

            // Delete the old image if it's not the default one
            if (product.image && product.image !== "default.jpeg") {
                deleteImage(product.image); // This should be a function to delete the file
            }
        }

        const updatedProduct = await Product.findOneAndUpdate({ slug }, updates, updateOptions);

        if (!updatedProduct) {
            throw createError(404, "Product with this slug does not exist");
        }

        return successResponse(res, {
            statusCode: 200,
            message: "Product updated successfully",
            payload: updatedProduct,
        });

    } catch (error) {
        next(error);
    }
};
