import express from "express";
import runValidation from "../validators/index.js";
import { handleLogin, handleLogout, handleProtectedRoute, handleRefreshToken } from "../controllers/authController.js";
import { isLoggedIn, isLoggedOut } from "../middlewares/auth.js";
import { validateUserLogin } from "../validators/auth.js";

const authRouter = express.Router();


// Handle login route
authRouter.post("/login", validateUserLogin, runValidation, isLoggedOut, handleLogin);

// Handle logout route
authRouter.post("/logout", isLoggedIn, handleLogout);

// Handle refresh token
authRouter.get("/refresh-token", handleRefreshToken);


authRouter.get("/protected", handleProtectedRoute);

export default authRouter;