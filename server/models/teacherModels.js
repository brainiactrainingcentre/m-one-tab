import mongoose from "mongoose";

const teacherSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    employeeId: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
    },

    // Personal Information
    title: String,
    gender: String,
    dateOfBirth: Date,
    fatherName: String,
    qualification: String,

    // Contact Information
    contactNumber: String,
    address: String,

    // Professional Information
    designation: String,
    department: String,
    staffType: String,
    professionType: String,
    joiningDate: Date,
    retireDate: Date,
    salary: Number,

    // Marital Information
    maritalStatus: String,
    spouseName: String,
    spouseContactNumber: String,

    // ID Information
    aadharNumber: String,
    panNumber: String,

    // Bank Details
    accountNumber: String,
    ifscCode: String,
    bankName: String,

    // References
    subjects: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Subject",
      },
    ],
    classes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Class",
      },
    ],
  },
  {
    timestamps: true,
  }
);

// 📌 Indexes for performance
teacherSchema.index({ userId: 1 });
teacherSchema.index({ department: 1 });
teacherSchema.index({ designation: 1 });
teacherSchema.index({ staffType: 1 });
teacherSchema.index({ joiningDate: 1 });
teacherSchema.index({ department: 1, staffType: 1 });

// ✅ Export function for multi-tenant use
const getTeacherModel = (connection) => {
  return connection.models.Teacher || connection.model("Teacher", teacherSchema);
};

export default getTeacherModel;
