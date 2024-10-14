import express from "express";
import morgan from "morgan";
import cookieParser from "cookie-parser"
import createHttpError from "http-errors";
import rateLimit from "express-rate-limit";

import userRouter from "./routers/userRouter.js";
import seedRouter from "./routers/seedRouter.js";
import { errorResponse } from "./helpers/responseController.js";
import authRouter from "./routers/authRouter.js";
import categoryRouter from "./routers/categoryRouter.js";
import productRouter from "./routers/productRouter.js";


// RATE LIMITER
const rateLimiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 20,
    message: "Too many requests from this IP. Please try again later."
});


// EXTRACT APP FROM THE EXPRESS
const app = express();

// APPLICATION LAYER MIDDLEWARE
app.use(cookieParser());
app.use(rateLimiter);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));


// APPLICATION LAYER MIDDLEWARE ==> ROUTING
app.use("/api/v1/users", userRouter)
app.use("/api/v1/auth", authRouter)
app.use("/api/v1/categories", categoryRouter)
app.use("/api/v1/products", productRouter)
app.use("/api/v1/seed", seedRouter)


// HANDLE CLIENT ERROR
app.use((req, res, next) => {
    next(createHttpError(500, "Route not found"))
});


// HANDLE SERVER ERROR
app.use((err, req, res, next) => {
    return errorResponse(res, {
        statusCode: err.status,
        message: err.message
    })
});

export default app;