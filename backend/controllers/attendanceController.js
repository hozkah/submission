const pool = require("../config/database");

const createAttendance = async (req, res) => {
  try {
    const { childId, date, status, notes } = req.body;
    const [result] = await pool.execute(
      "INSERT INTO attendance (child_id, date, status, notes) VALUES (?, ?, ?, ?)",
      [childId, date, status, notes]
    );
    res.status(201).json({
      id: result.insertId,
      message: "Attendance recorded successfully",
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error recording attendance", error: error.message });
  }
};

const getAttendance = async (req, res) => {
  try {
    const { startDate, endDate, childId } = req.query;
    let query = "SELECT * FROM attendance";
    const params = [];

    if (startDate && endDate) {
      query += " WHERE date BETWEEN ? AND ?";
      params.push(startDate, endDate);
    }

    if (childId) {
      query += params.length ? " AND child_id = ?" : " WHERE child_id = ?";
      params.push(childId);
    }

    const [attendance] = await pool.execute(query, params);
    res.json(attendance);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching attendance", error: error.message });
  }
};

const updateAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    await pool.execute(
      "UPDATE attendance SET status = ?, notes = ? WHERE id = ?",
      [status, notes, id]
    );
    res.json({ message: "Attendance updated successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating attendance", error: error.message });
  }
};

const getAttendanceSummary = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const [summary] = await pool.execute(
      `SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present,
        SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) as absent,
        SUM(CASE WHEN status = 'late' THEN 1 ELSE 0 END) as late
      FROM attendance
      WHERE date BETWEEN ? AND ?`,
      [startDate, endDate]
    );
    res.json(summary[0]);
  } catch (error) {
    res.status(500).json({
      message: "Error generating attendance summary",
      error: error.message,
    });
  }
};

module.exports = {
  createAttendance,
  getAttendance,
  updateAttendance,
  getAttendanceSummary,
};
