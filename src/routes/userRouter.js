import express from "express";
import { activateUserAccount, deleteUserById, getUserById, getUsers, processRegister } from "../controllers/userController.js";
import upload from "../middlewares/uploadFile.js";

const userRoute = express.Router();

userRoute.post("/process-register", upload.single("image"), processRegister);
userRoute.post("/verify", activateUserAccount);
userRoute.get("/", getUsers);
userRoute.get("/:id", getUserById);
userRoute.delete("/:id", deleteUserById);

export default userRoute;