-- ============================================================
-- MSBTE College Faculty Feedback Module - Database Schema
-- Scheme: CIAAN-2023 K15 | AICTE Diploma Engineering
-- Computer Engineering Department
-- ============================================================

CREATE DATABASE IF NOT EXISTS college_feedback;
USE college_feedback;

CREATE TABLE IF NOT EXISTS departments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(10) NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(150) NOT NULL,
  department_id INT,
  semester INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (department_id) REFERENCES departments(id)
);

CREATE TABLE IF NOT EXISTS academic_years (
  id INT AUTO_INCREMENT PRIMARY KEY,
  year_label VARCHAR(20) NOT NULL UNIQUE,
  is_current BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS faculties (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  designation VARCHAR(100),
  department_id INT NOT NULL,
  email VARCHAR(150),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (department_id) REFERENCES departments(id),
  UNIQUE KEY unique_faculty_dept (name, department_id)
);

CREATE TABLE IF NOT EXISTS subjects (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(20) NOT NULL,
  name VARCHAR(200) NOT NULL,
  department_id INT NOT NULL,
  semester INT NOT NULL,
  type ENUM('theory', 'practical', 'both') NOT NULL DEFAULT 'both',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (department_id) REFERENCES departments(id),
  UNIQUE KEY unique_subject (code, department_id)
);

CREATE TABLE IF NOT EXISTS feedback_sessions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  academic_year_id INT NOT NULL,
  department_id INT NOT NULL,
  semester INT NOT NULL,
  title VARCHAR(200) NOT NULL,
  status ENUM('draft', 'active', 'closed') DEFAULT 'draft',
  created_by INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  activated_at TIMESTAMP NULL,
  closed_at TIMESTAMP NULL,
  FOREIGN KEY (academic_year_id) REFERENCES academic_years(id),
  FOREIGN KEY (department_id) REFERENCES departments(id),
  FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS faculty_allocations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  subject_id INT NOT NULL,
  faculty_id INT NOT NULL,
  allocation_type ENUM('theory', 'practical') NOT NULL,
  batch ENUM('ALL', 'B1', 'B2', 'B3') DEFAULT 'ALL',
  session_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (subject_id) REFERENCES subjects(id),
  FOREIGN KEY (faculty_id) REFERENCES faculties(id),
  FOREIGN KEY (session_id) REFERENCES feedback_sessions(id),
  UNIQUE KEY unique_allocation (subject_id, allocation_type, batch, session_id)
);

CREATE TABLE IF NOT EXISTS student_roster (
  id INT AUTO_INCREMENT PRIMARY KEY,
  enrollment_no VARCHAR(30) NOT NULL,
  name VARCHAR(150) NOT NULL,
  department_id INT NOT NULL,
  semester INT NOT NULL,
  batch VARCHAR(20) DEFAULT 'ALL',
  academic_year_id INT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  uploaded_by INT NOT NULL,
  FOREIGN KEY (department_id) REFERENCES departments(id),
  FOREIGN KEY (academic_year_id) REFERENCES academic_years(id),
  FOREIGN KEY (uploaded_by) REFERENCES users(id),
  UNIQUE KEY unique_student_year (enrollment_no, academic_year_id)
);

CREATE TABLE IF NOT EXISTS feedback_submissions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  session_id INT NOT NULL,
  enrollment_no VARCHAR(30) NOT NULL,
  student_name VARCHAR(150) NOT NULL,
  department_id INT NOT NULL,
  semester INT NOT NULL,
  batch ENUM('B1', 'B2', 'B3') NOT NULL,
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ip_address VARCHAR(45),
  reference_code VARCHAR(50) UNIQUE,
  FOREIGN KEY (session_id) REFERENCES feedback_sessions(id),
  UNIQUE KEY unique_submission (session_id, enrollment_no)
);

CREATE TABLE IF NOT EXISTS feedback_scores (
  id INT AUTO_INCREMENT PRIMARY KEY,
  submission_id INT NOT NULL,
  allocation_id INT NOT NULL,
  p1_coverage_syllabus TINYINT,
  p2_topics_beyond TINYINT,
  p3_technical_content TINYINT,
  p4_communication TINYINT,
  p5_teaching_aids TINYINT,
  p6_motivation TINYINT,
  p7_practical_skills TINYINT,
  p8_project_skills TINYINT,
  p9_student_progress TINYINT,
  p10_punctuality TINYINT,
  p11_domain_knowledge TINYINT,
  p12_interaction TINYINT,
  p13_resolve_difficulties TINYINT,
  p14_cocurricular TINYINT,
  p15_extracurricular TINYINT,
  p16_internship TINYINT,
  total_raw INT,
  marks_out_of_25 DECIMAL(5,2),
  comments TEXT,
  FOREIGN KEY (submission_id) REFERENCES feedback_submissions(id),
  FOREIGN KEY (allocation_id) REFERENCES faculty_allocations(id)
);