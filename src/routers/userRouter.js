import express from "express";
import { activateUserAccount, deleteUserById, getUserById, getUsers, processRegister, updateUserById } from "../controllers/userController.js";
import upload from "../middlewares/uploadFile.js";
import { validateUserRegisteration } from "../validators/auth.js";
import runValidation from "../validators/index.js";
import isLoggedIn from "../middlewares/auth.js";

const userRouter = express.Router();

userRouter.post("/process-register",
    upload.single("image"),
    validateUserRegisteration,
    runValidation,
    processRegister
);

userRouter.post("/verify", activateUserAccount);
userRouter.get("/", isLoggedIn, getUsers);
userRouter.get("/:id", isLoggedIn, getUserById);
userRouter.delete("/:id", deleteUserById);
userRouter.put("/:id", upload.single("image"), updateUserById);

export default userRouter;