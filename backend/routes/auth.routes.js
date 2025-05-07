const express = require("express");
const auth = require("../middleware/auth.middleware");
const authController = require("../controller/user.controller");

const router = express.Router();

// Register a new user
router.post("/register", authController.register);

// Login user
router.post("/login", authController.login);

// Verify token and get user
router.get("/verify", auth, authController.verify);

// Forgot password - send reset email
router.post("/forgot-password", authController.forgotpassword);

// Verify reset token
router.get("/verify-reset-token/:token", authController.verifyresettoken);

// Reset password
router.post("/reset-password", authController.resetpassword);

module.exports = router;
