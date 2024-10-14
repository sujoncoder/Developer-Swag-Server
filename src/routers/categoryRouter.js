import express from "express";
import { handleCreateCategory, handleDeleteCategory, handleGetCategories, handleGetCategory, handleUpdateCategory } from "../controllers/categoryController.js";
import { validateCategory } from "../validators/category.js";
import runValidation from "../validators/index.js"
import { isAdmin, isLoggedIn } from "../middlewares/auth.js"


const categoryRouter = express.Router();

// POST --> /API/V1/CATEGORIES == CREATE A CATEGORY ==> ADMIN
categoryRouter.post("/", validateCategory, runValidation, isLoggedIn, isAdmin, handleCreateCategory);


// GET --> /API/V1/CATEGORIES == GET ALL CATEGORIES
categoryRouter.get("/", handleGetCategories);


// GET --> /API/V1/CATEGORIES/:SLUG == GET SINGLE CATEGORY
categoryRouter.get("/:slug", handleGetCategory);


// PUT --> /API/V1/CATEGORIES/:SLUG == UPDATE SINGLE CATEGORY ==> ADMIN
categoryRouter.put("/:slug", validateCategory, runValidation, isLoggedIn, isAdmin, handleUpdateCategory);


// DELETE --> /API/V1/CATEGORIES/:SLUG == DELETE SINGLE CATEGORY ==> ADMIN
categoryRouter.delete("/:slug", isLoggedIn, isAdmin, handleDeleteCategory);

export default categoryRouter;