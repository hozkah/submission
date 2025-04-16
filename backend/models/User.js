const pool = require("../config/database");
const bcrypt = require("bcryptjs");

/**
 * Creates a new user in the database
 * @param {Object} userData - User data including username, email, password, and role
 * @returns {Promise<number>} - The ID of the newly created user
 */
async function createUser(userData) {
  const { username, email, password, role, isActive = true } = userData;
  const hashedPassword = await bcrypt.hash(password, 10);

  const [result] = await pool.execute(
    "INSERT INTO users (username, email, password, role, is_active) VALUES (?, ?, ?, ?, ?)",
    [username, email, hashedPassword, role, isActive]
  );
  return result.insertId;
}

/**
 * Finds a user by their username
 * @param {string} username - The username to search for
 * @returns {Promise<Object|null>} - The user object or null if not found
 */
async function findUserByUsername(username) {
  console.log("Searching for user by username:", username);
  const [rows] = await pool.execute("SELECT * FROM users WHERE username = ?", [
    username,
  ]);
  console.log("Found user by username:", rows[0] ? "Yes" : "No");
  return rows[0] || null;
}

/**
 * Finds a user by their email address
 * @param {string} email - The email address to search for
 * @returns {Promise<Object|null>} - The user object or null if not found
 */
async function findUserByEmail(email) {
  console.log("Searching for user by email:", email);
  const [rows] = await pool.execute("SELECT * FROM users WHERE email = ?", [
    email,
  ]);
  console.log("Found user by email:", rows[0] ? "Yes" : "No");
  if (rows[0]) {
    console.log("User details:", {
      id: rows[0].id,
      email: rows[0].email,
      is_active: rows[0].is_active,
    });
  }
  return rows[0] || null;
}

/**
 * Finds a user by their ID
 * @param {number} id - The user ID to search for
 * @returns {Promise<Object|null>} - The user object or null if not found
 */
async function findUserById(id) {
  const [rows] = await pool.execute("SELECT * FROM users WHERE id = ?", [id]);
  return rows[0] || null;
}

/**
 * Updates a user's last login timestamp
 * @param {number} id - The ID of the user to update
 * @returns {Promise<void>}
 */
async function updateUserLastLogin(id) {
  await pool.execute(
    "UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?",
    [id]
  );
}

/**
 * Updates a user's information
 * @param {number} id - The ID of the user to update
 * @param {Object} updates - The fields to update and their new values
 * @returns {Promise<void>}
 */
async function updateUser(id, updates) {
  const fields = [];
  const values = [];

  for (const [key, value] of Object.entries(updates)) {
    if (key === "password") {
      const hashedPassword = await bcrypt.hash(value, 10);
      fields.push(`${key} = ?`);
      values.push(hashedPassword);
    } else {
      fields.push(`${key} = ?`);
      values.push(value);
    }
  }

  values.push(id);
  await pool.execute(
    `UPDATE users SET ${fields.join(", ")} WHERE id = ?`,
    values
  );
}

/**
 * Soft deletes a user by setting is_active to false
 * @param {number} id - The ID of the user to delete
 * @returns {Promise<void>}
 */
async function deleteUser(id) {
  await pool.execute("UPDATE users SET is_active = FALSE WHERE id = ?", [id]);
}

/**
 * Compares a plain text password with a hashed password
 * @param {string} password - The plain text password to check
 * @param {string} hashedPassword - The hashed password to compare against
 * @returns {Promise<boolean>} - True if passwords match, false otherwise
 */
async function comparePasswords(password, hashedPassword) {
  return bcrypt.compare(password, hashedPassword);
}

// Export all functions
module.exports = {
  createUser,
  findUserByUsername,
  findUserByEmail,
  findUserById,
  updateUser,
  updateUserLastLogin,
  deleteUser,
  comparePasswords,
};
