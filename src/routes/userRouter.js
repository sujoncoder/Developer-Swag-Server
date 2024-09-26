import express from "express";
import { deleteUserById, getUserById, getUsers, processRegister } from "../controllers/userController.js";

const userRoute = express.Router();

userRoute.post("/process-register", processRegister)
userRoute.get("/", getUsers)
userRoute.get("/:id", getUserById)
userRoute.delete("/:id", deleteUserById)

export default userRoute;