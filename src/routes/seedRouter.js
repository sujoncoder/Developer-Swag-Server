import express from "express";
import seedUser from "../controllers/seedController.js";
const seedRouter = express.Router();


seedRouter.get("/users", seedUser)

export default seedRouter;