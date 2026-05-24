const admin = require('firebase-admin')
const { db } = require('../config/firebase')

/**
 * Log a configuration, authentication, or dispatch action in the audit trail.
 * @param {Object} params
 * @param {string} params.action - The categorization/name of the action (e.g. "Grant Access").
 * @param {string} params.details - Detailed human-readable description.
 * @param {string} params.performedBy - Email of the broker who initiated the action.
 */
async function logAudit({ action, details, performedBy }) {
  try {
    await db.collection('audit_logs').add({
      action: action || 'UNKNOWN_ACTION',
      details: details || '',
      performedBy: performedBy || 'unknown',
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    })
  } catch (err) {
    console.error('[Audit Logs Error] Failed to write audit log:', err.message)
  }
}

module.exports = { logAudit }
