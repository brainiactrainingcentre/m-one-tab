// routes/user.router.js
import express from 'express';
import userController from '../controllers/userController.js';
import auth from '../middlewares/checkUserAuth.js';
import extractTenantId from '../middlewares/tenantMiddleware.js';
import { upload } from '../middlewares/multer.middleware.js';

const userRoute = express.Router();

// Public routes - need tenant middleware
userRoute.post('/signup', extractTenantId, userController.signup);
userRoute.get('/user', extractTenantId, userController.alluser);
userRoute.post('/login', extractTenantId, userController.Login);
userRoute.post('/verifyEmail', extractTenantId, userController.verifyEmail);
userRoute.post('/resetPassword/:id/:token', extractTenantId, userController.resetPassword);
userRoute.post('/request-otp', extractTenantId, userController.requestOTP);
userRoute.post('/reset-password-with-otp', extractTenantId, userController.resetPasswordWithOTP); // New route for OTP-based reset


// Protected routes - auth middleware already gets tenant from token
userRoute.get('/profile', auth, userController.userProfile);
userRoute.post('/change-password', auth, userController.changePassword);
userRoute.post(
  '/update-profile-image',
  auth,
  upload.single('image'),
  userController.updateProfileImage
);

export default userRoute;