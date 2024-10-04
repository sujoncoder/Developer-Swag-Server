import nodemailer from "nodemailer";
import { smtpPassword, smtpUsername } from "../secret.js";



// Configure the transport mechanism for nodemailer
const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // true for port 465, false for other ports like 587
    auth: {
        user: smtpUsername,
        pass: smtpPassword,
    },
});



// Function to send email using the configured transporter
const emailWithNodeMailer = async (emailData) => {
    try {
        const mailOptions = {
            from: smtpUsername, // sender email address
            to: emailData.email, // receiver's email address
            subject: emailData.subject, // email subject
            html: emailData.html // email body content (HTML format)
        };

        // Send the email and wait for the result
        const info = await transporter.sendMail(mailOptions);
        console.log(`Message sent: ${info.response}`);

        return info; // Optional: return the info if needed for further processing

    } catch (error) {
        console.error("Error occurred while sending email:", error);

        // Re-throw the error so that it can be caught by a higher-level handler
        throw new Error("Email failed to send. Please try again later.");
    }
}

export default emailWithNodeMailer;
