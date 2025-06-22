const express = require('express');
const router = express.Router();
const resultController = require('../controllers/resultController');
const extractTenantId = require('../middlewares/tenantMiddleware');

// Create a new result
router.post('/create', extractTenantId, resultController.createResult);

// Get all results with optional filters
router.get('/all', extractTenantId, resultController.getResults);

// Get a specific result by ID
router.get('/:id', extractTenantId, resultController.getResultById);

// Get results for a specific student
router.get('/student/:studentId', extractTenantId, resultController.getStudentResults);

// Update a result
router.put('/:id', extractTenantId, resultController.updateResult);

// Delete a result
router.delete('/:id', extractTenantId, resultController.deleteResult);

// Get exam statistics
router.get('/exam/:examId/statistics', extractTenantId, resultController.getExamStatistics);

module.exports = router;