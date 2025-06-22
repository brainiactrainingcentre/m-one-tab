import express from 'express';
import staffAttendanceController from '../controllers/staffAttendanceContoller.js';
import extractTenantId from '../middlewares/tenantMiddleware.js';

const staffAttendanceRouter = express.Router();

// Mark daily attendance for a staff member
staffAttendanceRouter.post('/daily', extractTenantId, staffAttendanceController.markDailyAttendance);

// Mark attendance for multiple staff members at once
staffAttendanceRouter.post('/bulk', extractTenantId, staffAttendanceController.markBulkAttendance);

// Get staff attendance record by ID
staffAttendanceRouter.get('/:id', extractTenantId, staffAttendanceController.getAttendanceById);

// Get staff attendance for a specific date range
staffAttendanceRouter.get('/', extractTenantId, staffAttendanceController.getAttendance);

// Update a staff attendance record
staffAttendanceRouter.put('/:id', extractTenantId, staffAttendanceController.updateAttendance);

// Delete a staff attendance record
staffAttendanceRouter.delete('/:id', extractTenantId, staffAttendanceController.deleteAttendance);

// Get attendance statistics for staff
staffAttendanceRouter.get('/stats', extractTenantId, staffAttendanceController.getAttendanceStats);

// Check in staff (mark arrival)
staffAttendanceRouter.post('/check-in', extractTenantId, staffAttendanceController.checkIn);

// Check out staff (mark departure)
staffAttendanceRouter.post('/check-out', extractTenantId, staffAttendanceController.checkOut);

// Add/update substituted classes for a staff member
staffAttendanceRouter.post('/substitution', extractTenantId, staffAttendanceController.updateSubstitution);

export default staffAttendanceRouter;