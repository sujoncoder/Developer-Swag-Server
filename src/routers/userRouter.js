import express from "express";
import { activateUserAccount, deleteUserById, getUserById, getUsers, handleBanUserById, handleUnBanUserById, processRegister, updateUserById } from "../controllers/userController.js";
import upload from "../middlewares/uploadFile.js";
import { validateUserRegisteration } from "../validators/auth.js";
import runValidation from "../validators/index.js";
import { isAdmin, isLoggedIn, isLoggedOut } from "../middlewares/auth.js"

const userRouter = express.Router();

userRouter.post("/process-register",
    upload.single("image"),
    isLoggedOut,
    validateUserRegisteration,
    runValidation,
    processRegister
);

userRouter.post("/verify", isLoggedOut, activateUserAccount);
userRouter.get("/", isLoggedIn, isAdmin, getUsers);
userRouter.get("/:id", isLoggedIn, getUserById);
userRouter.delete("/:id", deleteUserById);
userRouter.put("/:id", upload.single("image"), updateUserById);
userRouter.put("/ban-user/:id", isLoggedIn, isAdmin, handleBanUserById);
userRouter.put("/unban-user/:id", isLoggedIn, isAdmin, handleUnBanUserById);

export default userRouter;