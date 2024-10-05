import createError from "http-errors";
import slugify from "slugify";

import Product from "../models/productModel.js";

// create category service.
export const createProduct = async (productData) => {
    const { name, description, price, category, quantity, shipping, imageBufferString } = productData;

    const productExists = await Product.exists({ name: name })

    if (productExists) {
        throw createError(409, "Product with this name already exist")
    }

    const product = await Product.create({
        name: name,
        slug: slugify(name),
        description: description,
        price: price,
        quantity: quantity,
        shipping: shipping,
        image: imageBufferString,
        category: category,
    })

    return product;
}