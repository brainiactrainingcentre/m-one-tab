import mongoose from "mongoose";

// Define the user schema
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: [String],
    enum: ["admin", "teacher", "student", "parent"],
    default: ["student"],
    required: true,
  },
  is_verified: {
    type: Boolean,
    default: false,
  },
  avatar: {
    type: String,
    default: ""
  },
});


const getUserModel = (connection) => {
  return connection.models.User || connection.model("User", userSchema);
};

export default getUserModel;
