const db = require('../db');

// GET /api/allocations?session_id=
async function getAllocations(req, res) {
  const { session_id } = req.query;
  if (!session_id) return res.status(400).json({ error: 'session_id required' });
  try {
    const rows = await db.query(
      `SELECT fa.*, s.name as subject_name, s.code as subject_code, s.type as subject_type,
              f.name as faculty_name, f.designation
       FROM faculty_allocations fa
       JOIN subjects s ON fa.subject_id = s.id
       JOIN faculties f ON fa.faculty_id = f.id
       WHERE fa.session_id = ?
       ORDER BY s.id, fa.allocation_type, fa.batch`, [session_id]
    );
    res.json({ allocations: rows });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
}

// POST /api/allocations
async function saveAllocation(req, res) {
  const { subject_id, faculty_id, allocation_type, batch, session_id } = req.body;
  if (!subject_id || !faculty_id || !allocation_type || !session_id)
    return res.status(400).json({ error: 'Missing required fields' });
  const batchVal = allocation_type === 'practical' ? (batch || 'B1') : 'ALL';
  try {
    await db.query(
      `INSERT INTO faculty_allocations (subject_id, faculty_id, allocation_type, batch, session_id)
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE faculty_id = VALUES(faculty_id)`,
      [subject_id, faculty_id, allocation_type, batchVal, session_id]
    );
    const [alloc] = await db.query(
      `SELECT fa.*, f.name as faculty_name, s.name as subject_name FROM faculty_allocations fa
       JOIN faculties f ON fa.faculty_id = f.id JOIN subjects s ON fa.subject_id = s.id
       WHERE fa.subject_id = ? AND fa.allocation_type = ? AND fa.batch = ? AND fa.session_id = ?`,
      [subject_id, allocation_type, batchVal, session_id]
    );
    res.status(201).json({ allocation: alloc });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
}

// DELETE /api/allocations/:id
async function deleteAllocation(req, res) {
  try {
    await db.query('DELETE FROM faculty_allocations WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
}

module.exports = { getAllocations, saveAllocation, deleteAllocation };
