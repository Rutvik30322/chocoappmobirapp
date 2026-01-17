// API Response Utility Class
class ApiResponse {
  constructor(statusCode, message, data = null) {
    this.success = statusCode < 400;
    this.statusCode = statusCode;
    this.message = message;
    if (data !== null) {
      this.data = data;
    }
  }
}

// Success Response
export const successResponse = (res, statusCode, message, data = null) => {
  return res.status(statusCode).json(new ApiResponse(statusCode, message, data));
};

// Error Response
export const errorResponse = (res, statusCode, message) => {
  return res.status(statusCode).json(new ApiResponse(statusCode, message));
};
