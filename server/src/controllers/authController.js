const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');

const JWT_SECRET = process.env.JWT_SECRET || 'msbte_feedback_2025';
const JWT_EXPIRY = '12h';

// POST /api/auth/login
async function login(req, res) {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Username and password required' });

  try {
    const rows = await db.query(
      `SELECT u.*, d.code as dept_code, d.name as dept_name
       FROM users u LEFT JOIN departments d ON u.department_id = d.id
       WHERE u.username = ?`, [username]
    );
    if (!rows.length) return res.status(401).json({ error: 'Invalid username or password' });

    const user = rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: 'Invalid username or password' });

    const token = jwt.sign(
      { id: user.id, username: user.username, name: user.name, department_id: user.department_id, dept_code: user.dept_code, dept_name: user.dept_name, semester: user.semester },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRY }
    );

    res.json({ token, user: { id: user.id, username: user.username, name: user.name, department_id: user.department_id, dept_code: user.dept_code, dept_name: user.dept_name, semester: user.semester } });
  } catch (err) {
    console.error('[Auth]', err);
    res.status(500).json({ error: 'Server error' });
  }
}

// GET /api/auth/me
async function me(req, res) {
  res.json({ user: req.user });
}

module.exports = { login, me };
