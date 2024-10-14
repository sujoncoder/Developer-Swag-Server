import express from "express";
const seedRouter = express.Router();

import { seedProducts, seedUsers } from "../controllers/seedController.js";
import { uploadProductImage, uploadUserImage } from "../middlewares/uploadFile.js";

// USER SEED ROUTER
seedRouter.get("/users", uploadUserImage.single("image"), seedUsers);

// PRODUCT SEED ROUTER
seedRouter.get("/products", uploadProductImage.single("image"), seedProducts);

export default seedRouter;