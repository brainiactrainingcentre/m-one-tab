import mongoose from "mongoose";

const staffAttendanceSchema = new mongoose.Schema({
  staff: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  date: {
    type: Date,
    required: true,
    index: true,
  },
  academicYear: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["present", "absent", "late", "halfDay", "leave"],
    default: "absent",
  },
  checkInTime: Date,
  checkOutTime: Date,
  workingHours: Number,
  leaveType: {
    type: String,
    enum: ["casual", "medical", "earned", "unpaid", "other"],
  },
  leaveReason: String,
  leaveApplication: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "LeaveApplication",
  },
  substitutedClasses: [
    {
      class: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Class",
      },
      periodIndex: Number,
      subject: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Subject",
      },
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

staffAttendanceSchema.index({ staff: 1, date: 1 }, { unique: true });

// ✅ Export as a function for multi-tenant use
const getStaffAttendanceModel = (connection) => {
  return connection.models.StaffAttendance || connection.model("StaffAttendance", staffAttendanceSchema);
};

export default getStaffAttendanceModel;
