const db = require('../db');

// GET /api/sessions?department_id=
async function getSessions(req, res) {
  const { department_id } = req.query;
  if (!department_id) return res.status(400).json({ error: 'department_id required' });
  try {
    const rows = await db.query(
      `SELECT fs.*, ay.year_label, d.code as dept_code,
              (SELECT COUNT(*) FROM feedback_submissions sub WHERE sub.session_id = fs.id) as submission_count
       FROM feedback_sessions fs
       JOIN academic_years ay ON fs.academic_year_id = ay.id
       JOIN departments d ON fs.department_id = d.id
       WHERE fs.department_id = ?
       ORDER BY fs.created_at DESC`, [department_id]
    );
    res.json({ sessions: rows });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
}

// POST /api/sessions
async function createSession(req, res) {
  const { academic_year_id, department_id, semester, title } = req.body;
  if (!academic_year_id || !department_id || !semester || !title)
    return res.status(400).json({ error: 'All fields required' });
  try {
    const result = await db.query(
      'INSERT INTO feedback_sessions (academic_year_id, department_id, semester, title, created_by) VALUES (?, ?, ?, ?, ?)',
      [academic_year_id, department_id, semester, title.trim(), req.user.id]
    );
    const [session] = await db.query(
      `SELECT fs.*, ay.year_label FROM feedback_sessions fs JOIN academic_years ay ON fs.academic_year_id = ay.id WHERE fs.id = ?`,
      [result.insertId]
    );
    res.status(201).json({ session });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
}

// PATCH /api/sessions/:id/status
async function updateSessionStatus(req, res) {
  const { status } = req.body;
  const { id } = req.params;
  if (!['active', 'closed', 'draft'].includes(status))
    return res.status(400).json({ error: 'Invalid status' });
  try {
    let extra = '';
    if (status === 'active') extra = ', activated_at = NOW()';
    if (status === 'closed') extra = ', closed_at = NOW()';
    await db.query(`UPDATE feedback_sessions SET status = ? ${extra} WHERE id = ?`, [status, id]);
    res.json({ success: true });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
}

// DELETE /api/sessions/:id
async function deleteSession(req, res) {
  try {
    const [sess] = await db.query('SELECT * FROM feedback_sessions WHERE id = ?', [req.params.id]);
    if (!sess) return res.status(404).json({ error: 'Not found' });
    if (sess.status !== 'draft') return res.status(400).json({ error: 'Only draft sessions can be deleted' });
    await db.query('DELETE FROM faculty_allocations WHERE session_id = ?', [req.params.id]);
    await db.query('DELETE FROM feedback_sessions WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
}

module.exports = { getSessions, createSession, updateSessionStatus, deleteSession };
