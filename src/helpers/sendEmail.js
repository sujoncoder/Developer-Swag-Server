import createError from "http-errors";

import emailWithNodeMailer from "./email.js";


// SEND EMAIL HELPER
const sendEmail = async (emailData) => {
    try {
        await emailWithNodeMailer(emailData)
    } catch (emailError) {
        throw createError(500, "Failed to send verification email")
    }
};

export default sendEmail;