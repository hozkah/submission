const pool = require("../config/database");

/**
 * Creates a new babysitter in the database
 * @param {Object} babysitterData - Babysitter data including personal and next of kin information
 * @returns {Promise<number>} - The ID of the newly created babysitter
 */
async function createBabysitter(babysitterData) {
  const [result] = await pool.execute(
    `INSERT INTO babysitters (
      first_name, last_name, email, phone_number, nin, age,
      next_of_kin_name, next_of_kin_phone, next_of_kin_relationship
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      babysitterData.firstName,
      babysitterData.lastName,
      babysitterData.email,
      babysitterData.phoneNumber,
      babysitterData.nin,
      babysitterData.age,
      babysitterData.nextOfKinName,
      babysitterData.nextOfKinPhone,
      babysitterData.nextOfKinRelationship,
    ]
  );
  return result.insertId;
}

/**
 * Finds a babysitter by their ID
 * @param {number} id - The babysitter ID to search for
 * @returns {Promise<Object|null>} - The babysitter object or null if not found
 */
async function findBabysitterById(id) {
  const [rows] = await pool.execute("SELECT * FROM babysitters WHERE id = ?", [
    id,
  ]);
  return rows[0] || null;
}

/**
 * Retrieves all active babysitters
 * @returns {Promise<Array>} - Array of babysitter objects
 */
async function findAllBabysitters() {
  const [rows] = await pool.execute(
    "SELECT * FROM babysitters WHERE is_active = TRUE"
  );
  return rows;
}

/**
 * Updates a babysitter's information
 * @param {number} id - The ID of the babysitter to update
 * @param {Object} updates - The fields to update and their new values
 * @returns {Promise<void>}
 */
async function updateBabysitter(id, updates) {
  const fields = [];
  const values = [];

  for (const [key, value] of Object.entries(updates)) {
    fields.push(`${key} = ?`);
    values.push(value);
  }

  values.push(id);
  await pool.execute(
    `UPDATE babysitters SET ${fields.join(", ")} WHERE id = ?`,
    values
  );
}

/**
 * Soft deletes a babysitter by setting is_active to false
 * @param {number} id - The ID of the babysitter to delete
 * @returns {Promise<Object>} - The result of the operation
 */
async function deleteBabysitter(id) {
  try {
    const [result] = await pool.execute(
      "UPDATE babysitters SET is_active = FALSE WHERE id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      throw new Error("Babysitter not found");
    }

    return { success: true, message: "Babysitter deactivated successfully" };
  } catch (error) {
    console.error("Error in deleteBabysitter:", error);
    throw error;
  }
}

/**
 * Gets all children assigned to a specific babysitter
 * @param {number} id - The ID of the babysitter
 * @returns {Promise<Array>} - Array of child objects
 */
async function getAssignedChildren(id) {
  const [rows] = await pool.execute(
    "SELECT * FROM children WHERE assigned_babysitter_id = ? AND is_active = TRUE",
    [id]
  );
  return rows;
}

// Export all functions
module.exports = {
  createBabysitter,
  findBabysitterById,
  findAllBabysitters,
  updateBabysitter,
  deleteBabysitter,
  getAssignedChildren,
};
