import express from "express";

import runValidation from "../validators/index.js";
import { isLoggedIn, isLoggedOut } from "../middlewares/auth.js";
import { validateUserLogin } from "../validators/auth.js";
import { login, logout, protectedRoute, refreshToken } from "../controllers/authController.js";



// EXTRACT AUTH_ROUTER FROM EXPRESS ROUTER
const authRouter = express.Router();


// POST --> /API/V1/AUTH/LOGIN == USER LOGIN ROUTE
authRouter.post("/login", validateUserLogin, runValidation, isLoggedOut, login);


// POST --> /API/V1/AUTH/LOGINOUT == USER LOGOUT ROUTE
authRouter.post("/logout", isLoggedIn, logout);


// GET --> /API/V1/AUTH/REFRESH_TOKEN == GET USER REFRESH_TOKEN 
authRouter.get("/refresh-token", refreshToken);


// GET --> /API/V1/AUTH/PROTECTED == PROTECTED ROUTE
authRouter.get("/protected", protectedRoute);

export default authRouter;