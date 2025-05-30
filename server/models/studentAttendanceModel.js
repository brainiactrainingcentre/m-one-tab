import mongoose from "mongoose";

const studentAttendanceSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    required: true,
    index: true,
  },
  class: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Class",
    required: true,
    index: true,
  },
  date: {
    type: Date,
    required: true,
    index: true,
  },
  dailyStatus: {
    type: String,
    enum: ["present", "absent", "late", "halfDay", "leave"],
    default: "absent",
  },
  periodAttendance: [
    {
      periodIndex: {
        type: Number,
        required: true,
      },
      subject: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Subject",
      },
      teacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Teacher",
      },
      status: {
        type: String,
        enum: ["present", "absent", "late"],
        default: "present",
      },
      remarks: String,
    },
  ],
  remarks: String,
  markedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  lastUpdatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
}, {
  timestamps: true,
});

studentAttendanceSchema.index({ student: 1, date: 1 }, { unique: true });
studentAttendanceSchema.index({ class: 1, date: 1 });

// ✅ Export as multi-tenant model getter
const getStudentAttendanceModel = (connection) => {
  return connection.models.StudentAttendance || connection.model("StudentAttendance", studentAttendanceSchema);
};

export default getStudentAttendanceModel;
