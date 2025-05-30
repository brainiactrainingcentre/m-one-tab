import getResultModel from "../models/resultModel.js";
import getStudentModel from "../models/studentModel.js";
import getExamModel from "../models/examModel.js";
import { getTenantDb } from "../utils/getTenantDb.js";
import 'dotenv/config';
const mongoose = require('mongoose');

// Helper function to validate MongoDB ObjectIds
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

class ResultController {
  // Create a new result entry
  async createResult(req, res) {
    try {
      const tenantId = req.tenantId;
      
      // Get tenant database connection
      const connection = await getTenantDb(tenantId);
      const Result = getResultModel(connection);
      const Student = getStudentModel(connection);
      const Exam = getExamModel(connection);
      
      const { student, exam, marksObtained, remarks } = req.body;
      
      // Validate required IDs
      if (!isValidObjectId(student) || !isValidObjectId(exam)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid student or exam ID'
        });
      }

      // Calculate grade based on marks (you can modify this logic)
      const grade = this.calculateGrade(marksObtained);

      const result = await Result.create({
        student,
        exam,
        marksObtained,
        remarks,
        grade
      });

      const populatedResult = await Result.findById(result._id)
        .populate('student', 'name rollNumber')
        .populate('exam', 'name totalMarks');

      res.status(201).json({
        success: true,
        data: populatedResult
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get all results with optional filters
  async getResults(req, res) {
    try {
      const tenantId = req.tenantId;
      
      // Get tenant database connection
      const connection = await getTenantDb(tenantId);
      const Result = getResultModel(connection);
      
      const { student, exam } = req.query;
      const filter = {};

      if (student && isValidObjectId(student)) filter.student = student;
      if (exam && isValidObjectId(exam)) filter.exam = exam;

      const results = await Result.find(filter)
        .populate('student', 'name rollNumber')
        .populate('exam', 'name totalMarks date')
        .sort('-createdAt');

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

  // Get a specific result by ID
  async getResultById(req, res) {
    try {
      const tenantId = req.tenantId;
      
      // Get tenant database connection
      const connection = await getTenantDb(tenantId);
      const Result = getResultModel(connection);
      
      const { id } = req.params;

      if (!isValidObjectId(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid result ID'
        });
      }

      const result = await Result.findById(id)
        .populate('student', 'name rollNumber class')
        .populate('exam', 'name totalMarks date subject');

      if (!result) {
        return res.status(404).json({
          success: false,
          message: 'Result not found'
        });
      }

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get results for a specific student
  async getStudentResults(req, res) {
    try {
      const tenantId = req.tenantId;
      
      // Get tenant database connection
      const connection = await getTenantDb(tenantId);
      const Result = getResultModel(connection);
      
      const { studentId } = req.params;

      if (!isValidObjectId(studentId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid student ID'
        });
      }

      const results = await Result.find({ student: studentId })
        .populate('exam', 'name totalMarks date subject')
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

  // Update a result
  async updateResult(req, res) {
    try {
      const tenantId = req.tenantId;
      
      // Get tenant database connection
      const connection = await getTenantDb(tenantId);
      const Result = getResultModel(connection);
      
      const { id } = req.params;
      const updates = req.body;

      if (!isValidObjectId(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid result ID'
        });
      }

      // Recalculate grade if marks are being updated
      if (updates.marksObtained) {
        updates.grade = this.calculateGrade(updates.marksObtained);
      }

      const result = await Result.findByIdAndUpdate(
        id,
        updates,
        { new: true, runValidators: true }
      ).populate('student', 'name rollNumber')
       .populate('exam', 'name totalMarks');

      if (!result) {
        return res.status(404).json({
          success: false,
          message: 'Result not found'
        });
      }

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Delete a result
  async deleteResult(req, res) {
    try {
      const tenantId = req.tenantId;
      
      // Get tenant database connection
      const connection = await getTenantDb(tenantId);
      const Result = getResultModel(connection);
      
      const { id } = req.params;

      if (!isValidObjectId(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid result ID'
        });
      }

      const result = await Result.findByIdAndDelete(id);

      if (!result) {
        return res.status(404).json({
          success: false,
          message: 'Result not found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Result deleted successfully'
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
      
      const { examId } = req.params;

      if (!isValidObjectId(examId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid exam ID'
        });
      }

      const results = await Result.find({ exam: examId });
      
      if (results.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'No results found for this exam'
        });
      }

      // Calculate statistics
      const marks = results.map(r => r.marksObtained);
      const statistics = {
        totalStudents: results.length,
        highestMarks: Math.max(...marks),
        lowestMarks: Math.min(...marks),
        averageMarks: marks.reduce((a, b) => a + b, 0) / results.length,
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

  // Helper method to calculate grade
  calculateGrade(marks) {
    if (marks >= 90) return 'A+';
    if (marks >= 80) return 'A';
    if (marks >= 70) return 'B';
    if (marks >= 60) return 'C';
    if (marks >= 50) return 'D';
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

module.exports = new ResultController();