import mongoose from "mongoose";
import bcrypt from "bcrypt";
import getUserModel from "../models/userModel.js";
import getTeacherModel from "../models/teacherModels.js";
import getClassModel from "../models/classModel.js";
import getSubjectModel from "../models/subjectModel.js";
import { getTenantDb } from "../utils/getTenantDb.js";
import 'dotenv/config';

const createTeacher = async (req, res) => {
  try {
    const { 
      name = "",
      password = "",
      email, 
      employeeId,
      // Personal Information
      title = "",
      gender = "",
      dateOfBirth,
      fatherName = "",
      qualification = "",
      // Contact Information
      contactNumber = "",
      address = "",
      // Professional Information
      designation = "",
      department = "",
      staffType = "",
      professionType = "",
      joiningDate,
      retireDate,
      salary = 0,
      // Marital Information
      maritalStatus = "",
      spouseName = "",
      spouseContactNumber = "",
      // ID Information
      aadharNumber = "",
      panNumber = "",
      // Bank Details
      accountNumber = "",
      ifscCode = "",
      bankName = "",
      // References
      subjectsCode = [], 
      classCode = []
    } = req.body;

    const tenantId = req.tenantId; // From middleware

    // Validate required inputs
    if (!email || !employeeId) {
      return res.status(400).json({
        status: "Fail", 
        message: "Email and Employee ID are required."
      });
    }

    // Get tenant database connection
    const connection = await getTenantDb(tenantId);
    const UserModel = getUserModel(connection);
    const TeacherModel = getTeacherModel(connection);
    const ClassModel = getClassModel(connection);
    const SubjectModel = getSubjectModel(connection);

    // Normalize inputs
    const normalizedData = {
      name: name?.trim().toLowerCase(),
      email: email.trim().toLowerCase(),
      employeeId: employeeId.trim(),
      title: title.trim(),
      gender: gender.trim(),
      fatherName: fatherName.trim(),
      qualification: qualification.trim(),
      contactNumber: contactNumber.trim(),
      address: address.trim(),
      designation: designation.trim(),
      department: department.trim(),
      staffType: staffType.trim(),
      professionType: professionType.trim(),
      maritalStatus: maritalStatus.trim(),
      spouseName: spouseName.trim(),
      spouseContactNumber: spouseContactNumber.trim(),
      aadharNumber: aadharNumber.trim(),
      panNumber: panNumber.trim(),
      accountNumber: accountNumber.trim(),
      ifscCode: ifscCode.trim(),
      bankName: bankName.trim(),
      subjectsCode: subjectsCode.map(code => code.trim().toLowerCase()),
      classCode: classCode.map(code => code.trim().toLowerCase()),
    };

    // Check if teacher with this email or employeeId already exists
    const existingUser = await UserModel.findOne({ email: normalizedData.email });
    const existingTeacher = await TeacherModel.findOne({ employeeId: normalizedData.employeeId });

    if (existingTeacher) {
      return res.status(400).json({
        status: "Fail",
        message: "Teacher with this Employee ID already exists."
      });
    }

    let user = existingUser;
    if (!user) {
      // Generate secure password
      const salt = await bcrypt.genSalt(Number(process.env.SALT));
      const hashedPassword = await bcrypt.hash(password, salt);

      user = new UserModel({
        name,
        email: normalizedData.email,
        password: hashedPassword,
        role: ["teacher"]
      });

      await user.save();
    }

    // Fetch subject IDs based on subject codes
    const subjects = await SubjectModel.find({ code: { $in: normalizedData.subjectsCode } });
    const subjectIds = subjects.map(subject => subject._id);

    // Find class IDs based on class codes 
    const allClasses = await ClassModel.find({ classId: { $in: normalizedData.classCode } });
    const classIds = allClasses.map(classItem => classItem._id);

    // Create the teacher record with all new fields
    const teacher = new TeacherModel({
      userId: user._id,
      employeeId: normalizedData.employeeId,
      // Personal Information
      title: normalizedData.title,
      gender: normalizedData.gender,
      dateOfBirth,
      fatherName: normalizedData.fatherName,
      qualification: normalizedData.qualification,
      // Contact Information
      contactNumber: normalizedData.contactNumber,
      address: normalizedData.address,
      // Professional Information
      designation: normalizedData.designation,
      department: normalizedData.department,
      staffType: normalizedData.staffType,
      professionType: normalizedData.professionType,
      joiningDate,
      retireDate,
      salary,
      // Marital Information
      maritalStatus: normalizedData.maritalStatus,
      spouseName: normalizedData.spouseName,
      spouseContactNumber: normalizedData.spouseContactNumber,
      // ID Information
      aadharNumber: normalizedData.aadharNumber,
      panNumber: normalizedData.panNumber,
      // Bank Details
      accountNumber: normalizedData.accountNumber,
      ifscCode: normalizedData.ifscCode,
      bankName: normalizedData.bankName,
      // References
      subjects: subjectIds,
      classes: classIds
    });

    await teacher.save();

    // Update subjects with new teacher
    await SubjectModel.updateMany(
      { _id: { $in: subjectIds } },
      { $addToSet: { teachers: teacher._id } }
    );

    // Update classes with new teacher
    await ClassModel.updateMany(
      { _id: { $in: classIds } },
      { $addToSet: { teachers: teacher._id } }
    );

    // Populate the teacher details
    const populatedTeacher = await TeacherModel.findById(teacher._id)
      .populate("userId", "name email")
      .populate("subjects", "name code")
      .populate("classes", "classId name");

    res.status(201).json({
      success: true,
      data: populatedTeacher,
    });
  } catch (error) {
    console.error("Teacher Creation Error:", error);

    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : {},
    });
  }
};

// Get all teachers
const getAllTeachers = async (req, res) => {
  try {
    const tenantId = req.tenantId; // From middleware
    
    // Get tenant database connection
    const connection = await getTenantDb(tenantId);
    const TeacherModel = getTeacherModel(connection);

    const teachers = await TeacherModel.find()
      .populate("userId", "name email role")
      .populate("subjects", "name code")
      .populate("classes", "classId name");

    res.status(200).json({
      success: true,
      count: teachers.length,
      data: teachers,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Get single teacher
const getTeacher = async (req, res) => {
  try {
    const tenantId = req.tenantId; // From middleware
    
    // Get tenant database connection
    const connection = await getTenantDb(tenantId);
    const TeacherModel = getTeacherModel(connection);

    const teacher = await TeacherModel.findById(req.params.id)
      .populate("userId", "name email")
      .populate("subjects", "name code")
      .populate("classes", "classId name");

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: "Teacher not found",
      });
    }

    res.status(200).json({
      success: true,
      data: teacher,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Update teacher
const updateTeacher = async (req, res) => {
  try {
    const teacherId = req.params.id;
    const tenantId = req.tenantId; // From middleware
    
    // Get tenant database connection
    const connection = await getTenantDb(tenantId);
    const UserModel = getUserModel(connection);
    const TeacherModel = getTeacherModel(connection);
    const ClassModel = getClassModel(connection);
    const SubjectModel = getSubjectModel(connection);
    
    // First check if the teacher record exists
    const existingTeacher = await TeacherModel.findById(teacherId);
    if (!existingTeacher) {
      return res.status(404).json({
        status: "fail",
        message: "Teacher not found"
      });
    }
    
    // Extract user-related fields to update separately
    const { name, email, subjectsCode, classCode, ...teacherFields } = req.body;
    
    // If name or email are provided, update the User document
    if (name || email) {
      const userUpdateFields = {};
      if (name) userUpdateFields.name = name;
      if (email) userUpdateFields.email = email;
      
      await UserModel.findByIdAndUpdate(
        existingTeacher.userId,
        userUpdateFields,
        { new: true, runValidators: true }
      );
    }
    
    // Handle subjects update if provided
    if (subjectsCode && Array.isArray(subjectsCode)) {
      const normalizedSubjectCodes = subjectsCode.map(code => code.trim().toLowerCase());
      
      // Get subject IDs from codes
      const subjects = await SubjectModel.find({ code: { $in: normalizedSubjectCodes } });
      const subjectIds = subjects.map(subject => subject._id);
      
      // Remove teacher from old subjects not in the new list
      await SubjectModel.updateMany(
        { _id: { $in: existingTeacher.subjects }, _id: { $nin: subjectIds } },
        { $pull: { teachers: teacherId } }
      );
      
      // Add teacher to new subjects
      await SubjectModel.updateMany(
        { _id: { $in: subjectIds } },
        { $addToSet: { teachers: teacherId } }
      );
      
      // Update teacher's subjects field
      teacherFields.subjects = subjectIds;
    }
    
    // Handle classes update if provided
    if (classCode && Array.isArray(classCode)) {
      const normalizedClassCodes = classCode.map(code => code.trim().toLowerCase());
      
      // Get class IDs from codes
      const classes = await ClassModel.find({ classId: { $in: normalizedClassCodes } });
      const classIds = classes.map(cls => cls._id);
      
      // Remove teacher from old classes not in the new list
      await ClassModel.updateMany(
        { _id: { $in: existingTeacher.classes }, _id: { $nin: classIds } },
        { $pull: { teachers: teacherId } }
      );
      
      // Add teacher to new classes
      await ClassModel.updateMany(
        { _id: { $in: classIds } },
        { $addToSet: { teachers: teacherId } }
      );
      
      // Update teacher's classes field
      teacherFields.classes = classIds;
    }
    
    // Update the teacher record with remaining fields
    const updatedTeacher = await TeacherModel.findByIdAndUpdate(
      teacherId,
      teacherFields,
      { new: true, runValidators: true }
    )
      .populate("userId", "name email")
      .populate("subjects", "name code")
      .populate("classes", "classId name");

    res.status(200).json({
      status: "success",
      data: updatedTeacher,
    });
  } catch (error) {
    console.error("Teacher Update Error:", error);
    res.status(400).json({
      status: "fail",
      message: error.message
    });
  }
};

// Delete teacher
const deleteTeacher = async (req, res) => {
  try {
    const tenantId = req.tenantId; // From middleware
    
    // Get tenant database connection
    const connection = await getTenantDb(tenantId);
    const UserModel = getUserModel(connection);
    const TeacherModel = getTeacherModel(connection);
    const ClassModel = getClassModel(connection);
    const SubjectModel = getSubjectModel(connection);

    const teacher = await TeacherModel.findById(req.params.id);

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: "Teacher not found",
      });
    }

    // Update class models to remove references to this teacher
    await ClassModel.updateMany(
      { classTeacher: teacher._id },
      { $unset: { classTeacher: 1 } }
    );

    await ClassModel.updateMany(
      { teachers: teacher._id },
      { $pull: { teachers: teacher._id } }
    );

    // Update subjects to remove references to this teacher
    await SubjectModel.updateMany(
      { teachers: teacher._id },
      { $pull: { teachers: teacher._id } }
    );

    // Delete associated user record
    await UserModel.findByIdAndDelete(teacher.userId);
    
    // Delete the teacher record
    await teacher.deleteOne();

    res.status(200).json({
      success: true,
      message: "Teacher deleted successfully",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

// Get teacher's classes
const getTeacherClasses = async (req, res) => {
  try {
    const tenantId = req.tenantId; // From middleware
    
    // Get tenant database connection
    const connection = await getTenantDb(tenantId);
    const TeacherModel = getTeacherModel(connection);

    const teacher = await TeacherModel.findById(req.params.id).populate("classes", "classId name section");

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: "Teacher not found",
      });
    }

    res.status(200).json({
      success: true,
      count: teacher.classes.length,
      data: teacher.classes,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Get teacher's subjects
const getTeacherSubjects = async (req, res) => {
  try {
    const tenantId = req.tenantId; // From middleware
    
    // Get tenant database connection
    const connection = await getTenantDb(tenantId);
    const TeacherModel = getTeacherModel(connection);

    const teacher = await TeacherModel.findById(req.params.id).populate("subjects", "name code description");

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: "Teacher not found",
      });
    }

    res.status(200).json({
      success: true,
      count: teacher.subjects.length,
      data: teacher.subjects,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

export default {
  getAllTeachers,
  createTeacher,
  getTeacher,
  updateTeacher,
  deleteTeacher,
  getTeacherClasses,
  getTeacherSubjects,
};