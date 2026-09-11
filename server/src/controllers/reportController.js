const db = require('../db');
const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');

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

    // Faculty-wise aggregated results (combined theory & practical per subject)
    const faculty_reports = await db.query(
      `SELECT f.id as faculty_id, s.id as subject_id,
              f.name as faculty_name, f.designation,
              s.name as subject_name, s.code as subject_code,
              CASE 
                WHEN COUNT(DISTINCT fa.allocation_type) > 1 THEN 'THEORY & PRACTICAL'
                ELSE UPPER(MIN(fa.allocation_type))
              END as allocation_type,
              CASE 
                WHEN COUNT(DISTINCT fa.allocation_type) > 1 THEN 'ALL'
                WHEN COUNT(DISTINCT fa.batch) > 1 THEN 'ALL'
                ELSE MIN(fa.batch)
              END as batch,
              COUNT(DISTINCT fs_sub.id) as evaluation_count,
              ROUND(AVG(sc.p1_coverage_syllabus), 2) as p1, ROUND(AVG(sc.p2_topics_beyond), 2) as p2,
              ROUND(AVG(sc.p3_technical_content), 2) as p3, ROUND(AVG(sc.p4_communication), 2) as p4,
              ROUND(AVG(sc.p5_teaching_aids), 2) as p5, ROUND(AVG(sc.p6_motivation), 2) as p6,
              ROUND(AVG(sc.p7_practical_skills), 2) as p7, ROUND(AVG(sc.p8_project_skills), 2) as p8,
              ROUND(AVG(sc.p9_student_progress), 2) as p9, ROUND(AVG(sc.p10_punctuality), 2) as p10,
              ROUND(AVG(sc.p11_domain_knowledge), 2) as p11, ROUND(AVG(sc.p12_interaction), 2) as p12,
              ROUND(AVG(sc.p13_resolve_difficulties), 2) as p13, ROUND(AVG(sc.p14_cocurricular), 2) as p14,
              ROUND(AVG(sc.p15_extracurricular), 2) as p15, ROUND(AVG(sc.p16_internship), 2) as p16,
              ROUND(AVG(sc.total_raw), 2) as avg_raw, ROUND(AVG(sc.marks_out_of_25), 2) as avg_marks
       FROM faculty_allocations fa
       JOIN faculties f ON fa.faculty_id = f.id
       JOIN subjects s ON fa.subject_id = s.id
       LEFT JOIN feedback_scores sc ON sc.allocation_id = fa.id
       LEFT JOIN feedback_submissions fs_sub ON sc.submission_id = fs_sub.id
       WHERE fa.session_id = ?
       GROUP BY f.id, s.id, f.name, f.designation, s.name, s.code
       ORDER BY s.id, (CASE WHEN COUNT(DISTINCT fa.allocation_type) > 1 THEN 1 WHEN UPPER(MIN(fa.allocation_type)) = 'THEORY' THEN 2 ELSE 3 END), f.name`, [id]
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

    // 1. Faculty Summary data (combined theory & practical per subject)
    const facultySummary = await db.query(
      `SELECT f.name as "Faculty Name", f.designation as "Designation",
              s.name as "Subject", s.code as "Code",
              CASE 
                WHEN COUNT(DISTINCT fa.allocation_type) > 1 THEN 'THEORY & PRACTICAL'
                ELSE UPPER(MIN(fa.allocation_type))
              END as "Type",
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
       GROUP BY f.id, s.id, f.name, f.designation, s.name, s.code
       ORDER BY s.id, (CASE WHEN COUNT(DISTINCT fa.allocation_type) > 1 THEN 1 WHEN UPPER(MIN(fa.allocation_type)) = 'THEORY' THEN 2 ELSE 3 END), f.name`, [id]
    );

    // 2. Student-wise raw data
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

    const wb = new ExcelJS.Workbook();
    wb.creator = 'Government Polytechnic Awasari (Kh)';
    wb.created = new Date();

    // Check college logo
    let logoPath = path.join(__dirname, '../assets/logo.png');
    if (!fs.existsSync(logoPath)) {
      logoPath = path.join(__dirname, '../../../client/public/logo.png');
    }
    if (!fs.existsSync(logoPath)) {
      logoPath = path.join(__dirname, '../../../GPA\'s Library-BLNV5e.png');
    }
    let logoId = null;
    if (fs.existsSync(logoPath)) {
      try {
        logoId = wb.addImage({ filename: logoPath, extension: 'png' });
      } catch (e) {
        console.warn('Logo image could not be loaded:', e.message);
      }
    }

    // ────────────────────────────────────────────────────────────
    // SHEET 1: Faculty Evaluation Summary
    // ────────────────────────────────────────────────────────────
    const ws1 = wb.addWorksheet('Faculty Summary', {
      views: [{ showGridLines: true }]
    });

    if (logoId !== null) {
      ws1.addImage(logoId, {
        tl: { col: 0.1, row: 0.2 },
        ext: { width: 68, height: 68 },
        editAs: 'undefined'
      });
    }

    // Official Institutional Heading
    ws1.mergeCells('B1:X1');
    const t1 = ws1.getCell('B1');
    t1.value = 'GOVERNMENT POLYTECHNIC AWASARI (KHURD)';
    t1.font = { name: 'Arial', size: 16, bold: true, color: { argb: 'FF1E1B4B' } };
    t1.alignment = { vertical: 'middle', horizontal: 'center' };
    ws1.getRow(1).height = 28;

    ws1.mergeCells('B2:X2');
    const t2 = ws1.getCell('B2');
    t2.value = `Department of ${session.dept_name || 'Computer Engineering'} · MSBTE CIAAN-2023 K-Scheme`;
    t2.font = { name: 'Arial', size: 12, bold: true, color: { argb: 'FF4338CA' } };
    t2.alignment = { vertical: 'middle', horizontal: 'center' };
    ws1.getRow(2).height = 20;

    ws1.mergeCells('B3:X3');
    const t3 = ws1.getCell('B3');
    t3.value = 'STUDENT FEEDBACK ON FACULTY PERFORMANCE - SUMMARY EVALUATION REPORT';
    t3.font = { name: 'Arial', size: 10.5, bold: true, color: { argb: 'FF334155' } };
    t3.alignment = { vertical: 'middle', horizontal: 'center' };
    ws1.getRow(3).height = 20;

    // Metadata details
    ws1.getCell('B5').value = 'Feedback Session:';
    ws1.getCell('C5').value = session.title;
    ws1.getCell('F5').value = 'Academic Year:';
    ws1.getCell('G5').value = session.year_label;
    ws1.getCell('J5').value = 'Semester:';
    ws1.getCell('K5').value = `Semester ${session.semester}`;
    ws1.getCell('M5').value = 'Status:';
    ws1.getCell('N5').value = (session.status || 'Active').toUpperCase();

    ['B5', 'F5', 'J5', 'M5'].forEach(c => {
      ws1.getCell(c).font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FF475569' } };
    });
    ['C5', 'G5', 'K5', 'N5'].forEach(c => {
      ws1.getCell(c).font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FF0F172A' } };
    });

    ws1.getCell('B6').value = 'Generated On:';
    ws1.getCell('C6').value = new Date().toLocaleString('en-IN');
    ws1.getCell('F6').value = 'Submissions:';
    ws1.getCell('G6').value = `${rawData.length} evaluations recorded`;
    ['B6', 'F6'].forEach(c => {
      ws1.getCell(c).font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FF475569' } };
    });
    ['C6', 'G6'].forEach(c => {
      ws1.getCell(c).font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FF0F172A' } };
    });

    // Table Header (Matching MSBTE Institutional format)
    const headers1 = [
      'No', 'Faculty Name', 'Designation', 'Subject Name', 'Subject Code',
      'Type', 'Evaluations',
      'P1 (Syllabus)', 'P2 (Beyond)', 'P3 (Content)', 'P4 (Comm)',
      'P5 (Aids)', 'P6 (Motiv)', 'P7 (Pract)', 'P8 (Project)',
      'P9 (Feedback)', 'P10 (Punct)', 'P11 (Domain)', 'P12 (Interact)',
      'P13 (Diff)', 'P14 (Co-curr)', 'P15 (Extra)', 'P16 (Intern)',
      'Score (/25)'
    ];

    const hRow1 = ws1.getRow(8);
    hRow1.values = headers1;
    hRow1.height = 30;
    hRow1.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
    hRow1.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    hRow1.eachCell(c => {
      c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E293B' } };
      c.border = {
        top: { style: 'thin', color: { argb: 'FF0F172A' } },
        bottom: { style: 'medium', color: { argb: 'FF0F172A' } },
        left: { style: 'thin', color: { argb: 'FF334155' } },
        right: { style: 'thin', color: { argb: 'FF334155' } },
      };
    });

    // Data rows
    let rIdx = 9;
    facultySummary.forEach((f, i) => {
      const r = ws1.getRow(rIdx);
      r.values = [
        i + 1,
        f['Faculty Name'] || '',
        f['Designation'] || 'Lecturer',
        f['Subject'] || '',
        f['Code'] || '',
        f['Type'] || '',
        Number(f['No. of Evaluations']) || 0,
        f['P1'] !== null ? Number(f['P1']) : '-',
        f['P2'] !== null ? Number(f['P2']) : '-',
        f['P3'] !== null ? Number(f['P3']) : '-',
        f['P4'] !== null ? Number(f['P4']) : '-',
        f['P5'] !== null ? Number(f['P5']) : '-',
        f['P6'] !== null ? Number(f['P6']) : '-',
        f['P7'] !== null ? Number(f['P7']) : '-',
        f['P8'] !== null ? Number(f['P8']) : '-',
        f['P9'] !== null ? Number(f['P9']) : '-',
        f['P10'] !== null ? Number(f['P10']) : '-',
        f['P11'] !== null ? Number(f['P11']) : '-',
        f['P12'] !== null ? Number(f['P12']) : '-',
        f['P13'] !== null ? Number(f['P13']) : '-',
        f['P14'] !== null ? Number(f['P14']) : '-',
        f['P15'] !== null ? Number(f['P15']) : '-',
        f['P16'] !== null ? Number(f['P16']) : '-',
        f['Score /25'] !== null ? Number(f['Score /25']) : '-'
      ];

      r.height = 24;
      r.alignment = { vertical: 'middle', horizontal: 'center' };
      r.font = { name: 'Arial', size: 10, color: { argb: 'FF0F172A' } };

      // Left-align text columns
      r.getCell(2).alignment = { vertical: 'middle', horizontal: 'left' };
      r.getCell(3).alignment = { vertical: 'middle', horizontal: 'left' };
      r.getCell(4).alignment = { vertical: 'middle', horizontal: 'left' };

      // Highlight Score cell (Column 24)
      const scoreCell = r.getCell(24);
      scoreCell.font = { name: 'Arial', size: 10.5, bold: true, color: { argb: 'FF047857' } };
      scoreCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFECFDF5' } };

      const bg = i % 2 === 0 ? 'FFFFFFFF' : 'FFF8FAFC';
      r.eachCell((cell, colNum) => {
        if (colNum !== 24) {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } };
        }
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
          bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
          left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
          right: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        };
      });

      rIdx++;
    });

    ws1.columns = [
      { width: 8 },   { width: 26 },  { width: 18 },  { width: 34 },  { width: 14 },
      { width: 24 },  { width: 14 },  { width: 13 },  { width: 13 },  { width: 13 },
      { width: 13 },  { width: 13 },  { width: 13 },  { width: 13 },  { width: 13 },
      { width: 13 },  { width: 13 },  { width: 13 },  { width: 13 },  { width: 13 },
      { width: 13 },  { width: 13 },  { width: 13 },  { width: 16 },
    ];

    // ────────────────────────────────────────────────────────────
    // SHEET 2: Student Raw Responses (Confidential)
    // ────────────────────────────────────────────────────────────
    const ws2 = wb.addWorksheet('Raw Responses', {
      views: [{ showGridLines: true }]
    });

    if (logoId !== null) {
      ws2.addImage(logoId, {
        tl: { col: 0.1, row: 0.2 },
        ext: { width: 68, height: 68 },
        editAs: 'undefined'
      });
    }

    ws2.mergeCells('B1:Z1');
    const t21 = ws2.getCell('B1');
    t21.value = 'GOVERNMENT POLYTECHNIC AWASARI (KHURD)';
    t21.font = { name: 'Arial', size: 16, bold: true, color: { argb: 'FF1E1B4B' } };
    t21.alignment = { vertical: 'middle', horizontal: 'center' };
    ws2.getRow(1).height = 28;

    ws2.mergeCells('B2:Z2');
    const t22 = ws2.getCell('B2');
    t22.value = `Department of ${session.dept_name || 'Computer Engineering'} · MSBTE CIAAN-2023 K-Scheme`;
    t22.font = { name: 'Arial', size: 12, bold: true, color: { argb: 'FF4338CA' } };
    t22.alignment = { vertical: 'middle', horizontal: 'center' };
    ws2.getRow(2).height = 20;

    ws2.mergeCells('B3:Z3');
    const t23 = ws2.getCell('B3');
    t23.value = `STUDENT-WISE DETAILED RESPONSES - SESSION: ${session.title.toUpperCase()}`;
    t23.font = { name: 'Arial', size: 10.5, bold: true, color: { argb: 'FF334155' } };
    t23.alignment = { vertical: 'middle', horizontal: 'center' };
    ws2.getRow(3).height = 20;

    const headers2 = [
      'Sr No', 'Enrollment No', 'Student Name', 'Batch', 'Submitted At',
      'Subject Name', 'Subject Code', 'Type', 'Faculty Name',
      'P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P7', 'P8',
      'P9', 'P10', 'P11', 'P12', 'P13', 'P14', 'P15', 'P16',
      'Total Raw', 'Score (/25)'
    ];

    const hRow2 = ws2.getRow(6);
    hRow2.values = headers2;
    hRow2.height = 28;
    hRow2.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
    hRow2.alignment = { vertical: 'middle', horizontal: 'center' };
    hRow2.eachCell(c => {
      c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E293B' } };
      c.border = {
        top: { style: 'thin', color: { argb: 'FF0F172A' } },
        bottom: { style: 'medium', color: { argb: 'FF0F172A' } },
        left: { style: 'thin', color: { argb: 'FF334155' } },
        right: { style: 'thin', color: { argb: 'FF334155' } },
      };
    });

    let rawIdx = 7;
    rawData.forEach((row, i) => {
      const r = ws2.getRow(rawIdx);
      r.values = [
        i + 1,
        row['Enrollment No'] || '',
        row['Student Name'] || '',
        row['Batch'] || '',
        row['Submitted At'] ? new Date(row['Submitted At']).toLocaleString('en-IN') : '',
        row['Subject'] || '',
        row['Subject Code'] || '',
        (row['Type'] || '').toUpperCase(),
        row['Faculty Name'] || '',
        row['P1'], row['P2'], row['P3'], row['P4'], row['P5'], row['P6'], row['P7'], row['P8'],
        row['P9'], row['P10'], row['P11'], row['P12'], row['P13'], row['P14'], row['P15'], row['P16'],
        row['Total Raw'],
        row['Marks /25'] !== null ? Number(row['Marks /25']) : ''
      ];

      r.height = 22;
      r.alignment = { vertical: 'middle', horizontal: 'center' };
      r.font = { name: 'Arial', size: 9.5, color: { argb: 'FF0F172A' } };

      r.getCell(2).alignment = { vertical: 'middle', horizontal: 'left' };
      r.getCell(3).alignment = { vertical: 'middle', horizontal: 'left' };
      r.getCell(6).alignment = { vertical: 'middle', horizontal: 'left' };
      r.getCell(9).alignment = { vertical: 'middle', horizontal: 'left' };

      const bg = i % 2 === 0 ? 'FFFFFFFF' : 'FFF8FAFC';
      r.eachCell((cell) => {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } };
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
          bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
          left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
          right: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        };
      });

      rawIdx++;
    });

    ws2.columns = [
      { width: 8 },   { width: 16 },  { width: 24 },  { width: 10 },  { width: 22 },
      { width: 28 },  { width: 14 },  { width: 12 },  { width: 24 },
      { width: 8 },   { width: 8 },   { width: 8 },   { width: 8 },   { width: 8 },
      { width: 8 },   { width: 8 },   { width: 8 },   { width: 8 },   { width: 8 },
      { width: 8 },   { width: 8 },   { width: 8 },   { width: 8 },   { width: 8 },
      { width: 8 },   { width: 12 },  { width: 14 },
    ];

    // ────────────────────────────────────────────────────────────
    // SHEET 3: MSBTE Parameters Reference
    // ────────────────────────────────────────────────────────────
    const ws3 = wb.addWorksheet('MSBTE Parameters');
    ws3.views = [{ showGridLines: true }];

    ws3.mergeCells('A1:C1');
    const pTitle = ws3.getCell('A1');
    pTitle.value = 'MSBTE CIAAN-2023 K-SCHEME EVALUATION PARAMETERS (SCALE 1 TO 5)';
    pTitle.font = { name: 'Arial', size: 12, bold: true, color: { argb: 'FF1E1B4B' } };
    pTitle.alignment = { vertical: 'middle', horizontal: 'center' };
    ws3.getRow(1).height = 26;

    const pHRow = ws3.getRow(3);
    pHRow.values = ['Code', 'Parameter Title', 'Weightage / Description'];
    pHRow.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
    pHRow.eachCell(c => {
      c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E293B' } };
    });

    PARAM_LABELS.forEach((label, idx) => {
      const r = ws3.getRow(idx + 4);
      r.values = [
        `P${idx + 1}`,
        label,
        idx === 15 ? 'Optional parameter (evaluated when applicable)' : 'Core Parameter (1-5 Rating)'
      ];
      r.font = { name: 'Arial', size: 10 };
      r.height = 20;
    });

    ws3.columns = [{ width: 10 }, { width: 44 }, { width: 44 }];

    const buffer = await wb.xlsx.writeBuffer();
    const safeTitle = (session.title || 'Feedback').replace(/[^a-zA-Z0-9_-]/g, '_');
    const filename = `Feedback_${session.dept_name || 'CO'}_Sem${session.semester}_${session.year_label}_${safeTitle}.xlsx`;

    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Length', buffer.length);
    res.end(Buffer.from(buffer));
  } catch (err) {
    console.error('[Download Excel Error]', err);
    res.status(500).json({ error: 'Server error generating Excel file' });
  }
}

module.exports = { getSessionReport, getSubmissions, downloadSessionExcel };
