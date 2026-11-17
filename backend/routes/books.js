const express = require('express');
const db = require('../db');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

/** Validate and clean a book body. Returns { error } or { data }. */
function validateBook(body) {
  const title = (body.title || '').trim();
  const author = (body.author || '').trim();
  const genre = (body.genre || '').trim();
  const isbn = (body.isbn || '').trim();
  const quantity = Number(body.quantity);

  if (!title || !author || !genre || !isbn) {
    return { error: 'Title, author, genre and ISBN are required' };
  }
  const digits = isbn.replace(/-/g, '');
  if (!/^\d{10}(\d{3})?$/.test(digits)) {
    return { error: 'ISBN must contain 10 or 13 digits' };
  }
  if (!Number.isInteger(quantity) || quantity < 0) {
    return { error: 'Quantity must be a whole number of 0 or more' };
  }
  return { data: { title, author, genre, isbn, quantity } };
}

// GET /books
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM books ORDER BY title ASC');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not load books' });
  }
});

// GET /books/:id
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM books WHERE id = ?', [req.params.id]);
    if (!rows[0]) return res.status(404).json({ error: 'Book not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not load book' });
  }
});

// POST /books  (admin) - also logs the initial stock as an ADD_STOCK transaction
router.post('/', requireAdmin, async (req, res) => {
  const { error, data } = validateBook(req.body);
  if (error) return res.status(400).json({ error });

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const [result] = await conn.query(
      'INSERT INTO books (title, author, genre, isbn, quantity) VALUES (?, ?, ?, ?, ?)',
      [data.title, data.author, data.genre, data.isbn, data.quantity]
    );
    if (data.quantity > 0) {
      await conn.query(
        `INSERT INTO transactions (book_id, user_id, type, quantity, note) VALUES (?, ?, 'ADD_STOCK', ?, 'Initial stock')`,
        [result.insertId, req.user.id, data.quantity]
      );
    }
    await conn.commit();
    res.status(201).json({ id: result.insertId, ...data });
  } catch (err) {
    await conn.rollback();
    if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'A book with this ISBN already exists' });
    console.error(err);
    res.status(500).json({ error: 'Could not add book' });
  } finally {
    conn.release();
  }
});

// PUT /books/:id  (admin)
router.put('/:id', requireAdmin, async (req, res) => {
  const { error, data } = validateBook(req.body);
  if (error) return res.status(400).json({ error });
  try {
    const [result] = await db.query(
      'UPDATE books SET title = ?, author = ?, genre = ?, isbn = ?, quantity = ? WHERE id = ?',
      [data.title, data.author, data.genre, data.isbn, data.quantity, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Book not found' });
    res.json({ id: Number(req.params.id), ...data });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'A book with this ISBN already exists' });
    console.error(err);
    res.status(500).json({ error: 'Could not update book' });
  }
});

// DELETE /books/:id  (admin)
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM books WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Book not found' });
    res.json({ message: 'Book deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not delete book' });
  }
});

module.exports = router;
