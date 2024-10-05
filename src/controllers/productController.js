import createError from "http-errors";

import { successResponse } from "../helpers/responseController.js"
import { createProduct } from "../services/productService.js";

// create product
export const handleCreateProduct = async (req, res, next) => {
    try {
        const { name, description, price, quantity, shipping, category } = req.body;

        const image = req.file;

        if (!image) {
            throw createError(400, "Image file is required")
        }

        if (image.size > 1024 * 1024 * 2) {
            throw createError(400, "File too large. It must be less then 2 mb")
        }

        const imageBufferString = image.buffer.toString("base64")

        const productData = {
            name, description, price, category, shipping, quantity, imageBufferString
        }

        const product = await createProduct(productData);

        return successResponse(res, {
            statusCode: 200,
            message: "Product was created successfully",
            payload: product
        })
    } catch (error) {
        next(error)
    }
};