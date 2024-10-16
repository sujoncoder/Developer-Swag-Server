import { body } from "express-validator";


// CATEGORY VALIDATE USING EXPRESS VALIDATOR
export const validateCategory = [
    body("name")
        .trim()
        .notEmpty()
        .withMessage("Category name is required")
        .isLength({ min: 3 })
        .withMessage("Category name should be at least 3 characters long"),
];