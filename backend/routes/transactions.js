const express = require('express');
const pool = require('../db');

const router = express.Router();

const TYPES = ['ADD_STOCK', 'BORROW', 'RETURN'];

// GET /transactions - full history, newest first (optional ?book_id= or ?user_id=)
router.get('/', async (req, res, next) => {
  try {
    const filters = [];
    const params = [];
    if (req.query.book_id) { params.push(req.query.book_id); filters.push(`t.book_id = $${params.length}`); }
    if (req.query.user_id) { params.push(req.query.user_id); filters.push(`t.user_id = $${params.length}`); }
    const where = filters.length ? `WHERE ${filters.join(' AND ')}` : '';

    const { rows } = await pool.query(
      `SELECT t.id, t.book_id, t.user_id, t.type, t.quantity, t.created_at,
              b.title AS book_title, u.name AS user_name, u.membership_id
         FROM transactions t
         JOIN books b ON b.id = t.book_id
         LEFT JOIN users u ON u.id = t.user_id
         ${where}
         ORDER BY t.created_at DESC, t.id DESC`,
      params
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// POST /transactions - add stock, borrow, or return. Updates the book's quantity too.
router.post('/', async (req, res, next) => {
  const { book_id, user_id, type } = req.body;
  const quantity = Number(req.body.quantity);

  if (!book_id) return res.status(400).json({ error: 'Please choose a book' });
  if (!TYPES.includes(type)) return res.status(400).json({ error: 'Invalid transaction type' });
  if (!Number.isInteger(quantity) || quantity < 1) {
    return res.status(400).json({ error: 'Quantity must be a whole number of 1 or more' });
  }
  if (type !== 'ADD_STOCK' && !user_id) {
    return res.status(400).json({ error: 'A user is required for borrow and return' });
  }

  // A DB transaction keeps the stock update and history record consistent.
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Lock the row so two simultaneous borrows cannot oversell the stock.
    const { rows: books } = await client.query(
      'SELECT quantity FROM books WHERE id = $1 FOR UPDATE',
      [book_id]
    );
    if (books.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Book not found' });
    }

    const delta = type === 'BORROW' ? -quantity : quantity;
    if (books[0].quantity + delta < 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: `Not enough stock. Only ${books[0].quantity} available.` });
    }

    await client.query('UPDATE books SET quantity = quantity + $1 WHERE id = $2', [delta, book_id]);
    const { rows } = await client.query(
      `INSERT INTO transactions (book_id, user_id, type, quantity)
       VALUES ($1, $2, $3, $4) RETURNING id`,
      [book_id, user_id || null, type, quantity]
    );
    await client.query('COMMIT');

    res.status(201).json({ id: rows[0].id, book_id, user_id: user_id || null, type, quantity });
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
});

module.exports = router;
