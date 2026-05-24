const express = require('express')
const { db } = require('../config/firebase')
const { verifyToken } = require('../middleware/auth')
const { logAudit } = require('../services/audit')

const router = express.Router()

// All routes require valid auth
router.use(verifyToken)

// GET /api/audit-logs - Retrieve logs (restricted to korojitha@gmail.com only)
router.get('/', async (req, res) => {
  if (req.user.email !== 'korojitha@gmail.com') {
    return res.status(403).json({ error: 'Access denied: Only the system administrator can view audit logs.' })
  }

  try {
    const limit = Math.min(Number(req.query.limit) || 100, 200)
    const snap = await db.collection('audit_logs')
      .orderBy('timestamp', 'desc')
      .limit(limit)
      .get()

    const logs = snap.docs.map(doc => {
      const data = doc.data()
      return {
        id: doc.id,
        action: data.action,
        details: data.details,
        performedBy: data.performedBy,
        timestamp: data.timestamp?.toDate?.()?.toISOString() ?? null,
      }
    })

    res.json(logs)
  } catch (err) {
    console.error('GET /api/audit-logs error:', err)
    res.status(500).json({ error: 'Failed to fetch audit logs', message: err.message })
  }
})

// POST /api/audit-logs - Append an audit log (usable by all whitelisted brokers for frontend events)
router.post('/', async (req, res) => {
  const { action, details } = req.body
  if (!action || !details) {
    return res.status(400).json({ error: 'action and details fields are required.' })
  }

  try {
    await logAudit({
      action,
      details,
      performedBy: req.user.email,
    })
    res.status(201).json({ success: true })
  } catch (err) {
    console.error('POST /api/audit-logs error:', err)
    res.status(500).json({ error: 'Failed to record audit log', message: err.message })
  }
})

module.exports = router
