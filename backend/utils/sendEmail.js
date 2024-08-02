const nodemailer = require("nodemailer");

module.exports = async (userEmail, subject, htmlTemplate) => {
    try {
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.APP_EMAIL_ADDRESS,
                pass: process.env.APP_EMAIL_PASSWORD,
            },
        });
        const mailOptions = {
            from: process.env.APP_EMAIL_ADDRESS, // Sender
            to: userEmail,
            subject: subject,
            html: htmlTemplate,
        }

        const info = await transporter.sendMail(mailOptions);
        console.log("Email sent: ", info.response);
    } catch (e) {
        console.log(e);
        throw new Error("Internal Server Error: (nodemailer)");
    }
}