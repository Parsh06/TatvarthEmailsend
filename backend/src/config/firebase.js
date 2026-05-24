const admin = require('firebase-admin')

const requiredEnv = [
  'FIREBASE_PROJECT_ID',
  'FIREBASE_PRIVATE_KEY_ID',
  'FIREBASE_PRIVATE_KEY',
  'FIREBASE_CLIENT_EMAIL',
  'FIREBASE_CLIENT_ID'
]

console.log('\n🔍  [Firebase Config Verification]')
requiredEnv.forEach(key => {
  const val = process.env[key]
  if (!val) {
    console.error(`❌  Missing: ${key}`)
  } else {
    let preview = ''
    if (key === 'FIREBASE_PRIVATE_KEY') {
      const cleanVal = val.trim()
      preview = `starts with "${cleanVal.substring(0, 30)}..." and ends with "...${cleanVal.substring(cleanVal.length - 25)}"`
    } else {
      preview = `value: "${val.substring(0, 20)}${val.length > 20 ? '...' : ''}"`
    }
    console.log(`✅  Loaded: ${key} (length: ${val.length}, ${preview})`)
  }
})
console.log('─────────────────────────────────\n')

if (!admin.apps.length) {
  let privateKey = process.env.FIREBASE_PRIVATE_KEY
  if (privateKey) {
    // Strip wrapping double quotes if they exist
    if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
      privateKey = privateKey.substring(1, privateKey.length - 1)
    }
    // Strip wrapping single quotes if they exist
    if (privateKey.startsWith("'") && privateKey.endsWith("'")) {
      privateKey = privateKey.substring(1, privateKey.length - 1)
    }
    // Replace literal '\n' characters with actual newlines
    privateKey = privateKey.replace(/\\n/g, '\n')
  }

  admin.initializeApp({
    credential: admin.credential.cert({
      type: 'service_account',
      project_id: process.env.FIREBASE_PROJECT_ID,
      private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
      private_key: privateKey,
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      client_id: process.env.FIREBASE_CLIENT_ID,
      auth_uri: 'https://accounts.google.com/o/oauth2/auth',
      token_uri: 'https://oauth2.googleapis.com/token',
    }),
  })
}

const db   = admin.firestore()
const auth = admin.auth()

module.exports = { admin, db, auth }
