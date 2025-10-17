exports.errorMiddleware = (err, req, res, next) => {
  // console.error(err.stack);
  const statusCode = err.statusCode || 500;

  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error",
    // chỉ hiển thị stack khi ở môi trường development
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });

  // res.status(err.status || 500).json({
  //   message: err.message || "Internal Server Error",
  //   stack: err.stack || "Error",
  // });
};
