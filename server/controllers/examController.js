import getExamModel from "../models/examModel.js";
import getStudentModel from "../models/studentModel.js";
import getClassModel from "../models/classModel.js";
import getResultModel from "../models/resultModel.js";
import { getTenantDb } from "../utils/getTenantDb.js";
import 'dotenv/config';
const mongoose = require('mongoose');

// Helper function to validate MongoDB ObjectIds
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

class ExamController {
  // Create a new exam
  async createExam(req, res) {
    try {
      const tenantId = req.tenantId;
      
      // Get tenant database connection
      const connection = await getTenantDb(tenantId);
      const Exam = getExamModel(connection);
      const Class = getClassModel(connection);
      
      const { name, subject, totalMarks, date, duration, classId, description, examType } = req.body;
      
      // Validate required fields
      if (!name || !subject || !totalMarks || !date || !classId) {
        return res.status(400).json({
          success: false,
          message: 'Name, subject, total marks, date, and class are required'
        });
      }

      // Validate class ID
      if (!isValidObjectId(classId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid class ID'
        });
      }

      // Check if class exists
      const classExists = await Class.findById(classId);
      if (!classExists) {
        return res.status(404).json({
          success: false,
          message: 'Class not found'
        });
      }

      const exam = await Exam.create({
        name,
        subject,
        totalMarks,
        date,
        duration,
        classId,
        description,
        examType: examType || 'written'
      });

      const populatedExam = await Exam.findById(exam._id)
        .populate('classId', 'name grade section');

      res.status(201).json({
        success: true,
        data: populatedExam
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get all exams with optional filters
  async getAllExams(req, res) {
    try {
      const tenantId = req.tenantId;
      
      // Get tenant database connection
      const connection = await getTenantDb(tenantId);
      const Exam = getExamModel(connection);
      
      const { classId, subject, examType, startDate, endDate } = req.query;
      const filter = {};

      if (classId && isValidObjectId(classId)) filter.classId = classId;
      if (subject) filter.subject = { $regex: subject, $options: 'i' };
      if (examType) filter.examType = examType;
      
      // Date range filter
      if (startDate || endDate) {
        filter.date = {};
        if (startDate) filter.date.$gte = new Date(startDate);
        if (endDate) filter.date.$lte = new Date(endDate);
      }

      const exams = await Exam.find(filter)
        .populate('classId', 'name grade section')
        .sort('-date');

      res.status(200).json({
        success: true,
        count: exams.length,
        data: exams
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get exam by ID
  async getExamById(req, res) {
    try {
      const tenantId = req.tenantId;
      
      // Get tenant database connection
      const connection = await getTenantDb(tenantId);
      const Exam = getExamModel(connection);
      
      const { id } = req.params;

      if (!isValidObjectId(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid exam ID'
        });
      }

      const exam = await Exam.findById(id)
        .populate('classId', 'name grade section students');

      if (!exam) {
        return res.status(404).json({
          success: false,
          message: 'Exam not found'
        });
      }

      res.status(200).json({
        success: true,
        data: exam
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Update exam
  async updateExam(req, res) {
    try {
      const tenantId = req.tenantId;
      
      // Get tenant database connection
      const connection = await getTenantDb(tenantId);
      const Exam = getExamModel(connection);
      const Class = getClassModel(connection);
      
      const { id } = req.params;
      const updates = req.body;

      if (!isValidObjectId(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid exam ID'
        });
      }

      // Validate class ID if being updated
      if (updates.classId && !isValidObjectId(updates.classId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid class ID'
        });
      }

      // Check if class exists if being updated
      if (updates.classId) {
        const classExists = await Class.findById(updates.classId);
        if (!classExists) {
          return res.status(404).json({
            success: false,
            message: 'Class not found'
          });
        }
      }

      const exam = await Exam.findByIdAndUpdate(
        id,
        updates,
        { new: true, runValidators: true }
      ).populate('classId', 'name grade section');

      if (!exam) {
        return res.status(404).json({
          success: false,
          message: 'Exam not found'
        });
      }

      res.status(200).json({
        success: true,
        data: exam
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Delete exam
  async deleteExam(req, res) {
    try {
      const tenantId = req.tenantId;
      
      // Get tenant database connection
      const connection = await getTenantDb(tenantId);
      const Exam = getExamModel(connection);
      const Result = getResultModel(connection);
      
      const { id } = req.params;

      if (!isValidObjectId(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid exam ID'
        });
      }

      // Check if exam has results
      const hasResults = await Result.findOne({ exam: id });
      if (hasResults) {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete exam with existing results'
        });
      }

      const exam = await Exam.findByIdAndDelete(id);

      if (!exam) {
        return res.status(404).json({
          success: false,
          message: 'Exam not found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Exam deleted successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get exam schedule for a class
  async getExamSchedule(req, res) {
    try {
      const tenantId = req.tenantId;
      
      // Get tenant database connection
      const connection = await getTenantDb(tenantId);
      const Exam = getExamModel(connection);
      
      const { classId } = req.params;
      const { startDate, endDate } = req.query;

      if (!isValidObjectId(classId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid class ID'
        });
      }

      const filter = { classId };
      
      // Date range filter
      if (startDate || endDate) {
        filter.date = {};
        if (startDate) filter.date.$gte = new Date(startDate);
        if (endDate) filter.date.$lte = new Date(endDate);
      } else {
        // Default to upcoming exams
        filter.date = { $gte: new Date() };
      }

      const schedule = await Exam.find(filter)
        .populate('classId', 'name grade section')
        .sort('date');

      res.status(200).json({
        success: true,
        count: schedule.length,
        data: schedule
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get exam results by student ID
  async getExamResultsByStudent(req, res) {
    try {
      const tenantId = req.tenantId;
      
      // Get tenant database connection
      const connection = await getTenantDb(tenantId);
      const Result = getResultModel(connection);
      const Student = getStudentModel(connection);
      
      const { studentId } = req.params;

      if (!isValidObjectId(studentId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid student ID'
        });
      }

      // Check if student exists
      const student = await Student.findById(studentId);
      if (!student) {
        return res.status(404).json({
          success: false,
          message: 'Student not found'
        });
      }

      const results = await Result.find({ student: studentId })
        .populate('exam', 'name subject totalMarks date examType')
        .populate('student', 'name rollNumber')
        .sort('-exam.date');

      res.status(200).json({
        success: true,
        count: results.length,
        data: results
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Submit exam results
  async submitExamResults(req, res) {
    try {
      const tenantId = req.tenantId;
      
      // Get tenant database connection
      const connection = await getTenantDb(tenantId);
      const Result = getResultModel(connection);
      const Exam = getExamModel(connection);
      const Student = getStudentModel(connection);
      
      const { examId } = req.params;
      const { results } = req.body; // Array of { studentId, marksObtained, remarks }

      if (!isValidObjectId(examId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid exam ID'
        });
      }

      // Check if exam exists
      const exam = await Exam.findById(examId);
      if (!exam) {
        return res.status(404).json({
          success: false,
          message: 'Exam not found'
        });
      }

      // Validate results array
      if (!Array.isArray(results) || results.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Results array is required and cannot be empty'
        });
      }

      const savedResults = [];
      const errors = [];

      // Process each result
      for (let i = 0; i < results.length; i++) {
        const { studentId, marksObtained, remarks } = results[i];

        try {
          // Validate student ID
          if (!isValidObjectId(studentId)) {
            errors.push(`Invalid student ID at index ${i}`);
            continue;
          }

          // Check if student exists
          const student = await Student.findById(studentId);
          if (!student) {
            errors.push(`Student not found at index ${i}`);
            continue;
          }

          // Calculate grade
          const grade = this.calculateGrade(marksObtained, exam.totalMarks);

          // Check if result already exists
          const existingResult = await Result.findOne({
            student: studentId,
            exam: examId
          });

          if (existingResult) {
            // Update existing result
            existingResult.marksObtained = marksObtained;
            existingResult.grade = grade;
            existingResult.remarks = remarks;
            await existingResult.save();
            savedResults.push(existingResult);
          } else {
            // Create new result
            const newResult = await Result.create({
              student: studentId,
              exam: examId,
              marksObtained,
              grade,
              remarks
            });
            savedResults.push(newResult);
          }
        } catch (error) {
          errors.push(`Error processing result at index ${i}: ${error.message}`);
        }
      }

      res.status(200).json({
        success: true,
        message: 'Results processed successfully',
        data: {
          successCount: savedResults.length,
          errorCount: errors.length,
          errors: errors.length > 0 ? errors : undefined
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get upcoming exams
  async getUpcomingExams(req, res) {
    try {
      const tenantId = req.tenantId;
      
      // Get tenant database connection
      const connection = await getTenantDb(tenantId);
      const Exam = getExamModel(connection);
      
      const { classId, days = 30 } = req.query;
      const filter = {
        date: {
          $gte: new Date(),
          $lte: new Date(Date.now() + days * 24 * 60 * 60 * 1000)
        }
      };

      if (classId && isValidObjectId(classId)) {
        filter.classId = classId;
      }

      const upcomingExams = await Exam.find(filter)
        .populate('classId', 'name grade section')
        .sort('date');

      res.status(200).json({
        success: true,
        count: upcomingExams.length,
        data: upcomingExams
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get exam statistics
  async getExamStatistics(req, res) {
    try {
      const tenantId = req.tenantId;
      
      // Get tenant database connection
      const connection = await getTenantDb(tenantId);
      const Result = getResultModel(connection);
      const Exam = getExamModel(connection);
      
      const { examId } = req.params;

      if (!isValidObjectId(examId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid exam ID'
        });
      }

      const exam = await Exam.findById(examId);
      if (!exam) {
        return res.status(404).json({
          success: false,
          message: 'Exam not found'
        });
      }

      const results = await Result.find({ exam: examId })
        .populate('student', 'name rollNumber');

      if (results.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'No results found for this exam'
        });
      }

      // Calculate statistics
      const marks = results.map(r => r.marksObtained);
      const passMarks = exam.totalMarks * 0.4; // 40% pass marks
      const passedStudents = results.filter(r => r.marksObtained >= passMarks);

      const statistics = {
        examInfo: {
          name: exam.name,
          subject: exam.subject,
          totalMarks: exam.totalMarks,
          date: exam.date
        },
        totalStudents: results.length,
        highestMarks: Math.max(...marks),
        lowestMarks: Math.min(...marks),
        averageMarks: Math.round((marks.reduce((a, b) => a + b, 0) / results.length) * 100) / 100,
        passedStudents: passedStudents.length,
        failedStudents: results.length - passedStudents.length,
        passPercentage: Math.round((passedStudents.length / results.length) * 100 * 100) / 100,
        gradeDistribution: this.calculateGradeDistribution(results)
      };

      res.status(200).json({
        success: true,
        data: statistics
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Helper method to calculate grade based on percentage
  calculateGrade(marksObtained, totalMarks) {
    const percentage = (marksObtained / totalMarks) * 100;
    
    if (percentage >= 90) return 'A+';
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B';
    if (percentage >= 60) return 'C';
    if (percentage >= 50) return 'D';
    return 'F';
  }

  // Helper method to calculate grade distribution
  calculateGradeDistribution(results) {
    const distribution = {
      'A+': 0, 'A': 0, 'B': 0, 'C': 0, 'D': 0, 'F': 0
    };
    
    results.forEach(result => {
      distribution[result.grade]++;
    });

    return distribution;
  }
}

module.exports = new ExamController();