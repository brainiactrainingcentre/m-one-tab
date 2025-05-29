
// export default subjectRoute;
import express from 'express';
import subjectController from '../controllers/subjectController.js';
import extractTenantId from '../middlewares/tenantMiddleware.js';

const subjectRoute = express.Router();

// Create a new subject
subjectRoute.post('/create', extractTenantId, subjectController.createSubject);

// Get all subjects
subjectRoute.get('/all', extractTenantId, subjectController.getSubjects);

// Get a single subject by ID
subjectRoute.get('/:id', extractTenantId, subjectController.getSubjectById);

// Update a subject by ID
subjectRoute.put('/:id', extractTenantId, subjectController.updateSubject);

// Delete a subject by ID
subjectRoute.delete('/:id', extractTenantId, subjectController.deleteSubject);

export default subjectRoute;