import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";

export const sendEmail = async ({ email, emailType, userId }: any) => {
    try {
        const token = jwt.sign({ userId }, process.env.JWT_SECRET!, { expiresIn: '1h' });

        const transport = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.GMAIL_EMAIL, 
                pass: process.env.GMAIL_APP_PASSWORD 
            }
        });

        const mailOptions = {
            from: 'donotreply@habittracker.com',
            to: email,
            subject: emailType === "VERIFY" ? "Verify your email" : "Reset your password",
            html: `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                    body {
                        background-color: #f4f4f4;
                        font-family: Arial, sans-serif;
                        margin: 0;
                        padding: 0;
                    }
                    .email-container {
                        max-width: 600px;
                        margin: 20px auto;
                        background-color: #fff;
                        border-radius: 8px;
                        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
                        overflow: hidden;
                    }
                    .email-header {
                        background-color: #e80432;
                        padding: 20px;
                        text-align: center;
                        color: white;
                    }
                    .email-header h1 {
                        margin: 0;
                        font-size: 24px;
                    }
                    .email-body {
                        padding: 20px;
                        line-height: 1.6;
                    }
                    .email-body h2 {
                        font-size: 20px;
                        margin-bottom: 10px;
                    }
                    .email-body p {
                        font-size: 16px;
                        margin-bottom: 15px;
                    }
                    .email-button {
                        display: inline-block;
                        background-color: #e80432;
                        color: white;
                        text-decoration: none;
                        padding: 10px 20px;
                        border-radius: 5px;
                        font-size: 16px;
                    }
                    .email-button:hover {
                        background-color: #1e7e65;
                    }
                    .email-footer {
                        background-color: #f4f4f4;
                        padding: 15px;
                        text-align: center;
                        font-size: 14px;
                        color: #777;
                    }
                </style>
            </head>
            <body>
                <div class="email-container">
                    <!-- Email Header -->
                    <div class="email-header">
                        <h1>HabitTracker</h1>
                    </div>
        
                    <!-- Email Body -->
                    <div class="email-body">
                        <h2>${emailType === "VERIFY" ? "Verify Your Email" : "Reset Your Password"}</h2>
                        <p>Hello,</p>
                        <p>${emailType === "VERIFY" ? 
                            "Thank you for signing up! Please click the button below to verify your email address and complete your registration." : 
                            "We received a request to reset your password. Click the button below to proceed."}
                        </p>
        
                        <!-- Action Button -->
                        <p style="text-align: center;">
                            <a href="${process.env.DOMAIN}/${emailType === "VERIFY" ? "verify-email" : "reset-password"}?token=${token}" class="email-button">
                                ${emailType === "VERIFY" ? "Verify Email" : "Reset Password"}
                            </a>
                        </p>
        
                        <p>If the button above doesn't work, copy and paste the link below into your web browser:</p>
                        <p>
                            <a href="${process.env.DOMAIN}/${emailType === "VERIFY" ? "verify-email" : "reset-password"}?token=${token}">
                                ${process.env.DOMAIN}/${emailType === "VERIFY" ? "verify-email" : "reset-password"}?token=${token}
                            </a>
                        </p>
        
                        <p>If you didn't request this, you can safely ignore this email.</p>
                    </div>
        
                    <!-- Email Footer -->
                    <div class="email-footer">
                        <p>&copy; ${new Date().getFullYear()} HabitTracker. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>`
        };

        const mailResponse = await transport.sendMail(mailOptions);
        return mailResponse;

    } catch (error: any) {
        throw new Error(error.message);
    }
};
