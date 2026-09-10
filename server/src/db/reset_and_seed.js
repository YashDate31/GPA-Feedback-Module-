require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || '';
const DB_NAME = process.env.DB_NAME || 'college_feedback';
const DB_PORT = process.env.DB_PORT || 3306;

async function resetAndSeed() {
  console.log(`[RESET] Connecting to MySQL at ${DB_HOST}:${DB_PORT} as ${DB_USER}...`);
  const conn = await mysql.createConnection({
    host: DB_HOST,
    port: DB_PORT,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
    multipleStatements: true,
  });

  try {
    console.log('[RESET] Disabling foreign key checks and truncating all tables...');
    await conn.query('SET FOREIGN_KEY_CHECKS = 0');

    // Clear all tables completely
    await conn.query('TRUNCATE TABLE feedback_scores');
    await conn.query('TRUNCATE TABLE feedback_submissions');
    await conn.query('TRUNCATE TABLE faculty_allocations');
    await conn.query('TRUNCATE TABLE student_roster');
    await conn.query('TRUNCATE TABLE feedback_sessions');
    await conn.query('TRUNCATE TABLE faculties');
    await conn.query('TRUNCATE TABLE subjects');
    await conn.query('TRUNCATE TABLE users');
    await conn.query('TRUNCATE TABLE academic_years');
    await conn.query('TRUNCATE TABLE departments');

    await conn.query('SET FOREIGN_KEY_CHECKS = 1');
    console.log('[RESET] All data cleared successfully.');

    // ── 1. Departments ──────────────────────────────────────────
    console.log('[SEED] Seeding departments...');
    await conn.query(`
      INSERT INTO departments (code, name) VALUES
      ('CO', 'Computer Engineering'),
      ('CE', 'Civil Engineering'),
      ('ME', 'Mechanical Engineering'),
      ('EE', 'Electrical Engineering'),
      ('ETC', 'Electronics & Telecommunication Engineering'),
      ('IT', 'Information Technology')
    `);

    const [[deptCO]] = await conn.query("SELECT id FROM departments WHERE code = 'CO'");
    const deptId = deptCO.id;

    // ── 2. Academic Year ────────────────────────────────────────
    console.log('[SEED] Seeding academic years...');
    await conn.query(`
      INSERT INTO academic_years (year_label, is_current) VALUES
      ('2025-26', TRUE),
      ('2026-27', FALSE)
    `);

    // ── 3. Class Teacher Accounts ───────────────────────────────
    console.log('[SEED] Seeding Class Teacher accounts (semester_one..six)...');
    const semWords = ['one', 'two', 'three', 'four', 'five', 'six'];
    for (let s = 1; s <= 6; s++) {
      const uName = `semester_${semWords[s - 1]}`;
      const uPass = `semester@${semWords[s - 1]}`;
      const pwHash = await bcrypt.hash(uPass, 10);
      await conn.query(`
        INSERT INTO users (username, password_hash, name, department_id, semester) VALUES
        (?, ?, ?, ${deptId}, ?)
      `, [uName, pwHash, `Class Teacher - Sem ${s}`, s]);
    }

    // ── 4. Computer Engineering Subjects (Exact user curriculum) ─
    console.log('[SEED] Seeding Computer Engineering subjects for all semesters...');
    const subjects = [
      // Semester 1
      { code: '311302', name: 'Basic Mathematics', sem: 1, type: 'theory' },
      { code: '311305', name: 'Basic Science', sem: 1, type: 'both' },
      { code: '311303', name: 'Communication Skills (English)', sem: 1, type: 'both' },
      { code: '311008', name: 'Engineering Graphics', sem: 1, type: 'both' },
      { code: '311002', name: 'Engineering Workshop Practice', sem: 1, type: 'practical' },
      { code: '311001', name: 'Fundamentals of ICT', sem: 1, type: 'both' },
      { code: '311003', name: 'Yoga and Meditation', sem: 1, type: 'both' },

      // Semester 2
      { code: '312301', name: 'Applied Mathematics', sem: 2, type: 'theory' },
      { code: '312302', name: 'Basic Electrical and Electronics Engineering', sem: 2, type: 'both' },
      { code: '312303', name: 'Programming in C', sem: 2, type: 'both' },
      { code: '312001', name: 'Linux Basics', sem: 2, type: 'practical' },
      { code: '312002', name: 'Professional Communication', sem: 2, type: 'theory' },
      { code: '312003', name: 'Social and Life Skills', sem: 2, type: 'theory' },
      { code: '312004', name: 'Web Page Designing', sem: 2, type: 'practical' },

      // Semester 3
      { code: '313304', name: 'Object Oriented Programming Using C++', sem: 3, type: 'both' },
      { code: '313303', name: 'Digital Techniques', sem: 3, type: 'both' },
      { code: '313301', name: 'Data Structure Using C', sem: 3, type: 'both' },
      { code: '313302', name: 'Database Management System', sem: 3, type: 'both' },
      { code: '313001', name: 'Computer Graphics', sem: 3, type: 'practical' },

      // Semester 4
      { code: '314317', name: 'Java Programming', sem: 4, type: 'both' },
      { code: '314318', name: 'Data Communication and Computer Network', sem: 4, type: 'both' },
      { code: '314321', name: 'Microprocessor Programming', sem: 4, type: 'both' },
      { code: '314301', name: 'Environmental Education and Sustainability', sem: 4, type: 'theory' },
      { code: '314004', name: 'Python Programming', sem: 4, type: 'practical' },
      { code: '314005', name: 'UI/UX Design', sem: 4, type: 'both' },

      // Semester 5
      { code: '315319', name: 'Operating System', sem: 5, type: 'both' },
      { code: '315323', name: 'Software Engineering', sem: 5, type: 'both' },
      { code: '315002', name: 'Entrepreneurship Development and Startups', sem: 5, type: 'theory' },
      { code: '315003', name: 'Seminar and Project Initiation Course', sem: 5, type: 'practical' },
      { code: '315004', name: 'Internship (12 Weeks)', sem: 5, type: 'practical' },
      // Semester 5 Elective I
      { code: '315321', name: 'Advance Computer Network', sem: 5, type: 'both' },
      { code: '315325', name: 'Cloud Computing', sem: 5, type: 'both' },
      { code: '315326', name: 'Data Analytics', sem: 5, type: 'both' },

      // Semester 6
      { code: '315301', name: 'Management', sem: 6, type: 'theory' },
      { code: '316313', name: 'Emerging Trends in Computer Engg. and IT', sem: 6, type: 'theory' },
      { code: '316314', name: 'Software Testing', sem: 6, type: 'both' },
      { code: '316005', name: 'Client Side Scripting', sem: 6, type: 'both' },
      { code: '316006', name: 'Mobile Application Development', sem: 6, type: 'both' },
      { code: '316004', name: 'Capstone Project', sem: 6, type: 'practical' },
      // Semester 6 Elective II
      { code: '316315', name: 'Digital Forensic and Hacking Techniques', sem: 6, type: 'both' },
      { code: '316316', name: 'Machine Learning', sem: 6, type: 'both' },
      { code: '316317', name: 'Network and Information Security', sem: 6, type: 'both' },
    ];

    for (const sub of subjects) {
      await conn.query(
        'INSERT INTO subjects (code, name, department_id, semester, type) VALUES (?, ?, ?, ?, ?)',
        [sub.code, sub.name, deptId, sub.sem, sub.type]
      );
    }

    console.log(`[SEED] Successfully seeded ${subjects.length} subjects for Computer Engineering!`);
    console.log('[DONE] Database is completely reset and clean with fresh subjects.');

    await conn.end();
    process.exit(0);
  } catch (err) {
    console.error('[ERROR] Reset and seed failed:', err);
    await conn.end();
    process.exit(1);
  }
}

resetAndSeed();
