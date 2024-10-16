import express from "express";

import { uploadProductImage } from "../middlewares/uploadFile.js";
import { isLoggedIn, isAdmin } from "../middlewares/auth.js";
import { updateProduct, deleteProduct, getAllProducts, createProduct, getSingleProduct } from "../controllers/productController.js";



// EXTRACT PRODUCT_ROUTER FROM EXPRESS ROUTER
const productRouter = express.Router();

// POST --> /API/V1/PRODUCTS == CREATE A PRODUCT ==> ADMIN
productRouter.post("/", isLoggedIn, isAdmin, uploadProductImage.single("image"), createProduct);


// GET --> /API/V1/PRODUCTS == GET ALL PRODUCTS
productRouter.get("/", getAllProducts);


// GET --> /API/V1/PRODUCTS/:SLUG == GET SINGLE PRODUCT
productRouter.get("/:slug", getSingleProduct);


// DELETE --> /API/V1/PRODUCTS/:SLUG == DELETE SINGLE PRODUCT ==> ADMIN
productRouter.delete("/:slug", isLoggedIn, isAdmin, deleteProduct);


// PUT --> /API/V1/PRODUCTS/:SLUG == UPDATE SINGLE PRODUCT ==> ADMIN
productRouter.put("/:slug", isLoggedIn, isAdmin, uploadProductImage.single("image"), updateProduct);


export default productRouter;