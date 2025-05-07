const express = require("express");
const { auth } = require("../middleware/auth.middleware");
const fileController = require("../controller/file.controller")
const router = express.Router();


// Get all files for a user with pagination
router.get("/", auth, fileController.getfiles);

// Get recent files for dashboard
router.get("/recent", auth, fileController.recent);

// Get a single file by ID
router.get("/:id", auth, fileController.getfilebyid);

// Upload and process a file
router.post("/upload", auth, fileController.upload, fileController.uploadfile);


// Download a file (original or fixed)
router.get("/:id/download", auth, fileController.downloadfile );

// Delete a file
router.delete("/:id", auth, fileController.deletefile);


module.exports = router;
