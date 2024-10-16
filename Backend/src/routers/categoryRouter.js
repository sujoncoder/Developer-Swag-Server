import express from "express";
import { validateCategory } from "../validators/category.js";
import runValidation from "../validators/index.js"
import { isAdmin, isLoggedIn } from "../middlewares/auth.js"
import { createCategory, getAllCategories, deleteCategory, updateCategory, getSingleCategory, } from "../controllers/categoryController.js";


const categoryRouter = express.Router();

// POST --> /API/V1/CATEGORIES == CREATE A CATEGORY ==> ADMIN
categoryRouter.post("/", validateCategory, runValidation, isLoggedIn, isAdmin, createCategory);


// GET --> /API/V1/CATEGORIES == GET ALL CATEGORIES
categoryRouter.get("/", getAllCategories);


// GET --> /API/V1/CATEGORIES/:SLUG == GET SINGLE CATEGORY
categoryRouter.get("/:slug", getSingleCategory);


// PUT --> /API/V1/CATEGORIES/:SLUG == UPDATE SINGLE CATEGORY ==> ADMIN
categoryRouter.put("/:slug", validateCategory, runValidation, isLoggedIn, isAdmin, updateCategory);


// DELETE --> /API/V1/CATEGORIES/:SLUG == DELETE SINGLE CATEGORY ==> ADMIN
categoryRouter.delete("/:slug", isLoggedIn, isAdmin, deleteCategory);

export default categoryRouter;