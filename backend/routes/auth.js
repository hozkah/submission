const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const db = require("../config/database");
const bcrypt = require("bcrypt");
const { auth } = require("../middleware/auth");
const {
  register,
  login,
  getCurrentUser,
} = require("../controllers/authController");

// Register route
router.post("/register", register);

// Login route
router.post("/login", login);

// Get current user
router.get("/me", auth, async (req, res) => {
  try {
    const user = req.user;
    console.log("/auth/me - Received user:", user);

    // Format user data based on role
    const userData = {
      id: user.id,
      role: user.role,
      email: user.email,
      isActive: user.is_active,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
    };
    console.log("/auth/me - Formatted user data:", userData);

    // Add role-specific fields
    if (user.role === "manager") {
      userData.username = user.username;
      userData.firstName = user.username.split(" ")[0] || "";
      userData.lastName = user.username.split(" ").slice(1).join(" ") || "";
      console.log("/auth/me - Added manager-specific fields");
    } else if (user.role === "babysitter") {
      userData.firstName = user.first_name;
      userData.lastName = user.last_name;
      userData.phone = user.phone_number;
      userData.hourlyRate = user.hourly_rate;
      userData.nin = user.nin;
      userData.age = user.age;
      userData.nextOfKinName = user.next_of_kin_name;
      userData.nextOfKinPhone = user.next_of_kin_phone;
      userData.nextOfKinRelationship = user.next_of_kin_relationship;
      console.log("/auth/me - Added babysitter-specific fields");
    }

    res.json(userData);
  } catch (error) {
    console.error("/auth/me - Error:", error);
    res.status(500).json({ message: "Error getting current user" });
  }
});

module.exports = router;
