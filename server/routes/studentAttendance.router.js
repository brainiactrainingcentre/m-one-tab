// import express from 'express';
// import studentAttendanceController from '../controllers/studentAttendanceController.js';

// const studentAttendanceRouter = express.Router();

// // Mark daily attendance for a student
// studentAttendanceRouter.post(
//   "/daily",
//   studentAttendanceController.markDailyAttendance
// );

// // Mark period attendance for a student
// studentAttendanceRouter.post(
//   "/period",
//   studentAttendanceController.markPeriodAttendance
// );

// // Bulk mark daily attendance for multiple students
// studentAttendanceRouter.post(
//   "/bulk",
//   studentAttendanceController.bulkMarkDailyAttendance
// );

// // Bulk mark daily attendance for multiple students
// studentAttendanceRouter.post(
//   "/bulk-period",
//   studentAttendanceController.bulkMarkPeriodAttendance
// );

// // Get student attendance report for a date range (needs to come BEFORE the specific date route)
// studentAttendanceRouter.get(
//   "/student/:studentId/report",
//   studentAttendanceController.getStudentAttendanceReport
// );

// // Get class attendance report for a date range (needs to come BEFORE the specific date route)
// studentAttendanceRouter.get(
//   "/class/:classId/report",
//   studentAttendanceController.getClassAttendanceReport
// );

// // Get attendance for a specific student on a specific date
// studentAttendanceRouter.get(
//   "/student/:studentId/:date",
//   studentAttendanceController.getStudentAttendance
// );

// // Get class attendance for a specific date
// studentAttendanceRouter.get(
//   "/class/:classId/:date",
//   studentAttendanceController.getClassAttendance
// );

// // Delete an attendance record
// studentAttendanceRouter.delete(
//   "/:attendanceId",
//   studentAttendanceController.deleteAttendance
// );

// export default studentAttendanceRouter;

import express from 'express';
import { studentAttendanceController } from '../controllers/studentAttendanceController.js';
import extractTenantId from '../middlewares/tenantMiddleware.js';

const studentAttendanceRouter = express.Router();

// Mark daily attendance for a student
studentAttendanceRouter.post('/mark-daily', extractTenantId, studentAttendanceController.markDailyAttendance);

// Mark period-wise attendance for a student
studentAttendanceRouter.post('/mark-period', extractTenantId, studentAttendanceController.markPeriodAttendance);

// Bulk mark daily attendance for multiple students
studentAttendanceRouter.post('/bulk-mark-daily', extractTenantId, studentAttendanceController.bulkMarkDailyAttendance);

// Bulk mark period-wise attendance for multiple students
studentAttendanceRouter.post('/bulk-mark-period', extractTenantId, studentAttendanceController.bulkMarkPeriodAttendance);

// Get student attendance for a specific date
studentAttendanceRouter.get('/student/:studentId/:date', extractTenantId, studentAttendanceController.getStudentAttendance);

// Get class attendance for a specific date
studentAttendanceRouter.get('/class/:classId/:date', extractTenantId, studentAttendanceController.getClassAttendance);

// Get student attendance report for a date range
studentAttendanceRouter.get('/report/student/:studentId', extractTenantId, studentAttendanceController.getStudentAttendanceReport);

// Get class attendance report for a date range
studentAttendanceRouter.get('/report/class/:classId', extractTenantId, studentAttendanceController.getClassAttendanceReport);

// Delete attendance record
studentAttendanceRouter.delete('/:attendanceId', extractTenantId, studentAttendanceController.deleteAttendance);

export default studentAttendanceRouter;