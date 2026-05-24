const crypto = require('crypto')

const ALGORITHM  = 'aes-256-cbc'
const IV_BYTES   = 16

function key() {
  const k = process.env.ENCRYPTION_KEY
  if (!k || k.length !== 64) throw new Error('ENCRYPTION_KEY must be a 64-char hex string')
  return Buffer.from(k, 'hex')
}

function encrypt(plaintext) {
  const iv     = crypto.randomBytes(IV_BYTES)
  const cipher = crypto.createCipheriv(ALGORITHM, key(), iv)
  const enc    = cipher.update(plaintext, 'utf8', 'hex') + cipher.final('hex')
  return `${iv.toString('hex')}:${enc}`
}

function decrypt(ciphertext) {
  const [ivHex, enc] = ciphertext.split(':')
  const decipher     = crypto.createDecipheriv(ALGORITHM, key(), Buffer.from(ivHex, 'hex'))
  return decipher.update(enc, 'hex', 'utf8') + decipher.final('utf8')
}

module.exports = { encrypt, decrypt }
