const multer = require("multer");
const fs = require("fs");
const path = require("path");
const axios = require("axios");
const File = require("../models/File.model");

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "../uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    // Accept only CSV, JSON, and TXT files
    if (
      file.mimetype === "text/csv" ||
      file.mimetype === "application/json" ||
      file.mimetype === "text/plain"
    ) {
      cb(null, true);
    } else {
      cb(new Error("Only CSV, JSON, and TXT files are allowed"));
    }
  },
});

// Helper function to process file with AI service
async function processFile(fileId, content, fileType) {
    try {
      const startTime = Date.now();
  
      // Call AI service to fix the file
      const response = await axios.post(
        `${process.env.AI_SERVICE_URL || "http://localhost:8000"}/api/fix`,
        {
          content,
          fileType,
        }
      );
  
      const processingTime = ((Date.now() - startTime) / 1000).toFixed(2);
  
      // Update file with results
      if (response.data.success) {
        await File.findByIdAndUpdate(fileId, {
          status: "fixed",
          fixedContent: response.data.fixedContent,
          changes: response.data.changes || [],
          processingTime,
        });
      } else {
        await File.findByIdAndUpdate(fileId, {
          status: "failed",
          errorMessage: response.data.error || "Failed to fix file",
          processingTime,
        });
      }
    } catch (error) {
      console.error("File processing error:", error);
  
      // Update file with error
      await File.findByIdAndUpdate(fileId, {
        status: "failed",
        errorMessage: "Error processing file",
      });
    }
  }

  

// Get all files for a user with pagination
exports.getfiles = async (req, res) => {
  try {
    const page = Number.parseInt(req.query.page) || 1;
    const limit = Number.parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const filter = req.query.filter || "all";

    // Build query based on filter
    const query = { user: req.user.userId };

    if (filter === "csv") {
      query.fileType = "csv";
    } else if (filter === "json") {
      query.fileType = "json";
    } else if (filter === "fixed") {
      query.status = "fixed";
    } else if (filter === "failed") {
      query.status = "failed";
    }

    // Get total count for pagination
    const total = await File.countDocuments(query);

    // Get files
    const files = await File.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      files,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      totalFiles: total,
    });
  } catch (error) {
    console.error("Get files error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get recent files for dashboard
exports.recent = async (req, res) => {
  try {
    const files = await File.find({ user: req.user.userId })
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({ files });
  } catch (error) {
    console.error("Get recent files error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get a single file by ID
exports.getfilebyid = async (req, res) => {
  try {
    const file = await File.findOne({
      _id: req.params.id,
      user: req.user.userId,
    });

    if (!file) {
      return res.status(404).json({ message: "File not found" });
    }

    res.json({ file });
  } catch (error) {
    console.error("Get file error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Upload and process a file
exports.uploadfile = upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Read file content
    const filePath = req.file.path;
    const fileContent = fs.readFileSync(filePath, "utf8");

    // Determine file type
    let fileType = req.body.fileType || "auto";
    if (fileType === "auto") {
      const fileName = req.file.originalname.toLowerCase();
      if (fileName.endsWith(".csv")) {
        fileType = "csv";
      } else if (fileName.endsWith(".json")) {
        fileType = "json";
      } else {
        fileType = "txt";
      }
    }

    // Create file record in database
    const file = new File({
      user: req.user.userId,
      originalName: req.file.originalname,
      fileType,
      fileSize: req.file.size,
      originalContent: fileContent,
      status: "processing",
    });

    await file.save();

    // Process file asynchronously
    processFile(file._id, fileContent, fileType);

    // Clean up uploaded file
    fs.unlinkSync(filePath);

    res.status(201).json({
      message: "File uploaded successfully",
      fileId: file._id,
    });
  } catch (error) {
    console.error("File upload error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Download a file (original or fixed)
exports.downloadfile = async (req, res) => {
  try {
    const file = await File.findOne({
      _id: req.params.id,
      user: req.user.userId,
    });

    if (!file) {
      return res.status(404).json({ message: "File not found" });
    }

    const type = req.query.type || "fixed";
    let content, filename;

    if (type === "original" || file.status !== "fixed") {
      content = file.originalContent;
      filename = file.originalName;
    } else {
      content = file.fixedContent;
      filename = `fixed_${file.originalName}`;
    }

    // Set appropriate headers
    res.setHeader("Content-Type", "text/plain");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

    // Send file content
    res.send(content);
  } catch (error) {
    console.error("File download error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete a file
exports.deletefile = async (req, res) => {
  try {
    const file = await File.findOneAndDelete({
      _id: req.params.id,
      user: req.user.userId,
    });

    if (!file) {
      return res.status(404).json({ message: "File not found" });
    }

    res.json({ message: "File deleted successfully" });
  } catch (error) {
    console.error("File delete error:", error);
    res.status(500).json({ message: "Server error" });
  }
};



