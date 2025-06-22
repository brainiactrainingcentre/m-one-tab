// routes/student.router.js
import express from 'express';
import studentController from '../controllers/studentController.js';
import auth from '../middlewares/checkUserAuth.js';
import extractTenantId from '../middlewares/tenantMiddleware.js';

const studentRoute = express.Router();

// Public routes 
studentRoute.get('/all', extractTenantId, studentController.getAllStudents);
studentRoute.get('/:id', extractTenantId, studentController.getStudent);
studentRoute.get('/class/:classId', extractTenantId, studentController.getStudentsByClass);
studentRoute.get('/demographics', extractTenantId, studentController.getStudentsByDemographics);
studentRoute.get('/transport/:mode', extractTenantId, studentController.getStudentsByTransport);
studentRoute.get('/disability', extractTenantId, studentController.getStudentsWithDisability);
studentRoute.get('/admission', extractTenantId, studentController.getStudentsByAdmission);

// Create
studentRoute.post('/create', extractTenantId, auth, studentController.createStudent);

// Update
studentRoute.put('/:id', extractTenantId, auth, studentController.updateStudent);

// Delete
studentRoute.delete('/:id', extractTenantId, auth, studentController.deleteStudent);

// Additional routes for student data
studentRoute.get('/:id/attendance', extractTenantId, auth, studentController.getStudentAttendance);
studentRoute.get('/:id/results', extractTenantId, auth, studentController.getStudentResults);
studentRoute.get('/:id/fees', extractTenantId, auth, studentController.getStudentFees);

export default studentRoute;