import express from "express";
import { getUsers } from "../controllers/userController.js";

const userRoute = express.Router();

userRoute.get("/users", getUsers)

export default userRoute;