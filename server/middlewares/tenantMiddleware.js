// middlewares/tenantMiddleware.js
const extractTenantId = (req, res, next) => {
  const tenantId = req.headers['x-tenant-id'];
  
  if (!tenantId) {
    return res.status(400).json({
      status: "failed",
      message: "Tenant ID is required in the header 'x-tenant-id'"
    });
  }
  
  req.tenantId = tenantId;
  next();
};

export default extractTenantId;