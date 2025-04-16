const pool = require("../config/database");

/**
 * Creates a new incident report in the database
 * @param {Object} incidentData - Incident data including child, type, and description
 * @returns {Promise<number>} - The ID of the newly created incident report
 */
async function createIncidentReport(incidentData) {
  const [result] = await pool.execute(
    `INSERT INTO incident_report (
      child_id, reported_by, target, incident_type, description
    ) VALUES (?, ?, ?, ?, ?)`,
    [
      incidentData.child_id,
      incidentData.reported_by,
      incidentData.target,
      incidentData.incident_type,
      incidentData.description,
    ]
  );
  return result.insertId;
}

/**
 * Finds an incident report by its ID
 * @param {number} id - The incident report ID to search for
 * @returns {Promise<Object|null>} - The incident report object or null if not found
 */
async function findIncidentReportById(id) {
  const [rows] = await pool.execute(
    "SELECT * FROM incident_reports WHERE id = ?",
    [id]
  );
  return rows[0] || null;
}

/**
 * Retrieves all incident reports with optional filters
 * @param {Object} filters - Optional filters for the query
 * @returns {Promise<Array>} - Array of incident report objects
 */
async function findAllIncidentReports(filters = {}) {
  let query = "SELECT * FROM incident_reports WHERE 1=1";
  const params = [];

  if (filters.childId) {
    query += " AND child_id = ?";
    params.push(filters.childId);
  }

  if (filters.incidentType) {
    query += " AND incident_type = ?";
    params.push(filters.incidentType);
  }

  if (filters.severity) {
    query += " AND severity = ?";
    params.push(filters.severity);
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
 * Updates an incident report's information
 * @param {number} id - The ID of the incident report to update
 * @param {Object} updates - The fields to update and their new values
 * @returns {Promise<void>}
 */
async function updateIncidentReport(id, updates) {
  const fields = [];
  const values = [];

  for (const [key, value] of Object.entries(updates)) {
    fields.push(`${key} = ?`);
    values.push(value);
  }

  values.push(id);
  await pool.execute(
    `UPDATE incident_reports SET ${fields.join(", ")} WHERE id = ?`,
    values
  );
}

/**
 * Gets a summary of incident reports
 * @param {Object} filters - Optional filters for the summary
 * @returns {Promise<Object>} - Summary object with counts by type and severity
 */
async function getIncidentReportSummary(filters = {}) {
  let query = `
    SELECT 
      COUNT(*) as total,
      SUM(CASE WHEN incident_type = 'health' THEN 1 ELSE 0 END) as health_incidents,
      SUM(CASE WHEN incident_type = 'behavior' THEN 1 ELSE 0 END) as behavior_incidents,
      SUM(CASE WHEN incident_type = 'accident' THEN 1 ELSE 0 END) as accident_incidents,
      SUM(CASE WHEN incident_type = 'other' THEN 1 ELSE 0 END) as other_incidents,
      SUM(CASE WHEN severity = 'high' THEN 1 ELSE 0 END) as high_severity,
      SUM(CASE WHEN severity = 'medium' THEN 1 ELSE 0 END) as medium_severity,
      SUM(CASE WHEN severity = 'low' THEN 1 ELSE 0 END) as low_severity,
      SUM(CASE WHEN parent_notified = TRUE THEN 1 ELSE 0 END) as parent_notified,
      SUM(CASE WHEN follow_up_required = TRUE THEN 1 ELSE 0 END) as follow_up_required
    FROM incident_reports
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

/**
 * Gets all incident reports for a specific child
 * @param {number} childId - The ID of the child
 * @returns {Promise<Array>} - Array of incident reports
 */
async function getChildIncidents(childId) {
  const [rows] = await pool.execute(
    `SELECT ir.*, u.username as reporter_name 
     FROM incident_report ir
     JOIN users u ON ir.reported_by = u.id
     WHERE ir.child_id = ?
     ORDER BY ir.created_at DESC`,
    [childId]
  );
  return rows;
}

// Export all functions
module.exports = {
  createIncidentReport,
  findIncidentReportById,
  findAllIncidentReports,
  updateIncidentReport,
  getIncidentReportSummary,
  getChildIncidents,
};
