const multer = require('multer');
const XLSX = require('xlsx');
const db = require('../db');

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

// GET /api/roster?dept_id=&academic_year_id=&semester=
async function getRoster(req, res) {
  const { dept_id, academic_year_id, semester } = req.query;
  if (!dept_id || !academic_year_id) return res.status(400).json({ error: 'dept_id and academic_year_id required' });
  try {
    let sql = `SELECT sr.*, ay.year_label FROM student_roster sr
               JOIN academic_years ay ON sr.academic_year_id = ay.id
               WHERE sr.department_id = ? AND sr.academic_year_id = ?`;
    const params = [dept_id, academic_year_id];
    if (semester) { sql += ' AND sr.semester = ?'; params.push(semester); }
    sql += ' ORDER BY sr.semester, sr.batch, sr.enrollment_no';
    const rows = await db.query(sql, params);
    res.json({ roster: rows });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
}

// POST /api/roster/upload
async function uploadRoster(req, res) {
  const { department_id, semester, academic_year_id } = req.body;
  if (!department_id || !semester || !academic_year_id)
    return res.status(400).json({ error: 'department_id, semester, academic_year_id required' });
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  try {
    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });

    if (!rows.length) return res.status(400).json({ error: 'Excel file is empty' });

    let inserted = 0, skipped = 0;
    const errors = [];

    for (const row of rows) {
      // Support multiple column naming styles
      const enrollment = String(
        row['Enrollment No'] || row['Enrollment No.'] || row['EnrollmentNo'] ||
        row['enrollment_no'] || row['Enrollment'] || row['ENROLLMENT NO.'] ||
        row['Roll No'] || row['Roll No.'] || row['Enrollment number'] ||
        row['Candidate Name'] ? '' : (row['Enrollment No'] || '')
      ).trim() || String(row['Enrollment No'] || row['Enrollment No.'] || row['ENROLLMENT NO.'] || row['enrollment_no'] || row['Enrollment'] || '').trim();

      // Flexible header lookup
      const keys = Object.keys(row);
      const enrollKey = keys.find(k => /enroll/i.test(k));
      const nameKey = keys.find(k => /name/i.test(k));
      const batchKey = keys.find(k => /batch/i.test(k));

      const finalEnrollment = String(enrollment || (enrollKey ? row[enrollKey] : '')).trim().toUpperCase();
      const finalName = String(nameKey ? row[nameKey] : (row['Name'] || row['Student Name'] || '')).trim();
      const rawBatch = String(batchKey ? row[batchKey] : 'ALL').trim().toUpperCase();
      const finalBatch = ['B1', 'B2', 'B3'].includes(rawBatch) ? rawBatch : 'ALL';

      if (!finalEnrollment || !finalName) {
        errors.push(`Row skipped: missing enrollment or name`);
        skipped++;
        continue;
      }

      try {
        await db.query(
          `INSERT INTO student_roster (enrollment_no, name, department_id, semester, batch, academic_year_id, uploaded_by)
           VALUES (?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE name = VALUES(name), batch = VALUES(batch), semester = VALUES(semester)`,
          [finalEnrollment, finalName, department_id, semester, finalBatch, academic_year_id, req.user.id]
        );
        inserted++;
      } catch (e) { errors.push(`${finalEnrollment}: ${e.message}`); skipped++; }
    }

    res.json({ message: `${inserted} students added/updated, ${skipped} skipped`, inserted, skipped, errors });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to process file: ' + err.message });
  }
}

// DELETE /api/roster/:id
async function deleteStudent(req, res) {
  try {
    await db.query('DELETE FROM student_roster WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
}

// DELETE /api/roster/clear - clear all roster for a semester
async function clearRoster(req, res) {
  const { department_id, semester, academic_year_id } = req.body;
  if (!department_id || !semester || !academic_year_id)
    return res.status(400).json({ error: 'department_id, semester, academic_year_id required' });
  try {
    const result = await db.query(
      'DELETE FROM student_roster WHERE department_id = ? AND semester = ? AND academic_year_id = ?',
      [department_id, semester, academic_year_id]
    );
    res.json({ success: true, deleted: result.affectedRows });
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
}

// PATCH /api/roster/:id/toggle
async function toggleStudentAccess(req, res) {
  const { id } = req.params;
  const { is_active } = req.body;
  try {
    const val = is_active ? 1 : 0;
    await db.query('UPDATE student_roster SET is_active = ? WHERE id = ?', [val, id]);
    res.json({ success: true, is_active: val });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
}

// POST /api/roster/bulk-status
async function bulkToggleAccess(req, res) {
  const { ids, is_active, department_id, semester, academic_year_id } = req.body;
  try {
    const val = is_active ? 1 : 0;
    if (Array.isArray(ids) && ids.length > 0) {
      await db.query('UPDATE student_roster SET is_active = ? WHERE id IN (?)', [val, ids]);
    } else if (department_id && semester && academic_year_id) {
      await db.query(
        'UPDATE student_roster SET is_active = ? WHERE department_id = ? AND semester = ? AND academic_year_id = ?',
        [val, department_id, semester, academic_year_id]
      );
    } else {
      return res.status(400).json({ error: 'Invalid parameters for bulk update' });
    }
    res.json({ success: true, is_active: val });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
}

module.exports = {
  upload,
  getRoster,
  uploadRoster,
  deleteStudent,
  clearRoster,
  toggleStudentAccess,
  bulkToggleAccess,
};

