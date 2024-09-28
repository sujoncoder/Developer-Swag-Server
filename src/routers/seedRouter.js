import express from "express";
import seedUser from "../controllers/seedController.js";
import upload from "../middlewares/uploadFile.js";
const seedRouter = express.Router();


seedRouter.get("/users", upload.single("image"), seedUser)

export default seedRouter;