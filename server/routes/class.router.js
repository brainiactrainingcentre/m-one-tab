// import express from 'express';
// import classController from '../controllers/classController.js';

// const classRouter = express.Router();

// classRouter.post('/class/', classController.createClass);
// classRouter.get('/class/', classController.getClasses);
// classRouter.get('/class/:id', classController.getClassById);
// classRouter.put('/class/:id', classController.updateClass);
// classRouter.delete('/class/:id', classController.deleteClass);

// classRouter.post('/class/add-student', classController.addStudent);
// classRouter.delete('/class/:classId/student/:studentId', classController.removeStudent);

// classRouter.put('/class/:id/schedule', classController.updateSchedule);
// classRouter.put('/class/:id/period', classController.updateSinglePeriod);
// classRouter.put('/class/:id/subject', classController.updateClassSubjects);
// classRouter.delete('/class/:id/subject', classController.deleteClassSubjects);

// export default classRouter;

import express from 'express';
import classController from '../controllers/classController.js';
import extractTenantId from '../middlewares/tenantMiddleware.js';

const classRouter = express.Router();

// Create a new class
classRouter.post('/create', extractTenantId, classController.createClass);

// Get all classes with optional filters
classRouter.get('/all', extractTenantId, classController.getClasses);

// Get single class by ID with full details
classRouter.get('/:id', extractTenantId, classController.getClassById);

// Update class details
classRouter.put('/:id', extractTenantId, classController.updateClass);

// Delete class
classRouter.delete('/:id', extractTenantId, classController.deleteClass);

// Add student to class
classRouter.post('/add-student', extractTenantId, classController.addStudent);

// Remove student from class
classRouter.delete('/:classId/student/:studentId', extractTenantId, classController.removeStudent);

// Update class schedule
classRouter.put('/:id/schedule', extractTenantId, classController.updateSchedule);

// Update single period
classRouter.put('/:id/period', extractTenantId, classController.updateSinglePeriod);

// Update class subjects
classRouter.put('/:id/subjects', extractTenantId, classController.updateClassSubjects);

// Delete subjects from class
classRouter.delete('/:id/subjects', extractTenantId, classController.deleteClassSubjects);

export default classRouter;