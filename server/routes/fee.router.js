// import express from 'express';
// import feeController from '../controllers/feeController.js';

// const feeRouter = express.Router();

// // Base routes
// feeRouter.get('/fee/getall', feeController.getAllFees);
// feeRouter.post('/fee/create', feeController.createFee);

// feeRouter.get('/fee/get/:id', feeController.getFee);
// feeRouter.put('/fee/update/:id', feeController.updateFee);
// feeRouter.delete('/fee/delete/:id', feeController.deleteFee);

// // Additional routes
// feeRouter.get('/student/:studentId', feeController.getStudentFees);
// feeRouter.get('/pending', feeController.getPendingFees);

// export default feeRouter;

import express from 'express';
import feeController from '../controllers/feeController.js';
import extractTenantId from '../middlewares/tenantMiddleware.js';

const feeRouter = express.Router();

// Get all fees
feeRouter.get('/', extractTenantId, feeController.getAllFees);

// Create new fee record
feeRouter.post('/', extractTenantId, feeController.createFee);

// Get single fee record
feeRouter.get('/:id', extractTenantId, feeController.getFee);

// Update fee record
feeRouter.put('/:id', extractTenantId, feeController.updateFee);

// Delete fee record
feeRouter.delete('/:id', extractTenantId, feeController.deleteFee);

// Get fees by student
feeRouter.get('/student/:studentId', extractTenantId, feeController.getStudentFees);

// Get pending fees
feeRouter.get('/status/pending', extractTenantId, feeController.getPendingFees);

export default feeRouter;
