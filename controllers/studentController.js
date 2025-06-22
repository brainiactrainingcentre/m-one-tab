// controllers/studentController.js
import getStudentModel from "../models/studentModel.js";
import getClassModel from "../models/classModel.js";
import getUserModel from "../models/userModel.js";
import getFeeCategoryModel from "../models/feeModel.js";
import bcrypt from "bcrypt";
import { getTenantDb } from "../utils/getTenantDb.js";
import 'dotenv/config';

// Create new student
const createStudent = async (req, res) => {
  try {
    const tenantId = req.tenantId; // From middleware
    
    // Get tenant database connection
    const connection = await getTenantDb(tenantId);
    const StudentModel = getStudentModel(connection);
    const ClassModel = getClassModel(connection);
    const UserModel = getUserModel(connection);
    const FeeCategoryModel = getFeeCategoryModel(connection);
    
    const {
      firstName = "",
      middleName = "",
      lastName = "",
      password = "",
      email,
      studentId,
      dateOfBirth,
      gender,
      classCode,
      section,
      parentEmailId = "",
      address,
      contactNumber = "",
      guardianContact = "",
      bloodGroup,
      academicYear,
      rollNumber = "",
      admissionDate = new Date(),
      feeCategory = null,
      // New fields from improved schema
      religion = null,
      caste = null,
      socialCategory = null,
      minorityStatus = false,
      hasDisability = false,
      disabilityDetails = "",
      rteAdmission = false,
      previousSchoolName = null,
      previousClassPassed = null,
      previousClassMarks = null,
      reportCardUpload = null,
      modeOfTransport = null,
      medicalIssues = "",
      siblingsInSchool = []
    } = req.body;

    // Process and normalize inputs
    const normalizedData = {
      firstName: firstName.toLowerCase().trim(),
      middleName: middleName.toLowerCase().trim(),
      lastName: lastName.toLowerCase().trim(),
      email: email ? email.toLowerCase().trim() : null,
      studentId: studentId ? studentId.toLowerCase().trim() : null,
      gender: gender ? gender.toLowerCase().trim() : null,
      classCode: classCode ? classCode.toLowerCase().trim() : null,
      section: section ? section.toLowerCase().trim() : null,
      parentEmailId: parentEmailId.toLowerCase().trim(),
      address: address ? address.toLowerCase().trim() : null,
      contactNumber: contactNumber.trim(),
      guardianContact: guardianContact.trim(),
      bloodGroup: bloodGroup ? bloodGroup.toLowerCase().trim() : null,
      academicYear: academicYear ? academicYear.toLowerCase().trim() : null,
      rollNumber: rollNumber.trim(),
      religion: religion ? religion.toLowerCase().trim() : null,
      caste: caste ? caste.toLowerCase().trim() : null,
      socialCategory: socialCategory ? socialCategory.toLowerCase().trim() : null,
      previousSchoolName: previousSchoolName ? previousSchoolName.toLowerCase().trim() : null,
      previousClassPassed: previousClassPassed ? previousClassPassed.toLowerCase().trim() : null,
      modeOfTransport: modeOfTransport ? modeOfTransport.toLowerCase().trim() : null,
      medicalIssues: medicalIssues ? medicalIssues.trim() : ""
    };

    // Validation: Check if required fields are provided
    if (
      !normalizedData.email ||
      !normalizedData.studentId ||
      !dateOfBirth ||
      !normalizedData.classCode ||
      !normalizedData.section
    ) {
      return res
        .status(400)
        .json({ status: "fail", message: "missing required fields" });
    }

    // Check if student already exists
    const existingStudent = await StudentModel.findOne({ 
      studentId: normalizedData.studentId 
    });
    
    if (existingStudent) {
      return res.status(400).json({
        status: "fail",
        message: "student with this student id already exists."
      });
    }

    // Find class object id by classId
    const findClass = await ClassModel.findOne({
      classId: normalizedData.classCode
    });
    
    const classId = findClass ? findClass._id : null;
    
    // if (!classId) {
    //   return res.status(400).json({
    //     status: "fail",
    //     message: "invalid class code"
    //   });
    // }

    // Check if the Parent already exists
    let parentUserId = null;
    let parentId = null;
    
    if (normalizedData.parentEmailId) {
      parentUserId = await UserModel.findOne({ 
        email: normalizedData.parentEmailId 
      });
      parentId = parentUserId ? parentUserId._id : null;
    }

    // Check if the user already exists
    let user = await UserModel.findOne({ email: normalizedData.email });
    
    if (!user) {
      let name = [
        normalizedData.firstName, 
        normalizedData.middleName, 
        normalizedData.lastName
      ].filter(Boolean).join(" ").toLowerCase().trim();
      
      const salt = await bcrypt.genSalt(Number(process.env.SALT));
      const hashedPassword = await bcrypt.hash(password, salt);
      
      user = await new UserModel({
        name,
        email: normalizedData.email,
        password: hashedPassword,
        role: ["student"], // Updated to match user model structure
      }).save();
    }
    
    let feeCategoryId = null;
    if (feeCategory) {
      const feeCategoryDoc = await FeeCategoryModel.findOne({ 
        name: feeCategory.toLowerCase().trim() 
      });
      feeCategoryId = feeCategoryDoc ? feeCategoryDoc._id : null;
    }
    
    const processedSiblings = Array.isArray(siblingsInSchool) ? 
      siblingsInSchool.map(sibling => ({
        name: sibling.name ? sibling.name.toLowerCase().trim() : "",
        class: sibling.class ? sibling.class.toLowerCase().trim() : "",
        section: sibling.section ? sibling.section.toLowerCase().trim() : "",
        studentId: sibling.studentId || null
      })) : [];

    const student = await StudentModel.create({
      userId: user._id,
      studentId: normalizedData.studentId,
      dateOfBirth,
      gender: normalizedData.gender,
      classId,
      section: normalizedData.section,
      parentId,
      address: normalizedData.address,
      contactNumber: normalizedData.contactNumber,
      guardianContact: normalizedData.guardianContact,
      bloodGroup: normalizedData.bloodGroup,
      academicYear: normalizedData.academicYear,
      isActive: true,
      rollNumber: normalizedData.rollNumber,
      admissionDate,
      attendanceRecords: [],
      feeRecords: [],
      feeCategory: feeCategoryId,
      religion: normalizedData.religion,
      caste: normalizedData.caste,
      socialCategory: normalizedData.socialCategory,
      minorityStatus,
      hasDisability,
      disabilityDetails,
      rteAdmission,
      previousSchoolName: normalizedData.previousSchoolName,
      previousClassPassed: normalizedData.previousClassPassed,
      previousClassMarks,
      reportCardUpload,
      admissionClass: normalizedData.classCode,
      modeOfTransport: normalizedData.modeOfTransport,
      medicalIssues: normalizedData.medicalIssues,
      siblingsInSchool: processedSiblings
    });

    res.status(201).json({ 
      success: true, 
      data: student 
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({ 
      success: false, 
      error: error.message.toLowerCase() 
    });
  }
};

// Get all students
const getAllStudents = async (req, res) => {
  try {
    const tenantId = req.tenantId;
    
    // Get tenant database connection
    const connection = await getTenantDb(tenantId);
    const StudentModel = getStudentModel(connection);
      getClassModel(connection);
      getUserModel(connection);
      getFeeCategoryModel(connection);
    const students = await StudentModel.find()
    .populate("userId", "name email role")
    .populate({
      path: "classId",
      select: "name section", 
      strictPopulate: false, 
    })
    .populate({
      path: "parentId",
      select: "name email",
      strictPopulate: false, 
    })
    .populate({
      path: "feeCategory",
      select: "name amount",
      strictPopulate: false,
    })
    .populate({
      path: "siblingsInSchool.studentId",
      select: "studentId",
      strictPopulate: false,
    });
    
    res.status(200).json({ success: true, data: students });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get a single student by ID
const getStudent = async (req, res) => {
  try {
    const tenantId = req.tenantId;
    
    // Get tenant database connection
    const connection = await getTenantDb(tenantId);
    const StudentModel = getStudentModel(connection);
    getClassModel(connection);
      getUserModel(connection);
      getFeeCategoryModel(connection);
    const student = await StudentModel.findById(req.params.id)
    .populate("userId", "name email role")
    .populate({
      path: "classId",
      select: "name section",
      strictPopulate: false, 
    })
    .populate({
      path: "parentId",
      select: "name email",
      strictPopulate: false, 
    })
    .populate({
      path: "feeCategory",
      select: "name amount",
      strictPopulate: false,
    })
    // Populate sibling references
    .populate({
      path: "siblingsInSchool.studentId",
      select: "studentId",
      strictPopulate: false,
    });

    if (!student) {
      return res
        .status(404)
        .json({ success: false, message: "Student not found" });
    }

    res.status(200).json({ success: true, data: student });
  } catch (error) {
    console.error(error);

    // Handle invalid MongoDB ID error
    if (error.name === "CastError") {
      return res
        .status(400)
        .json({ success: false, message: "Invalid student ID" });
    }

    res.status(500).json({ success: false, error: error.message });
  }
};

// Update student
const updateStudent = async (req, res) => {
  try {
    const tenantId = req.tenantId;
    
    // Get tenant database connection
    const connection = await getTenantDb(tenantId);
    const StudentModel = getStudentModel(connection);
    const ClassModel = getClassModel(connection);
    const UserModel = getUserModel(connection);
    const FeeCategoryModel = getFeeCategoryModel(connection);
    
    // Handle normalized fields for update
    const updateData = { ...req.body };
    
    // List of string fields to normalize if they exist in the update
    const fieldsToNormalize = [
      'religion', 'caste', 'socialCategory', 'previousSchoolName', 
      'previousClassPassed', 'modeOfTransport', 'medicalIssues'
    ];
    
    // Normalize string fields if they exist
    fieldsToNormalize.forEach(field => {
      if (updateData[field]) {
        updateData[field] = updateData[field].toLowerCase().trim();
      }
    });
    
    // Process siblings data if provided
    if (Array.isArray(updateData.siblingsInSchool)) {
      updateData.siblingsInSchool = updateData.siblingsInSchool.map(sibling => ({
        name: sibling.name ? sibling.name.toLowerCase().trim() : "",
        class: sibling.class ? sibling.class.toLowerCase().trim() : "",
        section: sibling.section ? sibling.section.toLowerCase().trim() : "",
        studentId: sibling.studentId || null
      }));
    }

    const updatedStudent = await StudentModel.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate("userId", "name email role")
    .populate({
      path: "classId",
      select: "name section",
      strictPopulate: false,
    })
    .populate({
      path: "parentId", 
      select: "name email",
      strictPopulate: false,
    })
    .populate({
      path: "feeCategory",
      select: "name amount",
      strictPopulate: false,
    });

    if (!updatedStudent) {
      return res
        .status(404)
        .json({ success: false, message: "Student not found" });
    }
    res.status(200).json({ success: true, data: updatedStudent });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Delete student
const deleteStudent = async (req, res) => {
  try {
    const tenantId = req.tenantId;
    
    // Get tenant database connection
    const connection = await getTenantDb(tenantId);
    const StudentModel = getStudentModel(connection);
    
    const student = await StudentModel.findByIdAndDelete(req.params.id);
    if (!student) {
      return res
        .status(404)
        .json({ success: false, message: "Student not found" });
    }
    res
      .status(200)
      .json({ success: true, message: "Student deleted successfully" });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Get students by class - with simplified data
const getStudentsByClass = async (req, res) => {
  try {
    const tenantId = req.tenantId;
    
    // Get tenant database connection
    const connection = await getTenantDb(tenantId);
    const StudentModel = getStudentModel(connection);
    getClassModel(connection);
      getUserModel(connection);
      getFeeCategoryModel(connection);
    // Find students by classId and populate only necessary fields
    const students = await StudentModel.find({
      classId: req.params.classId,
    }).populate({
      path: "userId",
      select: "name email role" // Only select needed fields from userId
    }).populate({
      path: "classId",
      select: "name section classId" // Only select needed fields from classId 
    }).populate({
      path: "parentId",
      select: "name email" // Only select needed fields from parentId
    });
    
    // Map the results to include only the fields you need
    const simplifiedStudents = students.map(student => {
      return {
        _id: student._id,
        studentId: student.studentId,
        name: student.userId ? student.userId.name : null,
        email: student.userId ? student.userId.email : null,
        dateOfBirth: student.dateOfBirth,
        gender: student.gender,
        className: student.classId ? student.classId.name : null,
        section: student.section,
        parentName: student.parentId ? student.parentId.name : null,
        address: student.address,
        contactNumber: student.contactNumber,
        bloodGroup: student.bloodGroup,
        academicYear: student.academicYear,
        isActive: student.isActive,
        admissionDate: student.admissionDate
      };
    });
    
    res.status(200).json({ success: true, data: simplifiedStudents });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get students by demographic data (religion, social category)
const getStudentsByDemographics = async (req, res) => {
  try {
    const tenantId = req.tenantId;
    
    // Get tenant database connection
    const connection = await getTenantDb(tenantId);
    const StudentModel = getStudentModel(connection);
    getClassModel(connection);
      getUserModel(connection);
    const { religion, socialCategory, minorityStatus, rteAdmission } = req.query;
    
    const queryFilters = {};
    if (religion) queryFilters.religion = religion.toLowerCase().trim();
    if (socialCategory) queryFilters.socialCategory = socialCategory.toLowerCase().trim();
    if (minorityStatus !== undefined) queryFilters.minorityStatus = minorityStatus === 'true';
    if (rteAdmission !== undefined) queryFilters.rteAdmission = rteAdmission === 'true';
    
    const students = await StudentModel.find(queryFilters)
      .populate("userId", "name email")
      .populate("classId", "name section");
      
    res.status(200).json({ 
      success: true, 
      count: students.length,
      data: students 
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get students by transport mode
const getStudentsByTransport = async (req, res) => {
  try {
    const tenantId = req.tenantId;
    
    // Get tenant database connection
    const connection = await getTenantDb(tenantId);
    const StudentModel = getStudentModel(connection);
    getClassModel(connection);
      getUserModel(connection);
    const { mode } = req.params;
    
    const students = await StudentModel.find({
      modeOfTransport: mode.toLowerCase().trim()
    })
    .populate("userId", "name email")
    .populate("classId", "name section");
    
    res.status(200).json({ 
      success: true, 
      count: students.length,
      data: students 
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get students with disability
const getStudentsWithDisability = async (req, res) => {
  try {
    const tenantId = req.tenantId;
    
    // Get tenant database connection
    const connection = await getTenantDb(tenantId);
    const StudentModel = getStudentModel(connection);
    getClassModel(connection);
      getUserModel(connection);
    const students = await StudentModel.find({
      hasDisability: true
    })
    .populate("userId", "name email")
    .populate("classId", "name section");
    
    res.status(200).json({ 
      success: true, 
      count: students.length,
      data: students 
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get students by admission class and year
const getStudentsByAdmission = async (req, res) => {
  try {
    const tenantId = req.tenantId;
    
    // Get tenant database connection
    const connection = await getTenantDb(tenantId);
    const StudentModel = getStudentModel(connection);
    getClassModel(connection);
      getUserModel(connection);
    const { admissionClass, academicYear } = req.query;
    
    const queryFilters = {};
    if (admissionClass) queryFilters.admissionClass = admissionClass.toLowerCase().trim();
    if (academicYear) queryFilters.academicYear = academicYear.toLowerCase().trim();
    
    const students = await StudentModel.find(queryFilters)
      .populate("userId", "name email")
      .populate("classId", "name section");
      
    res.status(200).json({ 
      success: true, 
      count: students.length,
      data: students 
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Placeholder for future implementations
const getStudentAttendance = async (req, res) => {
  try {
    // Implementation for attendance using tenant-specific data
    const tenantId = req.tenantId;
    const connection = await getTenantDb(tenantId);
    // Continue with implementation
    
    res.status(501).json({ message: "Not implemented yet" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const getStudentResults = async (req, res) => {
  try {
    // Implementation for results using tenant-specific data
    const tenantId = req.tenantId;
    const connection = await getTenantDb(tenantId);
    // Continue with implementation
    
    res.status(501).json({ message: "Not implemented yet" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const getStudentFees = async (req, res) => {
  try {
    // Implementation for fees using tenant-specific data
    const tenantId = req.tenantId;
    const connection = await getTenantDb(tenantId);
    // Continue with implementation
    
    res.status(501).json({ message: "Not implemented yet" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export default {
  getAllStudents,
  createStudent,
  getStudent,
  updateStudent,
  deleteStudent,
  getStudentAttendance,
  getStudentResults,
  getStudentFees,
  getStudentsByClass,
  getStudentsByDemographics,
  getStudentsByTransport,
  getStudentsWithDisability,
  getStudentsByAdmission
};