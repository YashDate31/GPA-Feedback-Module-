-- ============================================================
-- Government Polytechnic Awasari (Kh) - Feedback Portal
-- Supabase (PostgreSQL) Database Schema & Initial Data
-- Department of Computer Engineering | MSBTE K-Scheme
-- ============================================================

-- 1. Departments Table
CREATE TABLE IF NOT EXISTS departments (
  id SERIAL PRIMARY KEY,
  code VARCHAR(10) NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 2. Academic Years Table
CREATE TABLE IF NOT EXISTS academic_years (
  id SERIAL PRIMARY KEY,
  year_label VARCHAR(20) NOT NULL UNIQUE,
  is_current BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3. Users Table (Class Teachers)
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(150) NOT NULL,
  department_id INT REFERENCES departments(id) ON DELETE SET NULL,
  semester INT NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 4. Faculties Table
CREATE TABLE IF NOT EXISTS faculties (
  id SERIAL PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  designation VARCHAR(100),
  department_id INT NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
  email VARCHAR(150),
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_faculties_dept_lower_name ON faculties (department_id, LOWER(TRIM(name)));

-- 5. Subjects Table (MSBTE Curriculum)
CREATE TABLE IF NOT EXISTS subjects (
  id SERIAL PRIMARY KEY,
  code VARCHAR(20) NOT NULL,
  name VARCHAR(200) NOT NULL,
  department_id INT NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
  semester INT NOT NULL,
  type VARCHAR(20) NOT NULL DEFAULT 'both' CHECK (type IN ('theory', 'practical', 'both')),
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT unique_subject UNIQUE (code, department_id)
);

-- 6. Feedback Sessions Table
CREATE TABLE IF NOT EXISTS feedback_sessions (
  id SERIAL PRIMARY KEY,
  academic_year_id INT NOT NULL REFERENCES academic_years(id) ON DELETE CASCADE,
  department_id INT NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
  semester INT NOT NULL,
  title VARCHAR(200) NOT NULL,
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'closed')),
  created_by INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  activated_at TIMESTAMPTZ NULL,
  closed_at TIMESTAMPTZ NULL
);

-- 7. Faculty Allocations Table
CREATE TABLE IF NOT EXISTS faculty_allocations (
  id SERIAL PRIMARY KEY,
  subject_id INT NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  faculty_id INT NOT NULL REFERENCES faculties(id) ON DELETE CASCADE,
  allocation_type VARCHAR(20) NOT NULL CHECK (allocation_type IN ('theory', 'practical')),
  batch VARCHAR(10) DEFAULT 'ALL' CHECK (batch IN ('ALL', 'B1', 'B2', 'B3')),
  session_id INT NOT NULL REFERENCES feedback_sessions(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT unique_allocation UNIQUE (subject_id, allocation_type, batch, session_id)
);

-- 8. Student Roster Table
CREATE TABLE IF NOT EXISTS student_roster (
  id SERIAL PRIMARY KEY,
  enrollment_no VARCHAR(30) NOT NULL,
  name VARCHAR(150) NOT NULL,
  department_id INT NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
  semester INT NOT NULL,
  batch VARCHAR(20) DEFAULT 'ALL',
  academic_year_id INT NOT NULL REFERENCES academic_years(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT TRUE,
  uploaded_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  uploaded_by INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT unique_student_year UNIQUE (enrollment_no, academic_year_id)
);

-- 9. Feedback Submissions Table
CREATE TABLE IF NOT EXISTS feedback_submissions (
  id SERIAL PRIMARY KEY,
  session_id INT NOT NULL REFERENCES feedback_sessions(id) ON DELETE CASCADE,
  enrollment_no VARCHAR(30) NOT NULL,
  student_name VARCHAR(150) NOT NULL,
  department_id INT NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
  semester INT NOT NULL,
  batch VARCHAR(10) NOT NULL CHECK (batch IN ('B1', 'B2', 'B3')),
  submitted_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  ip_address VARCHAR(45),
  reference_code VARCHAR(50) UNIQUE,
  CONSTRAINT unique_submission UNIQUE (session_id, enrollment_no)
);

-- 10. Feedback Scores Table (16 MSBTE Parameters)
CREATE TABLE IF NOT EXISTS feedback_scores (
  id SERIAL PRIMARY KEY,
  submission_id INT NOT NULL REFERENCES feedback_submissions(id) ON DELETE CASCADE,
  allocation_id INT NOT NULL REFERENCES faculty_allocations(id) ON DELETE CASCADE,
  p1_coverage_syllabus SMALLINT,
  p2_topics_beyond SMALLINT,
  p3_technical_content SMALLINT,
  p4_communication SMALLINT,
  p5_teaching_aids SMALLINT,
  p6_motivation SMALLINT,
  p7_practical_skills SMALLINT,
  p8_project_skills SMALLINT,
  p9_student_progress SMALLINT,
  p10_punctuality SMALLINT,
  p11_domain_knowledge SMALLINT,
  p12_interaction SMALLINT,
  p13_resolve_difficulties SMALLINT,
  p14_cocurricular SMALLINT,
  p15_extracurricular SMALLINT,
  p16_internship SMALLINT,
  total_raw INT,
  marks_out_of_25 DECIMAL(5,2),
  comments TEXT
);

-- ============================================================
-- SEED DATA
-- ============================================================

-- 1. Departments
INSERT INTO departments (code, name) VALUES
  ('CO', 'Computer Engineering'),
  ('CE', 'Civil Engineering'),
  ('ME', 'Mechanical Engineering'),
  ('EE', 'Electrical Engineering'),
  ('ETC', 'Electronics & Telecommunication Engineering'),
  ('IT', 'Information Technology'),
  ('AE', 'Automobile Engineering')
ON CONFLICT (code) DO NOTHING;

-- 2. Academic Years
INSERT INTO academic_years (year_label, is_current) VALUES
  ('2025-26', TRUE),
  ('2026-27', FALSE)
ON CONFLICT (year_label) DO NOTHING;

-- 3. Class Teacher Accounts (semester_one through semester_six)
-- Passwords: semester@one, semester@two, semester@three, semester@four, semester@five, semester@six
INSERT INTO users (username, password_hash, name, department_id, semester)
SELECT 'semester_one', '$2a$10$EHg1klG4SWV/tDRGsgd/xeEIZbJyZTrgVPw0QFijfLGDSfQXFTVJW', 'Class Teacher - Sem 1', id, 1 FROM departments WHERE code = 'CO'
ON CONFLICT (username) DO NOTHING;

INSERT INTO users (username, password_hash, name, department_id, semester)
SELECT 'semester_two', '$2a$10$jxN170knSSn6xkoxVAvJSO.BQW71h1mloSPgDf603Py5pHPJl7Hoy', 'Class Teacher - Sem 2', id, 2 FROM departments WHERE code = 'CO'
ON CONFLICT (username) DO NOTHING;

INSERT INTO users (username, password_hash, name, department_id, semester)
SELECT 'semester_three', '$2a$10$MF5Uif1GyImasx/EbEAX5.VLLqerwYDvGmlhbyo4I02X9jzx0HPVW', 'Class Teacher - Sem 3', id, 3 FROM departments WHERE code = 'CO'
ON CONFLICT (username) DO NOTHING;

INSERT INTO users (username, password_hash, name, department_id, semester)
SELECT 'semester_four', '$2a$10$.JhMF6hLjZ8visjBQIJOnOOhb/6oMEcMOhOuyvobepT8alec3Umqq', 'Class Teacher - Sem 4', id, 4 FROM departments WHERE code = 'CO'
ON CONFLICT (username) DO NOTHING;

INSERT INTO users (username, password_hash, name, department_id, semester)
SELECT 'semester_five', '$2a$10$bPZvuC2/pelf.jylCxIVtuhHEQw87BwBn6PSwOlxD4OqL5RssnzN2', 'Class Teacher - Sem 5', id, 5 FROM departments WHERE code = 'CO'
ON CONFLICT (username) DO NOTHING;

INSERT INTO users (username, password_hash, name, department_id, semester)
SELECT 'semester_six', '$2a$10$6TEJ3UmZXt7MGs76ChqBXepc5wkaXhEA6rAmYBO5U8eL3BGghAyC.', 'Class Teacher - Sem 6', id, 6 FROM departments WHERE code = 'CO'
ON CONFLICT (username) DO NOTHING;

-- 4. Computer Engineering MSBTE Subjects (42 subjects)
INSERT INTO subjects (code, name, department_id, semester, type)
SELECT s.code, s.name, d.id, s.semester, s.type
FROM departments d,
(VALUES
  -- Semester 1
  ('311302', 'Basic Mathematics', 1, 'theory'),
  ('311305', 'Basic Science', 1, 'both'),
  ('311303', 'Communication Skills (English)', 1, 'both'),
  ('311008', 'Engineering Graphics', 1, 'both'),
  ('311002', 'Engineering Workshop Practice', 1, 'practical'),
  ('311001', 'Fundamentals of ICT', 1, 'both'),
  ('311003', 'Yoga and Meditation', 1, 'both'),

  -- Semester 2
  ('312301', 'Applied Mathematics', 2, 'theory'),
  ('312302', 'Basic Electrical and Electronics Engineering', 2, 'both'),
  ('312303', 'Programming in C', 2, 'both'),
  ('312001', 'Linux Basics', 2, 'practical'),
  ('312002', 'Professional Communication', 2, 'theory'),
  ('312003', 'Social and Life Skills', 2, 'theory'),
  ('312004', 'Web Page Designing', 2, 'practical'),

  -- Semester 3
  ('313304', 'Object Oriented Programming Using C++', 3, 'both'),
  ('313303', 'Digital Techniques', 3, 'both'),
  ('313301', 'Data Structure Using C', 3, 'both'),
  ('313302', 'Database Management System', 3, 'both'),
  ('313001', 'Computer Graphics', 3, 'practical'),

  -- Semester 4
  ('314317', 'Java Programming', 4, 'both'),
  ('314318', 'Data Communication and Computer Network', 4, 'both'),
  ('314321', 'Microprocessor Programming', 4, 'both'),
  ('314301', 'Environmental Education and Sustainability', 4, 'theory'),
  ('314004', 'Python Programming', 4, 'practical'),
  ('314005', 'UI/UX Design', 4, 'both'),

  -- Semester 5
  ('315319', 'Operating System', 5, 'both'),
  ('315323', 'Software Engineering', 5, 'both'),
  ('315002', 'Entrepreneurship Development and Startups', 5, 'theory'),
  ('315003', 'Seminar and Project Initiation Course', 5, 'practical'),
  ('315004', 'Internship (12 Weeks)', 5, 'practical'),
  ('315321', 'Advance Computer Network', 5, 'both'),
  ('315325', 'Cloud Computing', 5, 'both'),
  ('315326', 'Data Analytics', 5, 'both'),

  -- Semester 6
  ('315301', 'Management', 6, 'theory'),
  ('316313', 'Emerging Trends in Computer Engg. and IT', 6, 'theory'),
  ('316314', 'Software Testing', 6, 'both'),
  ('316005', 'Client Side Scripting', 6, 'both'),
  ('316006', 'Mobile Application Development', 6, 'both'),
  ('316004', 'Capstone Project', 6, 'practical'),
  ('316315', 'Digital Forensic and Hacking Techniques', 6, 'both'),
  ('316316', 'Machine Learning', 6, 'both'),
  ('316317', 'Network and Information Security', 6, 'both')
) AS s(code, name, semester, type)
WHERE d.code = 'CO'
ON CONFLICT (code, department_id) DO UPDATE SET name = EXCLUDED.name, semester = EXCLUDED.semester, type = EXCLUDED.type;
