const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error for development
  console.error(err);

  // MySQL duplicate entry error
  if (err.code === "ER_DUP_ENTRY") {
    error.message = "Duplicate entry found";
    error.statusCode = 400;
  }

  // MySQL foreign key constraint error
  if (err.code === "ER_NO_REFERENCED_ROW_2") {
    error.message = "Referenced record not found";
    error.statusCode = 400;
  }

  // MySQL syntax error
  if (err.code === "ER_PARSE_ERROR") {
    error.message = "Database query error";
    error.statusCode = 500;
  }

  // Default error response
  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || "Server Error",
  });
};

module.exports = errorHandler;
