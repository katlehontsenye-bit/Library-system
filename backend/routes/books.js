const express = require('express');
const pool = require('../db');

const router = express.Router();
const DUPLICATE = '23505'; // PostgreSQL unique-violation error code

// Validate the fields shared by create and update.
function validateBook(body, { requireQuantity }) {
  const { title, author, genre, isbn, quantity } = body;
  if (!title?.trim() || !author?.trim() || !genre?.trim() || !isbn?.trim()) {
    return 'Title, author, genre and ISBN are required';
  }
  if (requireQuantity && (!Number.isInteger(Number(quantity)) || Number(quantity) < 0)) {
    return 'Quantity must be a whole number of 0 or more';
  }
  return null;
}

// GET /books - list all books
router.get('/', async (req, res, next) => {
  try {
    const { rows } = await pool.query('SELECT * FROM books ORDER BY title');
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// GET /books/:id
router.get('/:id', async (req, res, next) => {
  try {
    const { rows } = await pool.query('SELECT * FROM books WHERE id = $1', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Book not found' });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

// POST /books - add a book (with initial quantity)
router.post('/', async (req, res, next) => {
  const error = validateBook(req.body, { requireQuantity: true });
  if (error) return res.status(400).json({ error });

  const { title, author, genre, isbn, quantity } = req.body;
  try {
    const { rows } = await pool.query(
      `INSERT INTO books (title, author, genre, isbn, quantity)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [title.trim(), author.trim(), genre.trim(), isbn.trim(), Number(quantity)]
    );
    // Record the opening stock in the history log
    if (Number(quantity) > 0) {
      await pool.query(
        "INSERT INTO transactions (book_id, user_id, type, quantity) VALUES ($1, NULL, 'ADD_STOCK', $2)",
        [rows[0].id, Number(quantity)]
      );
    }
    res.status(201).json(rows[0]);
  } catch (err) {
    if (err.code === DUPLICATE) return res.status(409).json({ error: 'A book with that ISBN already exists' });
    next(err);
  }
});

// PUT /books/:id - update details (stock is changed via /transactions)
router.put('/:id', async (req, res, next) => {
  const error = validateBook(req.body, { requireQuantity: false });
  if (error) return res.status(400).json({ error });

  const { title, author, genre, isbn } = req.body;
  try {
    const { rows } = await pool.query(
      `UPDATE books SET title = $1, author = $2, genre = $3, isbn = $4
       WHERE id = $5 RETURNING *`,
      [title.trim(), author.trim(), genre.trim(), isbn.trim(), req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Book not found' });
    res.json(rows[0]);
  } catch (err) {
    if (err.code === DUPLICATE) return res.status(409).json({ error: 'A book with that ISBN already exists' });
    next(err);
  }
});

// DELETE /books/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const result = await pool.query('DELETE FROM books WHERE id = $1', [req.params.id]);
    if (result.rowCount === 0) return res.status(404).json({ error: 'Book not found' });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
