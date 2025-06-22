import express from 'express';
import feeController from '../controllers/feeController.js';
import extractTenantId from '../middlewares/tenantMiddleware.js';

const feeRouter = express.Router();

//  Monthly fee creation for entire class
feeRouter.post('/create-monthly-fee', extractTenantId, feeController.createMonthlyFeeForClass);

//  Student fee payment route
feeRouter.post('/pay', extractTenantId, feeController.payStudentFee);

//  Class-wise fee summary
feeRouter.get('/class-summary', extractTenantId, feeController.getClassFeeSummary);

//  Get all fees
feeRouter.get('/', extractTenantId, feeController.getAllFees);

//  Create new fee record
feeRouter.post('/', extractTenantId, feeController.createFee);

//  Get single fee record
feeRouter.get('/:id', extractTenantId, feeController.getFee);

//  Update fee record
feeRouter.put('/:id', extractTenantId, feeController.updateFee);

//  Delete fee record
feeRouter.delete('/:id', extractTenantId, feeController.deleteFee);

//  Get fees by student
feeRouter.get('/student/:studentId', extractTenantId, feeController.getStudentFees);

// Get pending fees
feeRouter.get('/status/pending', extractTenantId, feeController.getPendingFees);

export default feeRouter;
