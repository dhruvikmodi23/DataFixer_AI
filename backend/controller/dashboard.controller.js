const File = require("../models/File.model");

// Get dashboard stats
exports.stats = async (req, res) => {
  try {
    // Get total files count
    const totalFiles = await File.countDocuments({ user: req.user.userId });

    // Get fixed files count
    const fixedFiles = await File.countDocuments({
      user: req.user.userId,
      status: "fixed",
    });

    // Get CSV files count
    const csvFiles = await File.countDocuments({
      user: req.user.userId,
      fileType: "csv",
    });

    // Get JSON files count
    const jsonFiles = await File.countDocuments({
      user: req.user.userId,
      fileType: "json",
    });

    res.json({
      totalFiles,
      fixedFiles,
      csvFiles,
      jsonFiles,
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
