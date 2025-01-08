class AppError extends Error {
    constructor(
        message = "Internal server error", // Default message
        statusCode = 500, // Default status code
        errors = [], // Optional array for additional error details
        stack = '' // Optional custom stack trace
    ) {
        super(message); // Call the parent Error constructor
        this.statusCode = statusCode; // HTTP status code
        this.success = false; // For API response structure
        this.errors = errors; // Additional error details
        this.isOperational = true; // Distinguish operational vs programming errors

        // Handle the stack trace
        if (stack) {
            this.stack = stack;
        } else {
            Error.captureStackTrace(this, this.constructor); // Auto-capture stack trace
        }
    }
}

export default AppError;
