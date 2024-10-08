import express from "express";

import { uploadProductImage } from "../middlewares/uploadFile.js";
import validateProduct from "../validators/product.js";
import runValidation from "../validators/index.js";
import { isLoggedIn, isAdmin } from "../middlewares/auth.js";
import { handleCreateProduct } from "../controllers/productController.js";

const productRouter = express.Router();

// create a product route
productRouter.post("/", isLoggedIn, isAdmin, uploadProductImage.single("image"), handleCreateProduct);


export default productRouter;