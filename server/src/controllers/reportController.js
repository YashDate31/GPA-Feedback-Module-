const db = require('../db');
const XLSX = require('xlsx');

const PARAM_LABELS = [
  'Coverage of Syllabus',
  'Covering Topics Beyond Syllabus',
  'Effectiveness - Technical Content',
  'Effectiveness - Communication Skills',
  'Effectiveness - Teaching Aids',
  'Motivation for Self-Learning',
  'Student Skills: Practical Performance',
  'Student Skills: Project & Seminar',
  'Feedback on Student Progress',
  'Punctuality and Discipline',
  'Domain Knowledge',
  'Interaction with Students',
  'Ability to Resolve Difficulties',
  'Encourage Co-curricular Activities',
  'Encourage Extra-curricular Activities',
  'Guidance during Internship',
];

const PARAM_COLS = [
  'p1_coverage_syllabus', 'p2_topics_beyond', 'p3_technical_content',
  'p4_communication', 'p5_teaching_aids', 'p6_motivation',
  'p7_practical_skills', 'p8_project_skills', 'p9_student_progress',
  'p10_punctuality', 'p11_domain_knowledge', 'p12_interaction',
  'p13_resolve_difficulties', 'p14_cocurricular', 'p15_extracurricular',
  'p16_internship'
];

// GET /api/reports/session/:id
async function getSessionReport(req, res) {
  const { id } = req.params;
  try {
    const [session] = await db.query(
      `SELECT fs.*, ay.year_label, d.name as dept_name, d.code as dept_code
       FROM feedback_sessions fs
       JOIN academic_years ay ON fs.academic_year_id = ay.id
       JOIN departments d ON fs.department_id = d.id
       WHERE fs.id = ?`, [id]
    );
    if (!session) return res.status(404).json({ error: 'Session not found' });

    const total_submissions = await db.query(
      'SELECT COUNT(*) as cnt FROM feedback_submissions WHERE session_id = ?', [id]
    );
    const submissions_count = total_submissions[0].cnt;

    // Faculty-wise aggregated results
    const faculty_reports = await db.query(
      `SELECT fa.id as allocation_id, fa.allocation_type, fa.batch,
              f.name as faculty_name, f.designation,
              s.name as subject_name, s.code as subject_code,
              COUNT(DISTINCT fs_sub.id) as evaluation_count,
              AVG(sc.p1_coverage_syllabus) as p1, AVG(sc.p2_topics_beyond) as p2,
              AVG(sc.p3_technical_content) as p3, AVG(sc.p4_communication) as p4,
              AVG(sc.p5_teaching_aids) as p5, AVG(sc.p6_motivation) as p6,
              AVG(sc.p7_practical_skills) as p7, AVG(sc.p8_project_skills) as p8,
              AVG(sc.p9_student_progress) as p9, AVG(sc.p10_punctuality) as p10,
              AVG(sc.p11_domain_knowledge) as p11, AVG(sc.p12_interaction) as p12,
              AVG(sc.p13_resolve_difficulties) as p13, AVG(sc.p14_cocurricular) as p14,
              AVG(sc.p15_extracurricular) as p15, AVG(sc.p16_internship) as p16,
              AVG(sc.total_raw) as avg_raw, AVG(sc.marks_out_of_25) as avg_marks
       FROM faculty_allocations fa
       JOIN faculties f ON fa.faculty_id = f.id
       JOIN subjects s ON fa.subject_id = s.id
       LEFT JOIN feedback_scores sc ON sc.allocation_id = fa.id
       LEFT JOIN feedback_submissions fs_sub ON sc.submission_id = fs_sub.id
       WHERE fa.session_id = ?
       GROUP BY fa.id, fa.allocation_type, fa.batch, f.name, f.designation, s.name, s.code, s.id
       ORDER BY s.id, fa.allocation_type, fa.batch`, [id]
    );

    // Submission tracking
    const roster = await db.query(
      `SELECT sr.enrollment_no, sr.name, sr.batch FROM student_roster sr
       WHERE sr.department_id = ? AND sr.semester = ? AND sr.academic_year_id = ?`,
      [session.department_id, session.semester, session.academic_year_id]
    );

    const submitted = await db.query(
      `SELECT fs.enrollment_no, fs.student_name, fs.batch, fs.submitted_at
       FROM feedback_submissions fs WHERE fs.session_id = ?`, [id]
    );
    const submittedEnrollments = new Set(submitted.map(s => s.enrollment_no));
    const pending = roster.filter(s => !submittedEnrollments.has(s.enrollment_no));

    res.json({
      session,
      submissions_count,
      faculty_reports,
      submitted,
      pending,
      roster_count: roster.length
    });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
}

// GET /api/reports/submissions?session_id=
async function getSubmissions(req, res) {
  const { session_id } = req.query;
  if (!session_id) return res.status(400).json({ error: 'session_id required' });
  try {
    const [session] = await db.query(
      `SELECT fs.*, ay.year_label FROM feedback_sessions fs JOIN academic_years ay ON fs.academic_year_id = ay.id WHERE fs.id = ?`, [session_id]
    );
    if (!session) return res.status(404).json({ error: 'Session not found' });

    const submitted = await db.query(
      `SELECT enrollment_no, student_name, batch, submitted_at FROM feedback_submissions WHERE session_id = ? ORDER BY submitted_at DESC`, [session_id]
    );
    const roster = await db.query(
      `SELECT enrollment_no, name, batch FROM student_roster WHERE department_id = ? AND semester = ? AND academic_year_id = ?`,
      [session.department_id, session.semester, session.academic_year_id]
    );
    const submittedSet = new Set(submitted.map(s => s.enrollment_no));
    const pending = roster.filter(s => !submittedSet.has(s.enrollment_no));

    res.json({
      submitted_count: submitted.length,
      pending_count: pending.length,
      submitted,
      pending
    });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
}

// GET /api/reports/download/session/:id  → Excel download
async function downloadSessionExcel(req, res) {
  const { id } = req.params;
  try {
    const [session] = await db.query(
      `SELECT fs.*, ay.year_label, d.name as dept_name FROM feedback_sessions fs
       JOIN academic_years ay ON fs.academic_year_id = ay.id
       JOIN departments d ON fs.department_id = d.id WHERE fs.id = ?`, [id]
    );
    if (!session) return res.status(404).json({ error: 'Session not found' });

    // Sheet 1: Faculty Summary
    const facultySummary = await db.query(
      `SELECT f.name as "Faculty Name", f.designation as "Designation",
              s.name as "Subject", s.code as "Code", fa.allocation_type as "Type", fa.batch as "Batch",
              COUNT(DISTINCT fs_sub.id) as "No. of Evaluations",
              ROUND(AVG(sc.p1_coverage_syllabus),2) as "P1", ROUND(AVG(sc.p2_topics_beyond),2) as "P2",
              ROUND(AVG(sc.p3_technical_content),2) as "P3", ROUND(AVG(sc.p4_communication),2) as "P4",
              ROUND(AVG(sc.p5_teaching_aids),2) as "P5", ROUND(AVG(sc.p6_motivation),2) as "P6",
              ROUND(AVG(sc.p7_practical_skills),2) as "P7", ROUND(AVG(sc.p8_project_skills),2) as "P8",
              ROUND(AVG(sc.p9_student_progress),2) as "P9", ROUND(AVG(sc.p10_punctuality),2) as "P10",
              ROUND(AVG(sc.p11_domain_knowledge),2) as "P11", ROUND(AVG(sc.p12_interaction),2) as "P12",
              ROUND(AVG(sc.p13_resolve_difficulties),2) as "P13", ROUND(AVG(sc.p14_cocurricular),2) as "P14",
              ROUND(AVG(sc.p15_extracurricular),2) as "P15", ROUND(AVG(sc.p16_internship),2) as "P16",
              ROUND(AVG(sc.marks_out_of_25),2) as "Score /25"
       FROM faculty_allocations fa
       JOIN faculties f ON fa.faculty_id = f.id JOIN subjects s ON fa.subject_id = s.id
       LEFT JOIN feedback_scores sc ON sc.allocation_id = fa.id
       LEFT JOIN feedback_submissions fs_sub ON sc.submission_id = fs_sub.id
       WHERE fa.session_id = ?
       GROUP BY fa.id, f.name, f.designation, s.name, s.code, fa.allocation_type, fa.batch, s.id
       ORDER BY s.id`, [id]
    );

    // Sheet 2: Student-wise raw data
    const rawData = await db.query(
      `SELECT fs.enrollment_no as "Enrollment No", fs.student_name as "Student Name",
              fs.batch as "Batch", fs.submitted_at as "Submitted At",
              sub.name as "Subject", sub.code as "Subject Code",
              fa.allocation_type as "Type", fa.batch as "Faculty Batch",
              f.name as "Faculty Name",
              sc.p1_coverage_syllabus as "P1", sc.p2_topics_beyond as "P2",
              sc.p3_technical_content as "P3", sc.p4_communication as "P4",
              sc.p5_teaching_aids as "P5", sc.p6_motivation as "P6",
              sc.p7_practical_skills as "P7", sc.p8_project_skills as "P8",
              sc.p9_student_progress as "P9", sc.p10_punctuality as "P10",
              sc.p11_domain_knowledge as "P11", sc.p12_interaction as "P12",
              sc.p13_resolve_difficulties as "P13", sc.p14_cocurricular as "P14",
              sc.p15_extracurricular as "P15", sc.p16_internship as "P16",
              sc.total_raw as "Total Raw", sc.marks_out_of_25 as "Marks /25"
       FROM feedback_submissions fs
       JOIN feedback_scores sc ON sc.submission_id = fs.id
       JOIN faculty_allocations fa ON sc.allocation_id = fa.id
       JOIN subjects sub ON fa.subject_id = sub.id
       JOIN faculties f ON fa.faculty_id = f.id
       WHERE fs.session_id = ? ORDER BY fs.enrollment_no, sub.id`, [id]
    );

    const wb = XLSX.utils.book_new();

    // Cover sheet
    const coverData = [
      ['MSBTE Student Feedback Report'],
      ['Department', session.dept_name],
      ['Session', session.title],
      ['Academic Year', session.year_label],
      ['Semester', session.semester],
      ['Status', session.status],
      ['Generated On', new Date().toLocaleString('en-IN')],
    ];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(coverData), 'Cover');
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(facultySummary), 'Faculty Summary');
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rawData), 'Raw Responses');

    const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' });
    const filename = `Feedback_${session.dept_name}_Sem${session.semester}_${session.year_label}.xlsx`.replace(/\s/g, '_');

    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
}

module.exports = { getSessionReport, getSubmissions, downloadSessionExcel };
