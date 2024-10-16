// ERROR_RESPONSE HELPER
export const errorResponse = (res, { statusCode = 500, message = "Internal Server Error" }) => {
    return res.status(statusCode).json({
        success: false,
        message: message
    })
};



// SUCCESS_RESPONSE HELPER
export const successResponse = (res, { statusCode = 200, message = "Success", payload = {} }) => {
    return res.status(statusCode).json({
        success: true,
        message: message,
        payload
    })
};

