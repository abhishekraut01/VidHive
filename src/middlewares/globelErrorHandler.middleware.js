const globalErrorHandler = (err, _, res, next) => {
  console.error(err); // Log for debugging (can integrate with logging libraries like Winston)

  // Default values for errors
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';
  const errors = err.errors || [];
  // Send response
  return res.status(statusCode).json({
    success: false,
    message,
    errors,
  });
};

export default globalErrorHandler;
