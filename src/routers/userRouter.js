import express from "express";

import { validateUserForgetPassword, validateUserPasswordUpdate, validateUserRegisteration, validateUserResetPassword } from "../validators/auth.js";
import runValidation from "../validators/index.js";
import { isAdmin, isLoggedIn, isLoggedOut } from "../middlewares/auth.js"
import { uploadUserImage } from "../middlewares/uploadFile.js";
import { activateUserAccount, deleteUser, forgetPassword, getAllUsers, getSingleUser, manageUserStatus, processRegister, resetPassword, updatePassword, updateUser } from "../controllers/userController.js";


// EXTRACT USER_ROUTER FROM EXPRESS ROUTER
const userRouter = express.Router();


// POST --> /API/V1/USERS/PROCESS-REGISTER == REGISTER-PROCESS ROUTE
userRouter.post("/process-register",
    uploadUserImage.single("image"),
    isLoggedOut,
    validateUserRegisteration,
    runValidation,
    processRegister
);


// POST --> /API/V1/USERS/VERIFY == VERIFY USER ROUTE
userRouter.post("/verify", isLoggedOut, activateUserAccount);


// GET --> /API/V1/USERS == GET ALL USERS ==> ADMIN
userRouter.get("/", isLoggedIn, isAdmin, getAllUsers);


// GET --> /API/V1/USERS == GET SINGLE USER BY ID ==> ADMIN
userRouter.get("/:id([0-9a-fA-F]{24})", isLoggedIn, isAdmin, getSingleUser);


// DELETE --> /API/V1/USERS == DELETE USER BY ID
userRouter.delete("/:id([0-9a-fA-F]{24})", deleteUser);


// PUT --> /API/V1/USERS == UPDATE USER BY ID
userRouter.put("/:id([0-9a-fA-F]{24})", isLoggedIn, uploadUserImage.single("image"), updateUser);


// PUT --> /API/V1/USERS/MANAGE-USER == BAN, UNBAN ACCOUNT BY ID ==> ADMIN
userRouter.put("/manage-user/:id([0-9a-fA-F]{24})", isLoggedIn, isAdmin, manageUserStatus);


// UPDATE PASSWORD BY ID ==> ADMIN
userRouter.put("/update-password/:id([0-9a-fA-F]{24})", validateUserPasswordUpdate, runValidation, isLoggedIn, updatePassword);


// FORGET PASSWORD ==> USER
userRouter.post("/forget-password", validateUserForgetPassword, runValidation, forgetPassword);


// RESET PASSWORD ==> USER
userRouter.put("/reset-password", validateUserResetPassword, runValidation, resetPassword);


export default userRouter;