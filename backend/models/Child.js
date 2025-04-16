const pool = require("../config/database");

/**
 * Creates a new child in the database
 * @param {Object} childData - Child data including personal and parent information
 * @returns {Promise<number>} - The ID of the newly created child
 */
async function createChild(childData) {
  const [result] = await pool.execute(
    `INSERT INTO children (
      full_name, age, parent_name, parent_phone, parent_email,
      special_care_needs, session_type, assigned_babysitter_id
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      childData.fullName,
      childData.age,
      childData.parentName,
      childData.parentPhone,
      childData.parentEmail,
      childData.specialCareNeeds,
      childData.sessionType,
      childData.assignedBabysitterId,
    ]
  );
  return result.insertId;
}

/**
 * Finds a child by their ID
 * @param {number} id - The child ID to search for
 * @returns {Promise<Object|null>} - The child object or null if not found
 */
async function findChildById(id) {
  const [rows] = await pool.execute("SELECT * FROM children WHERE id = ?", [
    id,
  ]);
  return rows[0] || null;
}

/**
 * Retrieves all children
 * @returns {Promise<Array>} - Array of child objects
 */
async function findAllChildren() {
  const [rows] = await pool.execute("SELECT * FROM children");
  return rows;
}

/**
 * Updates a child's information
 * @param {number} id - The ID of the child to update
 * @param {Object} updates - The fields to update and their new values
 * @returns {Promise<void>}
 */
async function updateChild(id, updates) {
  const fields = [];
  const values = [];

  for (const [key, value] of Object.entries(updates)) {
    fields.push(`${key} = ?`);
    values.push(value);
  }

  values.push(id);
  await pool.execute(
    `UPDATE children SET ${fields.join(", ")} WHERE id = ?`,
    values
  );
}

/**
 * Soft deletes a child by setting is_active to false
 * @param {number} id - The ID of the child to delete
 * @returns {Promise<void>}
 */
async function deleteChild(id) {
  await pool.execute("UPDATE children SET is_active = FALSE WHERE id = ?", [
    id,
  ]);
}

/**
 * Gets all attendance records for a specific child
 * @param {number} id - The ID of the child
 * @returns {Promise<Array>} - Array of attendance records
 */
async function getChildAttendance(id) {
  const [rows] = await pool.execute(
    "SELECT * FROM attendance WHERE child_id = ? ORDER BY date DESC",
    [id]
  );
  return rows;
}

/**
 * Gets all incident reports for a specific child
 * @param {number} id - The ID of the child
 * @returns {Promise<Array>} - Array of incident reports
 */
async function getChildIncidents(id) {
  const [rows] = await pool.execute(
    "SELECT * FROM incident_reports WHERE child_id = ? ORDER BY date DESC",
    [id]
  );
  return rows;
}

/**
 * Finds all children assigned to a specific babysitter
 * @param {number} babysitterId - The ID of the babysitter
 * @returns {Promise<Array>} - Array of child objects
 */
async function findChildrenByBabysitter(babysitterId) {
  const [rows] = await pool.execute(
    "SELECT * FROM children WHERE assigned_babysitter_id = ?",
    [babysitterId]
  );
  return rows;
}

// Export all functions
module.exports = {
  createChild,
  findChildById,
  findAllChildren,
  findChildrenByBabysitter,
  updateChild,
  deleteChild,
  getChildAttendance,
  getChildIncidents,
};
