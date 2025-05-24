const express = require('express');
const router = express.Router();
const examController = require('../controllers/examController');
const extractTenantId = require('../middlewares/tenantMiddleware');

// Create a new exam
router.post('/create', extractTenantId, examController.createExam);

// Get all exams with optional filters
router.get('/all', extractTenantId, examController.getAllExams);

// Get upcoming exams
router.get('/upcoming', extractTenantId, examController.getUpcomingExams);

// Get exam by ID
router.get('/:id', extractTenantId, examController.getExamById);

// Update exam
router.put('/:id', extractTenantId, examController.updateExam);

// Delete exam
router.delete('/:id', extractTenantId, examController.deleteExam);

// Get exam schedule for a class
router.get('/schedule/:classId', extractTenantId, examController.getExamSchedule);

// Get exam results by student ID
router.get('/results/student/:studentId', extractTenantId, examController.getExamResultsByStudent);

// Submit exam results
router.post('/:examId/results', extractTenantId, examController.submitExamResults);

// Get exam statistics
router.get('/:examId/statistics', extractTenantId, examController.getExamStatistics);

module.exports = router;