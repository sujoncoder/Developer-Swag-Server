import multer from "multer"

import { ALLOWED_FILE_TYPES, MAX_FILE_SIZE, UPLOAD_PRODUCT_IMAGE_DIRECTORY, UPLOAD_USER_IMAGE_DIRECTORY } from "../config/index.js";


// USER STORAGE
const userStorage = multer.diskStorage({
    // destination: function (req, file, cb) {
    //     cb(null, UPLOAD_USER_IMAGE_DIRECTORY)
    // },
    filename: function (req, file, cb) {
        cb(null, Date.now() + "-" + file.originalname)
    }
});


// PRODUCT STORAGE
const productStorage = multer.diskStorage({
    // destination: function (req, file, cb) {
    //     cb(null, UPLOAD_PRODUCT_IMAGE_DIRECTORY)
    // },
    filename: function (req, file, cb) {
        cb(null, Date.now() + "-" + file.originalname)
    }
});


// FILE FILTERING
const fileFilter = (req, file, cb) => {
    if (!ALLOWED_FILE_TYPES.includes(file.mimetype)) {
        return cb(new Error("File type is not allowed"), false)
    }
    cb(null, true)
};


// USER IMAGE
export const uploadUserImage = multer({
    storage: userStorage,
    limits: { fileSize: MAX_FILE_SIZE },
    fileFilter: fileFilter
});

// PRODUCT IMAGE
export const uploadProductImage = multer({
    storage: productStorage,
    limits: { fileSize: MAX_FILE_SIZE },
    fileFilter: fileFilter
});
