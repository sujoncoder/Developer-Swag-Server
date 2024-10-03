import express from "express";
import { activateUserAccount, getUserById, getUsers, handleDeleteUserById, handleForgetPassword, handleManageUserStatusById, handleResetPassword, handleUpdatePassword, handleUpdateUserById, processRegister } from "../controllers/userController.js";
import upload from "../middlewares/uploadFile.js";
import { validateUserForgetPassword, validateUserPasswordUpdate, validateUserRegisteration, validateUserResetPassword } from "../validators/auth.js";
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

// Handle verify user account after sending a email clicking verify link
userRouter.post("/verify", isLoggedOut, activateUserAccount);

// Handle get users see only admin
userRouter.get("/", isLoggedIn, isAdmin, getUsers);

// Handle get single user only admin using id
userRouter.get("/:id([0-9a-fA-F]{24})", isLoggedIn, getUserById);

// Handle user delete her own accoun using id
userRouter.delete("/:id([0-9a-fA-F]{24})", handleDeleteUserById);

// Handle user upadate her own account using id
userRouter.put("/:id([0-9a-fA-F]{24})", isLoggedIn, upload.single("image"), handleUpdateUserById);

// Handle only admin can banned & unbanned user account
userRouter.put("/manage-user/:id([0-9a-fA-F]{24})", isLoggedIn, isAdmin, handleManageUserStatusById);



// Handle user can update her own account password
userRouter.put("/update-password/:id([0-9a-fA-F]{24})", validateUserPasswordUpdate, runValidation, isLoggedIn, handleUpdatePassword)


// Handle user forget password
userRouter.post("/forget-password", validateUserForgetPassword, runValidation, handleForgetPassword)


// Handle reset password
userRouter.put("/reset-password", validateUserResetPassword, runValidation, handleResetPassword)



export default userRouter;