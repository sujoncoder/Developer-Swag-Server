import createError from "http-errors";
import slugify from "slugify";

import Product from "../models/productModel.js";


// Create Product Logic service
export const createProduct = async (productData, image) => {
    // Check image file size and presence
    if (image && image.size > 1024 * 1024 * 2) {
        throw createError(400, "File too large. It must be less than 2 MB");
    }

    if (image) {
        productData.image = image
    }

    const productExists = await Product.exists({ name: productData.name });

    if (productExists) {
        throw createError(409, "Product with this name already exist.")
    }

    const product = await Product.create({
        ...productData, slug: slugify(productData.name)
    })
    return product;
};
