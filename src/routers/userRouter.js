import express from "express";

import { handleActivateUserAccount, handleDeleteUserById, handleForgetPassword, handleGetUserById, handleGetUsers, handleManageUserStatusById, handleProcessRegister, handleResetPassword, handleUpdatePassword, handleUpdateUserById, } from "../controllers/userController.js";
import { validateUserForgetPassword, validateUserPasswordUpdate, validateUserRegisteration, validateUserResetPassword } from "../validators/auth.js";
import runValidation from "../validators/index.js";
import { isAdmin, isLoggedIn, isLoggedOut } from "../middlewares/auth.js"
import { uploadUserImage } from "../middlewares/uploadFile.js";

const userRouter = express.Router();


// Handle process register
userRouter.post("/process-register",
    uploadUserImage.single("image"),
    isLoggedOut,
    validateUserRegisteration,
    runValidation,
    handleProcessRegister
);

// Handle verify user account after sending a email clicking verify link
userRouter.post("/verify", isLoggedOut, handleActivateUserAccount);

// Handle get users see only admin
userRouter.get("/", isLoggedIn, isAdmin, handleGetUsers);

// Handle get single user only admin using id
userRouter.get("/:id([0-9a-fA-F]{24})", isLoggedIn, handleGetUserById);

// Handle user delete her own accoun using id
userRouter.delete("/:id([0-9a-fA-F]{24})", handleDeleteUserById);

// Handle user upadate her own account using id
userRouter.put("/:id([0-9a-fA-F]{24})", isLoggedIn, uploadUserImage.single("image"), handleUpdateUserById);

// Handle only admin can banned & unbanned user account
userRouter.put("/manage-user/:id([0-9a-fA-F]{24})", isLoggedIn, isAdmin, handleManageUserStatusById);


// Handle user can update her own account password
userRouter.put("/update-password/:id([0-9a-fA-F]{24})", validateUserPasswordUpdate, runValidation, isLoggedIn, handleUpdatePassword)


// Handle user forget password
userRouter.post("/forget-password", validateUserForgetPassword, runValidation, handleForgetPassword)


// Handle reset password
userRouter.put("/reset-password", validateUserResetPassword, runValidation, handleResetPassword)


export default userRouter;