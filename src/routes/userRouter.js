import express from "express";
import { activateUserAccount, deleteUserById, getUserById, getUsers, processRegister, updateUserById } from "../controllers/userController.js";
import upload from "../middlewares/uploadFile.js";
import { validateUserRegisteration } from "../validators/auth.js";
import runValidation from "../validators/index.js";

const userRoute = express.Router();

userRoute.post("/process-register",
    upload.single("image"),
    validateUserRegisteration,
    runValidation,
    processRegister
);

userRoute.post("/verify", activateUserAccount);
userRoute.get("/", getUsers);
userRoute.get("/:id", getUserById);
userRoute.delete("/:id", deleteUserById);
userRoute.put("/:id", upload.single("image"), updateUserById);

export default userRoute;