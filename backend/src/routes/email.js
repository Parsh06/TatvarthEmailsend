const express = require('express')
const { body, validationResult } = require('express-validator')
const { db }  = require('../config/firebase')
const { verifyToken } = require('../middleware/auth')
const { sendLeadEmail } = require('../services/email')
const { buildLeadEmail } = require('../services/template')
const { logAudit } = require('../services/audit')
const admin = require('firebase-admin')

const router = express.Router()
router.use(verifyToken)

const { DEFAULTS: SETTING_DEFAULTS } = require('./settings')

function resolveSubject(template, { transactionType, companyName, stockSymbol, clientName }) {
  const txUp = (transactionType || 'buy').toUpperCase()
  return (template || 'Share {{TX}} Request – {{COMPANY}}{{SYMBOL}}')
    .replace(/\{\{TX\}\}/g,      txUp)
    .replace(/\{\{COMPANY\}\}/g, companyName   || '')
    .replace(/\{\{SYMBOL\}\}/g,  stockSymbol ? ` (${stockSymbol})` : '')
    .replace(/\{\{CLIENT\}\}/g,  clientName    || '')
    .trim()
}

async function getSettings() {
  try {
    const snap = await db.collection('settings').doc('portal').get()
    return snap.exists ? { ...SETTING_DEFAULTS, ...snap.data() } : { ...SETTING_DEFAULTS }
  } catch {
    return { ...SETTING_DEFAULTS }
  }
}

async function processBulkJob(jobId, clientIds, formData, userId, userEmail) {
  try {
    const settings = await getSettings()
    let completed = 0
    let failed = 0

    await logAudit({
      action: 'Bulk Email Initiated',
      details: `Initiated bulk transaction request to ${clientIds.length} clients`,
      performedBy: userEmail,
    })

    for (const clientId of clientIds) {
      try {
        const snap = await db.collection('clients').doc(clientId).get()
        if (!snap.exists) throw new Error('Client profile not found')
        const client = { id: snap.id, ...snap.data() }

        if (!client.active) throw new Error('Client profile is inactive')
        if (!client.encryptedPassword) throw new Error('Client SMTP credentials not configured')

        const autoSubject = resolveSubject(settings.subjectTemplate, {
          transactionType: formData.transactionType,
          companyName: formData.companyName,
          stockSymbol: formData.stockSymbol,
          clientName: client.clientName,
        })

        const txUp = (formData.transactionType || 'buy').toUpperCase()
        const now  = admin.firestore.FieldValue.serverTimestamp()

        const delivery = {
          toEmail:     (formData.overrideToEmail    || '').trim() || settings.toEmail,
          ccEmail:     (formData.overrideCcEmail    || '').trim() || settings.ccEmail    || '',
          bccEmail:    (formData.overrideBccEmail   || '').trim() || settings.bccEmail   || '',
          replyToEmail:(formData.overrideReplyTo    || '').trim() || settings.replyToEmail || '',
          subject:     (formData.overrideSubject    || '').trim() || autoSubject,
        }

        const templateOpts = {
          portalName:        settings.portalName,
          greeting:          settings.emailGreeting,
          footerNote:        settings.emailFooterNote,
          signOffLine:       settings.signOffLine,
          closingSalutation: settings.closingSalutation,
          disclaimerText:    settings.disclaimerText,
          ctaButtonText:     settings.ctaButtonText,
          accentColor:       settings.accentColor,
        }

        const messageId = await sendLeadEmail({ client, formData, delivery, templateOpts })

        const logData = {
          clientId,
          clientName:      client.clientName,
          clientEmail:     client.email,
          subject:         delivery.subject,
          sentTo:          delivery.toEmail,
          ccEmail:         delivery.ccEmail  || null,
          status:          'SUCCESS',
          transactionType: txUp,
          companyName:     formData.companyName,
          stockSymbol:     formData.stockSymbol  || null,
          quantity:        formData.quantity,
          pricePerShare:   formData.pricePerShare || null,
          estimatedValue:  (formData.pricePerShare && formData.quantity)
            ? (Number(formData.quantity) * Number(formData.pricePerShare)).toString()
            : null,
          additionalInfo:  formData.additionalInfo || null,
          formData,
          response:        messageId,
          errorMessage:    null,
          sentBy:          userId,
          timestamp:       now,
        }

        await Promise.all([
          db.collection('email_logs').add(logData),
          db.collection('notifications').add({
            type:            'SUCCESS',
            clientName:      client.clientName,
            companyName:     formData.companyName,
            transactionType: txUp,
            quantity:        formData.quantity,
            message:         `${txUp} request for ${formData.quantity} shares of ${formData.companyName} sent successfully (Bulk)`,
            read:            false,
            createdAt:       now,
          }),
        ])

        completed++
      } catch (err) {
        console.error(`Bulk send error for client ${clientId}:`, err.message)
        failed++
        
        const txUp = (formData.transactionType || 'buy').toUpperCase()
        const now  = admin.firestore.FieldValue.serverTimestamp()

        await Promise.all([
          db.collection('email_logs').add({
            clientId,
            clientName:      `Error (${clientId})`,
            clientEmail:     '',
            subject:         formData.overrideSubject || 'Bulk Transaction Request',
            sentTo:          formData.overrideToEmail || '',
            ccEmail:         formData.overrideCcEmail || null,
            status:          'FAILED',
            transactionType: txUp,
            companyName:     formData.companyName,
            stockSymbol:     formData.stockSymbol || null,
            quantity:        formData.quantity,
            pricePerShare:   formData.pricePerShare || null,
            formData,
            response:        null,
            errorMessage:    err.message,
            sentBy:          userId,
            timestamp:       now,
          }),
          db.collection('notifications').add({
            type:            'FAILED',
            clientName:      `Bulk Send Fail`,
            companyName:     formData.companyName,
            transactionType: txUp,
            quantity:        formData.quantity,
            message:         `Failed bulk dispatch for client: ${err.message}`,
            read:            false,
            createdAt:       now,
          }),
        ])
      }

      // Update progress
      await db.collection('bulk_jobs').doc(jobId).update({
        completed,
        failed,
        status: (completed + failed) === clientIds.length ? 'COMPLETED' : 'PROCESSING',
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      })

      // Stagger delay between emails
      if ((completed + failed) < clientIds.length) {
        await new Promise(resolve => setTimeout(resolve, 1500))
      }
    }

    await logAudit({
      action: 'Bulk Email Completed',
      details: `Finished bulk transaction request. Succeeded: ${completed}, Failed: ${failed}`,
      performedBy: userEmail,
    })
  } catch (err) {
    console.error('Fatal error in processBulkJob worker:', err)
  }
}

// ── POST /api/email/send-bulk ───────────────────────────────────────────────
router.post('/send-bulk',
  [
    body('clientIds').isArray({ min: 1 }).withMessage('At least one Client ID must be specified'),
    body('formData.transactionType').isIn(['buy','sell']).withMessage('Transaction type must be buy or sell'),
    body('formData.companyName').trim().notEmpty().withMessage('Company name is required'),
    body('formData.quantity').notEmpty().withMessage('Quantity is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return res.status(400).json({ error: errors.array()[0].msg })

    const { clientIds, formData } = req.body
    const now = admin.firestore.FieldValue.serverTimestamp()

    try {
      const jobRef = await db.collection('bulk_jobs').add({
        total: clientIds.length,
        completed: 0,
        failed: 0,
        status: 'PENDING',
        formData,
        createdBy: req.user.email,
        createdAt: now,
        updatedAt: now,
      })

      // Spawn background worker (staggered send)
      processBulkJob(jobRef.id, clientIds, formData, req.user.uid, req.user.email)

      res.json({ success: true, jobId: jobRef.id })
    } catch (err) {
      console.error('Failed to initiate bulk job:', err)
      res.status(500).json({ error: 'Failed to initiate bulk email dispatch' })
    }
  }
)

// ── GET /api/email/bulk-job/:jobId ──────────────────────────────────────────
router.get('/bulk-job/:jobId', async (req, res) => {
  try {
    const snap = await db.collection('bulk_jobs').doc(req.params.jobId).get()
    if (!snap.exists) return res.status(404).json({ error: 'Bulk job not found' })
    const data = snap.data()
    res.json({
      id: snap.id,
      total: data.total,
      completed: data.completed,
      failed: data.failed,
      status: data.status,
      createdBy: data.createdBy,
      createdAt: data.createdAt?.toDate?.()?.toISOString() ?? null,
      updatedAt: data.updatedAt?.toDate?.()?.toISOString() ?? null,
    })
  } catch (err) {
    console.error('Failed to get bulk job:', err)
    res.status(500).json({ error: 'Failed to fetch bulk job status' })
  }
})

// ── POST /api/email/send ─────────────────────────────────────────────────────
router.post('/send',
  [
    body('clientId').notEmpty().withMessage('Client ID is required'),
    body('formData.transactionType').isIn(['buy','sell']).withMessage('Transaction type must be buy or sell'),
    body('formData.companyName').trim().notEmpty().withMessage('Company name is required'),
    body('formData.quantity').notEmpty().withMessage('Quantity is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return res.status(400).json({ error: errors.array()[0].msg })

    const { clientId, formData } = req.body

    let client
    try {
      const snap = await db.collection('clients').doc(clientId).get()
      if (!snap.exists) return res.status(404).json({ error: 'Client not found' })
      client = { id: snap.id, ...snap.data() }
    } catch { return res.status(500).json({ error: 'Failed to fetch client data' }) }

    if (!client.active)            return res.status(400).json({ error: 'Selected client is inactive' })
    if (!client.encryptedPassword) return res.status(400).json({ error: 'Client SMTP credentials not configured' })

    const settings = await getSettings()

    const { transactionType, companyName, stockSymbol, quantity, pricePerShare, additionalInfo,
            overrideToEmail, overrideCcEmail, overrideBccEmail, overrideReplyTo, overrideSubject } = formData

    const txUp = (transactionType || 'buy').toUpperCase()
    const autoSubject = resolveSubject(settings.subjectTemplate, {
      transactionType, companyName, stockSymbol, clientName: client.clientName,
    })
    const now  = admin.firestore.FieldValue.serverTimestamp()

    // Resolve final delivery values — per-send overrides win over settings defaults
    const delivery = {
      toEmail:     (overrideToEmail    || '').trim() || settings.toEmail,
      ccEmail:     (overrideCcEmail    || '').trim() || settings.ccEmail    || '',
      bccEmail:    (overrideBccEmail   || '').trim() || settings.bccEmail   || '',
      replyToEmail:(overrideReplyTo    || '').trim() || settings.replyToEmail || '',
      subject:     (overrideSubject    || '').trim() || autoSubject,
    }

    const templateOpts = {
      portalName:        settings.portalName,
      greeting:          settings.emailGreeting,
      footerNote:        settings.emailFooterNote,
      signOffLine:       settings.signOffLine,
      closingSalutation: settings.closingSalutation,
      disclaimerText:    settings.disclaimerText,
      ctaButtonText:     settings.ctaButtonText,
      accentColor:       settings.accentColor,
    }

    try {
      const messageId = await sendLeadEmail({ client, formData, delivery, templateOpts })

      const logData = {
        clientId,
        clientName:      client.clientName,
        clientEmail:     client.email,
        subject:         delivery.subject,
        sentTo:          delivery.toEmail,
        ccEmail:         delivery.ccEmail  || null,
        status:          'SUCCESS',
        transactionType: txUp,
        companyName,
        stockSymbol:     stockSymbol  || null,
        quantity,
        pricePerShare:   pricePerShare || null,
        estimatedValue:  (pricePerShare && quantity)
          ? (Number(quantity) * Number(pricePerShare)).toString()
          : null,
        additionalInfo:  additionalInfo || null,
        formData,
        response:        messageId,
        errorMessage:    null,
        sentBy:          req.user.uid,
        timestamp:       now,
      }

      await Promise.all([
        db.collection('email_logs').add(logData),
        db.collection('notifications').add({
          type:            'SUCCESS',
          clientName:      client.clientName,
          companyName,
          transactionType: txUp,
          quantity,
          message:         `${txUp} request for ${quantity} shares of ${companyName} sent successfully`,
          read:            false,
          createdAt:       now,
        }),
      ])

      res.json({ success: true, messageId })
    } catch (err) {
      console.error('Email send error:', err.message)

      await Promise.all([
        db.collection('email_logs').add({
          clientId,
          clientName:      client.clientName,
          clientEmail:     client.email,
          subject:         delivery.subject,
          sentTo:          delivery.toEmail,
          ccEmail:         delivery.ccEmail || null,
          status:          'FAILED',
          transactionType: txUp,
          companyName,
          stockSymbol:     stockSymbol || null,
          quantity,
          pricePerShare:   pricePerShare || null,
          formData,
          response:        null,
          errorMessage:    err.message,
          sentBy:          req.user.uid,
          timestamp:       now,
        }),
        db.collection('notifications').add({
          type:            'FAILED',
          clientName:      client.clientName,
          companyName,
          transactionType: txUp,
          quantity,
          message:         `Failed: ${txUp} request for ${companyName} — ${err.message}`,
          read:            false,
          createdAt:       now,
        }),
      ])

      res.status(500).json({ error: `Failed to send email: ${err.message}` })
    }
  }
)

// ── POST /api/email/preview ──────────────────────────────────────────────────
router.post('/preview', async (req, res) => {
  const { clientId, formData } = req.body
  if (!clientId || !formData) return res.status(400).json({ error: 'clientId and formData required' })

  try {
    const [snap, settings] = await Promise.all([
      db.collection('clients').doc(clientId).get(),
      getSettings(),
    ])
    if (!snap.exists) return res.status(404).json({ error: 'Client not found' })
    const client = snap.data()

    const txUp        = (formData.transactionType || 'buy').toUpperCase()
    const autoSubject = resolveSubject(settings.subjectTemplate, {
      transactionType: formData.transactionType,
      companyName:     formData.companyName || '[Company]',
      stockSymbol:     formData.stockSymbol,
      clientName:      client.clientName,
    })

    const html = buildLeadEmail({
      clientName:        client.clientName,
      clientEmail:       client.email,
      transactionType:   formData.transactionType || 'buy',
      companyName:       formData.companyName     || '[Company]',
      stockSymbol:       formData.stockSymbol,
      quantity:          formData.quantity        || '0',
      pricePerShare:     formData.pricePerShare,
      additionalInfo:    formData.additionalInfo,
      portalName:        settings.portalName,
      greeting:          settings.emailGreeting,
      footerNote:        settings.emailFooterNote,
      signOffLine:       settings.signOffLine,
      closingSalutation: settings.closingSalutation,
      disclaimerText:    settings.disclaimerText,
      ctaButtonText:     settings.ctaButtonText,
      accentColor:       settings.accentColor,
    })

    res.json({
      html,
      delivery: {
        toEmail:  (formData.overrideToEmail || '').trim() || settings.toEmail,
        ccEmail:  (formData.overrideCcEmail || '').trim() || settings.ccEmail || '',
        subject:  (formData.overrideSubject || '').trim() || autoSubject,
      },
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ── GET /api/email/logs ──────────────────────────────────────────────────────
router.get('/logs', async (req, res) => {
  try {
    const pageSize = Math.min(Number(req.query.limit) || 20, 100)
    const before   = req.query.before

    let q = db.collection('email_logs').orderBy('timestamp', 'desc').limit(pageSize + 1)
    if (before) q = q.startAfter(new Date(before))

    const snap    = await q.get()
    const hasMore = snap.docs.length > pageSize
    const docs    = hasMore ? snap.docs.slice(0, pageSize) : snap.docs

    const logs = docs.map(d => {
      const data = d.data()
      return {
        id:              d.id,
        clientId:        data.clientId,
        clientName:      data.clientName,
        clientEmail:     data.clientEmail,
        subject:         data.subject,
        sentTo:          data.sentTo          || null,
        ccEmail:         data.ccEmail         || null,
        status:          data.status,
        transactionType: data.transactionType || null,
        companyName:     data.companyName     || null,
        stockSymbol:     data.stockSymbol     || null,
        quantity:        data.quantity        || null,
        pricePerShare:   data.pricePerShare   || null,
        estimatedValue:  data.estimatedValue  || null,
        additionalInfo:  data.additionalInfo  || null,
        formData:        data.formData,
        response:        data.response,
        errorMessage:    data.errorMessage,
        sentBy:          data.sentBy,
        timestamp:       data.timestamp?.toDate?.()?.toISOString() ?? null,
      }
    })

    res.json({ logs, hasMore, total: logs.length })
  } catch (err) {
    console.error('GET /email/logs:', err)
    res.status(500).json({ error: 'Failed to fetch logs' })
  }
})

module.exports = router
