import express from "express";
import { seedProducts, seedUsers } from "../controllers/seedController.js";
import upload from "../middlewares/uploadFile.js";
const seedRouter = express.Router();

// user seed router
seedRouter.get("/users", upload.single("image"), seedUsers);

// products seed router
seedRouter.get("/products", upload.single("image"), seedProducts);

export default seedRouter;