const pool = require("../config/database");

/**
 * Creates a new attendance record in the database
 * @param {Object} attendanceData - Attendance data including child, date, and status
 * @returns {Promise<number>} - The ID of the newly created attendance record
 */
async function createAttendance(attendanceData) {
  const [result] = await pool.execute(
    `INSERT INTO attendance (
      child_id, date, status, check_in_time,
      check_out_time, notes, recorded_by
    ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      attendanceData.childId,
      attendanceData.date,
      attendanceData.status,
      attendanceData.checkInTime,
      attendanceData.checkOutTime,
      attendanceData.notes,
      attendanceData.recordedBy,
    ]
  );
  return result.insertId;
}

/**
 * Finds an attendance record by its ID
 * @param {number} id - The attendance record ID to search for
 * @returns {Promise<Object|null>} - The attendance record object or null if not found
 */
async function findAttendanceById(id) {
  const [rows] = await pool.execute("SELECT * FROM attendance WHERE id = ?", [
    id,
  ]);
  return rows[0] || null;
}

/**
 * Retrieves all attendance records with optional filters
 * @param {Object} filters - Optional filters for the query
 * @returns {Promise<Array>} - Array of attendance record objects
 */
async function findAllAttendance(filters = {}) {
  let query = "SELECT * FROM attendance WHERE 1=1";
  const params = [];

  if (filters.childId) {
    query += " AND child_id = ?";
    params.push(filters.childId);
  }

  if (filters.date) {
    query += " AND date = ?";
    params.push(filters.date);
  }

  if (filters.status) {
    query += " AND status = ?";
    params.push(filters.status);
  }

  if (filters.startDate && filters.endDate) {
    query += " AND date BETWEEN ? AND ?";
    params.push(filters.startDate, filters.endDate);
  }

  query += " ORDER BY date DESC";

  const [rows] = await pool.execute(query, params);
  return rows;
}

/**
 * Updates an attendance record's information
 * @param {number} id - The ID of the attendance record to update
 * @param {Object} updates - The fields to update and their new values
 * @returns {Promise<void>}
 */
async function updateAttendance(id, updates) {
  const fields = [];
  const values = [];

  for (const [key, value] of Object.entries(updates)) {
    fields.push(`${key} = ?`);
    values.push(value);
  }

  values.push(id);
  await pool.execute(
    `UPDATE attendance SET ${fields.join(", ")} WHERE id = ?`,
    values
  );
}

/**
 * Gets attendance summary for a specific date range
 * @param {Object} filters - Optional filters for the summary
 * @returns {Promise<Object>} - Summary object with attendance statistics
 */
async function getAttendanceSummary(filters = {}) {
  let query = `
    SELECT 
      COUNT(*) as total,
      SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present_count,
      SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) as absent_count,
      SUM(CASE WHEN status = 'late' THEN 1 ELSE 0 END) as late_count,
      AVG(TIMESTAMPDIFF(MINUTE, check_in_time, check_out_time)) as avg_duration
    FROM attendance
    WHERE 1=1
  `;
  const params = [];

  if (filters.startDate && filters.endDate) {
    query += " AND date BETWEEN ? AND ?";
    params.push(filters.startDate, filters.endDate);
  }

  const [summary] = await pool.execute(query, params);
  return summary[0];
}

// Export all functions
module.exports = {
  createAttendance,
  findAttendanceById,
  findAllAttendance,
  updateAttendance,
  getAttendanceSummary,
};
