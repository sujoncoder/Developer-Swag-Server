import express from "express";

import { uploadProductImage } from "../middlewares/uploadFile.js";
import { isLoggedIn, isAdmin } from "../middlewares/auth.js";
import { handleGetAllProducts, handleCreateProduct, handleGetProduct, handleDeleteProduct, handleUpdateProduct } from "../controllers/productController.js";

const productRouter = express.Router();

// POST --> /api/v1/products  == Create a products.
productRouter.post("/", isLoggedIn, isAdmin, uploadProductImage.single("image"), handleCreateProduct);

// GET --> /api/v1/products  == Get all products.
productRouter.get("/", handleGetAllProducts);

// GET --> /api/v1/products/:slug  == Get single product.
productRouter.get("/:slug", handleGetProduct);

// DELETE --> /api/v1/products/:slug  == Delete single product.
productRouter.delete("/:slug", isLoggedIn, isAdmin, handleDeleteProduct);

// PUT --> /api/v1/products/:slug  == Update a single product.
productRouter.put("/:slug", isLoggedIn, isAdmin, uploadProductImage.single("image"), handleUpdateProduct);





export default productRouter;