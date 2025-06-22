// middlewares/checkUserAuth.js
import jwt from "jsonwebtoken";
import { getTenantDb } from "../utils/getTenantDb.js";
import getUserModel from "../models/userModel.js";

const auth = async (req, res, next) => {
  try {
    // Get token from the request headers
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        status: "failed", 
        message: "Unauthorized - No token provided" 
      });
    }
    
    // Extract the token
    const token = authHeader.split(' ')[1];
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    
    // Extract tenantId from the token
    const tenantId = decoded.tenantId;
    if (!tenantId) {
      return res.status(401).json({ 
        status: "failed", 
        message: "Unauthorized - Invalid token format" 
      });
    }

    // Get tenant-specific database connection
    const connection = await getTenantDb(tenantId);
    const UserModel = getUserModel(connection);
    
    // Find the user in the tenant database
    const user = await UserModel.findById(decoded.id).select("-password");
    
    if (!user) {
      return res.status(401).json({ 
        status: "failed", 
        message: "Unauthorized - User not found" 
      });
    }
    
    // Add user info to request
    req.user = user;
    
    // Add tenantId to user object for convenience
    req.user.tenantId = tenantId;
    
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        status: "failed", 
        message: "Unauthorized - Token has expired" 
      });
    }
    
    console.error("Authentication error:", error);
    res.status(401).json({ 
      status: "failed", 
      message: "Unauthorized - Invalid token" 
    });
  }
};

export default auth;