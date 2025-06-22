import getStaffAttendanceModel from '../models/staffAttendanceModel.js';
import getUserModel from '../models/userModel.js';
import { getTenantDb } from '../utils/getTenantDb.js';
import mongoose from 'mongoose';
import 'dotenv/config';

const staffAttendanceController = {
  /**
   * Mark daily attendance for a staff member
   * @route POST /api/staff-attendance/daily
   */
  markDailyAttendance: async (req, res) => {
    try {
      const tenantId = req.tenantId;
      
      // Get tenant database connection
      const connection = await getTenantDb(tenantId);
      const StaffAttendance = getStaffAttendanceModel(connection);
      
      const { 
        staff, 
        date, 
        academicYear, 
        status, 
        checkInTime, 
        checkOutTime, 
        workingHours,
        leaveType,
        leaveReason,
        leaveApplication,
        remarks
      } = req.body;

      // Create attendance object
      const attendanceData = {
        staff,
        date: new Date(date),
        academicYear,
        status,
        markedBy: req.body.markedBy, // The user who marked the attendance
        lastUpdatedBy: req.body.markedBy
      };

      // Add optional fields if they exist
      if (checkInTime) attendanceData.checkInTime = new Date(checkInTime);
      if (checkOutTime) attendanceData.checkOutTime = new Date(checkOutTime);
      if (workingHours) attendanceData.workingHours = workingHours;
      if (status === 'leave' && leaveType) {
        attendanceData.leaveType = leaveType;
        attendanceData.leaveReason = leaveReason;
        if (leaveApplication) attendanceData.leaveApplication = leaveApplication;
      }
      if (remarks) attendanceData.remarks = remarks;

      // Use findOneAndUpdate with upsert to handle both creation and updates
      const attendance = await StaffAttendance.findOneAndUpdate(
        { staff, date: new Date(date) },
        attendanceData,
        { new: true, upsert: true }
      );

      res.status(200).json({
        success: true,
        data: attendance
      });
    } catch (error) {
      console.error('Error marking staff attendance:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to mark staff attendance',
        error: error.message
      });
    }
  },

  /**
   * Mark attendance for multiple staff members at once
   * @route POST /api/staff-attendance/bulk
   */
  markBulkAttendance: async (req, res) => {
    try {
      const tenantId = req.tenantId;
      
      // Get tenant database connection
      const connection = await getTenantDb(tenantId);
      const StaffAttendance = getStaffAttendanceModel(connection);
      
      const { attendanceRecords, markedBy } = req.body;

      if (!attendanceRecords || !Array.isArray(attendanceRecords)) {
        return res.status(400).json({
          success: false,
          message: 'Please provide an array of attendance records'
        });
      }

      const results = [];
      const errors = [];

      // Process each attendance record
      for (const record of attendanceRecords) {
        try {
          const attendanceData = {
            ...record,
            date: new Date(record.date),
            markedBy: markedBy || record.markedBy,
            lastUpdatedBy: markedBy || record.markedBy
          };

          // Convert time fields to Date objects if they exist
          if (record.checkInTime) attendanceData.checkInTime = new Date(record.checkInTime);
          if (record.checkOutTime) attendanceData.checkOutTime = new Date(record.checkOutTime);

          const attendance = await StaffAttendance.findOneAndUpdate(
            { staff: record.staff, date: new Date(record.date) },
            attendanceData,
            { new: true, upsert: true }
          );

          results.push(attendance);
        } catch (err) {
          errors.push({
            record: record,
            error: err.message
          });
        }
      }

      res.status(200).json({
        success: true,
        data: results,
        errors: errors.length > 0 ? errors : undefined,
        message: `Processed ${results.length} records with ${errors.length} errors`
      });
    } catch (error) {
      console.error('Error marking bulk staff attendance:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to process bulk attendance',
        error: error.message
      });
    }
  },

  /**
   * Get staff attendance record by ID
   * @route GET /api/staff-attendance/:id
   */
  getAttendanceById: async (req, res) => {
    try {
      const tenantId = req.tenantId;
      
      // Get tenant database connection
      const connection = await getTenantDb(tenantId);
      const StaffAttendance = getStaffAttendanceModel(connection);
      
      const attendance = await StaffAttendance.findById(req.params.id)
        .populate('staff', 'name email staffId')
        .populate('markedBy', 'name email')
        .populate('lastUpdatedBy', 'name email')
        .populate('leaveApplication');

      if (!attendance) {
        return res.status(404).json({
          success: false,
          message: 'Attendance record not found'
        });
      }

      res.status(200).json({
        success: true,
        data: attendance
      });
    } catch (error) {
      console.error('Error fetching attendance record:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch attendance record',
        error: error.message
      });
    }
  },

  /**
   * Get staff attendance for a specific date range
   * @route GET /api/staff-attendance
   */
  getAttendance: async (req, res) => {
    try {
      const tenantId = req.tenantId;
      
      // Get tenant database connection
      const connection = await getTenantDb(tenantId);
      const StaffAttendance = getStaffAttendanceModel(connection);
      
      const { staff, startDate, endDate, academicYear, status } = req.query;
      
      // Build query object
      const query = {};
      
      if (staff) query.staff = staff;
      if (academicYear) query.academicYear = academicYear;
      if (status) query.status = status;
      
      // Add date range if provided
      if (startDate || endDate) {
        query.date = {};
        if (startDate) query.date.$gte = new Date(startDate);
        if (endDate) query.date.$lte = new Date(endDate);
      }

      const attendance = await StaffAttendance.find(query)
        .populate('staff', 'name email staffId')
        .populate('markedBy', 'name email')
        .populate('lastUpdatedBy', 'name email')
        .sort({ date: -1 });

      res.status(200).json({
        success: true,
        count: attendance.length,
        data: attendance
      });
    } catch (error) {
      console.error('Error fetching attendance records:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch attendance records',
        error: error.message
      });
    }
  },

  /**
   * Update a staff attendance record
   * @route PUT /api/staff-attendance/:id
   */
  updateAttendance: async (req, res) => {
    try {
      const tenantId = req.tenantId;
      
      // Get tenant database connection
      const connection = await getTenantDb(tenantId);
      const StaffAttendance = getStaffAttendanceModel(connection);
      
      const { id } = req.params;
      const updateData = { ...req.body, lastUpdatedBy: req.body.updatedBy || req.body.markedBy };
      
      // Handle date conversions
      if (updateData.date) updateData.date = new Date(updateData.date);
      if (updateData.checkInTime) updateData.checkInTime = new Date(updateData.checkInTime);
      if (updateData.checkOutTime) updateData.checkOutTime = new Date(updateData.checkOutTime);

      const attendance = await StaffAttendance.findByIdAndUpdate(
        id, 
        updateData,
        { new: true, runValidators: true }
      );

      if (!attendance) {
        return res.status(404).json({
          success: false,
          message: 'Attendance record not found'
        });
      }

      res.status(200).json({
        success: true,
        data: attendance
      });
    } catch (error) {
      console.error('Error updating attendance record:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update attendance record',
        error: error.message
      });
    }
  },

  /**
   * Delete a staff attendance record
   * @route DELETE /api/staff-attendance/:id
   */
  deleteAttendance: async (req, res) => {
    try {
      const tenantId = req.tenantId;
      
      // Get tenant database connection
      const connection = await getTenantDb(tenantId);
      const StaffAttendance = getStaffAttendanceModel(connection);
      
      const attendance = await StaffAttendance.findByIdAndDelete(req.params.id);

      if (!attendance) {
        return res.status(404).json({
          success: false,
          message: 'Attendance record not found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Attendance record deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting attendance record:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete attendance record',
        error: error.message
      });
    }
  },

  /**
   * Get attendance statistics for staff
   * @route GET /api/staff-attendance/stats
   */
  getAttendanceStats: async (req, res) => {
    try {
      const tenantId = req.tenantId;
      
      // Get tenant database connection
      const connection = await getTenantDb(tenantId);
      const StaffAttendance = getStaffAttendanceModel(connection);
      
      const { staff, startDate, endDate, academicYear } = req.query;
      
      // Build match query
      const matchQuery = {};
      if (staff) matchQuery.staff = new mongoose.Types.ObjectId(staff);
      if (academicYear) matchQuery.academicYear = academicYear;
      
      // Add date range if provided
      if (startDate || endDate) {
        matchQuery.date = {};
        if (startDate) matchQuery.date.$gte = new Date(startDate);
        if (endDate) matchQuery.date.$lte = new Date(endDate);
      }

      const stats = await StaffAttendance.aggregate([
        { $match: matchQuery },
        {
          $group: {
            _id: { staff: "$staff", status: "$status" },
            count: { $sum: 1 },
            dates: { $push: "$date" }
          }
        },
        {
          $group: {
            _id: "$_id.staff",
            statusCounts: {
              $push: {
                status: "$_id.status",
                count: "$count",
                dates: "$dates"
              }
            },
            totalRecords: { $sum: "$count" }
          }
        },
        {
          $lookup: {
            from: "users",
            localField: "_id",
            foreignField: "_id",
            as: "staffInfo"
          }
        },
        {
          $project: {
            _id: 1,
            staffInfo: { $arrayElemAt: ["$staffInfo", 0] },
            statusCounts: 1,
            totalRecords: 1
          }
        },
        {
          $project: {
            _id: 1,
            "staffInfo.name": 1,
            "staffInfo.email": 1,
            "staffInfo.staffId": 1,
            statusCounts: 1,
            totalRecords: 1
          }
        }
      ]);

      res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Error fetching attendance statistics:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch attendance statistics',
        error: error.message
      });
    }
  },

  /**
   * Check in staff (mark arrival)
   * @route POST /api/staff-attendance/check-in
   */
  checkIn: async (req, res) => {
    try {
      const tenantId = req.tenantId;
      
      // Get tenant database connection
      const connection = await getTenantDb(tenantId);
      const StaffAttendance = getStaffAttendanceModel(connection);
      
      const { staff, date, academicYear } = req.body;
      const checkInTime = new Date();
      
      // Create or update attendance record
      const attendance = await StaffAttendance.findOneAndUpdate(
        { staff, date: new Date(date) },
        {
          staff,
          date: new Date(date),
          academicYear,
          status: 'present',
          checkInTime,
          markedBy: req.body.markedBy,
          lastUpdatedBy: req.body.markedBy
        },
        { new: true, upsert: true }
      );

      res.status(200).json({
        success: true,
        data: attendance,
        message: 'Staff checked in successfully'
      });
    } catch (error) {
      console.error('Error checking in staff:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to check in staff',
        error: error.message
      });
    }
  },

  /**
   * Check out staff (mark departure)
   * @route POST /api/staff-attendance/check-out
   */
  checkOut: async (req, res) => {
    try {
      const tenantId = req.tenantId;
      
      // Get tenant database connection
      const connection = await getTenantDb(tenantId);
      const StaffAttendance = getStaffAttendanceModel(connection);
      
      const { staff, date } = req.body;
      const checkOutTime = new Date();
      
      // Find the attendance record
      const attendance = await StaffAttendance.findOne({ 
        staff, 
        date: new Date(date) 
      });

      if (!attendance) {
        return res.status(404).json({
          success: false,
          message: 'No check-in record found for this staff member today'
        });
      }

      // Calculate working hours
      let workingHours = 0;
      if (attendance.checkInTime) {
        workingHours = (checkOutTime - attendance.checkInTime) / (1000 * 60 * 60);
        workingHours = Math.round(workingHours * 100) / 100; // Round to 2 decimal places
      }

      // Update the record
      attendance.checkOutTime = checkOutTime;
      attendance.workingHours = workingHours;
      attendance.lastUpdatedBy = req.body.updatedBy || req.body.markedBy;
      
      await attendance.save();

      res.status(200).json({
        success: true,
        data: attendance,
        message: 'Staff checked out successfully'
      });
    } catch (error) {
      console.error('Error checking out staff:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to check out staff',
        error: error.message
      });
    }
  },

  /**
   * Add/update substituted classes for a staff member
   * @route POST /api/staff-attendance/substitution
   */
  updateSubstitution: async (req, res) => {
    try {
      const tenantId = req.tenantId;
      
      // Get tenant database connection
      const connection = await getTenantDb(tenantId);
      const StaffAttendance = getStaffAttendanceModel(connection);
      
      const { staff, date, substitutedClasses } = req.body;
      
      const attendance = await StaffAttendance.findOneAndUpdate(
        { staff, date: new Date(date) },
        { 
          $set: { substitutedClasses },
          $set: { lastUpdatedBy: req.body.updatedBy || req.body.markedBy }
        },
        { new: true }
      );

      if (!attendance) {
        return res.status(404).json({
          success: false,
          message: 'Attendance record not found'
        });
      }

      res.status(200).json({
        success: true,
        data: attendance,
        message: 'Substituted classes updated successfully'
      });
    } catch (error) {
      console.error('Error updating substitution:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update substituted classes',
        error: error.message
      });
    }
  }
};

export default staffAttendanceController;