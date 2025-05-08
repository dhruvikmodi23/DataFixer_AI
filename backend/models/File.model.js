const mongoose = require("mongoose");

const FileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  originalName: {
    type: String,
    required: true,
  },
  fileType: {
    type: String,
    enum: ["csv", "json", "txt"],
    required: true,
  },
  fileSize: {
    type: Number,
  },
  originalContentUrl: {
    type: String,
    required: true,
  },
  fixedContentUrl: {
    type: String,
  },
  status: {
    type: String,
    enum: ["processing", "fixed", "failed"],
    default: "processing",
  },
  changes: [
    {
      line: Number,
      description: String,
      before: String,
      after: String,
    },
  ],
  errorMessage: {
    type: String,
  },
  processingTime: {
    type: Number,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Index for faster queries
FileSchema.index({ user: 1, createdAt: -1 });
FileSchema.index({ fileType: 1 });
FileSchema.index({ status: 1 });

module.exports = mongoose.model("File", FileSchema);