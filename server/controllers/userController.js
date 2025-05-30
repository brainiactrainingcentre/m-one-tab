// controllers/userController.js
import getUserModel from "../models/userModel.js";
import getEmailVerificationModel from "../models/EmailVerificaion.js";
import bcrypt from "bcrypt";
// import sendEmailVerificationByOTP from "../utils/sendEmailVerificationByOTP.js";
import transporter from "../config/emailConfig.js";
import jwt from "jsonwebtoken";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { getTenantDb } from "../utils/getTenantDb.js";
import 'dotenv/config';
import sendOTP from "../utils/sendOTP.js";

// signup user
const signup = async (req, res) => {
  try {
    const { name, email, password, role="student" } = req.body;
    const tenantId = req.tenantId; // From middleware
    
    // all field is require
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ status: "failed", message: "All fields are required" });
    }
    
    // Get tenant database connection
    const connection = await getTenantDb(tenantId);
    const UserModel = getUserModel(connection);
    
    // user already exist
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ status: "Fail", message: "User already exists" });
    }
    
    // salt
    const salt = await bcrypt.genSalt(Number(process.env.SALT));

    // hashpassword
    const hashpassword = await bcrypt.hash(password, salt);

    const newUser = await new UserModel({
      name,
      email,
      password: hashpassword,
      role,
    }).save();

    // sendEmailVerificationByOTP(req, newUser, connection);
    await sendOTP(newUser, connection, "verification");
    res.status(200).json({
      status: "success",
      message: "Your account is successfully created",
      user: { id: newUser._id, email: newUser.email },
    });
  } catch (error) {
    console.error(error);
    return res
      .status(400)
      .json({
        status: "failed",
        message: "Unable to Register, please try again later",
      });
  }
};

// get all users
const alluser = async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const connection = await getTenantDb(tenantId);
    const UserModel = getUserModel(connection);
    
    const users = await UserModel.find({}).select("-password");
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
//verifyEmail
const verifyEmail = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const tenantId = req.tenantId;

    if (!email || !otp) {
      return res.status(400).json({
        status: "failed",
        message: "All fields are required",
      });
    }

    // Get tenant database connection
    const connection = await getTenantDb(tenantId);
    const UserModel = getUserModel(connection);
    const EmailVerificationModel = getEmailVerificationModel(connection);

    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(400).json({
        status: "failed",
        message: "Email does not exist",
      });
    }

    if (user.is_verified) {
      return res.status(400).json({
        status: "failed",
        message: "This email is already verified",
      });
    }

    const emailVerification = await EmailVerificationModel.findOne({
      userId: user._id,
      otp,
    });

    if (!emailVerification) {
      await sendOTP(user, connection, "verification");
      return res.status(400).json({
        status: "failed",
        message: "Invalid OTP. A new OTP has been sent to your email.",
      });
    }

    const currentTime = new Date();
    const expirationTime = new Date(
      emailVerification.createdAt.getTime() + 15 * 60 * 1000
    );

    if (currentTime > expirationTime) {
      await sendOTP(user, connection, "verification");
      return res.status(400).json({
        status: "failed",
        message: "OTP expired. A new OTP has been sent to your email.",
      });
    }

    user.is_verified = true;
    await user.save();

    await EmailVerificationModel.deleteMany({ userId: user._id });

    return res.status(200).json({
      status: "success",
      message: "Email verified successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: "failed",
      message: "An error occurred while verifying the email.",
    });
  }
};


// User Login
const Login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const tenantId = req.tenantId;
    
    // All field is require
    if (!email || !password) {
      return res
        .status(400)
        .json({ status: "fail to login", message: "All fields are required" });
    }
    
    // Get tenant database connection
    const connection = await getTenantDb(tenantId);
    const UserModel = getUserModel(connection);
    
    // Email is exist or not
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({
          status: "Fail to login",
          message: "Email or password is not valid",
        });
    }

    // Check the user password is match or not
    const isMatch = await bcrypt.compare(password, user.password);
    //if password is not match
    if (!isMatch) {
      return res
        .status(400)
        .json({ status: "Fail to login", message: "Password is not valid" });
    }
    
    // Generate token with tenant information
    const tokenExp = Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60;
    const token = jwt.sign(
      {
        id: user._id,
        roles: user.role[0],
        tenantId: tenantId, // Include tenantId in the token
        exp: tokenExp,
      },
      process.env.JWT_SECRET_KEY
    );

    // Send response
    res.status(200).json({
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        roles: user.role[0],
        avatar: user.avatar,
      },
      status: "success",
      message: "Login successful",
      token,
      token_exp: tokenExp,
      is_auth: true,
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({ status: "Fail to login", message: error.message });
  }
};

// profile
const userProfile = async (req, res) => {
  res.send({ user: req.user });
};

// Change Password
// Merged function for password change, token-based reset, and OTP-based reset
const updatePassword = async (req, res) => {
  try {
    // Determine which authentication flow we're using
    const isTokenReset = req.params.id && req.params.token;
    const isOtpReset = req.body.email && req.body.otp;
    const isChangePassword = !isTokenReset && !isOtpReset;
    
    // Get common data
    const { password, confirm_password } = req.body;
    let userId, tenantId, connection, UserModel;
    
    // Validate passwords
    if (!password || !confirm_password) {
      return res.status(400).json({ 
        status: "failed", 
        message: "All fields are required" 
      });
    }
    
    if (password !== confirm_password) {
      return res.status(400).json({ 
        status: "failed", 
        message: "Passwords do not match" 
      });
    }
    
    // Handle different authentication flows
    if (isTokenReset) {
      // For token-based password reset flow
      userId = req.params.id;
      tenantId = req.tenantId; // From tenant middleware
      
      // Get tenant database connection
      connection = await getTenantDb(tenantId);
      UserModel = getUserModel(connection);
      
      // Find user by ID
      const user = await UserModel.findById(userId);
      if (!user) {
        return res.status(404).json({ 
          status: "failed", 
          message: "User not found" 
        });
      }
      
      // Validate token
      try {
        const token = req.params.token;
        const new_secret = user._id + process.env.JWT_ACCESS_TOKEN_SECRET_KEY;
        const decoded = jwt.verify(token, new_secret);
        
        // Verify tenant ID in token matches the requested tenant
        if (decoded.tenantId !== tenantId) {
          return res.status(401).json({ 
            status: "failed", 
            message: "Invalid token for this tenant" 
          });
        }
      } catch (error) {
        if (error.name === "TokenExpiredError") {
          return res.status(400).json({
            status: "failed",
            message: "Token expired. Please request a new password reset link.",
          });
        }
        return res.status(401).json({ 
          status: "failed", 
          message: "Invalid or expired token" 
        });
      }
    } 
    else if (isOtpReset) {
      // For OTP-based password reset flow
      const { email, otp } = req.body;
      tenantId = req.tenantId; // From tenant middleware
      
      // Validate required fields
      if (!email || !otp) {
        return res.status(400).json({
          status: "failed",
          message: "Email and OTP are required"
        });
      }
      
      // Get tenant database connection
      connection = await getTenantDb(tenantId);
      UserModel = getUserModel(connection);
      const EmailVerificationModel = getEmailVerificationModel(connection);
      
      // Find user by email
      const user = await UserModel.findOne({ email });
      if (!user) {
        return res.status(404).json({
          status: "failed",
          message: "User not found with this email"
        });
      }
      
      // Find OTP for this user
      const otpRecord = await EmailVerificationModel.findOne({
        userId: user._id,
        otp,
        type: "forgot_password" // This type should be used when sending the OTP
      });
      
      if (!otpRecord) {
        return res.status(400).json({
          status: "failed",
          message: "Invalid OTP"
        });
      }
      
      // Check if OTP is expired (15 minutes)
      const currentTime = new Date();
      const expirationTime = new Date(
        otpRecord.createdAt.getTime() + 15 * 60 * 1000
      );
      
      if (currentTime > expirationTime) {
        return res.status(400).json({
          status: "failed",
          message: "OTP expired. Please request a new OTP."
        });
      }
      
      // Set userId for password update
      userId = user._id;
      
      // Remove the used OTP
      await EmailVerificationModel.deleteOne({ _id: otpRecord._id });
    } 
    else {
      // For change password flow (authenticated user)
      userId = req.user._id;
      tenantId = req.user.tenantId; // From auth middleware
      
      // Get connection for authenticated user
      connection = await getTenantDb(tenantId);
      UserModel = getUserModel(connection);
    }
    
    // Common code for all flows - update the password
    // If connection isn't set yet (should only happen in change password flow)
    if (!connection) {
      connection = await getTenantDb(tenantId);
      UserModel = getUserModel(connection);
    }
    
    // Generate salt and hash new password
    const salt = await bcrypt.genSalt(Number(process.env.SALT) || 10);
    const hashPassword = await bcrypt.hash(password, salt);
    
    // Update user's password
    await UserModel.findByIdAndUpdate(userId, {
      $set: { password: hashPassword },
    });
    
    // Send success response with appropriate message
    let message = "Password updated successfully";
    if (isTokenReset) message = "Password reset successfully";
    if (isOtpReset) message = "Password reset with OTP successfully";
    if (isChangePassword) message = "Password changed successfully";
    
    res.status(200).json({ 
      status: "success", 
      message: message
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "failed",
      message: "Unable to update password, please try again later",
    });
  }
};


// Export as functions to maintain backwards compatibility with existing routes
const changePassword = (req, res) => updatePassword(req, res);
const resetPassword = (req, res) => updatePassword(req, res);
const resetPasswordWithOTP = (req, res) => updatePassword(req, res);





 // Add to requestOTP
const requestOTP = async (req, res) => {
  try {
    const { email, type = "verification" } = req.body;
    const tenantId = req.tenantId;
    
    // Validate OTP type
    if (!["verification", "login", "forgot_password"].includes(type)) {
      return res.status(400).json({ 
        status: "failed", 
        message: "Invalid OTP type. Must be 'verification', 'login', or 'forgot_password'" 
      });
    }
    
    if (!email) {
      return res.status(400).json({ status: "failed", message: "Email is required" });
    }
    
    // Get tenant database connection
    const connection = await getTenantDb(tenantId);
    const UserModel = getUserModel(connection);
    
    // Find user by email
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ status: "failed", message: "User not found" });
    }
    
    // Send OTP based on type
    const result = await sendOTP(user, connection, type);
    
    if (result.success) {
      const response = { 
        status: "success", 
        message: result.message 
      };
      
      // Only include OTP in development environment for testing
      if (process.env.NODE_ENV === 'development' && result.otp) {
        response.otp = result.otp;
      }
      
      return res.status(200).json(response);
    } else {
      return res.status(500).json({ status: "failed", message: result.message });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ 
      status: "failed", 
      message: "Failed to send OTP. Please try again later." 
    });
  }
};


// update profile image
const updateProfileImage = async (req, res) => {
  try {
    // Check if file exists
    if (!req.file) {
      return res
        .status(400)
        .json({ status: "failed", message: "No image file uploaded" });
    }

    // Check if auth middleware is extracting user info correctly
    if (!req.user || !req.user._id) {
      return res
        .status(401)
        .json({ status: "failed", message: "User authentication required" });
    }
    
    const tenantId = req.user.tenantId;
    const connection = await getTenantDb(tenantId);
    const UserModel = getUserModel(connection);

    // Upload to cloudinary
    const cloudinaryResponse = await uploadOnCloudinary(req.file.path);

    if (!cloudinaryResponse) {
      return res
        .status(500)
        .json({
          status: "failed",
          message: "Failed to upload image to cloud storage",
        });
    }

    // Update user with new avatar URL
    const updatedUser = await UserModel.findByIdAndUpdate(
      req.user._id,
      { avatar: cloudinaryResponse.url },
      { new: true }
    ).select("-password");

    return res.status(200).json({
      status: "success",
      message: "Profile image updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error updating profile image:", error);
    return res
      .status(500)
      .json({ status: "failed", message: "Failed to update profile image" });
  }
};
// loginWithOtp
const loginWithOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const { tenantId } = req;

    if (!email || !otp) {
      return res.status(400).json({ status: "failed", message: "Email and OTP are required" });
    }

    const connection = await getTenantDb(tenantId);
    const UserModel = getUserModel(connection);
    const EmailVerificationModel = getEmailVerificationModel(connection);

    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ status: "failed", message: "User not found" });
    }

    const otpRecord = await EmailVerificationModel.findOne({ userId: user._id, otp, type: "login" });

    if (!otpRecord || isOtpExpired(otpRecord)) {
      await sendOTP(user, connection, "login");
      return res.status(400).json({
        status: "failed",
        message: "Invalid or expired OTP. New OTP sent.",
      });
    }

    // OTP valid, login user
    const tokenExp = Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60;
    const token = jwt.sign(
      { id: user._id, roles: user.role[0], tenantId, exp: tokenExp },
      process.env.JWT_SECRET_KEY
    );

    await EmailVerificationModel.deleteMany({ userId: user._id, type: "login" });

    res.status(200).json({
      user: { id: user._id, email: user.email, name: user.name, roles: user.role[0] },
      status: "success",
      message: "Login successful with OTP",
      token,
      token_exp: tokenExp,
      is_auth: true,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "failed", message: "OTP login failed" });
  }
};


export default {
  updateProfileImage,
  signup,
  alluser,
  verifyEmail,
  Login,
  userProfile,
  changePassword,
  resetPassword,
  resetPasswordWithOTP,
  requestOTP,
  loginWithOTP,
};