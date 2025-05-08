const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const dotenv = require("dotenv")
const morgan = require("morgan")
const path = require("path")
const { createProxyMiddleware } = require("http-proxy-middleware")

// Load environment variables
dotenv.config()

// Import routes
const authRoutes = require("./routes/auth.routes")
const fileRoutes = require("./routes/files.routes")
const dashboardRoutes = require("./routes/dashboard.routes")

// Create Express app
const app = express()

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(morgan("dev"))

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err))

// API routes
app.use("/api/auth", authRoutes)
app.use("/api/files", fileRoutes)
app.use("/api/dashboard", dashboardRoutes)


// error handling middleware stack
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({
        success: false,
        message: 'File size exceeds the 5MB limit'
      });
    }
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }
  next(err);
});


// Proxy requests to Python AI service
app.use(
  "/api/ai",
  createProxyMiddleware({
    target: process.env.AI_SERVICE_URL || "http://localhost:8000",
    changeOrigin: true,
    pathRewrite: {
      "^/api/ai": "/api",
    },
  }),
)



// Serve static files in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")))

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/dist/index.html"))
  })
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({
    message: "Something went wrong!",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  })
})



// Start server
const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
