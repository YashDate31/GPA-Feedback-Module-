require('dotenv').config();
const db = require('./index');

async function migrate() {
  await db.initializeDatabase();
  console.log('Running schema updates...');

  try {
    // 1. Update subjects table enum to include 'both'
    await db.query("ALTER TABLE subjects MODIFY COLUMN type ENUM('theory', 'practical', 'both', 'theory_practical') NOT NULL DEFAULT 'both'");
    await db.query("UPDATE subjects SET type = 'both' WHERE type = 'theory_practical'");
    await db.query("ALTER TABLE subjects MODIFY COLUMN type ENUM('theory', 'practical', 'both') NOT NULL DEFAULT 'both'");
    console.log('[Migration] subjects.type updated to ENUM(theory, practical, both)');

    // 2. Set MSBTE Sem 1 subjects according to official curriculum
    await db.query("UPDATE subjects SET type = 'both' WHERE code IN ('311303', '311505', '311001', '311008')");
    await db.query("UPDATE subjects SET type = 'theory' WHERE code IN ('311302')");
    await db.query("UPDATE subjects SET type = 'practical' WHERE code IN ('311002', '311003')");
    console.log('[Migration] Sem 1 subjects types updated to MSBTE curriculum');

    // 3. Make student_roster.batch allow ALL and default to ALL
    await db.query("ALTER TABLE student_roster MODIFY COLUMN batch VARCHAR(20) DEFAULT 'ALL'");
    console.log('[Migration] student_roster.batch updated to VARCHAR(20) DEFAULT ALL');

    console.log('All migrations completed successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

migrate();
