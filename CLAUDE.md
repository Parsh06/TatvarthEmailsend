# Tatvarth Capital — Broker Email Platform

**Stack:** React 18 + Vite (frontend) · Node/Express (backend) · Firebase Auth + Firestore · Nodemailer SMTP · AES-256 encryption

**Purpose:** Internal broker portal. Brokers log in, pick a client, fill a stock trade request (BUY/SELL), and send a branded HTML email from that client's Gmail SMTP to `enquiry@tatvarth.com`. Every send is logged to Firestore and surfaced via real-time notification bell.

---

## Dev Setup

```bash
# Backend  (http://localhost:5000)
cd backend && npm run dev

# Frontend (http://localhost:5173)
cd frontend && npm run dev
```

Vite proxies `/api/*` → `http://localhost:5000` — no CORS issues in dev.

Frontend build: `npm run build` → `dist/`

---

## Monorepo Layout

```
TattvarthCapital/
├── backend/
│   ├── .env                         ← secrets (never commit)
│   ├── src/
│   │   ├── server.js                ← Express entry, CORS, routes mount
│   │   ├── config/firebase.js       ← Admin SDK init (reads .env)
│   │   ├── middleware/auth.js       ← verifyToken (Firebase ID token)
│   │   ├── routes/
│   │   │   ├── clients.js           ← CRUD /api/clients
│   │   │   └── email.js             ← send/preview/logs /api/email/*
│   │   └── services/
│   │       ├── encryption.js        ← AES-256-CBC encrypt/decrypt
│   │       ├── email.js             ← Nodemailer transport + sendLeadEmail()
│   │       ├── template.js          ← buildLeadEmail() → HTML string
│   │       └── dateUtil.js          ← format() helper for email timestamps
└── frontend/
    ├── vite.config.js               ← proxy /api → :5000
    ├── tailwind.config.js           ← custom navy/gold palette
    └── src/
        ├── App.jsx                  ← Router, AuthProvider, all routes
        ├── index.css                ← design system (see § CSS Classes)
        ├── firebase/config.js       ← Firebase web SDK init, exports auth/db/googleProvider
        ├── context/AuthContext.jsx  ← useAuth() → { user, loading, login, loginGoogle, logout }
        ├── utils/api.js             ← apiGet/apiPost/apiPut/apiDelete (auto-attaches Bearer token)
        ├── hooks/useNotifications.js ← real-time onSnapshot on `notifications` collection
        ├── components/
        │   ├── Auth/ProtectedRoute.jsx       ← redirects to /login if !user
        │   ├── Layout/Layout.jsx             ← Sidebar + Header + <Outlet>
        │   ├── Layout/Header.jsx             ← GlobalSearch trigger (Ctrl+K), NotificationBell
        │   ├── Layout/Sidebar.jsx            ← nav links, logout button
        │   ├── Notifications/NotificationBell.jsx ← bell icon, dropdown, mark-read
        │   └── Search/GlobalSearch.jsx       ← command-palette over clients + logs
        └── pages/
            ├── Login.jsx            ← Google OAuth only (no email/password)
            ├── Dashboard.jsx        ← stat cards, recent 5 logs
            ├── Clients.jsx          ← client CRUD table + add/edit modal
            ├── SendEmail.jsx        ← trade request form + Advanced Options overrides + HTML preview
            ├── EmailLogs.jsx        ← paginated log table + inline failure reason + detail modal
            └── Settings.jsx         ← portal-wide email defaults (to/cc/bcc/greeting/footer/name)
```

---

## API Reference

All routes require `Authorization: Bearer <Firebase ID token>` (added automatically by `apiGet/apiPost`).

### Clients

| Method | Path | Body / Params | Returns |
|--------|------|---------------|---------|
| GET | `/api/clients` | — | `Client[]` (no passwords) |
| POST | `/api/clients` | `{ clientName, email, appPassword, smtpHost?, smtpPort?, active? }` | `Client` |
| PUT | `/api/clients/:id` | any subset of POST fields | `Client` |
| DELETE | `/api/clients/:id` | — | `{ success: true }` |

`Client` shape: `{ id, clientName, email, smtpHost, smtpPort, active, hasPassword, createdAt, updatedAt }`
`encryptedPassword` is **never** returned to the frontend.

### Email

| Method | Path | Body / Params | Returns |
|--------|------|---------------|---------|
| POST | `/api/email/send` | `{ clientId, formData }` | `{ success: true, messageId }` |
| POST | `/api/email/preview` | `{ clientId, formData }` | `{ html, delivery }` |
| GET | `/api/email/logs` | `?limit=20&before=<ISO>` | `{ logs: Log[], hasMore: bool, total: number }` |

`formData` shape:
```js
{
  transactionType: 'buy' | 'sell',   // required
  companyName: string,               // required
  stockSymbol?: string,
  quantity: string,                  // required
  pricePerShare?: string,
  additionalInfo?: string,
  // per-send overrides (all optional — fall back to portal Settings)
  overrideToEmail?: string,
  overrideCcEmail?: string,
  overrideBccEmail?: string,
  overrideReplyTo?: string,
  overrideSubject?: string,
}
```

### Settings

| Method | Path | Body | Returns |
|--------|------|------|---------|
| GET | `/api/settings` | — | `Settings` |
| PUT | `/api/settings` | `Partial<Settings>` | `Settings` |
| GET | `/api/settings/defaults` | — | hardcoded `DEFAULTS` object |

`Settings` shape: `{ toEmail, ccEmail, bccEmail, replyToEmail, emailGreeting, emailFooterNote, portalName, updatedAt }`

`Log` shape: `{ id, clientId, clientName, clientEmail, subject, status ('SUCCESS'|'FAILED'), transactionType, companyName, stockSymbol, quantity, pricePerShare, estimatedValue, additionalInfo, formData, response, errorMessage, sentBy, timestamp }`

---

## Firestore Collections

### `settings`
Single document at `settings/portal`. Readable and writable by authenticated users (broker configures from the Settings page).
Fields: `toEmail, ccEmail, bccEmail, replyToEmail, emailGreeting, emailFooterNote, portalName, updatedAt, updatedBy`

### `clients`
Fields: `clientName, email, encryptedPassword, smtpHost, smtpPort, active, createdAt, updatedAt`
Only written/read by backend Admin SDK — frontend never touches this collection directly.

### `email_logs`
Written by backend after every send attempt (success or failure). Frontend reads via REST API (`/api/email/logs`), never via direct Firestore.

### `notifications`
Written by backend after every send. Frontend reads via **real-time onSnapshot** in `useNotifications.js`.
- `type`: `'SUCCESS' | 'FAILED'`
- `clientName, companyName, transactionType, quantity, message, read, createdAt`
- Firestore rules allow clients to update only `read` + `readAt` fields — no other writes from frontend.

---

## Auth Flow

```
Login page
  → signInWithEmailAndPassword() or signInWithPopup(googleProvider)
  → Firebase sets currentUser

Any API call (utils/api.js)
  → user.getIdToken() → attaches as Bearer header

backend/middleware/auth.js
  → admin.auth().verifyIdToken(token) → sets req.user
  → 401 if missing/invalid
```

---

## Email Send Pipeline

```
SendEmail.jsx
  → POST /api/email/send { clientId, formData }

backend routes/email.js
  1. Validate formData fields
  2. Fetch client from Firestore (Admin SDK)
  3. Check client.active + client.encryptedPassword exist
  4. Call sendLeadEmail({ client, formData })
       → services/email.js: decrypt SMTP password, create Nodemailer transport
       → services/template.js: buildLeadEmail() → HTML
       → sendMail() → to: enquiry@tatvarth.com, from: client email
  5. Parallel write: email_logs + notifications collections
  6. Return { success, messageId }
```

---

## Email Template

`backend/src/services/template.js` → `buildLeadEmail({ clientName, clientEmail, transactionType, companyName, stockSymbol, quantity, pricePerShare, additionalInfo })`

- Pure table-based HTML (email-client compatible, inline styles only)
- BUY = green (`#10B981`), SELL = amber (`#F59E0B`) theming
- Subject: `Share BUY/SELL Request – CompanyName (SYMBOL)`
- Recipient: `process.env.TATVARTH_INBOX` (default `enquiry@tatvarth.com`)

To change the template: edit only `template.js`. The `escapeHtml()` helper at the bottom must wrap all user-supplied values.

---

## Frontend Patterns

### Making an API call
```js
import { apiGet, apiPost, apiPut, apiDelete } from '../utils/api'

// GET with query params
const { logs, hasMore } = await apiGet('/email/logs?limit=20&before=2024-01-01T00:00:00Z')

// POST
await apiPost('/email/send', { clientId, formData })
```
Throws `Error(data.error)` on non-2xx — catch it and show to user.

### Using auth in a component
```js
import { useAuth } from '../context/AuthContext'
const { user, logout } = useAuth()
```

### Real-time data (Firestore)
Only `notifications` uses real-time. Pattern is in `hooks/useNotifications.js`:
`onSnapshot` → map docs → `setNotifications`. Returns `unsub` for cleanup.

### Adding a new page
1. Create `frontend/src/pages/NewPage.jsx`
2. Add route in `App.jsx` inside the protected `<Route path="/">`
3. Add entry to `PAGE_META` in `Header.jsx`
4. Add nav link in `Sidebar.jsx`

### Adding a new API route
1. Add handler in `backend/src/routes/clients.js` or `email.js` (or create a new router file)
2. If new file: mount in `server.js` with `app.use('/api/newroute', require('./routes/newroute'))`
3. All routes auto-get `verifyToken` via `router.use(verifyToken)` at the top of each router file

---

## CSS Design System

All reusable classes are in `frontend/src/index.css`. Use these — don't reinvent inline styles.

| Class | Use |
|-------|-----|
| `input-base` | All text inputs, selects, textareas |
| `btn-gold` | Primary CTA (gold gradient) |
| `btn-ghost` | Secondary actions |
| `btn-danger` | Delete / destructive |
| `nav-item` | Sidebar navigation links |
| `tc-table` | Data tables |
| `stat-card` | Dashboard metric cards |
| `modal-overlay` | Full-screen modal backdrop |
| `modal-box` | Modal content container |
| `badge` | Base pill badge |
| `badge-success` | Green badge |
| `badge-error` | Red badge |
| `badge-gold` | Gold badge |
| `badge-info` | Blue badge |
| `glass-card` | Glassmorphism card |
| `shimmer` | Loading skeleton placeholder |
| `text-gradient-gold` | Gold gradient text |
| `divider` | Horizontal rule |

### CSS Variables (use in inline styles)
```
--bg-primary: #020C1B     body background
--bg-surface: #071425     sidebar/panels
--bg-card:    #0A1A30     card backgrounds
--bg-card-hover: #0F2040  card hover state
--border-subtle: #1A3060  light dividers
--border-default: #1E3A6E standard borders
--gold:  #F0B429          primary gold
```

### Color Palette (Tailwind)
- `navy-*`: 300 → 950 (dark blue range)
- `gold-*`: 300 → 700 (amber/gold range)
- Shadow: `shadow-glow-gold` (gold outer glow)

### Transaction type colors (use consistently)
- BUY: color `#10B981`, bg `rgba(16,185,129,0.1)`
- SELL: color `#F59E0B`, bg `rgba(245,158,11,0.1)`

---

## Backend `.env` Keys

```
PORT=5000
ENCRYPTION_KEY=<64-char hex>        # AES-256 key for SMTP passwords
FIREBASE_PROJECT_ID=emailsender-dcb62
FIREBASE_PRIVATE_KEY_ID=...
FIREBASE_PRIVATE_KEY=<PEM>
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-...
FIREBASE_CLIENT_ID=...
TATVARTH_INBOX=enquiry@tatvarth.com  # where all emails are sent TO
FRONTEND_URL=http://localhost:5173   # CORS origin
```

SMTP passwords are encrypted with AES-256-CBC before Firestore storage. Format: `ivHex:encryptedHex`. The encryption key must be exactly 64 hex chars (= 32 bytes).

---

## Firestore Security Rules

File: `firestore.rules` in project root — copy-paste into Firebase Console → Firestore → Rules.

Key rules:
- `clients`: read-only for authenticated users (backend Admin SDK bypasses rules for writes)
- `email_logs`: read-only for authenticated users
- `notifications`: authenticated users can read; can only update `read` + `readAt` fields; no create/delete from client

---

## Common Tasks Cheatsheet

**Change the email template design** → `backend/src/services/template.js` only

**Add a new form field to the trade request** →
1. Add field to `BLANK` in `SendEmail.jsx`
2. Add input in the form JSX
3. Add validation in `backend/src/routes/email.js` (body validators)
4. Add field to `logData` + notification in `email.js` route handler
5. Add column to `EmailLogs.jsx` table + detail modal
6. Pass new field into `buildLeadEmail()` in `template.js` if it should appear in the email

**Add a new notification type** →
1. Write to `notifications` collection from backend with a new `type` value
2. Update icon/color logic in `NotificationBell.jsx` (the `notif.type === 'SUCCESS'` ternary)

**Change who emails are sent TO** → `TATVARTH_INBOX` in `backend/.env`

**Add a new client field** →
1. Add to POST/PUT body handling in `backend/src/routes/clients.js`
2. Add input to the client form modal in `Clients.jsx`
3. Show in the client list/detail in `Clients.jsx`

**Extend log pagination page size** → change `?limit=20` in `EmailLogs.jsx` `fetchPage()` (max 100, enforced in backend)

**Add a new page with its own API data** →
1. New file in `pages/`
2. Route in `App.jsx`
3. `PAGE_META` entry in `Header.jsx`
4. Nav link in `Sidebar.jsx`
5. Backend route if needed (new file in `routes/`, mount in `server.js`)
