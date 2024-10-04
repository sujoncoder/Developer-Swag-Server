import express from "express";
import { handleCreateCategory, handleDeleteCategory, handleGetCategories, handleGetCategory, handleUpdateCategory } from "../controllers/categoryController.js";
import { validateCategory } from "../validators/category.js";
import runValidation from "../validators/index.js"
import { isAdmin, isLoggedIn } from "../middlewares/auth.js"


const categoryRouter = express.Router();

// Create category
categoryRouter.post("/", validateCategory, runValidation, isLoggedIn, isAdmin, handleCreateCategory);

// Get categories
categoryRouter.get("/", handleGetCategories);

// Get category
categoryRouter.get("/:slug", handleGetCategory);

// Update category
categoryRouter.put("/:slug", validateCategory, runValidation, isLoggedIn, isAdmin, handleUpdateCategory);


// Delete category
categoryRouter.delete("/:slug", isLoggedIn, isAdmin, handleDeleteCategory);

export default categoryRouter;