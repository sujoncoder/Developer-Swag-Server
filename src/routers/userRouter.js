import express from "express";

import { handleActivateUserAccount, handleDeleteUserById, handleForgetPassword, handleGetUserById, handleGetUsers, handleManageUserStatusById, handleProcessRegister, handleResetPassword, handleUpdatePassword, handleUpdateUserById, } from "../controllers/userController.js";
import { validateUserForgetPassword, validateUserPasswordUpdate, validateUserRegisteration, validateUserResetPassword } from "../validators/auth.js";
import runValidation from "../validators/index.js";
import { isAdmin, isLoggedIn, isLoggedOut } from "../middlewares/auth.js"
import { uploadUserImage } from "../middlewares/uploadFile.js";


// EXTRACT USER_ROUTER FROM EXPRESS ROUTER
const userRouter = express.Router();


// PROCESS REGISTER ROUTE
userRouter.post("/process-register",
    uploadUserImage.single("image"),
    isLoggedOut,
    validateUserRegisteration,
    runValidation,
    handleProcessRegister
);


// VERIFY ROUTE ==> AFTER REGISTER VERIFY USING EMAIL
userRouter.post("/verify", isLoggedOut, handleActivateUserAccount);


// GET ALL USERS ==> ADMIN
userRouter.get("/", isLoggedIn, isAdmin, handleGetUsers);


// GET SINGLE USER BY ID ==> ADMIN
userRouter.get("/:id([0-9a-fA-F]{24})", isLoggedIn, isAdmin, handleGetUserById);


// DELETE USER BY ID ==> USER
userRouter.delete("/:id([0-9a-fA-F]{24})", handleDeleteUserById);


// UPDATE USER BY ID ==> USER
userRouter.put("/:id([0-9a-fA-F]{24})", isLoggedIn, uploadUserImage.single("image"), handleUpdateUserById);


// BAN, UNBAN ACCOUNT BY ID ==> ADMIN
userRouter.put("/manage-user/:id([0-9a-fA-F]{24})", isLoggedIn, isAdmin, handleManageUserStatusById);


// UPDATE PASSWORD BY ID ==> ADMIN
userRouter.put("/update-password/:id([0-9a-fA-F]{24})", validateUserPasswordUpdate, runValidation, isLoggedIn, handleUpdatePassword)


// FORGET PASSWORD ==> USER
userRouter.post("/forget-password", validateUserForgetPassword, runValidation, handleForgetPassword)


// RESET PASSWORD ==> USER
userRouter.put("/reset-password", validateUserResetPassword, runValidation, handleResetPassword)


export default userRouter;