import { successResponse } from "../helpers/responseController.js"
import { createProduct } from "../services/productService.js"


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
