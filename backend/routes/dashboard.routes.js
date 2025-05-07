const express = require("express");
const { auth } = require("../middleware/auth.middleware");
const dashboardController = require("../controller/dashboard.controller") 
const router = express.Router();

// Get dashboard stats
router.get("/stats", auth, dashboardController.stats);

module.exports = router;
