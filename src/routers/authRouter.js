import express from "express";

import runValidation from "../validators/index.js";
import { handleLogin, handleLogout, handleProtectedRoute, handleRefreshToken } from "../controllers/authController.js";
import { isLoggedIn, isLoggedOut } from "../middlewares/auth.js";
import { validateUserLogin } from "../validators/auth.js";



// EXTRACT AUTH_ROUTER FROM EXPRESS ROUTER
const authRouter = express.Router();


// POST --> /API/V1/AUTH/LOGIN == USER LOGIN ROUTE
authRouter.post("/login", validateUserLogin, runValidation, isLoggedOut, handleLogin);


// POST --> /API/V1/AUTH/LOGINOUT == USER LOGOUT ROUTE
authRouter.post("/logout", isLoggedIn, handleLogout);


// GET --> /API/V1/AUTH/REFRESH_TOKEN == GET USER REFRESH_TOKEN 
authRouter.get("/refresh-token", handleRefreshToken);


// GET --> /API/V1/AUTH/PROTECTED == PROTECTED ROUTE
authRouter.get("/protected", handleProtectedRoute);

export default authRouter;