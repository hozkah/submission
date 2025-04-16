const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/database");

const register = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      role,
      additionalData,
      username,
    } = req.body;
    console.log(req.body);
    // Validate required fields
    if (!firstName || !lastName || !password || !role) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // For babysitters, validate additional required fields
    if (role === "babysitter") {
      if (
        !additionalData?.phoneNumber ||
        !additionalData?.nin ||
        !additionalData?.dateOfBirth ||
        !additionalData?.nextOfKin?.name ||
        !additionalData?.nextOfKin?.phone ||
        !additionalData?.nextOfKin?.relationship
      ) {
        return res
          .status(400)
          .json({ message: "Missing required babysitter information" });
      }

      // Validate age range
      const birthDate = new Date(additionalData.dateOfBirth);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();

      if (
        monthDiff < 0 ||
        (monthDiff === 0 && today.getDate() < birthDate.getDate())
      ) {
        age--;
      }

      if (age < 21 || age > 35) {
        return res
          .status(400)
          .json({ message: "Babysitter must be between 21 and 35 years old" });
      }

      // Check if email already exists in babysitters table
      const [existingBabysitter] = await db.query(
        "SELECT id FROM babysitters WHERE email = ? OR nin = ?",
        [email, additionalData.nin]
      );

      if (existingBabysitter.length > 0) {
        return res
          .status(400)
          .json({ message: "Email or NIN already registered" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Insert into babysitters table
      const [result] = await db.query(
        `INSERT INTO babysitters (
          first_name, last_name, email, phone_number, nin, age,
          next_of_kin_name, next_of_kin_phone, next_of_kin_relationship,
          password, is_active
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          firstName,
          lastName,
          email,
          additionalData.phoneNumber,
          additionalData.nin,
          age,
          additionalData.nextOfKin.name,
          additionalData.nextOfKin.phone,
          additionalData.nextOfKin.relationship,
          hashedPassword,
          true,
        ]
      );

      const babysitterId = result.insertId;

      // Generate JWT token
      const token = jwt.sign(
        { id: babysitterId, role: "babysitter" },
        process.env.JWT_SECRET,
        { expiresIn: "24h" }
      );

      res.status(201).json({
        message: "Registration successful",
        token,
        user: {
          id: babysitterId,
          email,
          role: "babysitter",
          firstName,
          lastName,
        },
      });
    } else if (role === "manager") {
      // For managers, validate username
      if (!username) {
        return res
          .status(400)
          .json({ message: "Username is required for managers" });
      }

      // Check if email or username already exists in users table
      const [existingUser] = await db.query(
        "SELECT id FROM users WHERE email = ? OR username = ?",
        [email, username]
      );

      if (existingUser.length > 0) {
        return res
          .status(400)
          .json({ message: "Email or username already exists" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
      console.log("Hashed password for manager:", hashedPassword);

      // Insert into users table
      const [result] = await db.query(
        "INSERT INTO users (username, email, password, is_active) VALUES (?, ?, ?, ?)",
        [username, email, hashedPassword, true]
      );
      console.log("Manager registration result:", result);

      const userId = result.insertId;

      // Generate JWT token
      const token = jwt.sign(
        { id: userId, role: "manager" },
        process.env.JWT_SECRET,
        { expiresIn: "24h" }
      );

      res.status(201).json({
        message: "Registration successful",
        token,
        user: {
          id: userId,
          email,
          role: "manager",
          firstName,
          lastName,
        },
      });
    } else {
      return res.status(400).json({ message: "Invalid role" });
    }
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      message: error.message || "Registration failed",
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("Login attempt for email:", email);

    // First check in babysitters table
    const [babysitters] = await db.query(
      "SELECT * FROM babysitters WHERE email = ?",
      [email]
    );

    // Then check in users table
    const [users] = await db.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);

    let user = null;
    let role = null;

    // If found in both tables, prioritize users table (managers)
    if (users.length > 0) {
      user = users[0];
      role = "manager";
      console.log("Using manager account from users table");
    } else if (babysitters.length > 0) {
      user = babysitters[0];
      role = "babysitter";
      console.log("Using babysitter account from babysitters table");
    }

    if (!user) {
      console.log("User not found in either table");
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Verify password
    console.log("Attempting password verification for:", role);
    console.log("Input password:", password);
    console.log("Stored hashed password:", user.password);

    const isValidPassword = await bcrypt.compare(password, user.password);
    console.log("Password validation result:", isValidPassword);

    if (!isValidPassword) {
      console.log("Invalid password");
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Update last login
    if (role === "babysitter") {
      await db.query("UPDATE babysitters SET last_login = NOW() WHERE id = ?", [
        user.id,
      ]);
    } else {
      await db.query("UPDATE users SET last_login = NOW() WHERE id = ?", [
        user.id,
      ]);
    }

    // Generate JWT token
    const token = jwt.sign({ id: user.id, role }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        role,
        firstName: user.first_name || user.username,
        lastName: user.last_name || "",
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Login failed" });
  }
};

module.exports = {
  register,
  login,
};
