const { auth, db } = require('../config/firebase')

async function verifyToken(req, res, next) {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid Authorization header' })
  }
  try {
    const decodedToken = await auth.verifyIdToken(header.split(' ')[1])
    req.user = decodedToken

    const email = decodedToken.email?.toLowerCase()
    
    // Admin email is always allowed
    if (email === 'korojitha@gmail.com') {
      return next()
    }

    // Query whitelist from Firestore
    const whitelistDoc = await db.collection('access_control').doc('whitelist').get()
    if (whitelistDoc.exists) {
      const allowedEmails = whitelistDoc.data().emails || []
      const lowerAllowed = allowedEmails.map(e => e.toLowerCase())
      if (lowerAllowed.includes(email)) {
        return next()
      }
    }

    // Access denied if not whitelisted
    return res.status(403).json({ error: 'Access Denied: Your email is not authorized to access this application.' })
  } catch (err) {
    console.error('verifyToken error:', err)
    return res.status(401).json({ error: 'Invalid or expired token' })
  }
}

module.exports = { verifyToken }
