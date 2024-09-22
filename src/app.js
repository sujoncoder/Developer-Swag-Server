import express from "express";
import morgan from "morgan";
import createHttpError from "http-errors";
import rateLimit from "express-rate-limit";

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



    app.get("/test", (req, res) => {
        res.status(200).send("Wellcome to my server....")
    })

// client error handling
app.use((req, res, next) => {
    next(createHttpError(500, "Route not found"))
})


// server error handling ==> finaly all eroor handle here
app.use((err, req, res, next) => {
    return res.status(err.status || 500).json({
        success: false,
        message: err.message
    })
})

export default app