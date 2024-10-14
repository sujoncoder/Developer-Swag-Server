import { body } from "express-validator";



// REGSITRATION VALIDATE
export const validateUserRegisteration = [
    body("name")
        .trim()
        .notEmpty()
        .withMessage("Name is required. Enter your fullname")
        .isLength({ min: 3, max: 31 })
        .withMessage("Name should be at least 3-31 characters long"),

    body("email")
        .trim()
        .notEmpty()
        .withMessage("Email is required. Enter your email")
        .isEmail()
        .withMessage("Invalid email address"),

    body("password")
        .trim()
        .notEmpty()
        .withMessage("Password is required. Enter your password")
        .isLength({ min: 6 })
        .withMessage("Password should be at least 6 characters long")
        .matches(/^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).*$/)
        .withMessage("Password must contain at least one uppercase letter, one number, and one special character"),

    body("address")
        .trim()
        .notEmpty()
        .withMessage("Address is required. Enter your address")
        .isLength({ min: 3 })
        .withMessage("Address should be at least 3 characters long"),

    body("phone")
        .trim()
        .notEmpty()
        .withMessage("Phone is required. Enter your phone number"),

    body("image")
        .optional()
        .isString()
        .withMessage("User image is optional")
];


// LOGIN VALIDATE
export const validateUserLogin = [
    body("email")
        .trim()
        .notEmpty()
        .withMessage("Email is required. Enter your email")
        .isEmail()
        .withMessage("Invalid email address"),

    body("password")
        .trim()
        .notEmpty()
        .withMessage("Password is required. Enter your password")
        .isLength({ min: 6 })
        .withMessage("Password should be at least 6 characters long")
        .matches(/^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).*$/)
        .withMessage("Password must contain at least one uppercase letter, one number, and one special character"),
];


// PASSWORD UPDATE VALIDATE
export const validateUserPasswordUpdate = [
    body("oldPassword")
        .trim()
        .notEmpty()
        .withMessage("Old password is required. Enter your Old password")
        .isLength({ min: 6 })
        .withMessage("Old password should be at least 6 characters long")
        .matches(/^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).*$/)
        .withMessage("Old password must contain at least one uppercase letter, one number, and one special character"),

    body("newPassword")
        .trim()
        .notEmpty()
        .withMessage("New password is required. Enter your password")
        .isLength({ min: 6 })
        .withMessage("New password should be at least 6 characters long")
        .matches(/^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).*$/)
        .withMessage("New password must contain at least one uppercase letter, one number, and one special character"),

    body("confirmedPassword").custom((value, { req }) => {
        if (value !== req.body.newPassword) {
            throw new Error("Password did not match")
        }
        return true
    })
];


// FORGET PASSWORD VALIDATE
export const validateUserForgetPassword = [
    body("email")
        .trim()
        .notEmpty()
        .withMessage("Email is required. Enter your email")
        .isEmail()
        .withMessage("Invalid email address"),
];


// RESET PASSWORD VALIDATE
export const validateUserResetPassword = [
    body("token")
        .trim()
        .notEmpty()
        .withMessage("Token is missing"),

    body("password")
        .trim()
        .notEmpty()
        .withMessage("Password is required. Enter your password")
        .isLength({ min: 6 })
        .withMessage("Password should be at least 6 characters long")
        .matches(/^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).*$/)
        .withMessage("Password must contain at least one uppercase letter, one number, and one special character"),
];

