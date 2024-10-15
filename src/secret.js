import dotenv from "dotenv";
// CONFIGURE DOTENV
dotenv.config();

// SERVER PORT
export const port = process.env.SERVER_PORT || 3002;

// DATABASE URL
export const dbUrl = process.env.MONGODB_URI;

// DEFAULT IMAGE PATH
export const defaultImagePath = process.env.DEFAULT_IMAGE_PATH || "public/images/users/default.png";

// JWT ACCESS KEY
export const jwtAccessKey = process.env.JWT_ACCESS_KEY || "iamsujonsheikhdeveloper";

// JWT ACTIVITION KEY
export const jwtActivitionKey = process.env.JWT_ACTIVITION_KEY || "iamsujonsheikhprogrammer";

// JWT RESET PASSWORD KEY
export const jwtResetPasswordKey = process.env.JWT_RESET_PASSWORD_KEY || "thisisresetpasswordkey"

// JWT REFRESH KEY
export const jwtRefreshKey = process.env.JWT_REFRESH_KEY || "iamsujonsheikhprogrammer";

// SMTP USER NAME - EMAIL
export const smtpUsername = process.env.SMTP_USERNAME || "";

// SMTP PASSWORD - EMAIL
export const smtpPassword = process.env.SMTP_PASSWORD || "zavd dzfl mtrq pqkl";

// FRONTEND CLIENT URL
export const clientUrl = process.env.CLIENT_URL || "http://localhost:3000/";

// CLOUDINARY NAME
export const cloudinaryName = process.env.CLOUDINARY_NAME || "di22w71uh";

// CLOUDINARY API
export const cloudinaryApi = process.env.CLOUDINARY_API || "899484181977763";

// CLOUDINARY SECRET KEY
export const cloudinarySecretKey = process.env.CLOUDINARY_SECRET_KEY || "AHVf5ybSmnJLTzfbbYTG_E5YQAU";