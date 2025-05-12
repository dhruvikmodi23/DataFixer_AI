const jwt = require("jsonwebtoken")
const crypto = require("crypto")
const User = require("../models/User.model")
const sendEmail = require("../utils/email")


// Register a new user
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body

    // Check if user already exists
    let user = await User.findOne({ email })
    if (user) {
      return res.status(400).json({ message: "User already exists" })
    }

    // Create new user
    user = new User({
      name,
      email,
      password,
    })

    await user.save()

    // Generate JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" })

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    })
  } catch (error) {
    console.error("Registration error:", error)
    res.status(500).json({ message: "Server error" })
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body

    // Check if user exists
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" })
    }

    // Check password
    const isMatch = await user.comparePassword(password)
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" })
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" })

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    })
  } catch (error) {
    console.error("Login error:", error)
    res.status(500).json({ message: "Server error" })
  }
};

// Verify token and get user
exports.verify= async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password")
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    })
  } catch (error) {
    console.error("Verification error:", error)
    res.status(500).json({ message: "Server error" })
  }
};

// Forgot password - send reset email
exports.forgotpassword= async (req, res) => {
  try {
    const { email } = req.body

    // Find user by email
    const user = await User.findOne({ email })

    // If no user found, still return success to prevent email enumeration
    if (!user) {
      return res.json({ message: "If an account with that email exists, a password reset link has been sent." })
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex")

    // Hash token and set to resetPasswordToken field
    user.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex")

    // Set token expiry (1 hour)
    user.resetPasswordExpires = Date.now() + 3600000

    await user.save()

    // Create reset URL
    const resetUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/reset-password/${resetToken}`

    // Send email
    const message = `
      <h1>Password Reset</h1>
      <p>You requested a password reset for your DataFixer AI account.</p>
      <p>Please click the link below to reset your password:</p>
      <a href="${resetUrl}" style="display: inline-block; background-color: #10b981; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a>
      <p>If you didn't request this, please ignore this email.</p>
      <p>This link is valid for 1 hour.</p>
    `

    await sendEmail({
      to: user.email,
      subject: "DataFixer AI - Password Reset",
      html: message,
    })

    res.json({ message: "If an account with that email exists, a password reset link has been sent." })
  } catch (error) {
    console.error("Forgot password error:", error)
    res.status(500).json({ message: "Server error" })
  }
};

// Verify reset token
exports.verifyresettoken = async (req, res) => {
  try {
    // Get token from params
    const { token } = req.params

    // Hash token
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex")

    // Find user with matching token and valid expiry
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    })

    if (!user) {
      return res.status(400).json({ message: "Password reset token is invalid or has expired" })
    }

    res.json({ message: "Token is valid" })
  } catch (error) {
    console.error("Token verification error:", error)
    res.status(500).json({ message: "Server error" })
  }
};

// Reset password
exports.resetpassword = async (req, res) => {
  try {
    const { token, password } = req.body

    // Hash token
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex")

    // Find user with matching token and valid expiry
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    })

    if (!user) {
      return res.status(400).json({ message: "Password reset token is invalid or has expired" })
    }

    // Set new password
    user.password = password

    // Clear reset token fields
    user.resetPasswordToken = undefined
    user.resetPasswordExpires = undefined

    await user.save()

    // Send confirmation email
    const message = `
      <h1>Password Reset Successful</h1>
      <p>Your password has been successfully reset.</p>
      <p>If you did not perform this action, please contact support immediately.</p>
    `

    await sendEmail({
      to: user.email,
      subject: "DataFixer AI - Password Reset Successful",
      html: message,
    })

    res.json({ message: "Password has been reset" })
  } catch (error) {
    console.error("Reset password error:", error)
    res.status(500).json({ message: "Server error" })
  }
};

