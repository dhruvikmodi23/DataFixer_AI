const multer = require("multer");
const axios = require("axios");
const cloudinary = require('cloudinary').v2;
const File = require("../models/File.model");

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure multer for memory storage (no disk storage needed)
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { 
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 1
  },
  fileFilter: (req, file, cb) => {
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
}).single("file");


// Helper function remains the same
async function uploadToCloudinary(buffer, options = {}) {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error) return reject(error);
      resolve(result);
    }).end(buffer);
  });
}

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
      },
      {
        maxContentLength: 10 * 1024 * 1024, // 10MB limit for response
        maxBodyLength: 5 * 1024 * 1024, // 5MB limit for request
      }
    );

    const processingTime = ((Date.now() - startTime) / 1000).toFixed(2);

    // Upload fixed content to Cloudinary if successful
    if (response.data.success && response.data.fixedContent) {
      const fixedFile = await uploadToCloudinary(
        Buffer.from(response.data.fixedContent),
        {
          resource_type: 'raw',
          folder: 'fixed_files',
          public_id: `fixed_${fileId}`
        }
      );

      await File.findByIdAndUpdate(fileId, {
        status: "fixed",
        fixedContentUrl: fixedFile.secure_url,
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

    let errorMessage = "Error processing file";
    if (error.code === "ERR_OUT_OF_RANGE") {
      errorMessage = "File is too large to process";
    } else if (error.message) {
      errorMessage = error.message;
    }

    await File.findByIdAndUpdate(fileId, {
      status: "failed",
      errorMessage,
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

    // Get files without content to reduce payload
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
exports.upload = upload;

exports.uploadfile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false,
        message: "No file uploaded" 
      });
    }

    // Determine file type
    let fileType = req.body.fileType || "auto";
    if (fileType === "auto") {
      const fileName = req.file.originalname.toLowerCase();
      if (fileName.endsWith(".csv")) fileType = "csv";
      else if (fileName.endsWith(".json")) fileType = "json";
      else fileType = "txt";
    }

    // Upload to Cloudinary
    const fileContent = req.file.buffer.toString('utf8');
    const cloudinaryResult = await uploadToCloudinary(req.file.buffer, {
      resource_type: 'raw',
      folder: 'original_files',
      public_id: `${Date.now()}_${req.file.originalname}`
    });

    // Create file record
    const file = new File({
      user: req.user.userId,
      originalName: req.file.originalname,
      fileType,
      fileSize: req.file.size,
      originalContentUrl: cloudinaryResult.secure_url,
      status: "processing",
    });

    await file.save();

    // Process file asynchronously
    processFile(file._id, fileContent, fileType);

    res.status(201).json({
      success: true,
      message: "File uploaded successfully",
      fileId: file._id,
    });

  } catch (error) {
    console.error("File upload error:", error);
    
    let errorMessage = "Server error during file upload";
    let statusCode = 500;
    
    if (error instanceof multer.MulterError) {
      if (error.code === 'LIMIT_FILE_SIZE') {
        errorMessage = "File size exceeds the 5MB limit";
        statusCode = 413;
      } else {
        errorMessage = error.message;
        statusCode = 400;
      }
    } else if (error.message) {
      errorMessage = error.message;
      statusCode = 400;
    }

    res.status(statusCode).json({ 
      success: false,
      message: errorMessage 
    });
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
    let fileUrl;

    if (type === "original" || !file.fixedContentUrl) {
      fileUrl = file.originalContentUrl;
    } else {
      fileUrl = file.fixedContentUrl;
    }

    // Redirect to Cloudinary URL for download
    res.redirect(fileUrl);
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

    // Delete from Cloudinary
    if (file.originalContentUrl) {
      const publicId = file.originalContentUrl.split('/').pop().split('.')[0];
      await cloudinary.uploader.destroy(`original_files/${publicId}`, { resource_type: 'raw' });
    }
    if (file.fixedContentUrl) {
      const publicId = file.fixedContentUrl.split('/').pop().split('.')[0];
      await cloudinary.uploader.destroy(`fixed_files/${publicId}`, { resource_type: 'raw' });
    }

    res.json({ message: "File deleted successfully" });
  } catch (error) {
    console.error("File delete error:", error);
    res.status(500).json({ message: "Server error" });
  }
};