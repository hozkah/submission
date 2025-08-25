const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const { auth, authorize } = require("../middleware/auth");
const Babysitter = require("../models/Babysitter");
const FinancialTransaction = require("../models/FinancialTransaction");
const Attendance = require("../models/Attendance");
const db = require("../config/database");
const bcrypt = require("bcryptjs");

// Get all babysitters
router.get("/", async (req, res) => {
  try {
    const [babysitters] = await db.query(
      `SELECT b.id, b.first_name, b.last_name, b.email, b.phone_number, b.nin, b.age, 
       b.next_of_kin_name, b.next_of_kin_phone, b.next_of_kin_relationship, 
       b.is_active, b.last_login, b.created_at,
       COUNT(c.id) as children_assigned_count
       FROM babysitters b
       LEFT JOIN children c ON b.id = c.assigned_babysitter_id
       WHERE b.is_active = 1
       GROUP BY b.id`
    );
    res.json(babysitters);
  } catch (error) {
    console.error("Error fetching babysitters:", error);
    res
      .status(500)
      .json({ message: "Error fetching babysitters", error: error.message });
  }
});

// Get all users (managers)
router.get("/users", auth, async (req, res) => {
  try {
    const [users] = await db.query(
      `SELECT id, username, email, is_active, last_login, created_at
       FROM users 
       WHERE is_active = 1
       ORDER BY created_at DESC`
    );
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res
      .status(500)
      .json({ message: "Error fetching users", error: error.message });
  }
});

// Register a new babysitter
router.post(
  "/",
  [
    auth,
    authorize("manager"),
    body("firstName").trim().notEmpty().withMessage("First name is required"),
    body("lastName").trim().notEmpty().withMessage("Last name is required"),
    body("email")
      .isEmail()
      .withMessage("Please provide a valid email"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
    body("phoneNumber")
      .trim()
      .notEmpty()
      .withMessage("Phone number is required"),
    body("nin")
      .trim()
      .notEmpty()
      .withMessage("National Identification Number is required"),
    body("dateOfBirth")
      .notEmpty()
      .withMessage("Date of birth is required"),
    body("nextOfKin.name")
      .trim()
      .notEmpty()
      .withMessage("Next of kin name is required"),
    body("nextOfKin.phoneNumber")
      .trim()
      .notEmpty()
      .withMessage("Next of kin phone number is required"),
    body("nextOfKin.relationship")
      .trim()
      .notEmpty()
      .withMessage("Next of kin relationship is required"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const {
        firstName,
        lastName,
        email,
        password,
        phoneNumber,
        nin,
        dateOfBirth,
        nextOfKin,
      } = req.body;

      // Validate age range
      const birthDate = new Date(dateOfBirth);
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
        [email, nin]
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
          phoneNumber,
          nin,
          age,
          nextOfKin.name,
          nextOfKin.phoneNumber,
          nextOfKin.relationship,
          hashedPassword,
          true,
        ]
      );

      const babysitterId = result.insertId;

      // Get the created babysitter
      const [newBabysitter] = await db.query(
        "SELECT * FROM babysitters WHERE id = ?",
        [babysitterId]
      );

      res.status(201).json({
        message: "Babysitter registered successfully",
        babysitter: newBabysitter[0],
      });
    } catch (error) {
      console.error("Error registering babysitter:", error);
      res.status(500).json({
        message: "Error registering babysitter",
        error: error.message,
      });
    }
  }
);

// Register a new manager
router.post(
  "/manager",
  [
    auth,
    authorize("manager"),
    body("firstName").trim().notEmpty().withMessage("First name is required"),
    body("lastName").trim().notEmpty().withMessage("Last name is required"),
    body("email")
      .isEmail()
      .withMessage("Please provide a valid email"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
    body("username")
      .trim()
      .notEmpty()
      .withMessage("Username is required"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { firstName, lastName, email, password, username } = req.body;

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

      // Insert into users table
      const [result] = await db.query(
        "INSERT INTO users (username, email, password, is_active) VALUES (?, ?, ?, ?)",
        [username, email, hashedPassword, true]
      );

      const userId = result.insertId;

      // Get the created user
      const [newUser] = await db.query(
        "SELECT id, username, email, is_active, created_at FROM users WHERE id = ?",
        [userId]
      );

      res.status(201).json({
        message: "Manager registered successfully",
        manager: newUser[0],
      });
    } catch (error) {
      console.error("Error registering manager:", error);
      res.status(500).json({
        message: "Error registering manager",
        error: error.message,
      });
    }
  }
);

// Get all babysitter schedules
router.get("/schedules", auth, async (req, res) => {
  try {
    const [schedules] = await db.query(`
      SELECT 
        bs.*,
        b.first_name,
        b.last_name,
        COUNT(c.id) as children_assigned_count
      FROM babysitter_schedules bs
      JOIN babysitters b ON bs.babysitter_id = b.id
      LEFT JOIN children c ON b.id = c.assigned_babysitter_id
      WHERE b.is_active = TRUE
      GROUP BY bs.id, b.id, bs.date, bs.start_time, bs.end_time, bs.session_type, bs.status, bs.created_at
      ORDER BY bs.date DESC, bs.start_time ASC
    `);

    if (!schedules) {
      return res.status(200).json([]);
    }

    res.json(schedules);
  } catch (error) {
    console.error("Error fetching schedules:", error);
    res.status(500).json({ error: "Failed to fetch schedules" });
  }
});

// Get babysitter by ID
router.get("/:id", auth, async (req, res) => {
  try {
    const [babysitter] = await db.query(
      "SELECT * FROM babysitters WHERE id = ? AND is_active = TRUE",
      [req.params.id]
    );

    if (!babysitter || babysitter.length === 0) {
      return res.status(404).json({ message: "Babysitter not found" });
    }

    res.json(babysitter[0]);
  } catch (error) {
    console.error("Error fetching babysitter:", error);
    res.status(500).json({ error: "Failed to fetch babysitter" });
  }
});

// Update babysitter
router.put(
  "/:id",
  [
    auth,
    authorize("manager"),
    body("firstName").optional().trim().notEmpty(),
    body("lastName").optional().trim().notEmpty(),
    body("email").optional().isEmail(),
    body("phoneNumber").optional().trim().notEmpty(),
    body("age").optional().isInt({ min: 21, max: 35 }),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const babysitter = await Babysitter.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      );

      if (!babysitter) {
        return res.status(404).json({ message: "Babysitter not found" });
      }

      res.json({
        message: "Babysitter updated successfully",
        babysitter,
      });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error updating babysitter", error: error.message });
    }
  }
);

// Delete babysitter (soft delete)
router.delete("/:id", [auth, authorize("manager")], async (req, res) => {
  try {
    const result = await Babysitter.deleteBabysitter(req.params.id);
    res.json(result);
  } catch (error) {
    console.error("Error in delete route:", error);
    if (error.message === "Babysitter not found") {
      return res.status(404).json({ message: error.message });
    }
    res
      .status(500)
      .json({ message: "Error deactivating babysitter", error: error.message });
  }
});

// Get babysitter's payment history
router.get("/:id/payments", auth, async (req, res) => {
  try {
    const { id } = req.params;

    const [payments] = await db.query(
      `SELECT 
        id,
        date,
        session_type,
        children_count,
        amount,
        status
      FROM babysitter_payments 
      WHERE babysitter_id = ? 
      ORDER BY date DESC`,
      [id]
    );

    res.json(payments);
  } catch (error) {
    console.error("Error fetching payment history:", error);
    res.status(500).json({
      message: "Error fetching payment history",
      error: error.message,
    });
  }
});

// Get babysitter's attendance history
router.get("/:id/attendance", auth, async (req, res) => {
  try {
    const attendance = await Attendance.find({
      babysitter: req.params.id,
    }).sort({ date: -1 });

    res.json(attendance);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching attendance history",
      error: error.message,
    });
  }
});

// Get approved schedules for payments
router.get("/payments", auth, async (req, res) => {
  try {
    const [payments] = await db.query(`
      SELECT 
        bp.*,
        b.first_name,
        b.last_name
      FROM babysitter_payments bp
      JOIN babysitters b ON bp.babysitter_id = b.id
      WHERE bp.status = 'pending'
      ORDER BY bp.date DESC
    `);

    res.json(payments);
  } catch (error) {
    console.error("Error fetching payments:", error);
    res.status(500).json({ error: "Failed to fetch payments" });
  }
});

// Clear a payment
router.post(
  "/payments/:id/clear",
  [auth, authorize("manager")],
  async (req, res) => {
    try {
      const paymentId = req.params.id;

      // Update the payment status to completed
      await db.query(
        `UPDATE babysitter_payments 
         SET status = 'completed' 
         WHERE id = ? AND status = 'pending'`,
        [paymentId]
      );

      res.json({
        message: "Payment approved successfully",
      });
    } catch (error) {
      console.error("Error clearing payment:", error);
      res.status(500).json({
        message: "Error clearing payment",
        error: error.message,
      });
    }
  }
);

// Create a new payment record
router.post("/payments", auth, async (req, res) => {
  try {
    const { babysitter_id, date, session_type, children_count } = req.body;
    const userId = req.user.id;

    // Validate required fields
    if (
      !babysitter_id ||
      !date ||
      !session_type ||
      children_count === undefined
    ) {
      return res.status(400).json({
        message: "Missing required fields",
        required: ["babysitter_id", "date", "session_type", "children_count"],
      });
    }

    // Check if babysitter exists and is active
    const [babysitter] = await db.query(
      "SELECT id, first_name, last_name FROM babysitters WHERE id = ? AND is_active = TRUE",
      [babysitter_id]
    );

    if (!babysitter || babysitter.length === 0) {
      return res.status(404).json({
        message: "Babysitter not found or inactive",
        babysitter_id: babysitter_id,
      });
    }

    // Calculate amount
    const rate = session_type === "full-day" ? 5000 : 2000;
    const amount = children_count > 0 ? rate * children_count : 0;

    // Start a transaction
    await db.query("START TRANSACTION");

    try {
      // Insert into babysitter_payments
      const [result] = await db.query(
        `INSERT INTO babysitter_payments 
         (babysitter_id, date, session_type, children_count, amount, status)
         VALUES (?, ?, ?, ?, ?, 'pending')`,
        [babysitter_id, date, session_type, children_count, amount]
      );

      // Get the created payment with babysitter details
      const [payment] = await db.query(
        `SELECT 
          bp.*,
          b.first_name,
          b.last_name
         FROM babysitter_payments bp
         JOIN babysitters b ON bp.babysitter_id = b.id
         WHERE bp.id = ?`,
        [result.insertId]
      );

      // Commit the transaction
      await db.query("COMMIT");

      res.status(201).json({
        message: "Payment record created successfully",
        payment: payment[0],
      });
    } catch (error) {
      // Rollback the transaction if any error occurs
      await db.query("ROLLBACK");
      throw error;
    }
  } catch (error) {
    console.error("Error creating payment record:", error);
    res.status(500).json({
      message: "Error creating payment record",
      error: error.message,
    });
  }
});

// Create schedule for babysitter
router.post("/:id/schedule", [auth, authorize("manager")], async (req, res) => {
  try {
    const { id } = req.params;
    const { date, startTime, endTime, sessionType } = req.body;

    // Validate required fields
    if (!date || !startTime || !endTime || !sessionType) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Check if babysitter exists and is active
    const [babysitter] = await db.query(
      "SELECT * FROM babysitters WHERE id = ? AND is_active = TRUE",
      [id]
    );

    if (!babysitter || babysitter.length === 0) {
      return res
        .status(404)
        .json({ error: "Babysitter not found or inactive" });
    }

    // Start a transaction
    await db.query("START TRANSACTION");

    try {
      // Insert the schedule with approved status
      const [scheduleResult] = await db.query(
        `INSERT INTO babysitter_schedules 
         (babysitter_id, date, start_time, end_time, session_type, status) 
         VALUES (?, ?, ?, ?, ?, 'approved')`,
        [id, date, startTime, endTime, sessionType]
      );

      // Get children count for the babysitter
    const [childrenCount] = await db.query(
      `SELECT COUNT(*) as count 
       FROM children 
         WHERE assigned_babysitter_id = ?`,
        [id]
    );

      const count = childrenCount[0].count || 0;

      // Calculate payment amount
    const rate = sessionType === "full-day" ? 5000 : 2000;
      const amount = count > 0 ? rate * count : 0;

      // Create payment record
      const [paymentResult] = await db.query(
        `INSERT INTO babysitter_payments 
         (babysitter_id, date, session_type, children_count, amount, status)
         VALUES (?, ?, ?, ?, ?, 'pending')`,
        [id, date, sessionType, count, amount]
      );

      // Get the created schedule with babysitter details
      const [schedule] = await db.query(
        `SELECT 
          bs.*,
          b.first_name,
          b.last_name,
          COUNT(c.id) as children_assigned_count
         FROM babysitter_schedules bs
         JOIN babysitters b ON bs.babysitter_id = b.id
         LEFT JOIN children c ON b.id = c.assigned_babysitter_id
         WHERE bs.id = ?
         GROUP BY bs.id, b.id, bs.date, bs.start_time, bs.end_time, bs.session_type`,
        [scheduleResult.insertId]
      );

      // Get the created payment with babysitter details
      const [payment] = await db.query(
        `SELECT 
          bp.*,
          b.first_name,
          b.last_name
         FROM babysitter_payments bp
         JOIN babysitters b ON bp.babysitter_id = b.id
         WHERE bp.id = ?`,
        [paymentResult.insertId]
      );

      // Commit the transaction
      await db.query("COMMIT");

      res.status(201).json({
        message: "Schedule created and payment record generated successfully",
        schedule: schedule[0],
        payment: payment[0],
      });
    } catch (error) {
      // Rollback the transaction if any error occurs
      await db.query("ROLLBACK");
      throw error;
    }
  } catch (error) {
    console.error("Error creating schedule:", error);
    res.status(500).json({ error: "Failed to create schedule" });
  }
});

// Update schedule status
router.put(
  "/schedules/:id/status",
  [auth, authorize("manager")],
  async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      // Validate status
      if (!status || !["pending", "approved"].includes(status)) {
        return res.status(400).json({ error: "Invalid status" });
      }

      // Update the status
      await db.query(
        "UPDATE babysitter_schedules SET status = ? WHERE id = ?",
        [status, id]
      );

      res.json({ message: "Status updated successfully" });
    } catch (error) {
      console.error("Error updating status:", error);
      res.status(500).json({ error: "Failed to update status" });
    }
  }
);

// Get all babysitter payments
router.get("/payments/all", auth, async (req, res) => {
  try {
    const [payments] = await db.query(`
      SELECT 
        bp.*,
        b.first_name,
        b.last_name
      FROM babysitter_payments bp
      JOIN babysitters b ON bp.babysitter_id = b.id
      ORDER BY bp.date DESC
    `);

    res.json(payments);
  } catch (error) {
    console.error("Error fetching payments:", error);
    res.status(500).json({ error: "Failed to fetch payments" });
  }
});

// Get assigned children count for a babysitter
router.get("/:id/children/count", auth, async (req, res) => {
  try {
    const [results] = await db.query(
      "SELECT COUNT(*) as count FROM children WHERE assigned_babysitter_id = ?",
      [req.params.id]
    );
    res.json({ count: results[0].count });
  } catch (error) {
    console.error("Error fetching children count:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get babysitter payments summary
router.get("/:id/payments/summary", auth, async (req, res) => {
  try {
    const [pending] = await db.query(
      'SELECT SUM(amount) as total FROM babysitter_payments WHERE babysitter_id = ? AND status = "pending"',
      [req.params.id]
    );

    const [completed] = await db.query(
      'SELECT SUM(amount) as total FROM babysitter_payments WHERE babysitter_id = ? AND status = "completed"',
      [req.params.id]
    );

    res.json({
      pending: pending[0].total || 0,
      completed: completed[0].total || 0,
    });
  } catch (error) {
    console.error("Error fetching payments summary:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get today's schedule for a babysitter
router.get("/:id/schedule/today", auth, async (req, res) => {
  try {
    const today = new Date().toISOString().split("T")[0];
    const [schedule] = await db.query(
      'SELECT * FROM babysitter_schedules WHERE babysitter_id = ? AND date = ? AND status != "rejected"',
      [req.params.id, today]
    );
    res.json(schedule);
  } catch (error) {
    console.error("Error fetching today's schedule:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get all schedules for a specific babysitter
router.get("/:id/schedules", auth, async (req, res) => {
  try {
    const { id } = req.params;

    const [schedules] = await db.query(
      `SELECT 
        id,
        date,
        start_time,
        end_time,
        session_type,
        status
      FROM babysitter_schedules 
      WHERE babysitter_id = ? 
      ORDER BY date DESC`,
      [id]
    );

    res.json(schedules);
  } catch (error) {
    console.error("Error fetching babysitter schedules:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get all payments for a specific babysitter
router.get("/:id/payments", auth, async (req, res) => {
  try {
    const { id } = req.params;

    const [payments] = await db.query(
      `SELECT 
        id,
        date,
        session_type,
        children_count,
        amount,
        status
      FROM babysitter_payments 
      WHERE babysitter_id = ? 
      ORDER BY date DESC`,
      [id]
    );

    res.json(payments);
  } catch (error) {
    console.error("Error fetching babysitter payments:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
