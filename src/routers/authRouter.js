import express from "express";
import runValidation from "../validators/index.js";
import { handleLogin, handleLogout } from "../controllers/authController.js";
import { isLoggedIn, isLoggedOut } from "../middlewares/auth.js";
import { validateUserLogin } from "../validators/auth.js";

const authRouter = express.Router();

authRouter.post("/login", validateUserLogin, runValidation, isLoggedOut, handleLogin);
authRouter.post("/logout", isLoggedIn, handleLogout);

export default authRouter;