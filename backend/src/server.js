require('dotenv').config()
const express = require('express')
const cors    = require('cors')
const helmet  = require('helmet')

// Init Firebase Admin before importing routes
require('./config/firebase')

const clientsRouter  = require('./routes/clients')
const emailRouter    = require('./routes/email')
const { router: settingsRouter } = require('./routes/settings')
const auditLogsRouter = require('./routes/auditLogs')

const app  = express()
const PORT = process.env.PORT || 5000

// ── Security & middleware ──────────────────────────────────────────────────
app.use(helmet())
const allowedOrigins = [
  'http://localhost:5173',
  'https://tatvarth-emailsend.vercel.app',
  'https://tatvarthemailsend.web.app',
  'https://tatvarthemailsend.firebaseapp.com'
]
if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL.trim().replace(/\/$/, ''))
}

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  methods:      ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials:  true,
}))
app.use(express.json({ limit: '1mb' }))

// ── Routes ─────────────────────────────────────────────────────────────────
app.get('/api/health', (_, res) =>
  res.json({ status: 'ok', service: 'Tatvarth Capital Backend', ts: new Date().toISOString() })
)

app.use('/api/clients',  clientsRouter)
app.use('/api/email',    emailRouter)
app.use('/api/settings', settingsRouter)
app.use('/api/audit-logs', auditLogsRouter)

// ── 404 ────────────────────────────────────────────────────────────────────
app.use((_, res) => res.status(404).json({ error: 'Route not found' }))

// ── Global error handler ───────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('[Error]', err.message)
  res.status(500).json({ error: 'Internal server error', message: err.message })
})

app.listen(PORT, () => {
  console.log(`\n🚀  Tatvarth Capital Backend`)
  console.log(`    Listening on http://localhost:${PORT}`)
  console.log(`    Health: http://localhost:${PORT}/api/health\n`)
})
