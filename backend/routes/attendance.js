const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const { auth, authorize } = require("../middleware/auth");
const attendanceController = require("../controllers/attendanceController");

// Create attendance record
router.post(
  "/",
  [
    auth,
    authorize("manager", "babysitter"),
    body("childId").isInt().withMessage("Valid child ID is required"),
    body("date").isISO8601().withMessage("Valid date is required"),
    body("status")
      .isIn(["present", "absent", "late"])
      .withMessage("Invalid status"),
    body("notes").optional().isString(),
  ],
  attendanceController.createAttendance
);

// Get attendance records
router.get("/", auth, attendanceController.getAttendance);

// Update attendance record
router.put(
  "/:id",
  [
    auth,
    authorize("manager", "babysitter"),
    body("status").optional().isIn(["present", "absent", "late"]),
    body("notes").optional().isString(),
  ],
  attendanceController.updateAttendance
);

// Get attendance summary
router.get(
  "/summary",
  [auth, authorize("manager")],
  attendanceController.getAttendanceSummary
);

module.exports = router;
