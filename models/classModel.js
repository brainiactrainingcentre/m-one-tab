import mongoose from "mongoose";

// Period schema for schedule
const periodSchema = {
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Subject",
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Teacher",
  },
  startTime: String,
  endTime: String,
};

// Main Class schema
const classSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    section: String,
    classId: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    classTeacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
    },
    Teacher: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Teacher",
      },
    ],
    students: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
      },
    ],
    subjects: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Subject",
      },
    ],
    academicYear: String,
    schedule: [
      {
        day: String,
        periods: [periodSchema],
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Export as tenant-safe getter function
const getClassModel = (connection) => {
  return connection.models.Class || connection.model("Class", classSchema);
};

export default getClassModel;
