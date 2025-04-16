const pool = require("../config/database");

/**
 * Creates a new financial transaction in the database
 * @param {Object} transactionData - Transaction data including type, amount, and description
 * @returns {Promise<number>} - The ID of the newly created transaction
 */
async function createTransaction(transactionData) {
  const [result] = await pool.execute(
    `INSERT INTO financial_transactions (
      type, category, amount, description, date,
      reference_id, reference_type, status, created_by
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      transactionData.type,
      transactionData.category,
      transactionData.amount,
      transactionData.description,
      transactionData.date,
      transactionData.referenceId,
      transactionData.referenceType,
      transactionData.status || "pending",
      transactionData.createdBy,
    ]
  );
  return result.insertId;
}

/**
 * Finds a transaction by its ID
 * @param {number} id - The transaction ID to search for
 * @returns {Promise<Object|null>} - The transaction object or null if not found
 */
async function findTransactionById(id) {
  const [rows] = await pool.execute(
    "SELECT * FROM financial_transactions WHERE id = ?",
    [id]
  );
  return rows[0] || null;
}

/**
 * Retrieves all transactions with optional filters
 * @param {Object} filters - Optional filters for the query
 * @returns {Promise<Array>} - Array of transaction objects
 */
async function findAllTransactions(filters = {}) {
  let query = "SELECT * FROM financial_transactions WHERE 1=1";
  const params = [];

  if (filters.type) {
    query += " AND type = ?";
    params.push(filters.type);
  }

  if (filters.category) {
    query += " AND category = ?";
    params.push(filters.category);
  }

  if (filters.startDate && filters.endDate) {
    query += " AND date BETWEEN ? AND ?";
    params.push(filters.startDate, filters.endDate);
  }

  if (filters.status) {
    query += " AND status = ?";
    params.push(filters.status);
  }

  query += " ORDER BY date DESC";

  const [rows] = await pool.execute(query, params);
  return rows;
}

/**
 * Updates a transaction's information
 * @param {number} id - The ID of the transaction to update
 * @param {Object} updates - The fields to update and their new values
 * @returns {Promise<void>}
 */
async function updateTransaction(id, updates) {
  const fields = [];
  const values = [];

  for (const [key, value] of Object.entries(updates)) {
    fields.push(`${key} = ?`);
    values.push(value);
  }

  values.push(id);
  await pool.execute(
    `UPDATE financial_transactions SET ${fields.join(", ")} WHERE id = ?`,
    values
  );
}

/**
 * Gets a summary of financial transactions
 * @param {Object} filters - Optional filters for the summary
 * @returns {Promise<Object>} - Summary object with totals and counts
 */
async function getTransactionSummary(filters = {}) {
  let query = `
    SELECT 
      COUNT(*) as total,
      SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as total_income,
      SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as total_expense,
      SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END) as net_amount
    FROM financial_transactions
    WHERE 1=1
  `;
  const params = [];

  if (filters.startDate && filters.endDate) {
    query += " AND date BETWEEN ? AND ?";
    params.push(filters.startDate, filters.endDate);
  }

  if (filters.status) {
    query += " AND status = ?";
    params.push(filters.status);
  }

  const [summary] = await pool.execute(query, params);
  return summary[0];
}

// Export all functions
module.exports = {
  createTransaction,
  findTransactionById,
  findAllTransactions,
  updateTransaction,
  getTransactionSummary,
};
