const express = require("express");
const dotenv = require("dotenv");
const path = require("path");
const cors = require("cors");
const connectDB = require("./config/configDB");
const bodyParser = require("body-parser");
var cookieParser = require("cookie-parser");

const { notFoundMiddleware } = require("./middleware/notFound");
const { errorMiddleware } = require("./middleware/errorMiddleware");

// Load environment variables
dotenv.config();

// Initialize app
const app = express();

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Middleware
app.use(
  cors({
    origin: "http://localhost:5000",
    credentials: true,
  })
);
app.use(bodyParser.json());
app.use(cookieParser());

// connect to database
connectDB();

// Routes
app.use("/api/v1/auth", require("./routes/authRoutes"));
app.use("/api/v1/users", require("./routes/userRoutes"));
app.use("/api/v1/products", require("./routes/productRoutes"));
app.use("/api/v1/categories", require("./routes/categoryRoutes"));
app.use("/api/v1/reviews", require("./routes/reviewRoutes"));
app.use("/api/v1/upload", require("./routes/mediaRoutes"));
app.use("/api/v1/coupon", require("./routes/couponRoutes"));
app.get("/", (req, res) => {
  res.json({
    message: "Welcome to E-commerce Api",
    success: true,
  });
});

// Handle Middleware: Handle 404 not found
app.use(notFoundMiddleware);

// Handle Middleware: Handle Errors
app.use(errorMiddleware);

// Define PORT
const PORT = process.env.PORT || 8000;

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT}`);
});
