const express = require("express");
const morgan = require("morgan");
const json = require("morgan-json");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/configDB");
const bodyParser = require("body-parser");
const userRoutes = require("./routes/userRoutes");
const authRoutes = require("./routes/authRoutes"); // Import auth routes
const categoryRoutes = require("./routes/categoryRoutes");
const productsRoutes = require("./routes/productRoutes");

// Load environment variables
dotenv.config();

// Initialize app
const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Morgan format
const format = json({
  Request: ":method :url :status",
});

// Logger
if (process.env.NODE_ENV === "development") {
  app.use(morgan(format));
}

// connect to database
connectDB();

// Routes
app.use("/api/v1/auth", authRoutes); // Auth routes
app.use("/api/v1/users", userRoutes); // User routes
// app.use("/api/vi/categories", categoryRoutes);

app.use("/api/v1/products", productsRoutes);

// Define PORT
const PORT = process.env.PORT || 8000;

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
