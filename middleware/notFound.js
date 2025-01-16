exports.notFoundMiddleware = (req, res, next) => {
  res.status(404).json({
    message: "Router not found",
    success: false,
  });
};
