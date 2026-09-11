const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');

const JWT_SECRET = process.env.JWT_SECRET || 'msbte_feedback_2025';
const JWT_EXPIRY = '12h';

function normalizeUsername(u) {
  let s = (u || '').trim().toLowerCase();
  s = s.replace(/^co@/, 'computer@');
  s = s.replace(/^ce@/, 'civil@');
  s = s.replace(/^me@/, 'mechanical@');
  s = s.replace(/^ee@/, 'electrical@');
  s = s.replace(/^etc@/, 'entc@');
  s = s.replace(/@(1|sem1|sem_1)$/, '@first');
  s = s.replace(/@(2|sem2|sem_2)$/, '@second');
  s = s.replace(/@(3|sem3|sem_3)$/, '@third');
  s = s.replace(/@(4|sem4|sem_4)$/, '@fourth');
  s = s.replace(/@(5|sem5|sem_5)$/, '@fifth');
  s = s.replace(/@(6|sem6|sem_6)$/, '@sixth');
  return s;
}

// POST /api/auth/login
async function login(req, res) {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Username and password required' });

  const cleanUser = normalizeUsername(username);

  try {
    const rows = await db.query(
      `SELECT u.*, d.code as dept_code, d.name as dept_name
       FROM users u LEFT JOIN departments d ON u.department_id = d.id
       WHERE LOWER(u.username) = LOWER(?) OR LOWER(u.username) = LOWER(?)`, [cleanUser, username.trim()]
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
