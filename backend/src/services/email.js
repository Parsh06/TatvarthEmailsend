const nodemailer = require('nodemailer')
const { decrypt } = require('./encryption')
const { buildLeadEmail } = require('./template')

/**
 * delivery = { toEmail, ccEmail, bccEmail, replyToEmail, subject }
 * templateOpts = { portalName, greeting, footerNote }
 */
async function sendLeadEmail({ client, formData, delivery, templateOpts = {} }) {
  const { clientName, email, encryptedPassword, smtpHost, smtpPort } = client
  const { transactionType, companyName, stockSymbol, quantity, pricePerShare, additionalInfo } = formData

  const smtpPass = decrypt(encryptedPassword)

  const transport = nodemailer.createTransport({
    host:   smtpHost || 'smtp.gmail.com',
    port:   Number(smtpPort) || 587,
    secure: false,
    auth:   { user: email, pass: smtpPass },
    tls:    { rejectUnauthorized: false },
  })

  await transport.verify()

  const html = buildLeadEmail({
    clientName,
    clientEmail: email,
    transactionType,
    companyName,
    stockSymbol,
    quantity,
    pricePerShare,
    additionalInfo,
    portalName:   templateOpts.portalName   || 'Tatvarth Capital',
    greeting:     templateOpts.greeting     || 'Hello Tatvarth Capital,',
    footerNote:   templateOpts.footerNote   || '',
  })

  const mailOptions = {
    from:    `"${clientName}" <${email}>`,
    to:      delivery.toEmail,
    subject: delivery.subject,
    html,
    text:    buildPlainText({ clientName, transactionType, companyName, stockSymbol, quantity, pricePerShare, additionalInfo }),
  }
  if (delivery.ccEmail)    mailOptions.cc      = delivery.ccEmail
  if (delivery.bccEmail)   mailOptions.bcc     = delivery.bccEmail
  if (delivery.replyToEmail) mailOptions.replyTo = delivery.replyToEmail

  const info = await transport.sendMail(mailOptions)
  return info.messageId
}

function buildPlainText({ clientName, transactionType, companyName, stockSymbol, quantity, pricePerShare, additionalInfo }) {
  const txUp = (transactionType || 'buy').toUpperCase()
  return [
    `TATVARTH CAPITAL — Share ${txUp} Request`,
    '='.repeat(50),
    ``,
    `Hello Tatvarth Capital,`,
    ``,
    `I would like to ${txUp} ${quantity} shares of ${companyName}${stockSymbol ? ` (${stockSymbol})` : ''}.`,
    ``,
    'TRANSACTION DETAILS',
    '-'.repeat(30),
    `Transaction Type  : ${txUp}`,
    `Company Name      : ${companyName}`,
    stockSymbol   ? `Stock Symbol      : ${stockSymbol}` : '',
    `Quantity          : ${quantity} shares`,
    pricePerShare ? `Price per Share   : ₹${pricePerShare}` : '',
    (pricePerShare && quantity) ? `Estimated Value   : ₹${(Number(quantity) * Number(pricePerShare)).toLocaleString('en-IN')}` : '',
    additionalInfo ? `\nAdditional Info   : ${additionalInfo}` : '',
    ``,
    `Warm Regards,`,
    clientName,
    ``,
    `[Sent via Tatvarth Capital Broker Portal]`,
  ].filter(l => l !== '').join('\n')
}

module.exports = { sendLeadEmail }
