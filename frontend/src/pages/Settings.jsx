import { useState, useEffect, useCallback } from 'react'
import {
  Mail, AtSign, MessageSquare, Globe, RotateCcw,
  Save, CheckCircle, AlertCircle, Clock, Eye, EyeOff,
  Info, Palette, FileSignature, Tag, Hash,
} from 'lucide-react'
import { apiGet, apiPut } from '../utils/api'

const DEFAULTS = {
  toEmail:          'tatvarthcapital@gmail.com',
  ccEmail:          '',
  bccEmail:         '',
  replyToEmail:     '',
  subjectTemplate:  'Share {{TX}} Request – {{COMPANY}}{{SYMBOL}}',
  emailGreeting:    'Hello Tatvarth Capital,',
  emailFooterNote:  '',
  signOffLine:      'Please process this request and revert at your earliest convenience.',
  closingSalutation:'Warm Regards,',
  disclaimerText:   'This request was submitted through the Tatvarth Capital Broker Portal by {{CLIENT}} on {{DATE}}. This is an automated notification — please do not reply to this email directly.',
  ctaButtonText:    'Reply to Client →',
  accentColor:      '#F0B429',
  portalName:       'Tatvarth Capital',
}

const SUBJECT_VARS = [
  { tag: '{{TX}}',      desc: 'BUY or SELL' },
  { tag: '{{COMPANY}}', desc: 'Company name' },
  { tag: '{{SYMBOL}}',  desc: 'Stock symbol (with brackets)' },
  { tag: '{{CLIENT}}',  desc: 'Client name' },
]

const DISCLAIMER_VARS = [
  { tag: '{{CLIENT}}', desc: 'Client name' },
  { tag: '{{DATE}}',   desc: 'Timestamp of send' },
]

function resolveSubjectPreview(template) {
  return (template || '')
    .replace(/\{\{TX\}\}/g,      'BUY')
    .replace(/\{\{COMPANY\}\}/g, 'Reliance Industries')
    .replace(/\{\{SYMBOL\}\}/g,  ' (RELIANCE)')
    .replace(/\{\{CLIENT\}\}/g,  'Parsh Jain')
}

function resolveDisclaimerPreview(template) {
  return (template || '')
    .replace(/\{\{CLIENT\}\}/g, 'Parsh Jain')
    .replace(/\{\{DATE\}\}/g,   new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }))
}

// ── Reusable components ──────────────────────────────────────────────────────
function Field({ label, hint, Icon, value, onChange, placeholder, type = 'text', required = false, tag, maxLength }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        {tag && (
          <span className="text-xs px-2 py-0.5 rounded-full"
            style={{ background: 'rgba(240,180,41,0.1)', color: '#F0B429', border: '1px solid rgba(240,180,41,0.2)' }}>
            {tag}
          </span>
        )}
      </div>
      <div className="relative">
        {Icon && <Icon size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600" />}
        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className={`input-base ${Icon ? 'pl-10' : ''}`}
          required={required}
          maxLength={maxLength}
        />
      </div>
      {hint && <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">{hint}</p>}
    </div>
  )
}

function TextareaField({ label, hint, value, onChange, placeholder, rows = 3, maxLength = 500, vars }) {
  const insertVar = (v) => onChange(value + v)
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</label>
        <span className="text-xs text-slate-600">{value.length}/{maxLength}</span>
      </div>
      <textarea
        className="input-base resize-none"
        rows={rows}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        style={{ fontFamily: 'inherit' }}
      />
      {vars && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {vars.map(v => (
            <button key={v.tag} type="button" onClick={() => insertVar(v.tag)}
              className="text-xs px-2 py-1 rounded-md transition-all font-mono"
              style={{ background: 'rgba(96,165,250,0.08)', color: '#93C5FD', border: '1px solid rgba(96,165,250,0.2)' }}
              title={`Insert ${v.desc}`}
              onMouseOver={e => e.currentTarget.style.background = 'rgba(96,165,250,0.16)'}
              onMouseOut={e  => e.currentTarget.style.background = 'rgba(96,165,250,0.08)'}>
              {v.tag}
            </button>
          ))}
          <span className="text-xs text-slate-700 self-center ml-1">← click to insert</span>
        </div>
      )}
      {hint && <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">{hint}</p>}
    </div>
  )
}

function Section({ title, subtitle, icon: Icon, color = '#F0B429', children }) {
  return (
    <div className="rounded-2xl overflow-hidden"
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
      <div className="px-6 py-4" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: `${color}15`, border: `1px solid ${color}25` }}>
            <Icon size={15} color={color} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{title}</h3>
            <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
          </div>
        </div>
      </div>
      <div className="p-6 space-y-5">{children}</div>
    </div>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function Settings() {
  const [form, setForm]           = useState(DEFAULTS)
  const [original, setOriginal]   = useState(DEFAULTS)
  const [loading, setLoading]     = useState(true)
  const [saving, setSaving]       = useState(false)
  const [status, setStatus]       = useState(null)
  const [errMsg, setErrMsg]       = useState('')
  const [updatedAt, setUpdatedAt] = useState(null)
  const [showGreetingPreview, setShowGreetingPreview] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data  = await apiGet('/settings')
      const clean = { ...DEFAULTS, ...data }
      setForm(clean)
      setOriginal(clean)
      setUpdatedAt(data.updatedAt || null)
    } catch { /* keep defaults */ }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  const set = k => v => setForm(f => ({ ...f, [k]: v }))
  const isDirty = JSON.stringify(form) !== JSON.stringify(original)

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.toEmail) { setErrMsg('Default recipient email is required.'); return }
    if (form.accentColor && !/^#[0-9A-Fa-f]{6}$/.test(form.accentColor)) {
      setErrMsg('Accent colour must be a 6-digit hex code, e.g. #F0B429'); return
    }
    setErrMsg('')
    setSaving(true)
    setStatus(null)
    try {
      const data  = await apiPut('/settings', form)
      const clean = { ...DEFAULTS, ...data }
      setOriginal(clean)
      setForm(clean)
      setUpdatedAt(data.updatedAt || new Date().toISOString())
      setStatus('saved')
      setTimeout(() => setStatus(null), 4000)
    } catch (err) {
      setErrMsg(err.message || 'Failed to save settings.')
      setStatus('error')
    } finally { setSaving(false) }
  }

  const handleReset = async () => {
    if (!window.confirm('Reset ALL settings to factory defaults?')) return
    setSaving(true)
    try {
      const data  = await apiPut('/settings', DEFAULTS)
      const clean = { ...DEFAULTS, ...data }
      setForm(clean)
      setOriginal(clean)
      setUpdatedAt(data.updatedAt || new Date().toISOString())
      setStatus('saved')
      setTimeout(() => setStatus(null), 4000)
    } catch (err) {
      setErrMsg(err.message || 'Failed to reset.')
    } finally { setSaving(false) }
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto space-y-5">
        {[1,2,3,4,5,6].map(i => <div key={i} className="h-40 shimmer rounded-2xl" />)}
      </div>
    )
  }

  return (
    <form onSubmit={handleSave} className="max-w-2xl mx-auto space-y-5">

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-xl font-bold text-white" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Portal Settings
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            All fields are portal-wide defaults. Any can be overridden per-send in the Send Email form.
          </p>
        </div>
        {updatedAt && (
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <Clock size={11} />
            Last saved {new Date(updatedAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
          </div>
        )}
      </div>

      {/* ── 1. Email Delivery ── */}
      <Section title="Email Delivery" subtitle="Where emails are sent by default" icon={Mail} color="#F0B429">
        <Field label="Default Recipient (To)" required tag="Default"
          hint="Every transaction email goes here unless overridden per-send."
          Icon={AtSign} type="email"
          value={form.toEmail} onChange={set('toEmail')}
          placeholder="tatvarthcapital@gmail.com" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="CC Email"
            hint="Always CC'd on every send. Leave blank to skip."
            Icon={AtSign} type="email"
            value={form.ccEmail} onChange={set('ccEmail')}
            placeholder="manager@company.com" />
          <Field label="BCC Email"
            hint="Silently BCC'd. Leave blank to skip."
            Icon={AtSign} type="email"
            value={form.bccEmail} onChange={set('bccEmail')}
            placeholder="archive@company.com" />
        </div>
        <Field label="Reply-To Email"
          hint="Where replies go. Leave blank to use the sending client's own email."
          Icon={AtSign} type="email"
          value={form.replyToEmail} onChange={set('replyToEmail')}
          placeholder="broker@company.com (optional)" />
        {/* Delivery summary */}
        <div className="rounded-xl p-4"
          style={{ background: 'rgba(240,180,41,0.04)', border: '1px solid rgba(240,180,41,0.12)' }}>
          <div className="flex items-center gap-2 mb-3">
            <Info size={12} style={{ color: '#F0B429' }} />
            <span className="text-xs font-semibold" style={{ color: '#F0B429' }}>Live delivery summary</span>
          </div>
          {[['To', form.toEmail||'—'],['CC', form.ccEmail||'(none)'],['BCC', form.bccEmail||'(none)'],['Reply-To', form.replyToEmail||'(client email)']].map(([k,v]) => (
            <div key={k} className="flex gap-3 text-xs mb-1">
              <span className="text-slate-600 w-16 flex-shrink-0">{k}:</span>
              <span className="text-slate-300">{v}</span>
            </div>
          ))}
        </div>
      </Section>

      {/* ── 2. Subject Line ── */}
      <Section title="Subject Line" subtitle="Template for email subject — use variables for dynamic values" icon={Tag} color="#60A5FA">
        <TextareaField
          label="Subject Template"
          rows={2}
          maxLength={200}
          value={form.subjectTemplate}
          onChange={set('subjectTemplate')}
          placeholder="Share {{TX}} Request – {{COMPANY}}{{SYMBOL}}"
          vars={SUBJECT_VARS}
          hint="Supports: {{TX}} = BUY/SELL, {{COMPANY}} = company name, {{SYMBOL}} = stock symbol with brackets, {{CLIENT}} = client name"
        />
        {/* Live preview */}
        <div className="rounded-xl p-3.5"
          style={{ background: 'rgba(96,165,250,0.05)', border: '1px solid rgba(96,165,250,0.15)' }}>
          <div className="text-xs text-slate-600 mb-1 font-semibold uppercase tracking-wider">Preview</div>
          <div className="text-sm text-slate-200 font-medium">
            {resolveSubjectPreview(form.subjectTemplate) || '—'}
          </div>
          <div className="text-xs text-slate-600 mt-1">Using: BUY · Reliance Industries · RELIANCE</div>
        </div>
      </Section>

      {/* ── 3. Email Body ── */}
      <Section title="Email Body" subtitle="Text shown at the top and bottom of every email" icon={MessageSquare} color="#A78BFA">
        <Field label="Greeting Line"
          hint="The first line of the email. Appears above the transaction intro sentence."
          Icon={MessageSquare}
          value={form.emailGreeting} onChange={set('emailGreeting')}
          placeholder="Hello Tatvarth Capital," />
        <TextareaField
          label="Footer Note"
          rows={2}
          maxLength={500}
          value={form.emailFooterNote}
          onChange={set('emailFooterNote')}
          placeholder="Optional note shown after the sign-off line, e.g. 'Please confirm receipt by EOD.'"
          hint="Leave blank to skip." />
        {/* Body preview toggle */}
        <button type="button" onClick={() => setShowGreetingPreview(v => !v)}
          className="flex items-center gap-2 text-xs font-medium" style={{ color: '#A78BFA' }}>
          {showGreetingPreview ? <EyeOff size={13} /> : <Eye size={13} />}
          {showGreetingPreview ? 'Hide' : 'Show'} body preview
        </button>
        {showGreetingPreview && (
          <div className="rounded-xl p-4 text-sm leading-relaxed animate-slide-up"
            style={{ background: 'rgba(30,58,110,0.15)', border: '1px solid var(--border-subtle)', color: '#CBD5E1' }}>
            <p className="mb-3">{form.emailGreeting || 'Hello Tatvarth Capital,'}</p>
            <p className="text-slate-400">I would like to <strong className="text-emerald-400">BUY</strong> 500 shares of Reliance Industries (RELIANCE).
            Please find the complete transaction details below.</p>
            <p className="mt-3 text-slate-500 text-xs italic">[…transaction details table…]</p>
            {form.emailFooterNote && (
              <p className="mt-3 pt-3 text-slate-300 italic"
                style={{ borderTop: '1px solid var(--border-subtle)' }}>
                {form.emailFooterNote}
              </p>
            )}
          </div>
        )}
      </Section>

      {/* ── 4. Signature & Sign-off ── */}
      <Section title="Signature & Sign-off" subtitle="The closing lines of every email" icon={FileSignature} color="#10B981">
        <Field label="Sign-off Line"
          hint="The action line shown before the salutation (e.g. please process this request…)."
          Icon={MessageSquare}
          value={form.signOffLine} onChange={set('signOffLine')}
          placeholder="Please process this request and revert at your earliest convenience."
          maxLength={300} />
        <Field label="Closing Salutation"
          hint="The closing word before the client's name — e.g. Warm Regards, Best Regards, Thanks."
          Icon={MessageSquare}
          value={form.closingSalutation} onChange={set('closingSalutation')}
          placeholder="Warm Regards,"
          maxLength={60} />
        {/* Signature preview */}
        <div className="rounded-xl p-4"
          style={{ background: 'rgba(16,185,129,0.04)', border: '1px solid rgba(16,185,129,0.12)' }}>
          <div className="text-xs text-slate-600 mb-2 font-semibold uppercase tracking-wider">Sign-off preview</div>
          <div className="text-sm text-slate-300 leading-relaxed space-y-1">
            <p>{form.signOffLine || '—'}</p>
            {form.emailFooterNote && <p className="text-slate-500 italic">{form.emailFooterNote}</p>}
            <br />
            <p>{form.closingSalutation || 'Warm Regards,'}<br />
              <strong className="text-white">Client Name</strong><br />
              <span className="text-blue-400 text-xs">client@gmail.com</span><br />
              <span className="text-slate-500 text-xs">{new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
            </p>
          </div>
        </div>
      </Section>

      {/* ── 5. Disclaimer ── */}
      <Section title="Disclaimer Text" subtitle="Small footer note shown at the very bottom of the email" icon={Info} color="#F59E0B">
        <TextareaField
          label="Disclaimer"
          rows={3}
          maxLength={500}
          value={form.disclaimerText}
          onChange={set('disclaimerText')}
          placeholder="This request was submitted through the Tatvarth Capital Broker Portal by {{CLIENT}} on {{DATE}}."
          vars={DISCLAIMER_VARS}
        />
        <div className="rounded-xl p-3.5"
          style={{ background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.12)' }}>
          <div className="text-xs text-slate-600 mb-1 font-semibold uppercase tracking-wider">Preview</div>
          <div className="text-xs text-slate-400 leading-relaxed">
            {resolveDisclaimerPreview(form.disclaimerText) || '—'}
          </div>
        </div>
      </Section>

      {/* ── 6. Email Design ── */}
      <Section title="Email Design" subtitle="Visual style of the email" icon={Palette} color="#EF4444">
        {/* Accent colour */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
            Accent Colour
          </label>
          <div className="flex items-center gap-3">
            <div className="relative flex-shrink-0">
              <input
                type="color"
                value={form.accentColor}
                onChange={e => set('accentColor')(e.target.value)}
                className="w-12 h-10 rounded-lg cursor-pointer border-0 p-0.5"
                style={{ background: 'rgba(2,12,27,0.7)', border: '1px solid var(--border-default)' }}
              />
            </div>
            <input
              type="text"
              value={form.accentColor}
              onChange={e => set('accentColor')(e.target.value)}
              placeholder="#F0B429"
              className="input-base font-mono flex-1"
              maxLength={7}
            />
            {/* Swatch preview */}
            <div className="w-10 h-10 rounded-lg flex-shrink-0 flex items-center justify-center font-bold text-sm"
              style={{ background: `linear-gradient(135deg, ${form.accentColor}, ${form.accentColor}cc)`, color: '#020C1B' }}>
              T
            </div>
          </div>
          <p className="text-xs text-slate-600 mt-1.5">
            Used in: email header stripe, logo tile, portal name label, button background, and footer. Must be a 6-digit hex code.
          </p>
          {/* Quick presets */}
          <div className="flex flex-wrap gap-2 mt-3">
            <span className="text-xs text-slate-600 self-center">Quick:</span>
            {[
              { label: 'Gold',   color: '#F0B429' },
              { label: 'Blue',   color: '#3B82F6' },
              { label: 'Green',  color: '#10B981' },
              { label: 'Purple', color: '#8B5CF6' },
              { label: 'Red',    color: '#EF4444' },
              { label: 'Teal',   color: '#14B8A6' },
            ].map(({ label, color }) => (
              <button key={color} type="button"
                onClick={() => set('accentColor')(color)}
                className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg transition-all"
                style={{
                  background: form.accentColor === color ? `${color}25` : 'rgba(30,58,110,0.2)',
                  border: form.accentColor === color ? `1px solid ${color}60` : '1px solid var(--border-subtle)',
                  color: form.accentColor === color ? color : '#64748B',
                }}>
                <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: color }} />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* CTA button text */}
        <Field label="Reply Button Text"
          hint="Text on the call-to-action button that links to client's email."
          Icon={MessageSquare}
          value={form.ctaButtonText} onChange={set('ctaButtonText')}
          placeholder="Reply to Client →"
          maxLength={80} />
        {/* CTA preview */}
        <div className="text-center">
          <span
            className="inline-block px-8 py-3 rounded-xl font-bold text-sm"
            style={{
              background: `linear-gradient(135deg, ${form.accentColor}, ${form.accentColor}bb)`,
              color: '#020C1B',
              boxShadow: `0 4px 14px ${form.accentColor}40`,
            }}>
            {form.ctaButtonText || 'Reply to Client →'}
          </span>
          <p className="text-xs text-slate-600 mt-2">Button preview (links to client email in real email)</p>
        </div>
      </Section>

      {/* ── 7. Portal Branding ── */}
      <Section title="Portal Branding" subtitle="Name displayed in email header and footer" icon={Globe} color="#60A5FA">
        <Field label="Portal Name" required
          hint="Shown in the email header logo tile and copyright footer."
          Icon={Globe}
          value={form.portalName} onChange={set('portalName')}
          placeholder="Tatvarth Capital" />
        {/* Live logo preview */}
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl"
          style={{ background: 'rgba(10,26,48,0.6)', border: '1px solid var(--border-default)' }}>
          <div className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-base flex-shrink-0"
            style={{ background: `linear-gradient(135deg, ${form.accentColor}, ${form.accentColor}bb)`, color: '#020C1B' }}>
            {(form.portalName || 'T').charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="text-white text-sm font-bold">{form.portalName || 'Tatvarth Capital'}</div>
            <div className="text-xs font-semibold tracking-widest"
              style={{ color: form.accentColor }}>BROKER PORTAL</div>
          </div>
          <span className="ml-auto text-xs text-slate-600 italic">Email header preview</span>
        </div>
      </Section>

      {/* Feedback banners */}
      {(errMsg || status === 'error') && (
        <div className="flex items-start gap-3 p-4 rounded-xl text-sm"
          style={{ background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.2)', color: '#EF4444' }}>
          <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
          {errMsg || 'Something went wrong.'}
        </div>
      )}
      {status === 'saved' && (
        <div className="flex items-center gap-3 p-4 rounded-xl text-sm animate-slide-up"
          style={{ background: 'rgba(16,185,129,0.07)', border: '1px solid rgba(16,185,129,0.2)', color: '#10B981' }}>
          <CheckCircle size={16} className="flex-shrink-0" />
          Settings saved. All future emails will use these values immediately.
        </div>
      )}
      {isDirty && status !== 'saved' && (
        <div className="flex items-center gap-2 text-xs" style={{ color: '#F59E0B' }}>
          <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          Unsaved changes
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3 pb-4">
        <button type="button" onClick={handleReset} disabled={saving}
          className="btn-ghost flex items-center gap-2 disabled:opacity-40">
          <RotateCcw size={14} />Reset to defaults
        </button>
        <button type="submit" disabled={saving || !isDirty}
          className="btn-gold flex-1 flex items-center justify-center gap-2 disabled:opacity-40">
          {saving
            ? <><div className="w-4 h-4 border-2 border-navy-900 border-t-transparent rounded-full animate-spin" />Saving…</>
            : <><Save size={15} strokeWidth={2.2} />Save Settings</>}
        </button>
      </div>
    </form>
  )
}
