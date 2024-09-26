import express from "express";
import morgan from "morgan";
import createHttpError from "http-errors";
import rateLimit from "express-rate-limit";
import userRoute from "./routes/userRouter.js";
import seedRouter from "./routes/seedRouter.js";
import { errorResponse } from "./helpers/responseController.js";

const rateLimiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 5,
    message: "Too many requests from this IP. Please try again later."
})


const app = express()
app.use(rateLimiter)
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(morgan("dev")),

    // Application routing
    app.use("/api/v1/users", userRoute)
app.use("/api/v1/seed", seedRouter)


// client error handling
app.use((req, res, next) => {
    next(createHttpError(500, "Route not found"))
})


// server error handling ==> finaly all eroor handle here
app.use((err, req, res, next) => {
    return errorResponse(res, {
        statusCode: err.status,
        message: err.message
    })
})

export default app