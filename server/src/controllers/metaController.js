const db = require('../db');

// GET /api/academic-years
async function getAcademicYears(req, res) {
  try {
    const rows = await db.query('SELECT * FROM academic_years ORDER BY id DESC');
    res.json({ academic_years: rows });
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
}

// GET /api/subjects?department_id=&semester=
async function getSubjects(req, res) {
  const { department_id, semester } = req.query;
  if (!department_id) return res.status(400).json({ error: 'department_id required' });
  try {
    let sql = 'SELECT * FROM subjects WHERE department_id = ?';
    const params = [department_id];
    if (semester) { sql += ' AND semester = ?'; params.push(semester); }
    sql += ' ORDER BY semester, id';
    const rows = await db.query(sql, params);
    res.json({ subjects: rows });
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
}

// GET /api/departments
async function getDepartments(req, res) {
  try {
    const rows = await db.query('SELECT * FROM departments ORDER BY code');
    res.json({ departments: rows });
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
}

// GET /api/faculties?department_id=
async function getFaculties(req, res) {
  const { department_id } = req.query;
  if (!department_id) return res.status(400).json({ error: 'department_id required' });
  try {
    const rows = await db.query('SELECT * FROM faculties WHERE department_id = ? ORDER BY name', [department_id]);
    res.json({ faculties: rows });
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
}

// POST /api/faculties
async function addFaculty(req, res) {
  const { name, designation, department_id, email } = req.body;
  if (!name || !department_id) return res.status(400).json({ error: 'Name and department required' });
  try {
    const result = await db.query(
      'INSERT INTO faculties (name, designation, department_id, email) VALUES (?, ?, ?, ?)',
      [name.trim(), designation || null, department_id, email || null]
    );
    const [newFaculty] = await db.query('SELECT * FROM faculties WHERE id = ?', [result.insertId]);
    res.status(201).json({ faculty: newFaculty });
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
}

// DELETE /api/faculties/:id
async function deleteFaculty(req, res) {
  try {
    await db.query('DELETE FROM faculty_allocations WHERE faculty_id = ?', [req.params.id]);
    await db.query('DELETE FROM faculties WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Faculty removed' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
}

// POST /api/academic-years
async function addAcademicYear(req, res) {
  const { year_label, is_current } = req.body;
  if (!year_label || !year_label.trim())
    return res.status(400).json({ error: 'Year label required (e.g. 2025-26)' });
  try {
    if (is_current) {
      await db.query('UPDATE academic_years SET is_current = FALSE');
    }
    const result = await db.query(
      'INSERT INTO academic_years (year_label, is_current) VALUES (?, ?)',
      [year_label.trim(), is_current ? 1 : 0]
    );
    const [created] = await db.query('SELECT * FROM academic_years WHERE id = ?', [result.insertId]);
    res.status(201).json({ academic_year: created });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'Academic year already exists' });
    res.status(500).json({ error: 'Server error' });
  }
}

// PATCH /api/subjects/:id/type
async function updateSubjectType(req, res) {
  const { id } = req.params;
  const { type } = req.body;
  if (!['theory', 'practical', 'both'].includes(type)) {
    return res.status(400).json({ error: 'Invalid type: must be theory, practical, or both' });
  }
  try {
    await db.query('UPDATE subjects SET type = ? WHERE id = ?', [type, id]);
    res.json({ message: 'Subject type updated', id: parseInt(id), type });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
}

// POST /api/subjects
async function addSubject(req, res) {
  const { name, code, department_id, semester, type } = req.body;
  if (!name || !code || !department_id || !semester) {
    return res.status(400).json({ error: 'Name, code, department and semester required' });
  }
  try {
    const result = await db.query(
      'INSERT INTO subjects (name, code, department_id, semester, type) VALUES (?, ?, ?, ?, ?)',
      [name.trim(), code.trim(), department_id, semester, type || 'both']
    );
    const [sub] = await db.query('SELECT * FROM subjects WHERE id = ?', [result.insertId]);
    res.status(201).json({ subject: sub });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'Subject with this code already exists in department' });
    res.status(500).json({ error: 'Server error' });
  }
}

// DELETE /api/subjects/:id
async function deleteSubject(req, res) {
  try {
    await db.query('DELETE FROM faculty_allocations WHERE subject_id = ?', [req.params.id]);
    await db.query('DELETE FROM subjects WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Subject removed' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
}

module.exports = {
  getAcademicYears,
  addAcademicYear,
  getSubjects,
  updateSubjectType,
  addSubject,
  deleteSubject,
  getDepartments,
  getFaculties,
  addFaculty,
  deleteFaculty
};
