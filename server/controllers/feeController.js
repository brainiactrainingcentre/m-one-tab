import getFeeModel from '../models/feeModel.js';
import getStudentModel from '../models/studentModel.js';
import getUserModel from '../models/userModel.js';
import { getTenantDb } from '../utils/getTenantDb.js';
import 'dotenv/config';

// Get all fees
const getAllFees = async (req, res) => {
  try {
    const tenantId = req.tenantId;
    
    // Get tenant database connection
    const connection = await getTenantDb(tenantId);
    const Fee = getFeeModel(connection);
    
    const fees = await Fee.find()
      .populate({
        path: 'student',
        select: ' studentId class',
        populate: [
          {
            path: 'userId',
            select: 'name'
          },
          // {
          //   path: 'classId',
          //   select: 'name section'
          // }
        ]
      });

    res.status(200).json({
      success: true,
      data: fees
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Create new fee record
const createFee = async (req, res) => {
  try {
    const tenantId = req.tenantId;
    
    // Get tenant database connection
    const connection = await getTenantDb(tenantId);
    const Fee = getFeeModel(connection);
    
    const fee = await Fee.create({
      student: req.body.student,
      amount: req.body.amount,
      type: req.body.type,
      dueDate: req.body.dueDate,
      status: req.body.status || 'pending',
      paymentDate: req.body.paymentDate,
      paymentMethod: req.body.paymentMethod,
      transactionId: req.body.transactionId
    });

    const populatedFee = await Fee.findById(fee._id)
      .populate({
        path: 'student',
        select: 'studentId class',
        populate: [
          {
            path: 'userId',
            select: 'name'
          },
          // {
          //   path: 'classId',
          //   select: 'name section' 
          // }
        ]
      });

    res.status(201).json({
      success: true,
      data: populatedFee
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// Get single fee record
const getFee = async (req, res) => {
  try {
    const tenantId = req.tenantId;
    
    // Get tenant database connection
    const connection = await getTenantDb(tenantId);
    const Fee = getFeeModel(connection);
    
    const fee = await Fee.findById(req.params.id)
      .populate({
        path: 'student',
        select: 'name studentId class',
        populate: [
          {
            path: 'userId',
            select: 'name'
          },
          // {
          //   path: 'classId',
          //   select: 'name section' 
          // }
        ]
      });

    if (!fee) {
      return res.status(404).json({
        success: false,
        message: 'Fee record not found'
      });
    }

    res.status(200).json({
      success: true,
      data: fee
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Update fee record
const updateFee = async (req, res) => {
  try {
    const tenantId = req.tenantId;
    
    // Get tenant database connection
    const connection = await getTenantDb(tenantId);
    const Fee = getFeeModel(connection);
    
    const updatedFee = await Fee.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    ).populate({
      path: 'student',
      select: 'name studentId class',
      populate: [
        {
          path: 'userId',
          select: 'name'
        },
        // {
        //   path: 'classId',
        //   select: 'name section' 
        // }
      ]
    });

    if (!updatedFee) {
      return res.status(404).json({
        success: false,
        message: 'Fee record not found'
      });
    }

    res.status(200).json({
      success: true,
      data: updatedFee
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// Delete fee record
const deleteFee = async (req, res) => {
  try {
    const tenantId = req.tenantId;
    
    // Get tenant database connection
    const connection = await getTenantDb(tenantId);
    const Fee = getFeeModel(connection);
    
    const fee = await Fee.findByIdAndDelete(req.params.id);

    if (!fee) {
      return res.status(404).json({
        success: false,
        message: 'Fee record not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Fee record deleted successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// Get fees by student
const getStudentFees = async (req, res) => {
  try {
    const tenantId = req.tenantId;
    
    // Get tenant database connection
    const connection = await getTenantDb(tenantId);
    const Fee = getFeeModel(connection);
    
    const fees = await Fee.find({ student: req.params.studentId })
      .populate({
        path: 'student',
        select: 'name studentId class',
        populate: {
          path: 'class',
          select: 'name section'
        }
      })
      .sort({ dueDate: -1 });

    res.status(200).json({
      success: true,
      data: fees
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get pending fees
const getPendingFees = async (req, res) => {
  try {
    const tenantId = req.tenantId;
    
    // Get tenant database connection
    const connection = await getTenantDb(tenantId);
    const Fee = getFeeModel(connection);
    
    const fees = await Fee.find({ status: 'pending' })
      .populate({
        path: 'student',
        select: 'name studentId class',
        populate: {
          path: 'class',
          select: 'name section'
        }
      })
      .sort({ dueDate: 1 });

    res.status(200).json({
      success: true,
      data: fees
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

export default {
  getAllFees,
  createFee,
  getFee,
  updateFee,
  deleteFee,
  getStudentFees,
  getPendingFees
};