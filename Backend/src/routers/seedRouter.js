import express from "express";
const seedRouter = express.Router();

import { seedProducts, seedUsers } from "../controllers/seedController.js";
import { uploadProductImage, uploadUserImage } from "../middlewares/uploadFile.js";


// GET --> /API/V1/SEED/USERS == DELETE EXISTING USERS & INSERT SEED USERS
seedRouter.get("/users", uploadUserImage.single("image"), seedUsers);


// GET --> /API/V1/SEED/PRODUCTS == DELETE EXISTING PRODUCTS & INSERT SEED PRODUCTS
seedRouter.get("/products", uploadProductImage.single("image"), seedProducts);

export default seedRouter;