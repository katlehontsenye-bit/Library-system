// Creates a default admin account: membership ID "ADMIN001", password "admin123".
const bcrypt = require('bcryptjs');
const pool = require('./db');

(async () => {
  try {
    const hash = await bcrypt.hash('admin123', 10);
    await pool.query(
      `INSERT INTO users (name, membership_id, role, password_hash)
       VALUES ($1, $2, 'admin', $3)
       ON CONFLICT (membership_id) DO UPDATE SET password_hash = EXCLUDED.password_hash`,
      ['Library Admin', 'ADMIN001', hash]
    );
    console.log('Admin ready -> membership ID: ADMIN001, password: admin123');
  } catch (err) {
    console.error('Seed failed:', err.message);
  } finally {
    await pool.end();
  }
})();
