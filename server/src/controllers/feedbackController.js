const db = require('../db');
const { v4: uuidv4 } = require('uuid');

const PARAMS = [
  'p1_coverage_syllabus', 'p2_topics_beyond', 'p3_technical_content',
  'p4_communication', 'p5_teaching_aids', 'p6_motivation',
  'p7_practical_skills', 'p8_project_skills', 'p9_student_progress',
  'p10_punctuality', 'p11_domain_knowledge', 'p12_interaction',
  'p13_resolve_difficulties', 'p14_cocurricular', 'p15_extracurricular',
  'p16_internship'
];

// POST /api/feedback/verify
// Verify student enrollment before showing the form
async function verifyStudent(req, res) {
  const { enrollment_no, department_id, semester, batch, session_id } = req.body;
  if (!enrollment_no || !department_id || !semester || !batch || !session_id)
    return res.status(400).json({ error: 'All fields required' });

  try {
    // Check session is active
    const [session] = await db.query(
      `SELECT fs.*, ay.year_label FROM feedback_sessions fs
       JOIN academic_years ay ON fs.academic_year_id = ay.id
       WHERE fs.id = ? AND fs.department_id = ? AND fs.semester = ?`,
      [session_id, department_id, semester]
    );
    if (!session) return res.status(404).json({ error: 'Feedback session not found' });
    if (session.status !== 'active') return res.status(403).json({ error: 'This feedback session is not currently active' });

    // Check student is in roster
    const [student] = await db.query(
      `SELECT * FROM student_roster
       WHERE enrollment_no = ? AND department_id = ? AND semester = ? AND academic_year_id = ?`,
      [enrollment_no.trim().toUpperCase(), department_id, semester, session.academic_year_id]
    );
    if (!student) return res.status(403).json({ error: 'Enrollment number not found in roster. Contact your class teacher.' });
    if (student.is_active === 0) {
      return res.status(403).json({ error: 'Your feedback access has been disabled by the class teacher. Please contact your class teacher.' });
    }

    // Check not already submitted
    const [existing] = await db.query(
      'SELECT id FROM feedback_submissions WHERE session_id = ? AND enrollment_no = ?',
      [session_id, enrollment_no.trim().toUpperCase()]
    );
    if (existing) return res.status(409).json({ error: 'Feedback already submitted for this session with this enrollment number.' });

    // Get faculty allocations for this session
    const allocations = await db.query(
      `SELECT fa.*, s.name as subject_name, s.code as subject_code, s.type as subject_type,
              f.name as faculty_name, f.designation
       FROM faculty_allocations fa
       JOIN subjects s ON fa.subject_id = s.id
       JOIN faculties f ON fa.faculty_id = f.id
       WHERE fa.session_id = ? AND (fa.batch = 'ALL' OR fa.batch = ?)
       ORDER BY s.id, fa.allocation_type`,
      [session_id, batch]
    );

    if (!allocations.length) return res.status(404).json({ error: 'No faculty allocated for this session yet. Contact your class teacher.' });

    res.json({
      verified: true,
      student: { enrollment_no: student.enrollment_no, name: student.name, batch: batch },
      session: { id: session.id, title: session.title, semester: session.semester, department_id: session.department_id, year_label: session.year_label },
      allocations
    });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
}

// POST /api/feedback/submit
async function submitFeedback(req, res) {
  const { session_id, enrollment_no, student_name, semester, batch, scores } = req.body;
  if (!session_id || !enrollment_no || !student_name || !semester || !batch || !scores)
    return res.status(400).json({ error: 'All fields required' });

  const conn = await db.getPool().getConnection();
  try {
    await conn.beginTransaction();

    // Final checks
    const [[session]] = await conn.query('SELECT * FROM feedback_sessions WHERE id = ? AND status = ?', [session_id, 'active']);
    if (!session) { await conn.rollback(); return res.status(403).json({ error: 'Session is not active' }); }

    const department_id = req.body.department_id || session.department_id;

    const [[existing]] = await conn.query('SELECT id FROM feedback_submissions WHERE session_id = ? AND enrollment_no = ?', [session_id, enrollment_no]);
    if (existing) { await conn.rollback(); return res.status(409).json({ error: 'Already submitted' }); }

    const [[student]] = await conn.query(
      'SELECT * FROM student_roster WHERE enrollment_no = ? AND department_id = ? AND semester = ? AND academic_year_id = ?',
      [enrollment_no, department_id, semester, session.academic_year_id]
    );
    if (!student) { await conn.rollback(); return res.status(403).json({ error: 'Enrollment not in roster' }); }

    // Insert submission
    const refCode = 'FB' + Date.now().toString(36).toUpperCase();
    const [subResult] = await conn.query(
      `INSERT INTO feedback_submissions (session_id, enrollment_no, student_name, department_id, semester, batch, ip_address, reference_code)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [session_id, enrollment_no, student_name, department_id, semester, batch, req.ip, refCode]
    );
    const submissionId = subResult.insertId;

    const isSem5or6 = [5, 6, '5', '6'].includes(session.semester);
    if (isSem5or6) {
      for (const [allocIdStr, paramScores] of Object.entries(scores)) {
        const p16 = parseInt(paramScores?.p16_internship);
        if (!p16 || p16 < 1 || p16 > 5) {
          await conn.rollback();
          return res.status(400).json({ error: 'Parameter 16 (Guidance during Internship) is compulsory for Semester ' + session.semester });
        }
      }
    }

    // Insert scores for each allocation
    for (const [allocIdStr, paramScores] of Object.entries(scores)) {
      const allocId = parseInt(allocIdStr);
      const vals = PARAMS.map(p => {
        const v = parseInt(paramScores[p]);
        return (v >= 1 && v <= 5) ? v : null;
      });
      const validVals = vals.filter(v => v !== null);
      const total = validVals.reduce((a, b) => a + b, 0);
      const marksOut25 = validVals.length ? (total / (validVals.length * 5)) * 25 : null;

      await conn.query(
        `INSERT INTO feedback_scores
         (submission_id, allocation_id, ${PARAMS.join(', ')}, total_raw, marks_out_of_25)
         VALUES (?, ?, ${PARAMS.map(() => '?').join(', ')}, ?, ?)`,
        [submissionId, allocId, ...vals, total, marksOut25]
      );
    }

    await conn.commit();
    res.json({ success: true, reference_code: refCode, message: 'Feedback submitted successfully!' });
  } catch (err) {
    await conn.rollback();
    console.error(err);
    res.status(500).json({ error: 'Failed to submit feedback' });
  } finally { conn.release(); }
}

// GET /api/feedback/sessions-public?department_id=&semester=
// Public endpoint for students to find active sessions
async function getActiveSessions(req, res) {
  const { department_id, semester } = req.query;
  if (!department_id || !semester) return res.status(400).json({ error: 'department_id and semester required' });
  try {
    const rows = await db.query(
      `SELECT fs.id, fs.title, fs.semester, ay.year_label, d.name as dept_name, d.code as dept_code
       FROM feedback_sessions fs
       JOIN academic_years ay ON fs.academic_year_id = ay.id
       JOIN departments d ON fs.department_id = d.id
       WHERE fs.department_id = ? AND fs.semester = ? AND fs.status = 'active'`,
      [department_id, semester]
    );
    res.json({ sessions: rows });
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
}

module.exports = { verifyStudent, submitFeedback, getActiveSessions };
