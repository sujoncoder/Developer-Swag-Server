import nodemailer from "nodemailer";

import { smtpPassword, smtpUsername } from "../secret.js";



// CONFIGURE THE TRANSPORT MECHANISM FOR NODEMAILER
const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: smtpUsername,
        pass: smtpPassword,
    },
});


// FUNCTION TO SEND EMAIL USING THE CONFIGURED TRANSPORTER
const emailWithNodeMailer = async (emailData) => {
    try {
        const mailOptions = {
            from: smtpUsername,
            to: emailData.email,
            subject: emailData.subject,
            html: emailData.html
        };

        // SEND THE MAIL AND WAIT FOR THE RESULT
        const info = await transporter.sendMail(mailOptions);
        return info;

    } catch (error) {
        console.error("Error occurred while sending email:", error);

        throw new Error("Email failed to send. Please try again later.");
    }
};

export default emailWithNodeMailer;
