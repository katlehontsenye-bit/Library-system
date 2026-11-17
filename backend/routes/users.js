const express = require('express');
const bcrypt = require('bcryptjs');
const pool = require('../db');

const router = express.Router();

const ROLES = ['admin', 'member'];
const DUPLICATE = '23505'; // PostgreSQL unique-violation error code
const PUBLIC_FIELDS = 'id, name, membership_id, role, created_at'; // never expose password_hash

// POST /users/login - check membership ID + password
router.post('/login', async (req, res, next) => {
  const { membership_id, password } = req.body;
  if (!membership_id?.trim() || !password) {
    return res.status(400).json({ error: 'Membership ID and password are required' });
  }
  try {
    const { rows } = await pool.query('SELECT * FROM users WHERE membership_id = $1', [membership_id.trim()]);
    const user = rows[0];
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ error: 'Invalid membership ID or password' });
    }
    const { password_hash, ...safeUser } = user;
    res.json(safeUser);
  } catch (err) {
    next(err);
  }
});

// GET /users
router.get('/', async (req, res, next) => {
  try {
    const { rows } = await pool.query(`SELECT ${PUBLIC_FIELDS} FROM users ORDER BY name`);
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// POST /users
router.post('/', async (req, res, next) => {
  const { name, membership_id, role, password } = req.body;
  if (!name?.trim() || !membership_id?.trim()) {
    return res.status(400).json({ error: 'Name and membership ID are required' });
  }
  if (!ROLES.includes(role)) return res.status(400).json({ error: 'Role must be admin or member' });
  if (!password || password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }
  try {
    const hash = await bcrypt.hash(password, 10);
    const { rows } = await pool.query(
      `INSERT INTO users (name, membership_id, role, password_hash)
       VALUES ($1, $2, $3, $4) RETURNING ${PUBLIC_FIELDS}`,
      [name.trim(), membership_id.trim(), role, hash]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    if (err.code === DUPLICATE) return res.status(409).json({ error: 'That membership ID is already used' });
    next(err);
  }
});

// PUT /users/:id - password is optional; only changed when supplied
router.put('/:id', async (req, res, next) => {
  const { name, membership_id, role, password } = req.body;
  if (!name?.trim() || !membership_id?.trim()) {
    return res.status(400).json({ error: 'Name and membership ID are required' });
  }
  if (!ROLES.includes(role)) return res.status(400).json({ error: 'Role must be admin or member' });
  if (password && password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }
  try {
    let result;
    if (password) {
      const hash = await bcrypt.hash(password, 10);
      result = await pool.query(
        `UPDATE users SET name = $1, membership_id = $2, role = $3, password_hash = $4
         WHERE id = $5 RETURNING ${PUBLIC_FIELDS}`,
        [name.trim(), membership_id.trim(), role, hash, req.params.id]
      );
    } else {
      result = await pool.query(
        `UPDATE users SET name = $1, membership_id = $2, role = $3
         WHERE id = $4 RETURNING ${PUBLIC_FIELDS}`,
        [name.trim(), membership_id.trim(), role, req.params.id]
      );
    }
    if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });
    res.json(result.rows[0]);
  } catch (err) {
    if (err.code === DUPLICATE) return res.status(409).json({ error: 'That membership ID is already used' });
    next(err);
  }
});

// DELETE /users/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const result = await pool.query('DELETE FROM users WHERE id = $1', [req.params.id]);
    if (result.rowCount === 0) return res.status(404).json({ error: 'User not found' });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
