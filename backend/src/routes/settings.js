const express = require('express')
const { db }  = require('../config/firebase')
const { verifyToken } = require('../middleware/auth')
const admin = require('firebase-admin')

const router = express.Router()
router.use(verifyToken)

const DEFAULTS = {
  // ── Delivery ────────────────────────────────────────────────────────────
  toEmail:          'tatvarthcapital@gmail.com',
  ccEmail:          '',
  bccEmail:         '',
  replyToEmail:     '',

  // ── Subject ─────────────────────────────────────────────────────────────
  // Variables: {{TX}} {{COMPANY}} {{SYMBOL}} {{CLIENT}}
  subjectTemplate:  'Share {{TX}} Request – {{COMPANY}}{{SYMBOL}}',

  // ── Email body ──────────────────────────────────────────────────────────
  emailGreeting:    'Hello Tatvarth Capital,',
  emailFooterNote:  '',
  signOffLine:      'Please process this request and revert at your earliest convenience.',
  closingSalutation:'Warm Regards,',

  // ── Disclaimer ──────────────────────────────────────────────────────────
  // Variables: {{CLIENT}} {{DATE}}
  disclaimerText:   'This request was submitted through the Tatvarth Capital Broker Portal by {{CLIENT}} on {{DATE}}. This is an automated notification — please do not reply to this email directly.',

  // ── Design ──────────────────────────────────────────────────────────────
  accentColor:      '#F0B429',
  ctaButtonText:    'Reply to Client →',

  // ── Branding ────────────────────────────────────────────────────────────
  portalName:       'Tatvarth Capital',
}

const ALLOWED = Object.keys(DEFAULTS)

// GET /api/settings
router.get('/', async (req, res) => {
  try {
    const snap   = await db.collection('settings').doc('portal').get()
    const stored = snap.exists ? snap.data() : {}
    const merged = { ...DEFAULTS, ...stored }
    const { updatedAt, updatedBy, ...clean } = merged
    res.json({
      ...clean,
      updatedAt: stored.updatedAt?.toDate?.()?.toISOString() ?? null,
    })
  } catch (err) {
    console.error('GET /settings:', err)
    res.status(500).json({ error: 'Failed to fetch settings' })
  }
})

// PUT /api/settings
router.put('/', async (req, res) => {
  const update = {}
  ALLOWED.forEach(k => {
    if (req.body[k] !== undefined) update[k] = String(req.body[k]).trim()
  })

  if (!update.toEmail) return res.status(400).json({ error: 'Default recipient email is required' })

  // Validate hex color
  if (update.accentColor && !/^#[0-9A-Fa-f]{6}$/.test(update.accentColor)) {
    return res.status(400).json({ error: 'Accent color must be a valid hex colour (e.g. #F0B429)' })
  }

  try {
    await db.collection('settings').doc('portal').set(
      { ...update, updatedAt: admin.firestore.FieldValue.serverTimestamp(), updatedBy: req.user.uid },
      { merge: true }
    )
    res.json({ ...update, updatedAt: new Date().toISOString() })
  } catch (err) {
    console.error('PUT /settings:', err)
    res.status(500).json({ error: 'Failed to save settings' })
  }
})

// GET /api/settings/defaults
router.get('/defaults', (req, res) => res.json(DEFAULTS))

module.exports = { router, DEFAULTS }
