import { validationResult } from 'express-validator';
import { errorResponse } from '../utils/apiResponse.js';

// Validation Middleware
const validate = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => error.msg).join(', ');
    console.log('\n❌ === VALIDATION FAILED ===');
    console.log('Errors:', errors.array());
    console.log('Error Messages:', errorMessages);
    console.log('Request Body:', req.body);
    console.log('=== END VALIDATION ===\n');
    return errorResponse(res, 400, errorMessages);
  }
  
  console.log('✅ Validation passed for:', req.path);
  next();
};

export default validate;
