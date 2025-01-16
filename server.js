const express = require("express");
const morgan = require("morgan");
const json = require("morgan-json");
const dotenv = require("dotenv");
const path = require("path");
const cors = require("cors");
const connectDB = require("./config/configDB");
const bodyParser = require("body-parser");
const userRoutes = require("./routes/userRoutes");
const authRoutes = require("./routes/authRoutes"); // Import auth routes
const productsRoutes = require("./routes/productRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const mediaRoutes = require("./routes/mediaRoutes");

const { notFoundMiddleware } = require("./middleware/notFound");
const { errorMiddleware } = require("./middleware/errorMiddleware");

// Load environment variables
dotenv.config();

// Initialize app
const app = express();

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Morgan format
const format = json({
  Method: ":method  :url :status",
});

// Logger
if (process.env.NODE_ENV === "development") {
  app.use(morgan(format));
}

// connect to database
connectDB();

// Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/products", productsRoutes);
app.use("/api/v1/categories", categoryRoutes);
app.use("/api/v1/reviews", reviewRoutes);
app.use("/api/v1/upload", mediaRoutes);

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
  console.log(`Server is running on port http://localhost:${PORT}/api/v1`);
});
