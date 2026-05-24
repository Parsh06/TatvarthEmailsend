import { useState } from 'react'
import {
  BookOpen, Download, User, Users, Mail, Key, Shield, Send, FileText,
  Info, Lock, Bell, Settings, ChevronDown, ChevronRight,
  AlertCircle, Zap, Globe, Palette, MessageSquare, Star, Hash,
} from 'lucide-react'

// ── App Password PDF ────────────────────────────────────────────────────────
function openAppPasswordGuide() {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>Gmail App Password Setup Guide – Tatvarth Capital</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:'Inter',Arial,sans-serif;color:#1E293B;background:#fff;font-size:14px;line-height:1.6}
  .page{max-width:760px;margin:0 auto;padding:48px 40px}

  /* header */
  .hdr{background:linear-gradient(135deg,#0A1628 0%,#142850 100%);color:#fff;padding:36px 40px;border-radius:16px 16px 0 0;margin:-48px -40px 40px}
  .hdr-logo{display:flex;align-items:center;gap:12px;margin-bottom:20px}
  .hdr-tile{width:44px;height:44px;background:linear-gradient(135deg,#F0B429,#D97706);border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:22px;font-weight:900;color:#0A1628}
  .hdr h1{font-size:26px;font-weight:700;margin-bottom:6px}
  .hdr p{color:#94A3B8;font-size:14px}
  .badge{display:inline-block;background:rgba(240,180,41,0.15);color:#F0B429;border:1px solid rgba(240,180,41,0.3);border-radius:20px;padding:3px 12px;font-size:11px;font-weight:600;letter-spacing:0.06em;text-transform:uppercase;margin-top:12px}

  /* print btn */
  .print-bar{display:flex;justify-content:flex-end;margin-bottom:32px}
  .print-btn{background:linear-gradient(135deg,#F0B429,#D97706);color:#0A1628;border:none;border-radius:8px;padding:10px 22px;font-size:13px;font-weight:700;cursor:pointer;display:flex;align-items:center;gap:8px;font-family:inherit}
  .print-btn:hover{opacity:0.9}

  /* prereq box */
  .prereq{background:#FFF7ED;border:1px solid #FDE68A;border-left:4px solid #F0B429;border-radius:10px;padding:18px 20px;margin-bottom:32px}
  .prereq h3{color:#92400E;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:8px}
  .prereq ul{padding-left:18px;color:#451A03;font-size:13px}
  .prereq li{margin-bottom:4px}

  /* steps */
  .section-title{font-size:17px;font-weight:700;color:#0F172A;margin-bottom:20px;padding-bottom:10px;border-bottom:2px solid #E2E8F0;display:flex;align-items:center;gap:10px}
  .section-title .dot{width:28px;height:28px;background:linear-gradient(135deg,#F0B429,#D97706);border-radius:8px;display:inline-flex;align-items:center;justify-content:center;color:#0A1628;font-size:13px;font-weight:800;flex-shrink:0}

  .step{display:flex;gap:16px;margin-bottom:24px;align-items:flex-start}
  .step-num{width:32px;height:32px;border-radius:50%;background:#0A1628;color:#F0B429;font-size:13px;font-weight:800;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:1px}
  .step-body h4{font-size:14px;font-weight:700;color:#0F172A;margin-bottom:4px}
  .step-body p{color:#475569;font-size:13px;line-height:1.6}
  .step-body .tip{background:#F0F9FF;border:1px solid #BAE6FD;border-radius:6px;padding:10px 14px;margin-top:8px;font-size:12px;color:#0369A1}
  .step-body .warn{background:#FFF7ED;border:1px solid #FED7AA;border-radius:6px;padding:10px 14px;margin-top:8px;font-size:12px;color:#9A3412}
  .step-body .url{display:inline-block;background:#F1F5F9;border:1px solid #E2E8F0;border-radius:6px;padding:6px 12px;font-family:'Courier New',monospace;font-size:12px;color:#334155;margin-top:6px}

  /* password box */
  .pwd-box{background:#F0FDF4;border:1px solid #86EFAC;border-radius:10px;padding:18px 20px;margin:20px 0}
  .pwd-box h4{color:#15803D;font-size:13px;font-weight:700;margin-bottom:6px}
  .pwd-sample{font-family:'Courier New',monospace;font-size:20px;font-weight:700;letter-spacing:4px;color:#166534;background:#DCFCE7;padding:12px 20px;border-radius:8px;text-align:center;margin:10px 0;border:1px dashed #86EFAC}
  .pwd-box p{color:#15803D;font-size:12px}

  /* security box */
  .security{background:#FFF1F2;border:1px solid #FECDD3;border-radius:10px;padding:18px 20px;margin:24px 0}
  .security h4{color:#BE123C;font-size:13px;font-weight:700;margin-bottom:8px}
  .security ul{padding-left:16px;color:#9F1239;font-size:13px}
  .security li{margin-bottom:4px}

  /* footer */
  .footer{margin-top:40px;padding-top:20px;border-top:1px solid #E2E8F0;display:flex;justify-content:space-between;align-items:center;font-size:11px;color:#94A3B8}

  @media print{
    .print-bar{display:none}
    body{font-size:12px}
    .page{padding:24px 32px}
    .hdr{margin:-24px -32px 32px;border-radius:0}
    .step-body .tip,.step-body .warn{break-inside:avoid}
    .step{break-inside:avoid}
  }
</style>
</head>
<body>
<div class="page">

  <div class="hdr">
    <div class="hdr-logo">
      <div class="hdr-tile" style="background: #ffffff; padding: 2px;">
        <img src="/logo2.png" alt="Logo" style="width: 100%; height: 100%; object-fit: contain; border-radius: 8px;" />
      </div>
      <div>
        <div style="font-size:18px;font-weight:700">Tatvarth Capital</div>
        <div style="color:#F0B429;font-size:10px;font-weight:700;letter-spacing:0.14em">BROKER PORTAL</div>
      </div>
    </div>
    <h1>Gmail App Password Setup Guide</h1>
    <p>Step-by-step instructions for clients to generate a secure app password for use with the Tatvarth Capital Broker Portal.</p>
    <div class="badge">Client Reference Document</div>
  </div>

  <div class="print-bar">
    <button class="print-btn" onclick="window.print()">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
      Save as PDF / Print
    </button>
  </div>

  <div class="prereq">
    <h3>Before You Begin — What You Need</h3>
    <ul>
      <li>A <strong>Gmail account</strong> that you want to send broker request emails from</li>
      <li><strong>2-Step Verification (2FA)</strong> enabled on that Google account (required for App Passwords)</li>
      <li>Access to the Google Account Security settings (takes about 3 minutes)</li>
    </ul>
  </div>

  <!-- PART 1: Enable 2FA -->
  <div class="section-title">
    <span class="dot">1</span>
    Enable 2-Step Verification (if not already done)
  </div>

  <div class="step">
    <div class="step-num">1</div>
    <div class="step-body">
      <h4>Go to your Google Account</h4>
      <p>Open a browser and navigate to your Google Account Security settings.</p>
      <div class="url">https://myaccount.google.com/security</div>
    </div>
  </div>

  <div class="step">
    <div class="step-num">2</div>
    <div class="step-body">
      <h4>Find "2-Step Verification"</h4>
      <p>Scroll down to the <strong>"How you sign in to Google"</strong> section and click on <strong>"2-Step Verification"</strong>.</p>
    </div>
  </div>

  <div class="step">
    <div class="step-num">3</div>
    <div class="step-body">
      <h4>Follow the setup wizard</h4>
      <p>Click <strong>"Get started"</strong> and follow the on-screen steps. You can use SMS, Google Authenticator, or a physical key. <strong>SMS is the easiest option.</strong></p>
      <div class="tip">💡 If 2-Step Verification is already enabled, skip this section and go directly to Part 2.</div>
    </div>
  </div>

  <br/>

  <!-- PART 2: Create App Password -->
  <div class="section-title">
    <span class="dot">2</span>
    Create the App Password
  </div>

  <div class="step">
    <div class="step-num">1</div>
    <div class="step-body">
      <h4>Go directly to the App Passwords page</h4>
      <p>Use this direct link — it takes you straight to the App Passwords section:</p>
      <div class="url">https://myaccount.google.com/apppasswords</div>
      <div class="tip">💡 You may be asked to sign in again for security verification.</div>
    </div>
  </div>

  <div class="step">
    <div class="step-num">2</div>
    <div class="step-body">
      <h4>Enter a name for the app password</h4>
      <p>In the text field labelled <strong>"App name"</strong>, type a descriptive name so you can identify it later. Use something like:</p>
      <div class="url">Tatvarth Capital Broker Portal</div>
    </div>
  </div>

  <div class="step">
    <div class="step-num">3</div>
    <div class="step-body">
      <h4>Click "Create"</h4>
      <p>Google will generate a <strong>16-character password</strong>. It will appear in a yellow box on screen.</p>
    </div>
  </div>

  <div class="step">
    <div class="step-num">4</div>
    <div class="step-body">
      <h4>Copy the 16-character password</h4>
      <p>The password looks like this (yours will be different):</p>
      <div class="pwd-box">
        <h4>✅ Example App Password</h4>
        <div class="pwd-sample">abcd efgh ijkl mnop</div>
        <p>Your actual password will be a unique 16-character code. Copy it exactly — spaces are ignored automatically.</p>
      </div>
      <div class="warn">⚠️ This password is shown <strong>only once</strong>. Copy it immediately before closing the dialog.</div>
    </div>
  </div>

  <div class="step">
    <div class="step-num">5</div>
    <div class="step-body">
      <h4>Share the password with your broker</h4>
      <p>Provide your broker with:</p>
      <ul style="padding-left:16px;margin-top:6px;color:#475569;font-size:13px">
        <li style="margin-bottom:3px">Your full Gmail address (e.g. yourname@gmail.com)</li>
        <li style="margin-bottom:3px">The 16-character App Password you just generated</li>
      </ul>
      <div class="tip">💡 Share this information securely — use a trusted channel, not a public message.</div>
    </div>
  </div>

  <br/>

  <!-- PART 3: Security -->
  <div class="section-title">
    <span class="dot">3</span>
    Security Notes
  </div>

  <div class="security">
    <h4>🔒 Important Security Information</h4>
    <ul>
      <li>The app password is <strong>stored encrypted</strong> (AES-256) in the broker portal — your main Gmail password is never used or stored.</li>
      <li>This app password only grants access to <strong>send emails</strong> through your Gmail SMTP. It cannot read your emails or access your account.</li>
      <li>You can <strong>revoke this app password at any time</strong> from Google Account → Security → App Passwords → select your entry → Delete (trash icon).</li>
      <li>Revoking the password immediately prevents any further emails from being sent through the portal using your account.</li>
      <li>Your main Google account password remains <strong>completely unchanged and secure</strong>.</li>
    </ul>
  </div>

  <br/>

  <!-- PART 4: Troubleshooting -->
  <div class="section-title">
    <span class="dot">4</span>
    Troubleshooting
  </div>

  <div class="step">
    <div class="step-num">?</div>
    <div class="step-body">
      <h4>"App Passwords" option is not visible</h4>
      <p>This means 2-Step Verification is not enabled. Complete Part 1 first, then return to the App Passwords page.</p>
    </div>
  </div>

  <div class="step">
    <div class="step-num">?</div>
    <div class="step-body">
      <h4>Email sending fails after setup</h4>
      <p>Double-check that the full password was copied correctly (16 characters). Spaces in the displayed password can be ignored. Ask your broker to try removing the client and re-adding with the correct password.</p>
    </div>
  </div>

  <div class="step">
    <div class="step-num">?</div>
    <div class="step-body">
      <h4>Google account is a Workspace / business account</h4>
      <p>If your organisation uses Google Workspace, an administrator may need to <strong>enable App Passwords</strong> in the Admin Console under Security → Less secure apps. Contact your IT administrator.</p>
    </div>
  </div>

  <div class="footer">
    <span>Tatvarth Capital Broker Portal — Client Reference Document</span>
    <span>© ${new Date().getFullYear()} Tatvarth Capital. Confidential.</span>
  </div>

</div>
<script>
  // Auto-open print dialog after page loads
  window.addEventListener('load', function() {
    // Small delay to let fonts load
    setTimeout(function() { window.print(); }, 800)
  })
</script>
</body>
</html>`

  const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
  const url  = URL.createObjectURL(blob)
  const win  = window.open(url, '_blank')
  if (!win) alert('Please allow pop-ups to download the guide.')
  setTimeout(() => URL.revokeObjectURL(url), 60000)
}

// ── Reusable components ─────────────────────────────────────────────────────
function Card({ title, subtitle, icon: Icon, color = '#F0B429', children }) {
  return (
    <div className="rounded-2xl overflow-hidden"
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
      <div className="px-6 py-4" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: `${color}18`, border: `1px solid ${color}28` }}>
            <Icon size={15} color={color} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{title}</h3>
            {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
          </div>
        </div>
      </div>
      <div className="p-6">{children}</div>
    </div>
  )
}

function Step({ n, title, description, tip, color = '#F0B429', icon: Icon }) {
  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center flex-shrink-0">
        <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0"
          style={{ background: `${color}18`, border: `2px solid ${color}40`, color }}>
          {Icon ? <Icon size={14} /> : n}
        </div>
        <div className="flex-1 w-px mt-2" style={{ background: 'var(--border-subtle)', minHeight: 16 }} />
      </div>
      <div className="pb-5 flex-1 min-w-0">
        <div className="text-sm font-semibold text-slate-200 mb-1">{title}</div>
        <p className="text-xs text-slate-500 leading-relaxed">{description}</p>
        {tip && (
          <div className="mt-2 flex items-start gap-2 text-xs rounded-lg px-3 py-2"
            style={{ background: 'rgba(96,165,250,0.06)', border: '1px solid rgba(96,165,250,0.15)', color: '#93C5FD' }}>
            <Info size={11} className="flex-shrink-0 mt-0.5" />
            {tip}
          </div>
        )}
      </div>
    </div>
  )
}

function RequirementRow({ icon: Icon, label, description, color }) {
  return (
    <div className="flex items-start gap-3 py-3" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
      <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
        style={{ background: `${color}15`, border: `1px solid ${color}25` }}>
        <Icon size={13} color={color} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold text-slate-200">{label}</div>
        <p className="text-xs text-slate-500 leading-relaxed mt-0.5">{description}</p>
      </div>
    </div>
  )
}

function FAQ({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="rounded-xl overflow-hidden"
      style={{ border: '1px solid var(--border-subtle)', background: 'rgba(10,26,48,0.4)' }}>
      <button className="w-full flex items-center justify-between px-5 py-4 text-left"
        onClick={() => setOpen(v => !v)}>
        <span className="text-sm font-medium text-slate-300">{q}</span>
        {open
          ? <ChevronDown size={15} className="text-slate-500 flex-shrink-0" />
          : <ChevronRight size={15} className="text-slate-500 flex-shrink-0" />
        }
      </button>
      {open && (
        <div className="px-5 pb-4 text-xs text-slate-500 leading-relaxed animate-slide-up"
          style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 12 }}>
          {a}
        </div>
      )}
    </div>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function Guide() {
  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-8">

      {/* Hero */}
      <div className="rounded-2xl p-7 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg,#0A1628 0%,#0F1F3D 100%)', border: '1px solid var(--border-default)' }}>
        <div className="absolute top-0 right-0 w-64 h-64 pointer-events-none opacity-10"
          style={{ background: 'radial-gradient(circle,#F0B429 0%,transparent 70%)', transform: 'translate(30%,-30%)' }} />
        <div className="relative z-10 flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg,#F0B429,#D97706)', boxShadow: '0 4px 14px rgba(240,180,41,0.3)' }}>
                <BookOpen size={18} color="#020C1B" strokeWidth={2.2} />
              </div>
              <span className="text-xs font-bold tracking-widest" style={{ color: '#F0B429' }}>PORTAL GUIDE</span>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              How to Use Tatvarth Capital
            </h2>
            <p className="text-slate-400 text-sm max-w-lg leading-relaxed">
              Complete reference for brokers — from adding clients to sending share transaction requests.
              Everything you need to get up and running.
            </p>
          </div>
          {/* App Password Download */}
          <div className="flex-shrink-0">
            <button
              onClick={openAppPasswordGuide}
              className="flex items-center gap-2.5 px-5 py-3 rounded-xl font-semibold text-sm transition-all"
              style={{
                background: 'linear-gradient(135deg,#F0B429,#D97706)',
                color: '#020C1B',
                boxShadow: '0 4px 18px rgba(240,180,41,0.35)',
                border: 'none',
              }}
              onMouseOver={e => e.currentTarget.style.transform = 'translateY(-1px)'}
              onMouseOut={e  => e.currentTarget.style.transform = 'none'}
            >
              <Download size={15} strokeWidth={2.5} />
              App Password Guide
            </button>
            <p className="text-xs text-slate-600 mt-2 text-center">PDF — share with your clients</p>
          </div>
        </div>

        {/* Quick stats */}
        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
          {[
            { label: 'Pages',   value: '5',          color: '#F0B429' },
            { label: 'Steps',   value: '7',          color: '#10B981' },
            { label: 'Minutes', value: '~3',         color: '#60A5FA' },
            { label: 'Setup',   value: 'One-time',   color: '#A78BFA' },
          ].map(({ label, value, color }) => (
            <div key={label} className="rounded-xl px-4 py-3 text-center"
              style={{ background: 'rgba(2,12,27,0.5)', border: '1px solid var(--border-subtle)' }}>
              <div className="text-base font-bold" style={{ color }}>{value}</div>
              <div className="text-xs text-slate-500 mt-0.5">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 1. What is the Portal */}
      <Card title="What is This Portal?" subtitle="Overview and purpose" icon={Globe} color="#60A5FA">
        <div className="space-y-3 text-sm text-slate-400 leading-relaxed">
          <p>
            The <span className="text-white font-semibold">Tatvarth Capital Broker Portal</span> is a secure internal tool that lets brokers send branded share transaction request emails on behalf of their clients — directly from each client's own Gmail account.
          </p>
          <p>
            Instead of composing emails manually, brokers fill in a structured form (BUY/SELL, company, quantity, price) and the portal generates a professionally formatted HTML email and sends it to the designated recipient (e.g. the stock exchange or trading desk).
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
            {[
              { Icon: Shield,   label: 'Secure',      desc: 'Passwords encrypted with AES-256. Never stored in plain text.',   color: '#10B981' },
              { Icon: Zap,      label: 'Fast',         desc: 'Fill the form and send in under a minute. Real-time logs.',       color: '#F0B429' },
              { Icon: FileText, label: 'Auditable',    desc: 'Every send — success or failure — is logged with full details.',  color: '#A78BFA' },
            ].map(({ Icon, label, desc, color }) => (
              <div key={label} className="rounded-xl p-4"
                style={{ background: 'rgba(10,26,48,0.5)', border: '1px solid var(--border-subtle)' }}>
                <div className="flex items-center gap-2 mb-2">
                  <Icon size={14} color={color} />
                  <span className="text-sm font-semibold text-white">{label}</span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* 2. What you need from each client */}
      <Card title="What You Need From Each Client" subtitle="Collect this information before adding a client" icon={User} color="#F0B429">
        <RequirementRow icon={User}  color="#60A5FA" label="Client Full Name"
          description="The name displayed in emails and logs. Use the client's preferred name." />
        <RequirementRow icon={Mail}  color="#F0B429" label="Gmail Address"
          description="The Gmail account from which transaction emails will be sent. Must be a Gmail account (e.g. clientname@gmail.com)." />
        <RequirementRow icon={Key}   color="#10B981" label="Gmail App Password (16 characters)"
          description="A special password generated in the client's Google Account Security settings. This is NOT their regular Gmail password. See the App Password Guide PDF (button above) for exact steps to generate this." />
        <div className="pt-3">
          <div className="rounded-xl p-4 flex items-start gap-3"
            style={{ background: 'rgba(240,180,41,0.05)', border: '1px solid rgba(240,180,41,0.15)' }}>
            <AlertCircle size={14} style={{ color: '#F0B429', flexShrink: 0, marginTop: 1 }} />
            <div className="text-xs text-slate-400 leading-relaxed">
              <span className="text-amber-400 font-semibold">Important:</span> The App Password is different from the client's regular Google password.
              It is a 16-character code generated specifically for third-party apps. The client's main account password is never used or stored in this portal.
              Share the <button onClick={openAppPasswordGuide} className="underline font-semibold" style={{ color: '#F0B429', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>App Password Guide PDF</button> with your client so they can generate it themselves.
            </div>
          </div>
        </div>
      </Card>

      {/* 3. Step-by-step: Adding a client */}
      <Card title="Step-by-Step: Adding a Client" subtitle="One-time setup per client" icon={Users} color="#10B981">
        <div className="space-y-0">
          <Step n="1" color="#10B981" icon={null}
            title='Navigate to "Clients" in the sidebar'
            description="Click on Clients in the left menu to open the client management page." />
          <Step n="2" color="#10B981"
            title='Click "Add Client"'
            description='Click the gold "Add Client" button in the top-right corner of the Clients page.' />
          <Step n="3" color="#10B981"
            title="Fill in client details"
            description="Enter the client's full name, Gmail address, and 16-character app password. SMTP settings (host: smtp.gmail.com, port: 587) are pre-filled — do not change unless the client uses a custom domain."
            tip="The app password is encrypted with AES-256 before being stored. Nobody can read it back in plain text." />
          <Step n="4" color="#10B981"
            title="Toggle Active status"
            description="Ensure the 'Active' toggle is ON. Inactive clients cannot have emails sent from their account." />
          <Step n="5" color="#10B981"
            title="Save"
            description='Click "Save Client". The client now appears in the list and can be selected in the Send Email form.' />
        </div>
      </Card>

      {/* 4. Sending an email */}
      <Card title="Step-by-Step: Sending a Transaction Request" subtitle="The main workflow" icon={Send} color="#F0B429">
        <div className="space-y-0">
          <Step n="1" color="#F0B429"
            title='Navigate to "Send Email"'
            description="Click Send Email in the left sidebar." />
          <Step n="2" color="#F0B429"
            title="Select the client to send from"
            description="Use the client dropdown to pick which client's Gmail account will be used as the sender. Only active clients with configured credentials appear here." />
          <Step n="3" color="#F0B429"
            title="Choose transaction type"
            description="Click BUY (green) or SELL (amber) to set the transaction type. This affects the email subject, badge colour, and header." />
          <Step n="4" color="#F0B429"
            title="Fill in stock details"
            description="Enter: Company Name (required), Stock Symbol (optional, e.g. RELIANCE), Quantity (required), Price per Share (optional — shows estimated value)."
            tip="The estimated total value (quantity × price) is calculated live and shown in the email." />
          <Step n="5" color="#F0B429"
            title="Add additional information (optional)"
            description='Use the "Additional Information" textarea for special instructions — e.g. "Please process at market rate" or "T+1 settlement preferred".' />
          <Step n="6" color="#F0B429"
            title="Preview the email (recommended)"
            description='Click "Preview" to see an exact render of the HTML email before sending. The delivery meta (To, CC, Subject) is shown above the preview.'
            tip="The preview uses your actual portal settings, so it reflects exactly what the recipient will see." />
          <Step n="7" color="#F0B429"
            title='Click "Send Request"'
            description="The email is sent from the client's Gmail via SMTP. A success or failure notification appears in real time. All sends are logged in Email Logs." />
        </div>
      </Card>

      {/* 5. Advanced Options */}
      <Card title="Advanced Options (Per-Send Overrides)" subtitle="Override portal defaults for a single email" icon={Settings} color="#A78BFA">
        <p className="text-xs text-slate-500 leading-relaxed mb-4">
          By default every email uses the portal-wide settings configured in the Settings page.
          The Advanced Options section in the Send Email form lets you override any of these <strong className="text-slate-300">for one send only</strong> — without changing the global settings.
        </p>
        <div className="space-y-2">
          {[
            { Icon: Mail,         label: 'Override Recipient (To)',  desc: 'Send this email to a different address than the default.' },
            { Icon: Mail,         label: 'CC / BCC',                 desc: 'Add a one-off CC or BCC recipient for this transaction.' },
            { Icon: MessageSquare,label: 'Custom Subject',           desc: 'Override the auto-generated subject line for this email only.' },
          ].map(({ Icon, label, desc }) => (
            <div key={label} className="flex items-start gap-3 rounded-lg px-3 py-2.5"
              style={{ background: 'rgba(167,139,250,0.05)', border: '1px solid rgba(167,139,250,0.12)' }}>
              <Icon size={13} style={{ color: '#A78BFA', flexShrink: 0, marginTop: 2 }} />
              <div>
                <span className="text-xs font-semibold text-slate-300">{label} — </span>
                <span className="text-xs text-slate-500">{desc}</span>
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-slate-600 mt-3">
          Leave any override field blank to use the portal default. Active overrides are shown in a summary box before sending.
        </p>
      </Card>

      {/* 6. Portal Settings */}
      <Card title="Configuring Portal Settings" subtitle="Defaults that apply to every email" icon={Settings} color="#EF4444">
        <p className="text-xs text-slate-500 leading-relaxed mb-4">
          Navigate to <strong className="text-slate-300">Settings</strong> in the sidebar to configure portal-wide defaults. Changes take effect immediately for all future sends.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {[
            { Icon: Mail,         label: 'Email Delivery',    desc: 'Default To, CC, BCC, Reply-To',        color: '#F0B429' },
            { Icon: Hash,         label: 'Subject Template',  desc: 'With {{TX}}, {{COMPANY}}, {{SYMBOL}}', color: '#60A5FA' },
            { Icon: MessageSquare,label: 'Email Body',        desc: 'Greeting line and footer note',         color: '#A78BFA' },
            { Icon: FileText,     label: 'Sign-off',          desc: 'Sign-off line and closing salutation',  color: '#10B981' },
            { Icon: Lock,         label: 'Disclaimer',        desc: 'Footer disclaimer with {{CLIENT}} {{DATE}}', color: '#F59E0B' },
            { Icon: Palette,      label: 'Email Design',      desc: 'Accent colour and reply button text',   color: '#EF4444' },
            { Icon: Star,         label: 'Portal Branding',   desc: 'Portal name shown in every email',      color: '#60A5FA' },
          ].map(({ Icon, label, desc, color }) => (
            <div key={label} className="flex items-start gap-2.5 rounded-lg p-3"
              style={{ background: 'rgba(10,26,48,0.5)', border: '1px solid var(--border-subtle)' }}>
              <Icon size={13} style={{ color, flexShrink: 0, marginTop: 1 }} />
              <div>
                <div className="text-xs font-semibold text-slate-300">{label}</div>
                <div className="text-xs text-slate-600">{desc}</div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* 7. Email Logs */}
      <Card title="Understanding Email Logs" subtitle="Your complete audit trail" icon={FileText} color="#60A5FA">
        <p className="text-xs text-slate-500 leading-relaxed mb-4">
          Every send attempt — successful or failed — is recorded in <strong className="text-slate-300">Email Logs</strong>. Use this to track all transaction requests, investigate failures, and audit activity.
        </p>
        <div className="space-y-2">
          {[
            { color: '#10B981', label: 'SUCCESS',   desc: 'Email was accepted by Gmail SMTP and dispatched to the recipient.' },
            { color: '#EF4444', label: 'FAILED',    desc: 'Email send failed. The error reason is shown inline in the row and in the detail modal — usually an incorrect app password or inactive Gmail account.' },
          ].map(({ color, label, desc }) => (
            <div key={label} className="flex items-start gap-3 rounded-lg px-3 py-2.5"
              style={{ background: `${color}09`, border: `1px solid ${color}20` }}>
              <span className="badge flex-shrink-0 mt-0.5"
                style={{ background: `${color}15`, color, border: `1px solid ${color}30`, fontSize: 10, padding: '2px 8px' }}>
                {label}
              </span>
              <p className="text-xs text-slate-500">{desc}</p>
            </div>
          ))}
        </div>
        <div className="flex items-start gap-2.5 rounded-lg px-3 py-2.5 mt-3"
          style={{ background: 'rgba(96,165,250,0.05)', border: '1px solid rgba(96,165,250,0.15)' }}>
          <Bell size={12} style={{ color: '#60A5FA', flexShrink: 0, marginTop: 1 }} />
          <p className="text-xs text-slate-500">
            The <strong className="text-slate-300">notification bell</strong> (top-right) shows real-time alerts for every send. Click any notification to jump directly to Email Logs.
          </p>
        </div>
      </Card>

      {/* FAQ */}
      <div>
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: 'rgba(240,180,41,0.12)', border: '1px solid rgba(240,180,41,0.2)' }}>
            <Info size={13} color="#F0B429" />
          </div>
          <h3 className="text-sm font-semibold text-white"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Frequently Asked Questions</h3>
        </div>
        <div className="space-y-2">
          <FAQ
            q="Can the same client be used to send multiple emails?"
            a="Yes. A client can be selected for as many sends as needed. Each send is logged separately. There is no per-day limit imposed by the portal, but Gmail SMTP has its own daily sending limits (typically 500 emails per day for personal accounts)."
          />
          <FAQ
            q="What happens if the app password changes?"
            a="If the client regenerates or revokes their app password, all future sends from that client will fail with an authentication error. Edit the client in the Clients page, enter the new app password, and save."
          />
          <FAQ
            q="Can I send to multiple recipients at once?"
            a="The To field supports one address at a time. Use CC and BCC (in Advanced Options or in Settings) to copy additional recipients on every send. The portal is designed for structured one-to-broker-desk communication."
          />
          <FAQ
            q="Is the client notified when an email is sent?"
            a="No — the email is sent FROM the client's address but the client themselves does not receive a notification from the portal. The email goes to the configured recipient (e.g. Tatvarth Capital's inbox) only."
          />
          <FAQ
            q="How do I change where emails are sent to?"
            a="Go to Settings → Email Delivery → Default Recipient (To). This changes the destination for all future emails. You can also override it per-send using the Advanced Options in the Send Email form."
          />
          <FAQ
            q="What is the subject template and how do the variables work?"
            a="The subject template uses placeholder variables: {{TX}} = BUY or SELL, {{COMPANY}} = the company name entered in the form, {{SYMBOL}} = the stock symbol (shown in brackets), {{CLIENT}} = the client's name. Configure the template in Settings → Subject Line."
          />
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="rounded-2xl p-6 text-center"
        style={{ background: 'linear-gradient(135deg,rgba(240,180,41,0.06),rgba(240,180,41,0.02))', border: '1px solid rgba(240,180,41,0.15)' }}>
        <Download size={24} className="mx-auto mb-3" style={{ color: '#F0B429' }} strokeWidth={1.5} />
        <h3 className="text-white font-semibold mb-1.5"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          Share the App Password Guide with your clients
        </h3>
        <p className="text-xs text-slate-500 mb-4 max-w-sm mx-auto">
          Send this PDF to clients so they can generate their app password independently — step-by-step with screenshots.
        </p>
        <button
          onClick={openAppPasswordGuide}
          className="inline-flex items-center gap-2.5 px-6 py-3 rounded-xl font-bold text-sm"
          style={{ background: 'linear-gradient(135deg,#F0B429,#D97706)', color: '#020C1B', border: 'none', cursor: 'pointer', boxShadow: '0 4px 16px rgba(240,180,41,0.3)' }}
          onMouseOver={e => e.currentTarget.style.transform = 'translateY(-1px)'}
          onMouseOut={e  => e.currentTarget.style.transform = 'none'}
        >
          <Download size={15} strokeWidth={2.5} />
          Download App Password Guide (PDF)
        </button>
      </div>

    </div>
  )
}

