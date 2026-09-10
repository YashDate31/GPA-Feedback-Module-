const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();

const auth = require('../controllers/authController');
const meta = require('../controllers/metaController');
const session = require('../controllers/sessionController');
const allocation = require('../controllers/allocationController');
const { upload, getRoster, uploadRoster, deleteStudent, clearRoster, toggleStudentAccess, bulkToggleAccess } = require('../controllers/rosterController');
const feedback = require('../controllers/feedbackController');
const report = require('../controllers/reportController');

const JWT_SECRET = process.env.JWT_SECRET || 'msbte_feedback_2025';

// ── Auth Middleware ───────────────────────────────────────────
function requireAuth(req, res, next) {
  const header = req.headers['authorization'];
  if (!header) return res.status(401).json({ error: 'No token' });
  const token = header.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch (e) { res.status(401).json({ error: 'Invalid or expired token' }); }
}

// ── Public Routes ─────────────────────────────────────────────
router.get('/health', (req, res) => res.json({ status: 'ok', time: new Date() }));
router.post('/auth/login', auth.login);
router.get('/departments', meta.getDepartments);
router.get('/academic-years', meta.getAcademicYears);
router.get('/feedback/sessions-public', feedback.getActiveSessions);
router.post('/feedback/verify', feedback.verifyStudent);
router.post('/feedback/submit', feedback.submitFeedback);

// ── Protected Routes (Class Teacher) ─────────────────────────
router.use(requireAuth);  // All below require login

router.get('/auth/me', auth.me);

// Academic Years
router.post('/academic-years', meta.addAcademicYear);

// Subjects & Faculties
router.get('/subjects', meta.getSubjects);
router.post('/subjects', meta.addSubject);
router.patch('/subjects/:id/type', meta.updateSubjectType);
router.delete('/subjects/:id', meta.deleteSubject);
router.get('/faculties', meta.getFaculties);
router.post('/faculties', meta.addFaculty);
router.delete('/faculties/:id', meta.deleteFaculty);

// Sessions
router.get('/sessions', session.getSessions);
router.post('/sessions', session.createSession);
router.patch('/sessions/:id/status', session.updateSessionStatus);
router.delete('/sessions/:id', session.deleteSession);

// Allocations
router.get('/allocations', allocation.getAllocations);
router.post('/allocations', allocation.saveAllocation);
router.delete('/allocations/:id', allocation.deleteAllocation);

// Roster
router.get('/roster', getRoster);
router.post('/roster/upload', upload.single('file'), uploadRoster);
router.patch('/roster/:id/toggle', toggleStudentAccess);
router.post('/roster/bulk-status', bulkToggleAccess);
router.delete('/roster/clear', clearRoster);
router.delete('/roster/:id', deleteStudent);

// Reports + Download
router.get('/reports/session/:id', report.getSessionReport);
router.get('/reports/submissions', report.getSubmissions);
router.get('/reports/download/session/:id', report.downloadSessionExcel);

module.exports = router;
