

/*
import mongoose from "mongoose";

const studentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
  studentId: {
    type: String,
    required: true,
    lowercase: true,
  },
  rollNumber: String,
  dateOfBirth: Date,
  gender: {
    type: String,
    enum: ["male", "female", "other"],
    default: "male",
  },
  bloodGroup: String,
  address: String,
  contactNumber: String,
  religion: {
    type: String,
    enum: ["hindu", "muslim", "christian", "sikh", "buddhist", "jain", "other"],
    default: "hindu",
  },
  caste: String,
  socialCategory: {
    type: String,
    enum: ["general", "obc", "sc", "st"],
    default: "general",
  },
  minorityStatus: {
    type: Boolean,
    default: false,
  },
  hasDisability: {
    type: Boolean,
    default: false,
  },
  disabilityDetails: String,
  rteAdmission: {
    type: Boolean,
    default: false,
  },
  previousSchoolName: String,
  previousClassPassed: String,
  previousClassMarks: Number,
  reportCardUpload: String,
  admissionClass: String,
  classId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Class",
  },
  section: String,
  academicYear: String,
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  modeOfTransport: {
    type: String,
    enum: ["school_van", "self_arrangement", "public_transport", "walking"],
    default: "self_arrangement",
  },
  medicalIssues: String,
  admissionDate: {
    type: Date,
    default: Date.now,
  },
  siblingsInSchool: [
    {
      name: String,
      class: String,
      section: String,
      studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
      },
    },
  ],
  isActive: {
    type: Boolean,
    default: true,
  },
  attendanceRecords: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Attendance",
    },
  ],
  feeRecords: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Fee",
    },
  ],
}, {
  timestamps: true,
});

// Indexes
studentSchema.index({ classId: 1, section: 1, academicYear: 1 });
studentSchema.index({ studentId: 1 });
studentSchema.index({ religion: 1, socialCategory: 1 });
studentSchema.index({ admissionClass: 1, academicYear: 1 });
studentSchema.index({ rteAdmission: 1 });

// Multi-tenant export
const getStudentModel = (connection) => {
  return connection.models.Student || connection.model("Student", studentSchema);
};

export default getStudentModel;



*/



// File: models/studentModel.js
import mongoose from "mongoose";

const studentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
  studentId: {
    type: String,
    required: true,
    lowercase: true,
  },
  rollNumber: String,
  dateOfBirth: Date,
  gender: {
    type: String,
    enum: ["male", "female", "other"],
    default: "male",
  },
  bloodGroup: String,
  address: String,
  contactNumber: String,
  religion: {
    type: String,
    enum: ["hindu", "muslim", "christian", "sikh", "buddhist", "jain", "other"],
    default: "hindu",
  },
  caste: String,
  socialCategory: {
    type: String,
    enum: ["general", "obc", "sc", "st"],
    default: "general",
  },
  minorityStatus: {
    type: Boolean,
    default: false,
  },
  hasDisability: {
    type: Boolean,
    default: false,
  },
  disabilityDetails: String,
  rteAdmission: {
    type: Boolean,
    default: false,
  },
  previousSchoolName: String,
  previousClassPassed: String,
  previousClassMarks: Number,
  reportCardUpload: String,
  admissionClass: {
    type: String,
    enum: ["nursery", "lkg", "ukg", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"],
    default: "1"
  },
  classId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Class",
    required: true
  },
  section: String,
  academicYear: String,
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  modeOfTransport: {
    type: String,
    enum: ["school_van", "self_arrangement", "public_transport", "walking"],
    default: "self_arrangement",
  },
  medicalIssues: String,
  admissionDate: {
    type: Date,
    default: Date.now,
  },
  siblingsInSchool: [
    {
      name: String,
      class: String,
      section: String,
      studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
      },
    },
  ],
  isActive: {
    type: Boolean,
    default: true,
  },
  attendanceRecords: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Attendance",
    },
  ],
  feeRecords: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Fee",
    },
  ],
  isDeleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
});

// Indexes
studentSchema.index({ classId: 1, section: 1, academicYear: 1 });
studentSchema.index({ studentId: 1 });
studentSchema.index({ religion: 1, socialCategory: 1 });
studentSchema.index({ admissionClass: 1, academicYear: 1 });
studentSchema.index({ rteAdmission: 1 });

// Multi-tenant export
const getStudentModel = (connection) => {
  return connection.models.Student || connection.model("Student", studentSchema);
};

export default getStudentModel;
