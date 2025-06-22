import mongoose from "mongoose";

const subjectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  code: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true,
  },
  description: {
    type: String,
    trim: true,
  },
  teachers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
    },
  ],
}, {
  timestamps: true,
});

// Export function to get Subject model from specific connection
const getSubjectModel = (connection) => {
  return connection.models.Subject || connection.model("Subject", subjectSchema);
};

export default getSubjectModel;
