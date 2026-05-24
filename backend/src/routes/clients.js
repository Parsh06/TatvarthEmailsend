const express  = require('express')
const { body, validationResult } = require('express-validator')
const { db }   = require('../config/firebase')
const { verifyToken } = require('../middleware/auth')
const { encrypt, decrypt } = require('../services/encryption')
const { logAudit } = require('../services/audit')
const admin = require('firebase-admin')

const router = express.Router()

// ── All routes require a valid Firebase token ──────────────────────────────
router.use(verifyToken)

// GET /api/clients — list all clients (no passwords returned)
router.get('/', async (req, res) => {
  try {
    const snap = await db.collection('clients').orderBy('createdAt', 'desc').get()
    const clients = snap.docs.map(d => {
      const data = d.data()
      const { encryptedPassword, ...safe } = data
      return { id: d.id, ...safe, hasPassword: !!encryptedPassword }
    })
    res.json(clients)
  } catch (err) {
    console.error('GET /clients:', err)
    res.status(500).json({ error: 'Failed to fetch clients', message: err.message })
  }
})

// POST /api/clients — create a new client
router.post(
  '/',
  [
    body('clientName').trim().notEmpty().withMessage('Client name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('appPassword').notEmpty().withMessage('App password is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return res.status(400).json({ error: errors.array()[0].msg })

    const { clientName, email, appPassword, smtpHost, smtpPort, active } = req.body
    try {
      const now = admin.firestore.FieldValue.serverTimestamp()
      const ref = await db.collection('clients').add({
        clientName:        clientName.trim(),
        email:             email.trim().toLowerCase(),
        encryptedPassword: encrypt(appPassword),
        smtpHost:          smtpHost  || 'smtp.gmail.com',
        smtpPort:          Number(smtpPort) || 587,
        active:            active !== false,
        createdBy:         req.user.email,
        createdAt:         now,
        updatedAt:         now,
      })

      await logAudit({
        action: 'Client Created',
        details: `Created client profile: ${clientName.trim()} (${email.trim().toLowerCase()})`,
        performedBy: req.user.email,
      })

      const doc = await ref.get()
      const { encryptedPassword, ...safe } = doc.data()
      res.status(201).json({ id: ref.id, ...safe, hasPassword: true })
    } catch (err) {
      console.error('POST /clients:', err)
      res.status(500).json({ error: 'Failed to create client', message: err.message })
    }
  }
)

// PUT /api/clients/:id — update a client
router.put('/:id', async (req, res) => {
  const { id } = req.params
  const { clientName, email, appPassword, smtpHost, smtpPort, active } = req.body

  try {
    const ref     = db.collection('clients').doc(id)
    const existing = await ref.get()
    if (!existing.exists) return res.status(404).json({ error: 'Client not found' })
    const oldData = existing.data()

    const update = {
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    }
    const changedFields = []
    if (clientName && clientName.trim() !== oldData.clientName) {
      update.clientName = clientName.trim()
      changedFields.push('clientName')
    }
    if (email && email.trim().toLowerCase() !== oldData.email) {
      update.email = email.trim().toLowerCase()
      changedFields.push('email')
    }
    if (smtpHost && smtpHost !== oldData.smtpHost) {
      update.smtpHost = smtpHost
      changedFields.push('smtpHost')
    }
    if (smtpPort && Number(smtpPort) !== oldData.smtpPort) {
      update.smtpPort = Number(smtpPort)
      changedFields.push('smtpPort')
    }
    if (active !== undefined && active !== oldData.active) {
      update.active = active
      changedFields.push(`active (${active ? 'Active' : 'Deactive'})`)
    }
    if (appPassword) {
      update.encryptedPassword = encrypt(appPassword)
      changedFields.push('appPassword')
    }

    if (changedFields.length > 0) {
      await ref.update(update)
      await logAudit({
        action: 'Client Updated',
        details: `Updated client profile: ${oldData.clientName} (${oldData.email}). Changed fields: ${changedFields.join(', ')}`,
        performedBy: req.user.email,
      })
    }

    const updated = await ref.get()
    const { encryptedPassword, ...safe } = updated.data()
    res.json({ id, ...safe, hasPassword: true })
  } catch (err) {
    console.error('PUT /clients/:id:', err)
    res.status(500).json({ error: 'Failed to update client', message: err.message })
  }
})

// DELETE /api/clients/:id
router.delete('/:id', async (req, res) => {
  // Only admin korojitha@gmail.com can delete
  if (req.user.email !== 'korojitha@gmail.com') {
    return res.status(403).json({ error: 'Access denied: Only the system administrator can delete clients.' })
  }

  try {
    const ref = db.collection('clients').doc(req.params.id)
    const doc = await ref.get()
    if (!doc.exists) return res.status(404).json({ error: 'Client not found' })
    const clientData = doc.data()

    await ref.delete()

    await logAudit({
      action: 'Client Deleted',
      details: `Deleted client profile: ${clientData.clientName} (${clientData.email})`,
      performedBy: req.user.email,
    })

    res.json({ success: true })
  } catch (err) {
    console.error('DELETE /clients/:id:', err)
    res.status(500).json({ error: 'Failed to delete client', message: err.message })
  }
})

module.exports = router
