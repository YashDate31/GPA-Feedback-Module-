const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
require('dotenv').config();

let mysqlPool = null;
let pgPool = null;

const isPostgres = Boolean(
  process.env.DATABASE_URL ||
  process.env.SUPABASE_DB_URL ||
  (process.env.DB_HOST && process.env.DB_HOST.includes('supabase')) ||
  parseInt(process.env.DB_PORT) === 5432 ||
  (process.env.DB_CLIENT && process.env.DB_CLIENT.toLowerCase() === 'pg')
);

// MySQL config for local dev
const mysqlConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'college_feedback',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

/**
 * Translates MySQL queries & placeholders to PostgreSQL (Supabase) syntax
 */
function translateQueryForPg(sql, params = []) {
  let translatedSql = sql;
  const translatedParams = params ? [...params] : [];

  // 1. Translate ON DUPLICATE KEY UPDATE
  if (/student_roster/i.test(translatedSql) && /ON DUPLICATE KEY UPDATE/i.test(translatedSql)) {
    translatedSql = translatedSql.replace(
      /ON DUPLICATE KEY UPDATE[\s\S]*$/i,
      'ON CONFLICT (enrollment_no, academic_year_id) DO UPDATE SET name = EXCLUDED.name, batch = EXCLUDED.batch, semester = EXCLUDED.semester'
    );
  } else if (/faculty_allocations/i.test(translatedSql) && /ON DUPLICATE KEY UPDATE/i.test(translatedSql)) {
    translatedSql = translatedSql.replace(
      /ON DUPLICATE KEY UPDATE[\s\S]*$/i,
      'ON CONFLICT (subject_id, allocation_type, batch, session_id) DO UPDATE SET faculty_id = EXCLUDED.faculty_id'
    );
  }

  // 2. Translate INSERT IGNORE INTO
  if (/INSERT\s+IGNORE\s+INTO/i.test(translatedSql)) {
    translatedSql = translatedSql.replace(/INSERT\s+IGNORE\s+INTO/i, 'INSERT INTO ');
    if (!/ON CONFLICT/i.test(translatedSql)) {
      translatedSql += ' ON CONFLICT DO NOTHING';
    }
  }

  // 3. Append RETURNING id for INSERT queries to emulate result.insertId
  if (/^\s*INSERT\s+INTO/i.test(translatedSql) && !/RETURNING/i.test(translatedSql)) {
    translatedSql += ' RETURNING id';
  }

  // 4. Convert ? to $1, $2, ... while handling array params (e.g. IN (?))
  let paramCounter = 1;
  const flatParams = [];
  const parts = translatedSql.split('?');

  if (parts.length > 1) {
    let newSql = parts[0];
    for (let i = 0; i < parts.length - 1; i++) {
      const val = translatedParams[i];
      if (Array.isArray(val)) {
        if (val.length === 0) {
          newSql += 'NULL' + parts[i + 1];
        } else {
          const phs = val.map(() => `$${paramCounter++}`);
          flatParams.push(...val);
          newSql += phs.join(', ') + parts[i + 1];
        }
      } else {
        flatParams.push(val);
        newSql += `$${paramCounter++}` + parts[i + 1];
      }
    }
    translatedSql = newSql;
    return { sql: translatedSql, params: flatParams };
  }

  return { sql: translatedSql, params: translatedParams };
}

/**
 * Executes a PostgreSQL query with MySQL-like response format
 */
async function executePgQuery(executor, rawSql, rawParams) {
  const { sql, params } = translateQueryForPg(rawSql, rawParams);
  const res = await executor.query(sql, params);

  const results = res.rows ? [...res.rows] : [];
  results.insertId = res.rows && res.rows[0] && res.rows[0].id ? res.rows[0].id : null;
  results.affectedRows = res.rowCount !== undefined ? res.rowCount : 0;

  return results;
}

async function initializeDatabase() {
  if (isPostgres) {
    const { Pool } = require('pg');
    const connectionString = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL;
    console.log('[DB] Connecting to Supabase / PostgreSQL database...');

    const poolConfig = connectionString
      ? {
          connectionString,
          ssl: process.env.DB_SSL === 'false' ? false : { rejectUnauthorized: false },
        }
      : {
          host: process.env.DB_HOST || 'db.vidwfvsxrpozcxliorpb.supabase.co',
          port: parseInt(process.env.DB_PORT) || 5432,
          user: process.env.DB_USER || 'postgres',
          password: process.env.DB_PASSWORD,
          database: process.env.DB_NAME || 'postgres',
          ssl: process.env.DB_SSL === 'false' ? false : { rejectUnauthorized: false },
        };

    pgPool = new Pool(poolConfig);

    try {
      const testRes = await pgPool.query('SELECT NOW()');
      console.log(`[DB] Connected to PostgreSQL at ${testRes.rows[0].now}`);

      // Apply schema if departments table doesn't exist yet
      const tableCheck = await pgPool.query(
        "SELECT to_regclass('public.departments') AS tbl_exists"
      );
      if (!tableCheck.rows[0].tbl_exists) {
        console.log('[DB] Applying Supabase schema from supabase_schema.sql...');
        const schemaPath = path.join(__dirname, 'supabase_schema.sql');
        if (fs.existsSync(schemaPath)) {
          const sql = fs.readFileSync(schemaPath, 'utf8');
          await pgPool.query(sql);
          console.log('[DB] Supabase schema applied and initial data seeded!');
        }
      } else {
        console.log('[DB] PostgreSQL schema already exists and verified.');
      }
      console.log('[DB] Ready (PostgreSQL mode)');
    } catch (err) {
      console.error('[DB] PostgreSQL initialization failed:', err.message);
      throw err;
    }
    return;
  }

  // Fallback: Local MySQL mode
  try {
    const initConn = await mysql.createConnection({
      host: mysqlConfig.host,
      port: mysqlConfig.port,
      user: mysqlConfig.user,
      password: mysqlConfig.password,
    });

    console.log('[DB] Connected to local MySQL server');

    await initConn.query(`CREATE DATABASE IF NOT EXISTS \`${mysqlConfig.database}\``);
    await initConn.query(`USE \`${mysqlConfig.database}\``);

    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    const statements = schema
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    for (const stmt of statements) {
      try { await initConn.query(stmt); } catch (e) {
        if (!e.message.includes('already exists') && !e.message.includes('Duplicate entry')) throw e;
      }
    }
    console.log('[DB] Local MySQL schema applied');
    await initConn.end();

    mysqlPool = mysql.createPool(mysqlConfig);
    await seedDataMysql();
    console.log('[DB] Ready (MySQL mode)');
  } catch (err) {
    console.error('[DB] MySQL init failed:', err.message);
    console.error('[DB] Check server/.env — DB_PASSWORD must match your MySQL root password');
    process.exit(1);
  }
}

async function seedDataMysql() {
  const conn = await mysqlPool.getConnection();
  try {
    await conn.query(`
      INSERT IGNORE INTO departments (code, name) VALUES
      ('CO', 'Computer Engineering'),
      ('CE', 'Civil Engineering'),
      ('ME', 'Mechanical Engineering'),
      ('EE', 'Electrical Engineering'),
      ('ETC', 'Electronics & Telecommunication Engineering'),
      ('IT', 'Information Technology')
    `);

    await conn.query(`
      INSERT IGNORE INTO academic_years (year_label, is_current) VALUES ('2025-26', TRUE)
    `);

    const [[{ id: deptId }]] = await conn.query(`SELECT id FROM departments WHERE code = 'CO'`);
    const semWords = ['one', 'two', 'three', 'four', 'five', 'six'];
    for (let s = 1; s <= 6; s++) {
      const uName = `semester_${semWords[s - 1]}`;
      const uPass = `semester@${semWords[s - 1]}`;
      const pwHash = await bcrypt.hash(uPass, 10);
      await conn.query(`
        INSERT IGNORE INTO users (username, password_hash, name, department_id, semester) VALUES
        (?, ?, ?, ${deptId}, ?)
      `, [uName, pwHash, `Class Teacher - Sem ${s}`, s]);
    }

    await conn.query(`
      INSERT IGNORE INTO subjects (code, name, department_id, semester, type) VALUES
      ('311302', 'Basic Mathematics', ${deptId}, 1, 'theory'),
      ('311305', 'Basic Science', ${deptId}, 1, 'both'),
      ('311303', 'Communication Skills (English)', ${deptId}, 1, 'both'),
      ('311008', 'Engineering Graphics', ${deptId}, 1, 'both'),
      ('311002', 'Engineering Workshop Practice', ${deptId}, 1, 'practical'),
      ('311001', 'Fundamentals of ICT', ${deptId}, 1, 'both'),
      ('311003', 'Yoga and Meditation', ${deptId}, 1, 'both'),
      ('312301', 'Applied Mathematics', ${deptId}, 2, 'theory'),
      ('312302', 'Basic Electrical and Electronics Engineering', ${deptId}, 2, 'both'),
      ('312303', 'Programming in C', ${deptId}, 2, 'both'),
      ('312001', 'Linux Basics', ${deptId}, 2, 'practical'),
      ('312002', 'Professional Communication', ${deptId}, 2, 'theory'),
      ('312003', 'Social and Life Skills', ${deptId}, 2, 'theory'),
      ('312004', 'Web Page Designing', ${deptId}, 2, 'practical'),
      ('313304', 'Object Oriented Programming Using C++', ${deptId}, 3, 'both'),
      ('313303', 'Digital Techniques', ${deptId}, 3, 'both'),
      ('313301', 'Data Structure Using C', ${deptId}, 3, 'both'),
      ('313302', 'Database Management System', ${deptId}, 3, 'both'),
      ('313001', 'Computer Graphics', ${deptId}, 3, 'practical'),
      ('314317', 'Java Programming', ${deptId}, 4, 'both'),
      ('314318', 'Data Communication and Computer Network', ${deptId}, 4, 'both'),
      ('314321', 'Microprocessor Programming', ${deptId}, 4, 'both'),
      ('314301', 'Environmental Education and Sustainability', ${deptId}, 4, 'theory'),
      ('314004', 'Python Programming', ${deptId}, 4, 'practical'),
      ('314005', 'UI/UX Design', ${deptId}, 4, 'both'),
      ('315319', 'Operating System', ${deptId}, 5, 'both'),
      ('315323', 'Software Engineering', ${deptId}, 5, 'both'),
      ('315002', 'Entrepreneurship Development and Startups', ${deptId}, 5, 'theory'),
      ('315003', 'Seminar and Project Initiation Course', ${deptId}, 5, 'practical'),
      ('315004', 'Internship (12 Weeks)', ${deptId}, 5, 'practical'),
      ('315321', 'Advance Computer Network', ${deptId}, 5, 'both'),
      ('315325', 'Cloud Computing', ${deptId}, 5, 'both'),
      ('315326', 'Data Analytics', ${deptId}, 5, 'both'),
      ('315301', 'Management', ${deptId}, 6, 'theory'),
      ('316313', 'Emerging Trends in Computer Engg. and IT', ${deptId}, 6, 'theory'),
      ('316314', 'Software Testing', ${deptId}, 6, 'both'),
      ('316005', 'Client Side Scripting', ${deptId}, 6, 'both'),
      ('316006', 'Mobile Application Development', ${deptId}, 6, 'both'),
      ('316004', 'Capstone Project', ${deptId}, 6, 'practical'),
      ('316315', 'Digital Forensic and Hacking Techniques', ${deptId}, 6, 'both'),
      ('316316', 'Machine Learning', ${deptId}, 6, 'both'),
      ('316317', 'Network and Information Security', ${deptId}, 6, 'both')
    `);
    console.log('[DB] Seed: departments, academic year, users, CO subjects done');
  } catch (err) {
    if (!err.message.includes('Duplicate')) console.warn('[DB] Seed warning:', err.message);
  } finally {
    conn.release();
  }
}

function getPool() {
  if (isPostgres) {
    if (!pgPool) throw new Error('PostgreSQL database not initialized');
    return {
      getConnection: async () => {
        const client = await pgPool.connect();
        return {
          query: async (sql, params) => {
            const results = await executePgQuery(client, sql, params);
            return [results, []];
          },
          beginTransaction: async () => client.query('BEGIN'),
          commit: async () => client.query('COMMIT'),
          rollback: async () => client.query('ROLLBACK'),
          release: () => client.release(),
        };
      },
      query: (sql, params) => executePgQuery(pgPool, sql, params),
    };
  }

  if (!mysqlPool) throw new Error('MySQL database not initialized');
  return mysqlPool;
}

async function query(sql, params) {
  if (isPostgres) {
    return executePgQuery(pgPool, sql, params);
  }
  const [results] = await mysqlPool.query(sql, params);
  return results;
}

module.exports = { initializeDatabase, getPool, query };
