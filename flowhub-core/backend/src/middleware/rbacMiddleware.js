/**
 * RBAC Middleware
 * 
 * Handles role-based access control and ownership validation.
 * Supports ADMIN, EDITOR, and VIEWER roles.
 */

const mongoose = require('mongoose');

/**
 * Authorize middleware factory
 * 
 * @param {string[]} allowedRoles - Array of roles allowed to access the route
 * @param {object} options - Configuration options
 * @param {boolean} options.requireOwnership - If true, checks if user owns the resource
 * @param {string} options.modelName - Mongoose model name for ownership check
 * @param {string} options.idParam - Name of the ID parameter in req.params (default: 'id')
 */
function authorize(allowedRoles = [], options = {}) {
  return async (req, res, next) => {
    try {
      const { user } = req;

      if (!user) {
        return res.status(401).json({
          status: 'error',
          message: 'Authentication required'
        });
      }

      // 1. Role-based check
      if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
        return res.status(403).json({
          status: 'error',
          error_code: 403,
          error_type: 'Forbidden - Insufficient Permissions',
          message: `Access denied. Requires one of the following roles: ${allowedRoles.join(', ')}`,
          user_role: user.role
        });
      }

      // 2. Ownership-based check (Admins bypass this)
      if (options.requireOwnership && user.role !== 'ADMIN') {
        const resourceId = req.params[options.idParam || 'id'];
        const modelName = options.modelName;

        if (!resourceId || !modelName) {
          return next(new Error('RBAC Error: resourceId and modelName are required for ownership checks'));
        }

        const Model = mongoose.model(modelName);
        const resource = await Model.findById(resourceId);

        if (!resource) {
          // Return 404 instead of 403 to prevent information disclosure (ID guessing)
          return res.status(404).json({
            status: 'error',
            error_code: 404,
            message: 'Resource not found'
          });
        }

        // Check if the user is the owner
        // Assumes the model has a 'userId', 'createdBy', or 'created_by' field
        const ownerId = resource.userId || resource.createdBy || resource.created_by;
        
        if (!ownerId || ownerId.toString() !== user.id.toString()) {
          console.warn(`[RBAC] Access denied for user ${user.id} to resource ${resourceId} (owned by ${ownerId})`);
          
          // Return 404 to hide existence of resource from unauthorized users
          return res.status(404).json({
            status: 'error',
            error_code: 404,
            message: 'Resource not found'
          });
        }
      }

      next();
    } catch (error) {
      console.error('[RBAC] Middleware Error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Internal server error during authorization'
      });
    }
  };
}

module.exports = {
  authorize
};

