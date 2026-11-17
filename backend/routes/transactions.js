const express = require('express');
const db = require('../db');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

const SELECT_LOG = `
  SELECT t.id, t.book_id, t.user_id, t.type, t.quantity, t.note, t.created_at,
         b.title AS book_title, u.name AS user_name, u.membership_id
  FROM transactions t
  JOIN books b ON b.id = t.book_id
  LEFT JOIN users u ON u.id = t.user_id`;

// GET /transactions  - admins see everything, members only see their own history
router.get('/', async (req, res) => {
  try {
    const isAdmin = req.user.role === 'admin';
    const [rows] = await db.query(
      `${SELECT_LOG} ${isAdmin ? '' : 'WHERE t.user_id = ?'} ORDER BY t.created_at DESC, t.id DESC`,
      isAdmin ? [] : [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not load transactions' });
  }
});

// GET /transactions/:id
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query(`${SELECT_LOG} WHERE t.id = ?`, [req.params.id]);
    const row = rows[0];
    if (!row) return res.status(404).json({ error: 'Transaction not found' });
    if (req.user.role !== 'admin' && row.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Not allowed' });
    }
    res.json(row);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not load transaction' });
  }
});

// POST /transactions
// body: { book_id, type: 'ADD_STOCK' | 'BORROW' | 'RETURN', quantity, user_id?, note? }
router.post('/', async (req, res) => {
  const { book_id, type, note } = req.body;
  const quantity = Number(req.body.quantity);
  const isAdmin = req.user.role === 'admin';

  if (!book_id) return res.status(400).json({ error: 'Please choose a book' });
  if (!['ADD_STOCK', 'BORROW', 'RETURN'].includes(type)) {
    return res.status(400).json({ error: 'Invalid transaction type' });
  }
  if (!Number.isInteger(quantity) || quantity < 1) {
    return res.status(400).json({ error: 'Quantity must be a whole number of 1 or more' });
  }
  if (type === 'ADD_STOCK' && !isAdmin) {
    return res.status(403).json({ error: 'Only admins can add stock' });
  }

  // Members always act as themselves; admins may record a borrow/return for any user.
  let userId = isAdmin ? req.body.user_id || req.user.id : req.user.id;
  if (type === 'ADD_STOCK') userId = req.user.id;

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // Lock the row so two people cannot borrow the last copy at the same time
    const [books] = await conn.query('SELECT id, quantity FROM books WHERE id = ? FOR UPDATE', [book_id]);
    if (!books[0]) {
      await conn.rollback();
      return res.status(404).json({ error: 'Book not found' });
    }

    if (type === 'BORROW' && books[0].quantity < quantity) {
      await conn.rollback();
      return res.status(400).json({ error: `Only ${books[0].quantity} copies available` });
    }

    const change = type === 'BORROW' ? -quantity : quantity;
    await conn.query('UPDATE books SET quantity = quantity + ? WHERE id = ?', [change, book_id]);
    const [result] = await conn.query(
      'INSERT INTO transactions (book_id, user_id, type, quantity, note) VALUES (?, ?, ?, ?, ?)',
      [book_id, userId, type, quantity, note ? String(note).slice(0, 255) : null]
    );

    await conn.commit();
    res.status(201).json({ id: result.insertId, book_id, user_id: userId, type, quantity });
  } catch (err) {
    await conn.rollback();
    console.error(err);
    res.status(500).json({ error: 'Could not record transaction' });
  } finally {
    conn.release();
  }
});

// PUT /transactions/:id  (admin) - only the note can be edited so stock counts stay correct
router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const note = req.body.note ? String(req.body.note).slice(0, 255) : null;
    const [result] = await db.query('UPDATE transactions SET note = ? WHERE id = ?', [note, req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Transaction not found' });
    res.json({ id: Number(req.params.id), note });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not update transaction' });
  }
});

// DELETE /transactions/:id  (admin) - removes the log entry only; stock is not changed
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM transactions WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Transaction not found' });
    res.json({ message: 'Transaction log entry deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not delete transaction' });
  }
});

module.exports = router;
