// routes/parent.router.js
import express from 'express';
import parentController from '../controllers/parentController.js';
import auth from '../middlewares/checkUserAuth.js';
import extractTenantId from '../middlewares/tenantMiddleware.js';

const parentRoute = express.Router();

// Public routes - need tenant middleware
parentRoute.post('/create', extractTenantId, parentController.createParent);
parentRoute.get('/all', extractTenantId, parentController.getAllParents);
parentRoute.get('/:id', extractTenantId, parentController.getParent);
parentRoute.put('/:id', extractTenantId, parentController.updateParent);
parentRoute.delete('/:id', extractTenantId, parentController.deleteParent);
parentRoute.get('/:id/children', extractTenantId, parentController.getChildrenDetails);

// If you want to protect any routes with authentication, you can add them like this:
// parentRoute.post('/create', auth, parentController.createParent);
// parentRoute.put('/:id', auth, parentController.updateParent);
// parentRoute.delete('/:id', auth, parentController.deleteParent);

export default parentRoute;