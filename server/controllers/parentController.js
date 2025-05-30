import mongoose from "mongoose";
import bcrypt from "bcrypt";
import crypto from "crypto";
import getUserModel from "../models/userModel.js";
import getParentModel from "../models/parentModel.js";
import getStudentModel from "../models/studentModel.js";
import { getTenantDb } from "../utils/getTenantDb.js";
import 'dotenv/config';

const createParent = async (req, res) => {
  let session;
  
  try {
    const tenantId = req.tenantId; // From middleware
    
    // Get tenant database connection
    const connection = await getTenantDb(tenantId);
    const UserModel = getUserModel(connection);
    const ParentModel = getParentModel(connection);
    const StudentModel = getStudentModel(connection);
    
    // Start session on the tenant connection
    session = await connection.startSession();
    session.startTransaction();

    const {
      fatherName = "",
      motherName = "",
      password = "",
      childrenCode = [], 
      email,
      occupation = "",
      contactNumber,
      alternateNumber = "",
      address = "",
    } = req.body;
    
    // Normalize
    const normalizedData = {
      fatherName: fatherName.toLowerCase().trim(),
      motherName: motherName.toLowerCase().trim(),
      email: email.toLowerCase().trim(),
      childrenCode: childrenCode.map((code) => code.toLowerCase().trim()),
      occupation: occupation.toLowerCase().trim(),
      address: address.toLowerCase().trim(),
      contactNumber: contactNumber.trim(),
      alternateNumber: alternateNumber.trim(),
    };    

    // Comprehensive input validation
    if (!fatherName || !motherName || !email || !contactNumber || !address) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        status: "Fail",
        message: "Missing required fields",
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        status: "Fail",
        message: "Invalid email format",
      });
    }

    // Find or create user
    let user = await UserModel.findOne({ email: normalizedData.email });

    if (!user) {
      // Generate secure random password
      const salt = await bcrypt.genSalt(Number(process.env.SALT));

      // Hash password
      const hashedPassword = await bcrypt.hash(password, salt);

      user = new UserModel({
        name: fatherName,
        email: normalizedData.email,
        password: hashedPassword,
        role: ["parent"],
      });

      await user.save({ session });
    }

    // Check if parent already exists
    const existingParent = await ParentModel.findOne({ userId: user._id });
    if (existingParent) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        status: "Fail",
        message: "Parent profile already exists",
      });
    }

    // Validate student IDs
    const students = await StudentModel.find({
      studentId: { $in: normalizedData.childrenCode },
    });

    // Create parent
    const parent = new ParentModel({
      userId: user._id,
      motherName: normalizedData.motherName,
      children: students.map((student) => student._id),
      occupation: normalizedData.occupation,
      contactNumber: normalizedData.contactNumber,
      alternateNumber: normalizedData.alternateNumber,
      address: normalizedData.address,
    });

    await parent.save({ session });

    // Update students with parent ID
    await StudentModel.updateMany(
      { _id: { $in: students.map((student) => student._id) } },
      { parentId: parent._id },
      { session }
    );

    // Populate and return parent details
    const populatedParent = await ParentModel.findById(parent._id)
      .populate("userId", "name email")
      .populate("children", "name studentId")
      .session(session);

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      success: true,
      data: populatedParent,
    });
  } catch (error) {
    // Ensure session is ended
    if (session) {
      await session.abortTransaction();
      session.endSession();
    }

    // Log the full error for debugging
    console.error("Parent Creation Error:", error);

    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : {},
    });
  }
};

const getAllParents = async (req, res) => {
  try {
    const tenantId = req.tenantId; // From middleware
    
    // Get tenant database connection
    const connection = await getTenantDb(tenantId);
    const ParentModel = getParentModel(connection);

    const parents = await ParentModel.find()
      .populate("userId")
      .populate({
        path: "children",
        populate: {
          path: "classId",
          select: "name section",
        },
      });

    res.status(200).json({ success: true, data: parents });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const getParent = async (req, res) => {
  try {
    const tenantId = req.tenantId; // From middleware
    
    // Get tenant database connection
    const connection = await getTenantDb(tenantId);
    const ParentModel = getParentModel(connection);

    const parent = await ParentModel.findById(req.params.id)
      .populate("userId")
      .populate({
        path: "children",
        populate: {
          path: "classId",
          select: "name section",
        },
      });

    if (!parent) {
      return res
        .status(404)
        .json({ success: false, message: "Parent not found" });
    }

    res.status(200).json({ success: true, data: parent });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const updateParent = async (req, res) => {
  let session;
  
  try {
    const tenantId = req.tenantId; // From middleware
    
    // Get tenant database connection
    const connection = await getTenantDb(tenantId);
    const ParentModel = getParentModel(connection);
    const StudentModel = getStudentModel(connection);
    
    // Start session on the tenant connection
    session = await connection.startSession();
    session.startTransaction();

    const parentId = req.params.id;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(parentId)) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid parent ID" 
      });
    }

    // Find the parent first
    const parent = await ParentModel.findById(parentId).session(session);
    if (!parent) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ 
        success: false, 
        message: "Parent not found" 
      });
    }

    // Separate children update logic
    if (req.body.children && Array.isArray(req.body.children)) {
      // Remove parentId from previously assigned children that are no longer associated
      const childrenToRemove = parent.children.filter(
        child => !req.body.children.includes(child.toString())
      );

      if (childrenToRemove.length > 0) {
        await StudentModel.updateMany(
          { _id: { $in: childrenToRemove } },
          { $unset: { parentId: "" } },
          { session }
        );
      }

      // Assign new parentId to selected children
      await StudentModel.updateMany(
        { _id: { $in: req.body.children } },
        { parentId: parent._id },
        { session }
      );
    }

    // Prepare update object (remove children from body to handle separately)
    const updateData = { ...req.body };
    delete updateData.children;

    // Perform parent update
    const updatedParent = await ParentModel.findByIdAndUpdate(
      parentId,
      updateData,
      {
        new: true,
        runValidators: true,
        session
      }
    ).populate("userId", "name email")
     .populate("children", "studentId name");

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({ 
      success: true, 
      data: updatedParent 
    });

  } catch (error) {
    if (session) {
      await session.abortTransaction();
      session.endSession();
    }

    // Detailed error logging
    console.error('Update Parent Error:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      code: error.code
    });

    res.status(500).json({ 
      success: false, 
      message: 'Error updating parent',
      error: process.env.NODE_ENV === 'development' ? error.message : {} 
    });
  }
};

const deleteParent = async (req, res) => {
  let session;
  
  try {
    const tenantId = req.tenantId; // From middleware
    
    // Get tenant database connection
    const connection = await getTenantDb(tenantId);
    const UserModel = getUserModel(connection);
    const ParentModel = getParentModel(connection);
    const StudentModel = getStudentModel(connection);
    
    // Start session on the tenant connection
    session = await connection.startSession();
    session.startTransaction();

    const parentId = req.params.id;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(parentId)) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid parent ID" 
      });
    }

    const parent = await ParentModel.findById(parentId).session(session);
    if (!parent) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ 
        success: false, 
        message: "Parent not found" 
      });
    }

    // Remove parentId from associated children
    await StudentModel.updateMany(
      { parentId: parent._id },
      { $unset: { parentId: "" } },
      { session }
    );

    // Delete associated user
    await UserModel.findByIdAndDelete(parent.userId, { session });

    // Delete parent
    await ParentModel.findByIdAndDelete(parentId, { session });

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({ 
      success: true, 
      message: "Parent deleted successfully" 
    });

  } catch (error) {
    if (session) {
      await session.abortTransaction();
      session.endSession();
    }

    console.error('Delete Parent Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error deleting parent',
      error: process.env.NODE_ENV === 'development' ? error.message : {} 
    });
  }
};

const getChildrenDetails = async (req, res) => {
  try {
    const tenantId = req.tenantId; // From middleware
    
    // Get tenant database connection
    const connection = await getTenantDb(tenantId);
    const ParentModel = getParentModel(connection);

    const parentId = req.params.id;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(parentId)) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid parent ID" 
      });
    }

    const parent = await ParentModel.findById(parentId).populate({
      path: "children",
      populate: [
        { 
          path: "classId", 
          select: "name section" 
        },
        { 
          path: "userId", 
          select: "email" 
        }
      ]
    });

    if (!parent) {
      return res.status(404).json({ 
        success: false, 
        message: "Parent not found" 
      });
    }

    res.status(200).json({ 
      success: true, 
      data: parent.children 
    });

  } catch (error) {
    console.error('Get Children Details Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error retrieving children details',
      error: process.env.NODE_ENV === 'development' ? error.message : {} 
    });
  }
};

export default {
  createParent,
  getAllParents,
  getParent,
  updateParent,
  deleteParent,
  getChildrenDetails,
};