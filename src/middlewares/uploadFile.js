import multer from "multer"
import { ALLOWED_FILE_TYPES, MAX_FILE_SIZE } from "../config/index.js"

const storage = multer.memoryStorage()

const fileFilter = (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
        return cb(new Error("Only image files are allowed"), false)
    }

    if (file.size > MAX_FILE_SIZE) {
        return cb(new Error("File size to long"), false)
    }

    if (!ALLOWED_FILE_TYPES.includes(file.mimetype)) {
        return cb(new Error("File type is not allowed"), false)
    }

    cb(null, true)
}

const upload = multer({ storage: storage, fileFilter: fileFilter });

export default upload;