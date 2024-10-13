import dotenv from "dotenv"
dotenv.config();

export const port = process.env.SERVER_PORT || 3002;

export const dbUrl = process.env.MONGODB_URI;

export const defaultImagePath = process.env.DEFAULT_IMAGE_PATH || "public/images/users/default.png";


export const jwtAccessKey = process.env.JWT_ACCESS_KEY || "iamsujonsheikhdeveloper";

export const jwtActivitionKey = process.env.JWT_ACTIVITION_KEY || "iamsujonsheikhprogrammer";

export const jwtResetPasswordKey = process.env.JWT_RESET_PASSWORD_KEY || "thisisresetpasswordkey"

export const jwtRefreshKey = process.env.JWT_REFRESH_KEY || "iamsujonsheikhprogrammer";

export const smtpUsername = process.env.SMTP_USERNAME || "";

export const smtpPassword = process.env.SMTP_PASSWORD || "zavd dzfl mtrq pqkl";

export const clientUrl = process.env.CLIENT_URL || "http://localhost:3000/";

export const cloudinaryName = process.env.CLOUDINARY_NAME || "di22w71uh";

export const cloudinaryApi = process.env.CLOUDINARY_API || "899484181977763";

export const cloudinarySecretKey = process.env.CLOUDINARY_SECRET_KEY || "AHVf5ybSmnJLTzfbbYTG_E5YQAU";