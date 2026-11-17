const express = require('express');
const db = require('../db');
const { hashPassword, verifyPassword } = require('../utils/password');
const { createToken } = require('../utils/token');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

const publicUser = (u) => ({
  id: u.id,
  name: u.name,
  membership_id: u.membership_id,
  role: u.role,
});

// POST /auth/register  (public) - always creates a normal "member" account, never an admin
router.post('/register', async (req, res) => {
  const name = (req.body.name || '').trim();
  const membership_id = (req.body.membership_id || '').trim();
  const password = req.body.password || '';

  if (!name || !membership_id) return res.status(400).json({ error: 'Name and membership ID are required' });
  if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });

  try {
    const [result] = await db.query(
      `INSERT INTO users (name, membership_id, role, password_hash) VALUES (?, ?, 'member', ?)`,
      [name, membership_id, hashPassword(password)]
    );
    const user = { id: result.insertId, name, membership_id, role: 'member' };
    res.status(201).json({ token: createToken(user), user: publicUser(user) });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'This membership ID is already taken' });
    console.error(err);
    res.status(500).json({ error: 'Could not create account' });
  }
});

// POST /auth/login
router.post('/login', async (req, res) => {
  try {
    const { membership_id, password } = req.body;
    if (!membership_id || !password) {
      return res.status(400).json({ error: 'Membership ID and password are required' });
    }
    const [rows] = await db.query('SELECT * FROM users WHERE membership_id = ?', [membership_id.trim()]);
    const user = rows[0];
    if (!user || !verifyPassword(password, user.password_hash)) {
      return res.status(401).json({ error: 'Invalid membership ID or password' });
    }
    res.json({ token: createToken(user), user: publicUser(user) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Login failed' });
  }
});

// GET /auth/me
router.get('/me', requireAuth, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM users WHERE id = ?', [req.user.id]);
    if (!rows[0]) return res.status(401).json({ error: 'User no longer exists' });
    res.json(publicUser(rows[0]));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not load profile' });
  }
});

module.exports = router;
