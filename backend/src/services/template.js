const { format } = require('./dateUtil')

function darkenHex(hex, factor = 0.22) {
  const c   = hex.replace('#', '')
  const num = parseInt(c, 16)
  const r   = Math.max(0, Math.round(((num >> 16) & 0xff) * (1 - factor)))
  const g   = Math.max(0, Math.round(((num >> 8)  & 0xff) * (1 - factor)))
  const b   = Math.max(0, Math.round(( num        & 0xff) * (1 - factor)))
  return '#' + [r,g,b].map(v => v.toString(16).padStart(2,'0')).join('')
}

function buildLeadEmail({
  clientName, clientEmail,
  transactionType = 'buy',
  companyName, stockSymbol,
  quantity, pricePerShare,
  additionalInfo,
  // portal settings — all have sensible defaults so old callers keep working
  portalName        = 'Tatvarth Capital',
  greeting          = 'Hello Tatvarth Capital,',
  footerNote        = '',
  signOffLine       = 'Please process this request and revert at your earliest convenience.',
  closingSalutation = 'Warm Regards,',
  disclaimerText    = 'This request was submitted through the Tatvarth Capital Broker Portal by {{CLIENT}} on {{DATE}}. This is an automated notification — please do not reply to this email directly.',
  ctaButtonText     = 'Reply to Client →',
  accentColor       = '#F0B429',
}) {
  const ts          = format(new Date())
  const accentDark  = darkenHex(accentColor)
  const accentLight = accentColor + '33'   // 20% opacity for glow/shadow

  const txUpper   = transactionType.toUpperCase()
  const isBuy     = transactionType.toLowerCase() === 'buy'
  const txColor   = isBuy ? '#065F46' : '#7C2D12'
  const txBg      = isBuy ? '#ECFDF5' : '#FFF7ED'
  const txBorder  = isBuy ? '#34D399' : '#FB923C'
  const txBadgeBg = isBuy ? '#10B981' : '#F59E0B'

  const qty   = Number(quantity || 0).toLocaleString('en-IN')
  const price = pricePerShare ? `₹ ${Number(pricePerShare).toLocaleString('en-IN')}` : 'To be discussed'
  const total = (pricePerShare && quantity)
    ? `₹ ${(Number(quantity) * Number(pricePerShare)).toLocaleString('en-IN')}`
    : 'To be discussed'

  const resolvedDisclaimer = (disclaimerText || '')
    .replace(/\{\{CLIENT\}\}/g, clientName || '')
    .replace(/\{\{DATE\}\}/g,   ts)

  const symbolBadge = stockSymbol
    ? `<span style="display:inline-block;margin-left:8px;padding:2px 10px;border-radius:20px;
        background:#1E3A6E;color:#93C5FD;font-size:11px;font-weight:700;
        letter-spacing:0.08em;vertical-align:middle;font-family:Arial,sans-serif;">
        ${escapeHtml(stockSymbol)}</span>`
    : ''

  const infoBlock = additionalInfo
    ? `<tr><td style="padding-top:22px;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0"
          style="background:#FFFBEB;border:1px solid #FDE68A;
                 border-left:4px solid ${accentColor};border-radius:8px;">
          <tr><td style="padding:16px 20px;">
            <div style="font-size:11px;font-weight:700;text-transform:uppercase;
              letter-spacing:0.08em;color:#92400E;margin-bottom:8px;
              font-family:Arial,sans-serif;">Additional Information</div>
            <p style="margin:0;color:#451A03;font-size:14px;line-height:1.7;
              font-family:Arial,sans-serif;">${escapeHtml(additionalInfo)}</p>
          </td></tr>
        </table>
      </td></tr>`
    : ''

  const rows = [
    ['Transaction Type', `<span style="font-weight:800;color:${txColor};font-family:Arial,sans-serif;">${txUpper}</span>`],
    ['Company Name',     `<strong style="color:#1E293B;font-family:Arial,sans-serif;">${escapeHtml(companyName)}</strong>${stockSymbol ? ` &nbsp;<span style="color:#64748B;font-size:12px;">(${escapeHtml(stockSymbol)})</span>` : ''}`],
    ['Quantity',         `<strong style="font-size:16px;color:#1E293B;font-family:Arial,sans-serif;">${qty} shares</strong>`],
    ['Price per Share',  `<span style="color:#1E293B;font-family:Arial,sans-serif;">${price}</span>`],
    ['Estimated Value',  `<strong style="font-size:15px;color:${txColor};font-family:Arial,sans-serif;">${total}</strong>`],
  ]

  const tableRows = rows.map(([label, val], i) => `
    <tr style="background:${i % 2 === 0 ? '#F8FAFC' : '#FFFFFF'};">
      <td width="38%" style="padding:14px 20px;color:#64748B;font-size:12px;font-weight:700;
        text-transform:uppercase;letter-spacing:0.07em;border-right:1px solid #E2E8F0;
        border-bottom:1px solid #E2E8F0;font-family:Arial,sans-serif;vertical-align:middle;">
        ${label}
      </td>
      <td style="padding:14px 20px;font-size:14px;
        border-bottom:1px solid #E2E8F0;vertical-align:middle;">
        ${val}
      </td>
    </tr>`).join('')

  const footerNoteBlock = footerNote
    ? `<p style="margin:12px 0 0;color:#374151;font-size:14px;line-height:1.8;font-family:Arial,Helvetica,sans-serif;">${escapeHtml(footerNote)}</p>`
    : ''

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>Share ${txUpper} Request – ${escapeHtml(companyName)}</title>
</head>
<body style="margin:0;padding:0;background:#EEF2F7;font-family:Arial,Helvetica,sans-serif;-webkit-font-smoothing:antialiased;">

<table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#EEF2F7">
<tr><td align="center" style="padding:40px 16px;">

  <table width="620" cellpadding="0" cellspacing="0" border="0"
    style="max-width:620px;width:100%;border-radius:18px;overflow:hidden;box-shadow:0 8px 40px rgba(0,0,0,0.14);">

    <!-- ACCENT TOP STRIPE -->
    <tr>
      <td height="5" bgcolor="${accentColor}"
        style="font-size:0;line-height:0;background:linear-gradient(90deg,${accentColor},${accentDark});">&nbsp;</td>
    </tr>

    <!-- HEADER -->
    <tr>
      <td bgcolor="#0A1628" style="background:linear-gradient(135deg,#0A1628 0%,#142850 100%);padding:28px 36px;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td style="vertical-align:middle;">
              <table cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td width="46" height="46" bgcolor="${accentColor}"
                    style="border-radius:12px;text-align:center;vertical-align:middle;
                    background:linear-gradient(135deg,${accentColor},${accentDark});">
                    <span style="font-size:24px;font-weight:900;color:#0A1628;
                      font-family:Arial,sans-serif;line-height:46px;display:block;">${escapeHtml(portalName.charAt(0).toUpperCase())}</span>
                  </td>
                  <td style="padding-left:14px;vertical-align:middle;">
                    <div style="color:#FFFFFF;font-size:20px;font-weight:700;
                      font-family:Arial,Helvetica,sans-serif;letter-spacing:-0.3px;line-height:1.2;">
                      ${escapeHtml(portalName)}
                    </div>
                    <div style="color:${accentColor};font-size:10px;font-weight:700;
                      letter-spacing:0.18em;margin-top:4px;font-family:Arial,sans-serif;">
                      BROKER PORTAL
                    </div>
                  </td>
                </tr>
              </table>
            </td>
            <td align="right" style="vertical-align:middle;">
              <span style="display:inline-block;background:${txBadgeBg};
                color:#FFFFFF;font-size:11px;font-weight:800;letter-spacing:0.14em;
                padding:6px 16px;border-radius:20px;font-family:Arial,sans-serif;">
                ${txUpper} ORDER
              </span>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- HERO BAND -->
    <tr>
      <td bgcolor="#0F1F3D" style="padding:22px 36px 24px;border-bottom:2px solid ${accentLight};">
        <div style="color:${accentColor};font-size:11px;font-weight:700;letter-spacing:0.14em;
          text-transform:uppercase;font-family:Arial,sans-serif;margin-bottom:6px;">
          Share Transaction Request
        </div>
        <div style="color:#FFFFFF;font-size:22px;font-weight:700;
          font-family:Arial,Helvetica,sans-serif;line-height:1.3;margin-bottom:6px;">
          ${txUpper} — ${escapeHtml(companyName)}${symbolBadge}
        </div>
        <div style="color:#94A3B8;font-size:13px;font-family:Arial,sans-serif;">
          Submitted by&nbsp;
          <span style="color:#E2E8F0;font-weight:600;">${escapeHtml(clientName)}</span>
          &nbsp;·&nbsp;
          <a href="mailto:${escapeHtml(clientEmail)}" style="color:#93C5FD;text-decoration:none;">${escapeHtml(clientEmail)}</a>
        </div>
      </td>
    </tr>

    <!-- GREETING -->
    <tr>
      <td bgcolor="#FFFFFF" style="padding:30px 36px 0;">
        <p style="margin:0;color:#374151;font-size:15px;line-height:1.7;font-family:Arial,Helvetica,sans-serif;">
          ${escapeHtml(greeting)}
        </p>
        <p style="margin:12px 0 0;color:#374151;font-size:15px;line-height:1.7;font-family:Arial,Helvetica,sans-serif;">
          I would like to
          <span style="display:inline-block;padding:2px 12px;border-radius:6px;
            background:${txBg};border:1px solid ${txBorder};color:${txColor};font-weight:800;font-size:15px;">
            ${txUpper}
          </span>
          <strong>${qty} shares</strong> of <strong>${escapeHtml(companyName)}</strong>${stockSymbol ? ` (${escapeHtml(stockSymbol)})` : ''}.
          Please find the complete transaction details below.
        </p>
      </td>
    </tr>

    <!-- MAIN CONTENT -->
    <tr>
      <td bgcolor="#FFFFFF" style="padding:24px 36px 36px;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0">

          <tr><td style="padding-bottom:14px;">
            <div style="font-size:11px;font-weight:700;text-transform:uppercase;
              letter-spacing:0.1em;color:#94A3B8;font-family:Arial,sans-serif;">
              Transaction Details
            </div>
          </td></tr>

          <tr><td>
            <table width="100%" cellpadding="0" cellspacing="0" border="0"
              style="border:1px solid #E2E8F0;border-radius:12px;overflow:hidden;">
              ${tableRows}
            </table>
          </td></tr>

          ${infoBlock}

          <!-- CTA -->
          <tr><td style="padding-top:30px;text-align:center;">
            <a href="mailto:${escapeHtml(clientEmail)}?subject=Re: Share ${txUpper} – ${escapeHtml(companyName)}"
              style="display:inline-block;background:${accentColor};
              background:linear-gradient(135deg,${accentColor} 0%,${accentDark} 100%);
              color:#0A1628;font-size:15px;font-weight:800;letter-spacing:0.03em;
              text-decoration:none;padding:14px 36px;border-radius:10px;
              font-family:Arial,Helvetica,sans-serif;
              box-shadow:0 4px 14px ${accentLight};">
              ${escapeHtml(ctaButtonText)}
            </a>
          </td></tr>

          <!-- Divider -->
          <tr><td style="padding-top:30px;border-top:1px solid #F1F5F9;"><div></div></td></tr>

          <!-- Sign-off -->
          <tr><td style="padding-top:20px;">
            <p style="margin:0;color:#374151;font-size:14px;line-height:1.8;font-family:Arial,Helvetica,sans-serif;">
              ${escapeHtml(signOffLine)}
            </p>
            ${footerNoteBlock}
            <br/>
            <p style="margin:0;color:#374151;font-size:14px;line-height:1.8;font-family:Arial,Helvetica,sans-serif;">
              ${escapeHtml(closingSalutation)}<br/>
              <strong style="color:#1E293B;font-size:15px;">${escapeHtml(clientName)}</strong><br/>
              <a href="mailto:${escapeHtml(clientEmail)}" style="color:#3B82F6;font-size:13px;text-decoration:none;">${escapeHtml(clientEmail)}</a><br/>
              <span style="color:#94A3B8;font-size:12px;">${ts}</span>
            </p>
          </td></tr>

          <!-- Disclaimer -->
          <tr><td style="padding-top:20px;">
            <div style="color:#CBD5E1;font-size:11px;line-height:1.7;
              font-family:Arial,sans-serif;padding:12px 16px;background:#F8FAFC;
              border-radius:8px;border:1px solid #E2E8F0;">
              ${escapeHtml(resolvedDisclaimer)}
            </div>
          </td></tr>

        </table>
      </td>
    </tr>

    <!-- FOOTER -->
    <tr>
      <td bgcolor="#0A1628" style="padding:22px 36px;border-top:1px solid ${accentLight};">
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td style="vertical-align:middle;">
              <div style="color:${accentColor};font-size:14px;font-weight:700;font-family:Arial,sans-serif;">
                ${escapeHtml(portalName)}
              </div>
              <div style="color:#334155;font-size:11px;margin-top:3px;font-family:Arial,sans-serif;">
                Secure Broker Communication Platform
              </div>
            </td>
            <td align="right" style="vertical-align:middle;">
              <div style="color:#334155;font-size:11px;font-family:Arial,sans-serif;">
                Automated &bull; Do not reply
              </div>
              <div style="color:#1E3A5F;font-size:10px;margin-top:4px;font-family:Arial,sans-serif;">
                &copy; ${new Date().getFullYear()} ${escapeHtml(portalName)}. All rights reserved.
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>

  </table>
</td></tr>
</table>

</body>
</html>`
}

function escapeHtml(str = '') {
  return String(str)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;')
}

module.exports = { buildLeadEmail }
