import express from "express";
import { deleteUserById, getUserById, getUsers } from "../controllers/userController.js";

const userRoute = express.Router();

userRoute.get("/", getUsers)
userRoute.get("/:id", getUserById)
userRoute.delete("/:id", deleteUserById)

export default userRoute;