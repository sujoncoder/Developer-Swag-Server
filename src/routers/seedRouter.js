import express from "express";

import { seedProducts, seedUsers } from "../controllers/seedController.js";
import { uploadProductImage, uploadUserImage } from "../middlewares/uploadFile.js";
const seedRouter = express.Router();

// user seed router
seedRouter.get("/users", uploadUserImage.single("image"), seedUsers);

// products seed router
seedRouter.get("/products", uploadProductImage.single("image"), seedProducts);

export default seedRouter;