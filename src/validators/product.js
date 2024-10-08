import { body } from "express-validator";

export const validateProduct = [
    body("name")
        .trim()
        .notEmpty()
        .withMessage("Product name is required")
        .isLength({ min: 3, max: 150 })
        .withMessage("Product name should be at least 3-150 characters long"),

    body("description")
        .trim()
        .notEmpty()
        .withMessage("Description is required")
        .isLength({ min: 3 })
        .withMessage("Description should be at least 3 characters long"),

    body("price")
        .trim()
        .notEmpty()
        .withMessage("Price is required")
        .isLength({ min: 0 })
        .withMessage("Price must be a positive number"),

    body("category")
        .trim()
        .notEmpty()
        .withMessage("Category is required"),

    body("quantity")
        .trim()
        .notEmpty()
        .withMessage("Quantity is required")
        .isLength({ min: 1 })
        .withMessage("Quantity name must be a positive number"),

    body("image")
        .optional()
        .isString()
        .withMessage("Product image is optional")
];

export default validateProduct;