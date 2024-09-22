import createHttpError from "http-errors";


const users = ["sujon", "sheikh"]

export const getUsers = (req, res, next) => {
    try {
        res.send(users)
    } catch (error) {
        next(error)
    }
}