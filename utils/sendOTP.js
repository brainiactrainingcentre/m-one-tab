// utils/sendOTP.js
import getEmailVerificationModel from "../models/EmailVerificaion.js";
import transporter from "../config/emailConfig.js";
import crypto from "crypto";

const sendOTP = async (user, connection, type = "verification") => {
  try {
    // Validate OTP type
    if (!["verification", "login", "forgot_password"].includes(type)) {
      throw new Error("Invalid OTP type");
    }
    // Use the tenant-specific connection
    const EmailVerificationModel = getEmailVerificationModel(connection);
    // Generate a random 6-digit OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    // Save the OTP to database with the specified type
    await new EmailVerificationModel({
      userId: user._id,
      otp: otp,
      type: type
    }).save();
    // Create subject and message based on type
    let subject, message;
    switch(type) {
      case "verification":
        subject = "Email Verification OTP";
        message = `
          <h1>Email Verification</h1>
          <p>Hello ${user.name},</p>
          <p>Your verification code is: <strong>${otp}</strong></p>
          <p>This code will expire in 15 minutes.</p>
        `;
        break;
      case "login":
        subject = "Login OTP";
        message = `
          <h1>Login Authentication</h1>
          <p>Hello ${user.name},</p>
          <p>Your login verification code is: <strong>${otp}</strong></p>
          <p>This code will expire in 15 minutes.</p>
          <p>If you did not request this login, please secure your account immediately.</p>
        `;
        break;
      case "forgot_password":
        subject = "Password Reset OTP";
        message = `
          <h1>Password Reset</h1>
          <p>Hello ${user.name},</p>
          <p>Your password reset code is: <strong>${otp}</strong></p>
          <p>This code will expire in 15 minutes.</p>
          <p>If you did not request a password reset, please ignore this email.</p>
        `;
        break;
    }
    // Email template
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: user.email,
      subject: subject,
      html: message
    };
    // Send email
    await transporter.sendMail(mailOptions);
    return {
      success: true,
      message: `${type.charAt(0).toUpperCase() + type.slice(1)} OTP sent successfully`,
      otp: process.env.NODE_ENV === 'development' ? otp : undefined // Only in development
    };
  } catch (error) {
    console.error(`Error sending ${type} OTP:`, error);
    return {
      success: false,
      message: `Failed to send ${type} OTP: ${error.message}`
    };
  }
};

export default sendOTP;