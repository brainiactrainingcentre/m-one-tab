import mongoose from "mongoose";

const emailVerificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    otp: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["verification", "login", "forgot_password"],
      default: "verification",
    },
    createdAt: { type: Date, default: Date.now, expires: '15m' },
  },
  { timestamps: true }
);

const getEmailVerificationModel = (connection) => {
  return connection.models.EmailVerification || 
         connection.model("EmailVerification", emailVerificationSchema);
};

export default getEmailVerificationModel;