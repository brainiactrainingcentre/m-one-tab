import getStudentAttendanceModel from "../models/studentAttendanceModel.js";
import getUserModel from "../models/userModel.js";
import { getTenantDb } from "../utils/getTenantDb.js";
import mongoose from "mongoose";
import 'dotenv/config';

/**
 * Student Attendance Controller
 * Handles all operations related to student attendance
 */
export const studentAttendanceController = {
  /**
   * Mark daily attendance for a student
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  markDailyAttendance: async (req, res) => {
    try {
      const tenantId = req.tenantId;
      
      // Get tenant database connection
      const connection = await getTenantDb(tenantId);
      const StudentAttendance = getStudentAttendanceModel(connection);
      const UserModel = getUserModel(connection);
      
      const { studentId, classId, date, academicYear, dailyStatus, remarks } =
        req.body;

      // Validate required fields
      if (!studentId || !classId || !date || !academicYear || !dailyStatus) {
        return res.status(400).json({
          success: false,
          message: "All required fields must be provided",
        });
      }

      // Format date to start of day to ensure consistent comparison
      const attendanceDate = new Date(date);
      attendanceDate.setHours(0, 0, 0, 0);

      // Check if attendance already exists for this student on this date
      const existingAttendance = await StudentAttendance.findOne({
        student: studentId,
        date: {
          $gte: attendanceDate,
          $lt: new Date(attendanceDate.getTime() + 24 * 60 * 60 * 1000),
        },
      });

      // Use a placeholder user ID for testing purposes (until auth is implemented)
      const userId = req.user?._id || new mongoose.Types.ObjectId();

      if (existingAttendance) {
        // Update existing attendance record
        existingAttendance.dailyStatus = dailyStatus;
        existingAttendance.remarks = remarks;
        existingAttendance.lastUpdatedBy = userId;

        // Update period attendance defaults based on daily status
        if (
          existingAttendance.periodAttendance &&
          existingAttendance.periodAttendance.length > 0
        ) {
          if (dailyStatus === "absent") {
            existingAttendance.periodAttendance.forEach((period) => {
              period.status = "absent";
            });
          }
        }

        await existingAttendance.save();
        return res.status(200).json({
          success: true,
          message: "Student attendance updated successfully",
          data: existingAttendance,
        });
      } else {
        // Create new attendance record
        const newAttendance = new StudentAttendance({
          student: studentId,
          class: classId,
          date: attendanceDate,
          academicYear,
          dailyStatus,
          remarks,
          markedBy: userId,
          lastUpdatedBy: userId,
        });

        const savedAttendance = await newAttendance.save();
        return res.status(201).json({
          success: true,
          message: "Student attendance marked successfully",
          data: savedAttendance,
        });
      }
    } catch (error) {
      console.error("Error marking daily attendance:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to mark attendance",
        error: error.message,
      });
    }
  },

  /**
   * Mark period-wise attendance for a student
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  markPeriodAttendance: async (req, res) => {
    try {
      const tenantId = req.tenantId;
      
      // Get tenant database connection
      const connection = await getTenantDb(tenantId);
      const StudentAttendance = getStudentAttendanceModel(connection);
      const UserModel = getUserModel(connection);
      
      const {
        studentId,
        date,
        periodIndex,
        subjectId,
        teacherId,
        status,
        remarks,
      } = req.body;

      // Validate required fields
      if (!studentId || !date || periodIndex === undefined || !status) {
        return res.status(400).json({
          success: false,
          message: "Required fields missing",
        });
      }

      // Format date to start of day
      const attendanceDate = new Date(date);
      attendanceDate.setHours(0, 0, 0, 0);

      // Find the student's attendance record for this date
      let attendance = await StudentAttendance.findOne({
        student: studentId,
        date: {
          $gte: attendanceDate,
          $lt: new Date(attendanceDate.getTime() + 24 * 60 * 60 * 1000),
        },
      });

      if (!attendance) {
        return res.status(404).json({
          success: false,
          message:
            "Daily attendance not found. Please mark daily attendance first.",
        });
      }

      // Use a placeholder user ID for testing purposes (until auth is implemented)
      const userId = req.user?._id || new mongoose.Types.ObjectId();

      // Check if period already exists
      const periodExists = attendance.periodAttendance.findIndex(
        (p) => p.periodIndex === periodIndex
      );

      if (periodExists !== -1) {
        // Update existing period
        attendance.periodAttendance[periodExists] = {
          ...attendance.periodAttendance[periodExists],
          subject:
            subjectId || attendance.periodAttendance[periodExists].subject,
          teacher:
            teacherId || attendance.periodAttendance[periodExists].teacher,
          status,
          remarks: remarks || attendance.periodAttendance[periodExists].remarks,
        };
      } else {
        // Add new period
        attendance.periodAttendance.push({
          periodIndex,
          subject: subjectId,
          teacher: teacherId,
          status,
          remarks,
        });
      }

      attendance.lastUpdatedBy = userId;
      await attendance.save();

      return res.status(200).json({
        success: true,
        message: "Period attendance marked successfully",
        data: attendance,
      });
    } catch (error) {
      console.error("Error marking period attendance:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to mark period attendance",
        error: error.message,
      });
    }
  },

  /**
   * Bulk mark daily attendance for multiple students
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  bulkMarkDailyAttendance: async (req, res) => {
    try {
      const tenantId = req.tenantId;
      
      // Get tenant database connection
      const connection = await getTenantDb(tenantId);
      const StudentAttendance = getStudentAttendanceModel(connection);
      const UserModel = getUserModel(connection);
      
      const session = await connection.startSession();
      session.startTransaction();

      try {
        const { classId, date, academicYear, attendanceData } = req.body;

        // Validate request data
        if (
          !classId ||
          !date ||
          !academicYear ||
          !attendanceData ||
          !Array.isArray(attendanceData)
        ) {
          return res.status(400).json({
            success: false,
            message: "Invalid request data",
          });
        }

        // Format date to start of day
        const attendanceDate = new Date(date);
        attendanceDate.setHours(0, 0, 0, 0);

        // Use a placeholder user ID for testing purposes (until auth is implemented)
        const userId = req.user?._id || new mongoose.Types.ObjectId();

        const results = {
          created: 0,
          updated: 0,
          failed: 0,
          details: [],
        };

        // Process each student's attendance
        for (const item of attendanceData) {
          try {
            const { studentId, dailyStatus, remarks } = item;

            if (!studentId || !dailyStatus) {
              results.failed++;
              results.details.push({
                studentId,
                status: "failed",
                message: "Missing required fields",
              });
              continue;
            }

            // Check if attendance record already exists
            const existingRecord = await StudentAttendance.findOne({
              student: studentId,
              date: {
                $gte: attendanceDate,
                $lt: new Date(attendanceDate.getTime() + 24 * 60 * 60 * 1000),
              },
            }).session(session);

            if (existingRecord) {
              // Update existing record
              existingRecord.dailyStatus = dailyStatus;
              existingRecord.remarks = remarks;
              existingRecord.lastUpdatedBy = userId;
              await existingRecord.save({ session });

              results.updated++;
              results.details.push({
                studentId,
                status: "updated",
                attendanceId: existingRecord._id,
              });
            } else {
              // Create new record
              const newAttendance = new StudentAttendance({
                student: studentId,
                class: classId,
                date: attendanceDate,
                academicYear,
                dailyStatus,
                remarks,
                markedBy: userId,
                lastUpdatedBy: userId,
              });

              const saved = await newAttendance.save({ session });

              results.created++;
              results.details.push({
                studentId,
                status: "created",
                attendanceId: saved._id,
              });
            }
          } catch (itemError) {
            results.failed++;
            results.details.push({
              studentId: item.studentId,
              status: "failed",
              message: itemError.message,
            });
          }
        }

        await session.commitTransaction();
        session.endSession();

        return res.status(200).json({
          success: true,
          message: "Bulk attendance processing completed",
          data: results,
        });
      } catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw error;
      }
    } catch (error) {
      console.error("Error in bulk attendance marking:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to process bulk attendance",
        error: error.message,
      });
    }
  },

  /**
   * Bulk mark period-wise attendance for multiple students
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  bulkMarkPeriodAttendance: async (req, res) => {
    try {
      const tenantId = req.tenantId;
      
      // Get tenant database connection
      const connection = await getTenantDb(tenantId);
      const StudentAttendance = getStudentAttendanceModel(connection);
      const UserModel = getUserModel(connection);
      
      const session = await connection.startSession();
      session.startTransaction();

      try {
        const {
          classId,
          date,
          periodIndex,
          subjectId,
          teacherId,
          attendanceData,
        } = req.body;

        // Validate request data
        if (
          !classId ||
          !date ||
          periodIndex === undefined ||
          !attendanceData ||
          !Array.isArray(attendanceData)
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Invalid request data. Required fields: classId, date, periodIndex, and attendanceData array",
          });
        }

        // Format date to start of day
        const attendanceDate = new Date(date);
        attendanceDate.setHours(0, 0, 0, 0);

        // Use a placeholder user ID for testing purposes (until auth is implemented)
        const userId = req.user?._id || new mongoose.Types.ObjectId();

        const results = {
          created: 0,
          updated: 0,
          failed: 0,
          details: [],
        };

        // Process each student's attendance
        for (const item of attendanceData) {
          try {
            const { studentId, status, remarks } = item;

            if (!studentId || !status) {
              results.failed++;
              results.details.push({
                studentId,
                status: "failed",
                message: "Missing required fields",
              });
              continue;
            }

            // Check if attendance record already exists for this student on this date
            let attendanceRecord = await StudentAttendance.findOne({
              student: studentId,
              date: {
                $gte: attendanceDate,
                $lt: new Date(attendanceDate.getTime() + 24 * 60 * 60 * 1000),
              },
            }).session(session);

            if (!attendanceRecord) {
              // Create new daily attendance record if it doesn't exist
              attendanceRecord = new StudentAttendance({
                student: studentId,
                class: classId,
                date: attendanceDate,
                academicYear:
                  new Date().getFullYear() + "-" + (new Date().getFullYear() + 1),
                dailyStatus: "present", // Default to present for the day
                markedBy: userId,
                lastUpdatedBy: userId,
              });

              // Save the new attendance record first
              await attendanceRecord.save({ session });
              results.created++;
            }

            // Check if period already exists in this record
            const periodExists = attendanceRecord.periodAttendance.findIndex(
              (p) => p.periodIndex === parseInt(periodIndex)
            );

            if (periodExists !== -1) {
              // Update existing period
              attendanceRecord.periodAttendance[periodExists] = {
                ...attendanceRecord.periodAttendance[periodExists],
                subject:
                  subjectId ||
                  attendanceRecord.periodAttendance[periodExists].subject,
                teacher:
                  teacherId ||
                  attendanceRecord.periodAttendance[periodExists].teacher,
                status,
                remarks:
                  remarks ||
                  attendanceRecord.periodAttendance[periodExists].remarks,
              };
            } else {
              // Add new period
              attendanceRecord.periodAttendance.push({
                periodIndex: parseInt(periodIndex),
                subject: subjectId,
                teacher: teacherId,
                status,
                remarks: remarks || "",
              });
            }

            attendanceRecord.lastUpdatedBy = userId;
            await attendanceRecord.save({ session });

            results.updated++;
            results.details.push({
              studentId,
              status: "updated",
              attendanceId: attendanceRecord._id,
            });
          } catch (itemError) {
            results.failed++;
            results.details.push({
              studentId: item.studentId,
              status: "failed",
              message: itemError.message,
            });
          }
        }

        await session.commitTransaction();
        session.endSession();

        return res.status(200).json({
          success: true,
          message: "Bulk period attendance processing completed",
          data: results,
        });
      } catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw error;
      }
    } catch (error) {
      console.error("Error in bulk period attendance marking:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to process bulk period attendance",
        error: error.message,
      });
    }
  },

  getStudentAttendance: async (req, res) => {
    try {
      const tenantId = req.tenantId;
      
      // Get tenant database connection
      const connection = await getTenantDb(tenantId);
      const StudentAttendance = getStudentAttendanceModel(connection);
      
      const { studentId, date } = req.params;

      if (!studentId || !date) {
        return res.status(400).json({
          success: false,
          message: "Student ID and date are required",
        });
      }

      // Format date to start of day
      const attendanceDate = new Date(date);
      attendanceDate.setHours(0, 0, 0, 0);

      const attendance = await StudentAttendance.findOne({
        student: studentId,
        date: {
          $gte: attendanceDate,
          $lt: new Date(attendanceDate.getTime() + 24 * 60 * 60 * 1000),
        },
      })
        .populate("student", "name rollNumber")
        .populate("class", "name section")
        .populate("periodAttendance.subject", "name code")
        .populate("periodAttendance.teacher", "name");

      if (!attendance) {
        return res.status(404).json({
          success: false,
          message:
            "No attendance record found for this student on the specified date",
        });
      }

      return res.status(200).json({
        success: true,
        data: attendance,
      });
    } catch (error) {
      console.error("Error fetching student attendance:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to get attendance",
        error: error.message,
      });
    }
  },

  getClassAttendance: async (req, res) => {
    try {
      const tenantId = req.tenantId;
      
      // Get tenant database connection
      const connection = await getTenantDb(tenantId);
      const StudentAttendance = getStudentAttendanceModel(connection);
      
      const { classId, date } = req.params;

      if (!classId || !date) {
        return res.status(400).json({
          success: false,
          message: "Class ID and date are required",
        });
      }

      // Format date to start of day
      const attendanceDate = new Date(date);
      attendanceDate.setHours(0, 0, 0, 0);

      const attendance = await StudentAttendance.find({
        class: classId,
        date: {
          $gte: attendanceDate,
          $lt: new Date(attendanceDate.getTime() + 24 * 60 * 60 * 1000),
        },
      })
        .populate("student", "name rollNumber")
        .sort({ "student.rollNumber": 1 });

      // Calculate attendance statistics
      const stats = {
        total: attendance.length,
        present: attendance.filter((a) => a.dailyStatus === "present").length,
        absent: attendance.filter((a) => a.dailyStatus === "absent").length,
        late: attendance.filter((a) => a.dailyStatus === "late").length,
        halfDay: attendance.filter((a) => a.dailyStatus === "halfDay").length,
        leave: attendance.filter((a) => a.dailyStatus === "leave").length,
        presentPercentage: 0,
      };

      if (stats.total > 0) {
        stats.presentPercentage =
          ((stats.present + stats.late + stats.halfDay) / stats.total) * 100;
      }

      return res.status(200).json({
        success: true,
        data: {
          attendance,
          stats,
        },
      });
    } catch (error) {
      console.error("Error fetching class attendance:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to get class attendance",
        error: error.message,
      });
    }
  },

  getStudentAttendanceReport: async (req, res) => {
    try {
      const tenantId = req.tenantId;
      
      // Get tenant database connection
      const connection = await getTenantDb(tenantId);
      const StudentAttendance = getStudentAttendanceModel(connection);
      
      const { studentId } = req.params;
      const { startDate, endDate, academicYear } = req.query;

      if (!studentId || !startDate || !endDate) {
        return res.status(400).json({
          success: false,
          message: "Student ID, start date, and end date are required",
        });
      }

      const query = {
        student: studentId,
        date: {
          $gte: new Date(startDate),
          $lte: new Date(endDate),
        },
      };

      if (academicYear) {
        query.academicYear = academicYear;
      }

      const attendanceRecords = await StudentAttendance.find(query)
        .sort({ date: 1 })
        .populate("student", "name rollNumber")
        .populate("class", "name section");

      // Calculate statistics
      const stats = {
        totalDays: attendanceRecords.length,
        present: attendanceRecords.filter((r) => r.dailyStatus === "present")
          .length,
        absent: attendanceRecords.filter((r) => r.dailyStatus === "absent")
          .length,
        late: attendanceRecords.filter((r) => r.dailyStatus === "late").length,
        halfDay: attendanceRecords.filter((r) => r.dailyStatus === "halfDay")
          .length,
        leave: attendanceRecords.filter((r) => r.dailyStatus === "leave")
          .length,
        attendancePercentage: 0,
      };

      if (stats.totalDays > 0) {
        stats.attendancePercentage =
          ((stats.present + stats.halfDay) / stats.totalDays) * 100;
      }

      return res.status(200).json({
        success: true,
        data: {
          studentInfo:
            attendanceRecords.length > 0
              ? {
                  id: attendanceRecords[0].student._id,
                  name: attendanceRecords[0].student.name,
                  rollNumber: attendanceRecords[0].student.rollNumber,
                  class: attendanceRecords[0].class?.name,
                  section: attendanceRecords[0].class?.section,
                }
              : null,
          attendanceRecords,
          stats,
        },
      });
    } catch (error) {
      console.error("Error generating student attendance report:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to generate attendance report",
        error: error.message,
      });
    }
  },

  getClassAttendanceReport: async (req, res) => {
    try {
      const tenantId = req.tenantId;
      
      // Get tenant database connection
      const connection = await getTenantDb(tenantId);
      const StudentAttendance = getStudentAttendanceModel(connection);
      
      const { classId } = req.params;
      const { startDate, endDate, academicYear } = req.query;

      if (!classId || !startDate || !endDate) {
        return res.status(400).json({
          success: false,
          message: "Class ID, start date, and end date are required",
        });
      }

      const query = {
        class: classId,
        date: {
          $gte: new Date(startDate),
          $lte: new Date(endDate),
        },
      };

      if (academicYear) {
        query.academicYear = academicYear;
      }

      // Get unique dates in the range
      const dateRange = await StudentAttendance.distinct("date", {
        class: classId,
        date: { $gte: new Date(startDate), $lte: new Date(endDate) },
      });

      // Get all students in the class with their attendance
      const studentsAttendance = await StudentAttendance.aggregate([
        {
          $match: query,
        },
        {
          $group: {
            _id: "$student",
            totalPresent: {
              $sum: { $cond: [{ $eq: ["$dailyStatus", "present"] }, 1, 0] },
            },
            totalAbsent: {
              $sum: { $cond: [{ $eq: ["$dailyStatus", "absent"] }, 1, 0] },
            },
            totalLate: {
              $sum: { $cond: [{ $eq: ["$dailyStatus", "late"] }, 1, 0] },
            },
            totalHalfDay: {
              $sum: { $cond: [{ $eq: ["$dailyStatus", "halfDay"] }, 1, 0] },
            },
            totalLeave: {
              $sum: { $cond: [{ $eq: ["$dailyStatus", "leave"] }, 1, 0] },
            },
            attendanceRecords: { $push: "$$ROOT" },
          },
        },
        {
          $lookup: {
            from: "students", // Assuming your collection name is "students"
            localField: "_id",
            foreignField: "_id",
            as: "studentInfo",
          },
        },
        {
          $unwind: "$studentInfo",
        },
        {
          $project: {
            student: "$studentInfo",
            totalPresent: 1,
            totalAbsent: 1,
            totalLate: 1,
            totalHalfDay: 1,
            totalLeave: 1,
            attendancePercentage: {
              $multiply: [
                {
                  $divide: [
                    { $add: ["$totalPresent", "$totalHalfDay"] },
                    { $size: "$attendanceRecords" },
                  ],
                },
                100,
              ],
            },
          },
        },
        {
          $sort: { "student.rollNumber": 1 },
        },
      ]);

      // Overall class statistics
      const classStats = {
        totalStudents: studentsAttendance.length,
        totalDays: dateRange.length,
        averageAttendance:
          studentsAttendance.reduce(
            (sum, student) => sum + student.attendancePercentage,
            0
          ) / (studentsAttendance.length || 1),
      };

      return res.status(200).json({
        success: true,
        data: {
          dateRange: dateRange.map((date) => date.toISOString().split("T")[0]),
          studentsAttendance,
          classStats,
        },
      });
    } catch (error) {
      console.error("Error generating class attendance report:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to generate class attendance report",
        error: error.message,
      });
    }
  },

  deleteAttendance: async (req, res) => {
    try {
      const tenantId = req.tenantId;
      
      // Get tenant database connection
      const connection = await getTenantDb(tenantId);
      const StudentAttendance = getStudentAttendanceModel(connection);
      
      const { attendanceId } = req.params;

      if (!attendanceId) {
        return res.status(400).json({
          success: false,
          message: "Attendance ID is required",
        });
      }

      const deletedAttendance = await StudentAttendance.findByIdAndDelete(
        attendanceId
      );

      if (!deletedAttendance) {
        return res.status(404).json({
          success: false,
          message: "Attendance record not found",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Attendance record deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting attendance record:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to delete attendance record",
        error: error.message,
      });
    }
  },
};

export default studentAttendanceController;