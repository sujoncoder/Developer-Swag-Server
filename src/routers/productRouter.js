import express from "express";

import upload from "../middlewares/uploadFile.js";
import { handleCreateProduct } from "../controllers/productController.js";
import validateProduct from "../validators/product.js";
import runValidation from "../validators/index.js";
import { isLoggedIn, isAdmin } from "../middlewares/auth.js";

const productRouter = express.Router();

// post product route
productRouter.post("/", upload.single("image"), validateProduct, runValidation, isLoggedIn, isAdmin, handleCreateProduct);


export default productRouter;