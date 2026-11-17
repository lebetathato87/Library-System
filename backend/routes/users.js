const express = require('express');
const db = require('../db');
const { hashPassword } = require('../utils/password');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth, requireAdmin);

const COLUMNS = 'id, name, membership_id, role, created_at';

function validateUser(body, { passwordRequired }) {
  const name = (body.name || '').trim();
  const membership_id = (body.membership_id || '').trim();
  const role = body.role || 'member';
  const password = body.password || '';

  if (!name || !membership_id) return { error: 'Name and membership ID are required' };
  if (!['admin', 'member'].includes(role)) return { error: 'Role must be admin or member' };
  if (passwordRequired && password.length < 6) return { error: 'Password must be at least 6 characters' };
  if (!passwordRequired && password && password.length < 6) {
    return { error: 'New password must be at least 6 characters' };
  }
  return { data: { name, membership_id, role, password } };
}

// GET /users
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(`SELECT ${COLUMNS} FROM users ORDER BY name ASC`);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not load users' });
  }
});

// GET /users/:id
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query(`SELECT ${COLUMNS} FROM users WHERE id = ?`, [req.params.id]);
    if (!rows[0]) return res.status(404).json({ error: 'User not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not load user' });
  }
});

// POST /users
router.post('/', async (req, res) => {
  const { error, data } = validateUser(req.body, { passwordRequired: true });
  if (error) return res.status(400).json({ error });
  try {
    const [result] = await db.query(
      'INSERT INTO users (name, membership_id, role, password_hash) VALUES (?, ?, ?, ?)',
      [data.name, data.membership_id, data.role, hashPassword(data.password)]
    );
    res.status(201).json({ id: result.insertId, name: data.name, membership_id: data.membership_id, role: data.role });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'This membership ID is already in use' });
    console.error(err);
    res.status(500).json({ error: 'Could not add user' });
  }
});

// PUT /users/:id  (password is optional - only changed when supplied)
router.put('/:id', async (req, res) => {
  const { error, data } = validateUser(req.body, { passwordRequired: false });
  if (error) return res.status(400).json({ error });
  if (Number(req.params.id) === req.user.id && data.role !== 'admin') {
    return res.status(400).json({ error: 'You cannot remove your own admin role' });
  }
  try {
    const fields = ['name = ?', 'membership_id = ?', 'role = ?'];
    const values = [data.name, data.membership_id, data.role];
    if (data.password) {
      fields.push('password_hash = ?');
      values.push(hashPassword(data.password));
    }
    values.push(req.params.id);
    const [result] = await db.query(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, values);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'User not found' });
    res.json({ id: Number(req.params.id), name: data.name, membership_id: data.membership_id, role: data.role });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'This membership ID is already in use' });
    console.error(err);
    res.status(500).json({ error: 'Could not update user' });
  }
});

// DELETE /users/:id
router.delete('/:id', async (req, res) => {
  if (Number(req.params.id) === req.user.id) {
    return res.status(400).json({ error: 'You cannot delete your own account' });
  }
  try {
    const [result] = await db.query('DELETE FROM users WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'User not found' });
    res.json({ message: 'User deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not delete user' });
  }
});

module.exports = router;
