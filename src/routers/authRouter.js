import express from "express";
import runValidation from "../validators/index.js";
import { handleLogin, handleLogout } from "../controllers/authController.js";

const authRouter = express.Router();

authRouter.post("/login", handleLogin);
authRouter.post("/logout", handleLogout);

export default authRouter;