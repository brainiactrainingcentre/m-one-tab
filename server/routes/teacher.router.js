// import express from 'express';
// import teacherController from '../controllers/teacherController.js';

// const teacherRoute = express.Router();

// // Base routes
// teacherRoute.route('/teacher/')
//   .get(teacherController.getAllTeachers)
//   .post(teacherController.createTeacher);

// teacherRoute.route('/teacher/:id')
//   .get(teacherController.getTeacher)
//   .put(teacherController.updateTeacher)
//   .delete(teacherController.deleteTeacher);

// // Additional routes
// teacherRoute.get('/teacher/:id/classes', teacherController.getTeacherClasses);
// teacherRoute.get('/teacher/:id/subjects', teacherController.getTeacherSubjects);

// export default teacherRoute;
// routes/teacher.router.js
import express from 'express';
import teacherController from '../controllers/teacherController.js';
import auth from '../middlewares/checkUserAuth.js';
import extractTenantId from '../middlewares/tenantMiddleware.js';

const teacherRoute = express.Router();

// Public routes - need tenant middleware
teacherRoute.post('/create', extractTenantId, teacherController.createTeacher);
teacherRoute.get('/all', extractTenantId, teacherController.getAllTeachers);
teacherRoute.get('/:id', extractTenantId, teacherController.getTeacher);
teacherRoute.put('/:id', extractTenantId, teacherController.updateTeacher);
teacherRoute.delete('/:id', extractTenantId, teacherController.deleteTeacher);
teacherRoute.get('/:id/classes', extractTenantId, teacherController.getTeacherClasses);
teacherRoute.get('/:id/subjects', extractTenantId, teacherController.getTeacherSubjects);

// If you want to protect any routes with authentication, you can add them like this:
// teacherRoute.post('/create', auth, teacherController.createTeacher);
// teacherRoute.put('/:id', auth, teacherController.updateTeacher);
// teacherRoute.delete('/:id', auth, teacherController.deleteTeacher);

export default teacherRoute;