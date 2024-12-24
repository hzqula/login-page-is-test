// lib/nodemailer.ts
const nodemailer = require("nodemailer");
export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export const sendOTPEmail = async (email: string, otp: number) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Your OTP Code",
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Your OTP Verification Code</h2>
        <p style="font-size: 16px; color: #666;">Here is your OTP code for verification:</p>
        <div style="background-color: #f4f4f4; padding: 15px; border-radius: 5px; text-align: center; margin: 20px 0;">
          <span style="font-size: 24px; font-weight: bold; color: #333;">${otp}</span>
        </div>
        <p style="font-size: 14px; color: #666;">This code will expire in 5 minutes.</p>
        <p style="font-size: 14px; color: #666;">If you did not request this code, please ignore this email.</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
};
