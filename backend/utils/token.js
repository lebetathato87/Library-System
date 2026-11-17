const crypto = require('crypto');

const SECRET = () => process.env.TOKEN_SECRET || 'dev-secret-change-me';
const TTL_MS = 1000 * 60 * 60 * 8; // 8 hours

const b64 = (obj) => Buffer.from(JSON.stringify(obj)).toString('base64url');
const sign = (data) => crypto.createHmac('sha256', SECRET()).update(data).digest('base64url');

/** Create a signed token: base64(payload).signature */
function createToken(user) {
  const payload = b64({ id: user.id, role: user.role, exp: Date.now() + TTL_MS });
  return `${payload}.${sign(payload)}`;
}

/** Returns the payload if the token is valid and not expired, otherwise null. */
function verifyToken(token) {
  if (!token || !token.includes('.')) return null;
  const [payload, signature] = token.split('.');
  const expected = sign(payload);
  if (signature.length !== expected.length) return null;
  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;
  const data = JSON.parse(Buffer.from(payload, 'base64url').toString());
  return data.exp > Date.now() ? data : null;
}

module.exports = { createToken, verifyToken };
