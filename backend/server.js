const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
require("dotenv").config();

const pool = require("./config/database");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/babysitters", require("./routes/babysitters"));
app.use("/api/children", require("./routes/children"));
app.use("/api/financial", require("./routes/finance"));
app.use("/api/attendance", require("./routes/attendance"));
app.use("/api/incidents", require("./routes/incidents"));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res
    .status(500)
    .json({ message: "Something went wrong!", error: err.message });
});

const PORT = process.env.PORT || 5000;

// Test database connection
pool
  .getConnection()
  .then((connection) => {
    console.log("Connected to MySQL database");
    connection.release();

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Error connecting to MySQL database:", err);
    process.exit(1);
  });
