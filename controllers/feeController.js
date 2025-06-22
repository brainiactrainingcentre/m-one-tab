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






export const createMonthlyFeeForClass = async (req, res) => {
  try {
    const { classId, month, amount, dueDate } = req.body;
    const tenantId = req.tenantId;

    if (!classId || !month || !amount || !dueDate) {
      return res.status(400).json({
        success: false,
        message: "Please provide classId, month, amount, and dueDate"
      });
    }

    // ✅ tenant-specific DB connection
    const connection = await getTenantDb(tenantId);
    const Student = getStudentModel(connection);
    const Fee = getFeeModel(connection);

    // ✅ Find all students in the given classId
    const students = await Student.find({ classId });

    if (!students.length) {
      return res.status(404).json({
        success: false,
        message: "No students found in this class"
      });
    }

    const createdFees = [];

    for (const student of students) {
      // Check if fee already exists for this month and student
      const alreadyExists = await Fee.findOne({
        student: student._id,
        month,
        type: 'monthly'
      });

      if (!alreadyExists) {
        const newFee = new Fee({
          student: student._id,
          amount,
          type: 'monthly',
          month,
          dueDate,
          status: 'pending'
        });

        const savedFee = await newFee.save();
        createdFees.push(savedFee);
      }
    }

    res.status(201).json({
      success: true,
      message: `Monthly fees created for ${createdFees.length} students.`,
      data: createdFees
    });

  } catch (error) {
    console.error("Error in createMonthlyFeeForClass:", error);
    res.status(500).json({
      success: false,
      message: "Server error while creating monthly fees.",
      error: error.message
    });
  }
}; 



// Student fee payment handler
export const payStudentFee = async (req, res) => {
  try {
    const { studentId, month, amountPaid } = req.body;
    const tenantId = req.tenantId;

    const connection = await getTenantDb(tenantId);
    const Fee = getFeeModel(connection);

    const fee = await Fee.findOne({ student: studentId, month });

    if (!fee) {
      return res.status(404).json({
        success: false,
        message: "Fee record not found"
      });
    }

    fee.paidAmount = (fee.paidAmount || 0) + amountPaid;
    fee.balance = Math.max(0, fee.amount - fee.paidAmount);

    if (fee.paidAmount >= fee.amount) {
      fee.status = "paid";
    } else if (fee.paidAmount > 0) {
      fee.status = "partial";
    } else {
      fee.status = "pending";
    }

    await fee.save();

    res.status(200).json({
      success: true,
      message: "Payment recorded successfully",
      data: fee
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

export const getClassFeeSummary = async (req, res) => {
  try {
    const { classId, month } = req.query;
    const tenantId = req.tenantId;

    if (!classId || !month) {
      return res.status(400).json({
        success: false,
        message: "Please provide classId and month"
      });
    }

    // DB Connection
    const connection = await getTenantDb(tenantId);
    const Student = getStudentModel(connection);
    const Fee = getFeeModel(connection);

    // Get all students of the class
    const students = await Student.find({ classId });
    const studentMap = {};
    students.forEach((s) => {
      studentMap[s._id.toString()] = s.name;
    });

    const studentIds = students.map((s) => s._id);

    // Get all fee records for this month for the class students
    const fees = await Fee.find({
      student: { $in: studentIds },
      month
    });

    // Summary variables
    let totalFees = 0;
    let totalPaid = 0;
    let totalBalance = 0;

    const studentSummaries = [];

    // === CONFIG: Default fee per student if not created ===
    const defaultMonthlyFee = 2000;

    for (const student of students) {
      const studentFees = fees.filter(f => f.student.toString() === student._id.toString());

      if (studentFees.length === 0) {
        // No fee created for this student
        studentSummaries.push({
          studentId: student._id,
          name: student.name,
          amount: defaultMonthlyFee,
          paidAmount: 0,
          balance: defaultMonthlyFee,
          status: "not-created"
        });

        totalFees += defaultMonthlyFee;
        totalBalance += defaultMonthlyFee;
        continue;
      }

      // Fee record exists
      let amount = 0;
      let paid = 0;
      let balance = 0;
      let status = "pending";

      studentFees.forEach(fee => {
        amount += fee.amount;
        paid += fee.paidAmount || 0;
        balance += fee.balance != null ? fee.balance : (fee.amount - (fee.paidAmount || 0));
        if (fee.status === 'paid') status = 'paid';
      });

      studentSummaries.push({
        studentId: student._id,
        name: student.name,
        amount,
        paidAmount: paid,
        balance,
        status
      });

      totalFees += amount;
      totalPaid += paid;
      totalBalance += balance;
    }

    // Response
    res.status(200).json({
      success: true,
      classId,
      month,
      totalStudents: students.length,
      totalExpectedFee: totalFees,
      totalPaid,
      totalBalance,
      students: studentSummaries
    });

  } catch (error) {
    console.error("Error in getClassFeeSummary:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching class fee summary",
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
  getPendingFees,
  createMonthlyFeeForClass,
  payStudentFee,             // ✅ Added
  getClassFeeSummary         // ✅ Added
};
