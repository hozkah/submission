const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const { auth, authorize } = require("../middleware/auth");
const IncidentReport = require("../models/IncidentReport");
const Child = require("../models/Child");
// const Notification = require("../models/Notification");
const db = require("../config/database");
const { sendIncidentEmail } = require("../services/emailService");

// Create incident report
router.post(
  "/",
  [
    auth,
    body("child_id").isInt().withMessage("Child ID is required"),
    body("incident_type")
      .isIn([
        "health",
        "behavior",
        "well-being",
        "payment-reminder",
        "payment-overdue",
      ])
      .withMessage("Invalid incident type"),
    body("description")
      .trim()
      .notEmpty()
      .withMessage("Description is required"),
    body("target").isIn(["parent", "manager"]).withMessage("Invalid target"),
  ],
  async (req, res) => {
    console.log("Creating incident report:", req.body);
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { child_id, incident_type, description, target } = req.body;

      // Get child and parent details
      // const [childRows] = await db.execute(
      //   `SELECT c.*, p.email as parent_email, p.name as parent_name
      //    FROM children c
      //    LEFT JOIN parents p ON c.parent_id = p.id
      //    WHERE c.id = ?`,
      //   [child_id]
      // );

      const [childRows] = await db.query(
        "SELECT * FROM children WHERE id = ?",
        [child_id]
      );

      if (childRows.length === 0) {
        return res.status(404).json({ message: "Child not found" });
      }

      const child = childRows[0];
      console.log("Found child:", child.full_name);

      // Insert incident report
      const [result] = await db.execute(
        `INSERT INTO incident_report 
         (child_id, incident_type, description, reported_by, target) 
         VALUES (?, ?, ?, ?, ?)`,
        [child_id, incident_type, description, req.user.id, target]
      );

      console.log("Incident report created with ID:", result.insertId);
      console.log("Target:", target, "User role:", req.user.role);

      // Send email notification if target is parent
      if (target === "parent" && child.parent_email) {
        try {
          await sendIncidentEmail(
            child.parent_email,
            child.full_name,
            incident_type,
            description,
            child.parent_name
          );
          res.json({
            message: "Incident report submitted and email sent to parent",
            incidentId: result.insertId,
          });
        } catch (emailError) {
          console.error("Email sending failed:", emailError);
          res.json({
            message: "Incident saved but email notification failed",
            incidentId: result.insertId,
          });
        }
      } else {
        res.json({
          message: "Incident report submitted successfully",
          incidentId: result.insertId,
        });
      }
    } catch (error) {
      console.error("Error creating incident:", error);
      res.status(500).json({
        message: "Error creating incident report",
        error: error.message,
      });
    }
  }
);

// Update incident report
router.put(
  "/:id",
  [
    auth,
    authorize("manager"),
    body("parentNotified").optional().isBoolean(),
    body("followUpRequired").optional().isBoolean(),
    body("followUpNotes").optional().trim(),
    body("status").optional().isIn(["open", "resolved", "closed"]),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const incident = await IncidentReport.findById(req.params.id);
      if (!incident) {
        return res.status(404).json({ message: "Incident report not found" });
      }

      // Update parent notification date if parent was just notified
      if (req.body.parentNotified && !incident.parentNotified) {
        req.body.parentNotificationDate = new Date();
      }

      const updatedIncident = await IncidentReport.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      );

      res.json({
        message: "Incident report updated successfully",
        incident: updatedIncident,
      });
    } catch (error) {
      res.status(500).json({
        message: "Error updating incident report",
        error: error.message,
      });
    }
  }
);

// Get incident reports
router.get("/", auth, async (req, res) => {
  try {
    const { startDate, endDate, child, incidentType, status } = req.query;
    let query = `
      SELECT 
        ir.*,
        c.full_name as child_name,
        CONCAT(b.first_name, ' ', b.last_name) as reported_by_name
      FROM incident_report ir
      LEFT JOIN children c ON ir.child_id = c.id
      LEFT JOIN babysitters b ON ir.reported_by = b.id
      WHERE 1=1
    `;
    const params = [];

    if (startDate && endDate) {
      query += " AND ir.created_at BETWEEN ? AND ?";
      params.push(startDate, endDate);
    }

    if (child) {
      query += " AND ir.child_id = ?";
      params.push(child);
    }

    if (incidentType) {
      query += " AND ir.incident_type = ?";
      params.push(incidentType);
    }

    if (status) {
      query += " AND ir.status = ?";
      params.push(status);
    }

    query += " ORDER BY ir.created_at DESC";

    const [incidents] = await db.query(query, params);
    res.json(incidents);
  } catch (error) {
    console.error("Error fetching incident reports:", error);
    res.status(500).json({
      message: "Error fetching incident reports",
      error: error.message,
    });
  }
});

// Test endpoint to check database structure
router.get("/test/db", auth, async (req, res) => {
  try {
    console.log("Testing database structure...");
    
    // Check if incident_report table exists
    const [tables] = await db.query("SHOW TABLES LIKE 'incident_report'");
    console.log("incident_report table exists:", tables.length > 0);
    
    if (tables.length === 0) {
      return res.status(500).json({ 
        message: "incident_report table does not exist",
        availableTables: await db.query("SHOW TABLES")
      });
    }
    
    // Check table structure
    const [columns] = await db.query("DESCRIBE incident_report");
    console.log("incident_report table structure:", columns);
    
    // Check if there are any records
    const [count] = await db.query("SELECT COUNT(*) as count FROM incident_report");
    console.log("Total incident reports:", count[0].count);
    
    // Check manager incidents
    const [managerCount] = await db.query("SELECT COUNT(*) as count FROM incident_report WHERE target = 'manager'");
    console.log("Manager incidents:", managerCount[0].count);
    
    // Get sample data
    const [sample] = await db.query("SELECT * FROM incident_report LIMIT 5");
    console.log("Sample incident reports:", sample);
    
    res.json({
      tableExists: true,
      structure: columns,
      totalCount: count[0].count,
      managerCount: managerCount[0].count,
      sample: sample
    });
  } catch (error) {
    console.error("Database test error:", error);
    res.status(500).json({
      message: "Database test failed",
      error: error.message
    });
  }
});

// Get notifications for manager
router.get("/notifications", [auth, authorize("manager")], async (req, res) => {
  console.log("Fetching notifications for user:", req.user.id);
  try {
    const { babysitterName, childName } = req.query;
    
    let whereClause = "WHERE ir.target = 'manager'";
    const params = [];
    
    // Add babysitter name filter
    if (babysitterName && babysitterName.trim()) {
      whereClause += " AND (b.first_name LIKE ? OR b.last_name LIKE ? OR CONCAT(b.first_name, ' ', b.last_name) LIKE ?)";
      const searchTerm = `%${babysitterName.trim()}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }
    
    // Add child name filter
    if (childName && childName.trim()) {
      whereClause += " AND c.full_name LIKE ?";
      params.push(`%${childName.trim()}%`);
    }
    
    console.log("Filtering notifications with:", { babysitterName, childName });
    
    // Get filtered notifications with child and reporter names
    const [notifications] = await db.query(`
      SELECT 
        ir.id,
        ir.child_id,
        ir.incident_type,
        ir.description,
        ir.status,
        ir.created_at,
        ir.target,
        c.full_name as child_name,
        CONCAT(b.first_name, ' ', b.last_name) as reported_by_name
      FROM incident_report ir
      LEFT JOIN children c ON ir.child_id = c.id
      LEFT JOIN babysitters b ON ir.reported_by = b.id
      ${whereClause}
      ORDER BY ir.status ASC, ir.created_at DESC
    `, params);

    console.log("Fetched notifications:", notifications);

    if (!notifications || notifications.length === 0) {
      return res.json([]);
    }

    res.json(notifications);
  } catch (error) {
    console.error("Error in notifications endpoint:", {
      message: error.message,
      sqlMessage: error.sqlMessage,
      code: error.code,
      sql: error.sql,
      stack: error.stack,
    });
    res.status(500).json({
      message: "Error fetching notifications",
      error: error.message,
      sqlMessage: error.sqlMessage,
    });
  }
});

// Get unread notifications count
router.get(
  "/notifications/unread",
  [auth, authorize("manager")],
  async (req, res) => {
    console.log("Fetching unread notifications count for user:", req.user.id);
    try {
      const [result] = await db.query(
        `SELECT COUNT(*) as count 
       FROM incident_report 
       WHERE target = 'manager' 
       AND status = 0`
      );

      console.log("Unread notifications count:", result[0].count);
      res.json({ count: result[0].count });
    } catch (error) {
      console.error("Error fetching unread notifications count:", error);
      res.status(500).json({
        message: "Error fetching unread notifications count",
        error: error.message,
      });
    }
  }
);

// Get incident report by ID
router.get("/:id", auth, async (req, res) => {
  try {
    const [incidents] = await db.query(
      `SELECT 
        ir.*,
        c.full_name as child_name,
        CONCAT(b.first_name, ' ', b.last_name) as reported_by_name
      FROM incident_report ir
      LEFT JOIN children c ON ir.child_id = c.id
      LEFT JOIN babysitters b ON ir.reported_by = b.id
      WHERE ir.id = ?`,
      [req.params.id]
    );

    if (incidents.length === 0) {
      return res.status(404).json({ message: "Incident report not found" });
    }

    res.json(incidents[0]);
  } catch (error) {
    console.error("Error fetching incident report:", error);
    res.status(500).json({
      message: "Error fetching incident report",
      error: error.message,
    });
  }
});

// Get incident summary
router.get("/summary", [auth, authorize("manager")], async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    let query = "SELECT * FROM incident_report WHERE 1=1";
    const params = [];

    if (startDate && endDate) {
      query += " AND created_at BETWEEN ? AND ?";
      params.push(startDate, endDate);
    }

    const [incidents] = await db.query(query, params);

    const summary = {
      totalIncidents: incidents.length,
      byType: {},
      byStatus: {
        open: 0,
        resolved: 0,
        closed: 0,
      },
    };

    incidents.forEach((incident) => {
      // Count by type
      summary.byType[incident.incident_type] =
        (summary.byType[incident.incident_type] || 0) + 1;

      // Count by status
      if (incident.status === 0) {
        summary.byStatus.open++;
      } else if (incident.status === 1) {
        summary.byStatus.resolved++;
      } else {
        summary.byStatus.closed++;
      }
    });

    res.json(summary);
  } catch (error) {
    console.error("Error fetching incident summary:", error);
    res.status(500).json({
      message: "Error fetching incident summary",
      error: error.message,
    });
  }
});

// Get incidents for a child
router.get("/child/:childId", auth, async (req, res) => {
  try {
    const [incidents] = await db.execute(
      `SELECT i.*, 
       CONCAT(u.first_name, ' ', u.last_name) as reported_by_name
       FROM incidents i
       LEFT JOIN users u ON i.reported_by = u.id
       WHERE i.child_id = ?
       ORDER BY i.created_at DESC`,
      [req.params.childId]
    );

    res.json(incidents);
  } catch (error) {
    console.error("Error fetching incidents:", error);
    res.status(500).json({
      message: "Error fetching incidents",
      error: error.message,
    });
  }
});

// Mark notification as read
router.put("/:id/read", [auth, authorize("manager")], async (req, res) => {
  console.log("Marking notification as read:", req.params.id);
  try {
    const [result] = await db.query(
      "UPDATE incident_report SET status = TRUE WHERE id = ? AND target = 'manager'",
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      console.log("Notification not found:", req.params.id);
      return res.status(404).json({ message: "Notification not found" });
    }

    console.log("Notification marked as read:", req.params.id);
    res.json({ message: "Notification marked as read" });
  } catch (error) {
    console.error("Error marking notification as read:", {
      message: error.message,
      sqlMessage: error.sqlMessage,
      code: error.code,
      sql: error.sql,
      stack: error.stack,
    });
    res.status(500).json({
      message: "Error marking notification as read",
      error: error.message,
      sqlMessage: error.sqlMessage,
    });
  }
});

module.exports = router;
