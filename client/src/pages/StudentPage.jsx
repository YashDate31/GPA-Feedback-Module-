import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, ChevronRight, CheckCircle, AlertCircle, ArrowLeft, BookOpen } from 'lucide-react';
import API from '../api/axios';
import toast from 'react-hot-toast';

const PARAM_LABELS = [
  'Coverage of syllabus',
  'Covering relevant topics beyond the syllabus',
  'Effectiveness in terms of technical contents / course contents',
  'Effectiveness in terms of communication skills',
  'Effectiveness in terms of Teaching aids',
  'Motivation and inspiration for students to learn in self-learning mode',
  'Support for development of student skills: Practical Performance',
  'Support for development of student skills: Project and Seminar preparation',
  'Feedback provided on student progress',
  'Punctuality and discipline',
  'Domain Knowledge',
  'Interaction with students',
  'Ability to resolve difficulties',
  'Encourage to participate in co-curricular activities',
  'Encourage to participate in Extra-curricular activities',
  'Guidance during Internship',
];
const PARAM_KEYS = [
  'p1_coverage_syllabus','p2_topics_beyond','p3_technical_content','p4_communication',
  'p5_teaching_aids','p6_motivation','p7_practical_skills','p8_project_skills',
  'p9_student_progress','p10_punctuality','p11_domain_knowledge','p12_interaction',
  'p13_resolve_difficulties','p14_cocurricular','p15_extracurricular','p16_internship',
];
const DEFAULT_DEPARTMENTS = [
  { id: 1, code: 'CO', name: 'Computer Engineering' },
  { id: 2, code: 'CE', name: 'Civil Engineering' },
  { id: 3, code: 'ME', name: 'Mechanical Engineering' },
  { id: 4, code: 'EE', name: 'Electrical Engineering' },
  { id: 5, code: 'ETC', name: 'Electronics & Telecommunication Engineering' },
  { id: 6, code: 'IT', name: 'Information Technology' },
];

function getInitialDepartments() {
  try {
    const cached = localStorage.getItem('gpa_cached_depts');
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {}
  return DEFAULT_DEPARTMENTS;
}

const RATING_LABELS = { 1: 'Very Poor', 2: 'Poor', 3: 'Average', 4: 'Good', 5: 'Excellent' };

// ─── Step 1: Student Info ───────────────────────────────────
function StepInfo({ onVerified }) {
  const [form, setForm] = useState({ enrollment_no: '', semester: '', batch: '', department_id: '' });
  const [departments, setDepartments] = useState(getInitialDepartments);
  const [sessions, setSessions] = useState([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [selectedSession, setSelectedSession] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    API.get('/departments')
      .then(r => {
        if (r.data?.departments?.length) {
          setDepartments(r.data.departments);
          try { localStorage.setItem('gpa_cached_depts', JSON.stringify(r.data.departments)); } catch (e) {}
        }
      })
      .catch(() => {});
  }, []);

  const handleSemBatchChange = (field, val) => {
    const updated = { ...form, [field]: val };
    setForm(updated);
    setSessions([]);
    setSelectedSession('');
    if (updated.department_id && updated.semester) {
      setSessionsLoading(true);
      API.get(`/feedback/sessions-public?department_id=${updated.department_id}&semester=${updated.semester}`)
        .then(r => {
          const list = r.data.sessions || [];
          setSessions(list);
          if (list.length === 1) {
            setSelectedSession(list[0].id);
          }
        })
        .catch(() => {})
        .finally(() => setSessionsLoading(false));
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!form.department_id) { toast.error('Please select your Department'); return; }
    if (!form.semester) { toast.error('Please select your Semester'); return; }
    if (!form.batch) { toast.error('Please select your Practical Batch (B1, B2, or B3)'); return; }
    if (!selectedSession) { toast.error('Please select an active Feedback Session'); return; }
    if (!form.enrollment_no || !form.enrollment_no.trim()) { toast.error('Please enter your Enrollment Number'); return; }

    setLoading(true);
    try {
      const { data } = await API.post('/feedback/verify', { ...form, session_id: selectedSession });
      onVerified(data);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Verification failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="feedback-form-wrap">
      <div className="gform-header">
        <div className="gform-logo"><img src="/logo.png" alt="Government Polytechnic Awasari (Kh) Logo" /></div>
        <div>
          <h1>Student Feedback Form</h1>
          <p>Government Polytechnic Awasari (Kh) · MSBTE Faculty Feedback Portal</p>
        </div>
      </div>

      <div className="gform-card gform-intro">
        <p>This feedback is collected to evaluate faculty performance as per MSBTE norms. Please rate each faculty member honestly on 16 parameters (scale 1–5). Your response is confidential.</p>
        <ul>
          <li>Enter your enrollment number exactly as on your ID card</li>
          <li>One submission allowed per session</li>
          <li>All parameters must be rated for each faculty (Guidance during Internship is compulsory for Sem 5 & 6)</li>
        </ul>
      </div>

      <form onSubmit={handleVerify} noValidate>
        <div className="gform-card">
          <div className="gform-q-label">Select Department <span className="req">*</span></div>
          <select className="gform-select" value={form.department_id} onChange={e => handleSemBatchChange('department_id', e.target.value)} required>
            <option value="">— Select Department —</option>
            {departments.map(d => <option key={d.id} value={d.id}>{d.name} ({d.code})</option>)}
          </select>
        </div>

        <div className="gform-card">
          <div className="gform-q-label">Select Semester <span className="req">*</span></div>
          <div className="gform-radio-grid">
            {[1,2,3,4,5,6].map(s => (
              <label
                key={s}
                className={`gform-radio-opt ${form.semester == s ? 'selected' : ''}`}
                onClick={() => handleSemBatchChange('semester', s)}
              >
                <input
                  type="radio"
                  name="semester"
                  value={s}
                  checked={form.semester == s}
                  onChange={() => handleSemBatchChange('semester', s)}
                />
                Semester {s}
              </label>
            ))}
          </div>
        </div>

        <div className="gform-card">
          <div className="gform-q-label">Select Practical Batch <span className="req">*</span></div>
          <div className="gform-radio-row">
            {['B1','B2','B3'].map(b => (
              <label
                key={b}
                className={`gform-radio-opt ${form.batch === b ? 'selected' : ''}`}
                onClick={() => setForm(f => ({ ...f, batch: b }))}
              >
                <input
                  type="radio"
                  name="batch"
                  value={b}
                  checked={form.batch === b}
                  onChange={() => setForm(f => ({ ...f, batch: b }))}
                />
                Batch {b}
              </label>
            ))}
          </div>
          <div className="gform-hint">Select your practical batch to evaluate the faculty assigned to your practical sessions</div>
        </div>

        {sessions.length > 0 && (
          <div className="gform-card">
            <div className="gform-q-label">Select Feedback Session <span className="req">*</span></div>
            <div className="gform-radio-col">
              {sessions.map(s => (
                <label
                  key={s.id}
                  className={`gform-radio-opt ${selectedSession == s.id ? 'selected' : ''}`}
                  onClick={() => setSelectedSession(s.id)}
                >
                  <input
                    type="radio"
                    name="session"
                    value={s.id}
                    checked={selectedSession == s.id}
                    onChange={() => setSelectedSession(s.id)}
                  />
                  {s.title} · {s.year_label}
                </label>
              ))}
            </div>
          </div>
        )}

        {sessionsLoading && (
          <div className="gform-card" style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--primary-600)', fontSize: 13, padding: '14px 18px' }}>
            <div style={{ width: 14, height: 14, border: '2px solid var(--primary-600)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            Checking active feedback sessions...
          </div>
        )}

        {!sessionsLoading && form.department_id && form.semester && sessions.length === 0 && (
          <div className="gform-card gform-alert">
            <AlertCircle size={16} /> No active feedback session found for this department & semester. Contact your class teacher.
          </div>
        )}

        <div className="gform-card">
          <div className="gform-q-label">Enrollment Number <span className="req">*</span></div>
          <input className="gform-input" placeholder="e.g. 24210270001" value={form.enrollment_no}
            onChange={e => setForm(f => ({ ...f, enrollment_no: e.target.value.toUpperCase().trim() }))} />
          <div className="gform-hint">Enter your MSBTE enrollment number exactly as on your ID card</div>
        </div>

        <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginTop: 8 }}>
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/')}>
            <ArrowLeft size={15} /> Back
          </button>
          <button type="submit" className="gform-next-btn" disabled={loading} id="verify-btn">
            {loading ? 'Verifying...' : 'Next — Fill Feedback'} <ChevronRight size={17} />
          </button>
        </div>
      </form>
    </div>
  );
}

const RATING_TIERS = [
  { val: 1, label: 'V. Poor' },
  { val: 2, label: 'Poor' },
  { val: 3, label: 'Average' },
  { val: 4, label: 'Good' },
  { val: 5, label: 'Excellent' },
];

// ─── Rating Widget (Mobile-First Touch Grid) ────────────────
function RatingRow({ label, paramKey, value, onChange, idx, isOptional }) {
  const isSelected = !!value;
  return (
    <div className={`mobile-rating-card ${isSelected ? 'completed' : ''}`}>
      <div className="rating-card-top">
        <div className={`rating-num-badge ${isSelected ? 'done' : ''}`}>
          {idx}
        </div>
        <div className="rating-question-text">
          {label}
          {isOptional ? (
            <span className="rating-opt-tag">Optional</span>
          ) : (
            <span style={{ color: '#ef4444', marginLeft: 4, fontWeight: 700 }}>*</span>
          )}
        </div>
      </div>

      <div className="rating-touch-grid">
        {RATING_TIERS.map(({ val, label: tLabel }) => {
          const active = value == val;
          return (
            <button
              key={val}
              type="button"
              className={`rating-touch-btn ${active ? `selected selected-${val}` : ''}`}
              onClick={() => onChange(paramKey, active ? '' : val)}
              aria-label={`${label}: ${val} - ${tLabel}`}
            >
              <span className="rtb-num">{val}</span>
              <span className="rtb-label">{tLabel}</span>
            </button>
          );
        })}
      </div>

      {isOptional && value && (
        <div style={{ textAlign: 'right', marginTop: 4 }}>
          <button
            type="button"
            className="rating-clear-opt"
            onClick={() => onChange(paramKey, '')}
          >
            Clear (skip this point)
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Step 2: Feedback Form (Faculty-by-Faculty Flow) ────────
function StepFeedback({ verifyData, onSubmitted }) {
  const { student, session } = verifyData;
  const [scores, setScores] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);

  // Group allocations for the same subject and same faculty into a single evaluation item
  const allocations = useMemo(() => {
    const map = new Map();
    const list = [];
    for (const a of (verifyData.allocations || [])) {
      const key = `${a.subject_id}_${a.faculty_id}`;
      if (!map.has(key)) {
        const item = {
          ...a,
          allocation_ids: [a.id],
          is_both: false,
          types: [a.allocation_type],
          batch_list: a.batch && a.batch !== 'ALL' ? [a.batch] : []
        };
        map.set(key, item);
        list.push(item);
      } else {
        const existing = map.get(key);
        existing.allocation_ids.push(a.id);
        if (!existing.types.includes(a.allocation_type)) {
          existing.types.push(a.allocation_type);
        }
        if (a.batch && a.batch !== 'ALL' && !existing.batch_list.includes(a.batch)) {
          existing.batch_list.push(a.batch);
        }
        if (existing.types.includes('theory') && existing.types.includes('practical')) {
          existing.is_both = true;
          existing.allocation_type = 'both';
        }
      }
    }
    return list;
  }, [verifyData.allocations]);

  const setRating = (allocId, paramKey, val) => {
    setScores(prev => ({ ...prev, [allocId]: { ...(prev[allocId] || {}), [paramKey]: val } }));
  };

  const isInternshipCompulsory = [5, 6, '5', '6'].includes(session?.semester);
  const requiredParamKeys = isInternshipCompulsory ? PARAM_KEYS : PARAM_KEYS.filter(k => k !== 'p16_internship');

  // For Semester 5 & 6, all 16 parameters are compulsory. For Semester 1-4, parameters 1 to 15 are compulsory.
  const isSectionComplete = (allocId) => {
    const s = scores[allocId] || {};
    return requiredParamKeys.every(k => s[k]);
  };

  const currentAlloc = allocations[currentIdx];
  const isCurrentComplete = currentAlloc ? isSectionComplete(currentAlloc.id) : false;
  const allComplete = allocations.every(a => isSectionComplete(a.id));

  const handleNextFaculty = () => {
    if (!isCurrentComplete) {
      const currentScores = scores[currentAlloc.id] || {};
      const missingKey = requiredParamKeys.find(k => !currentScores[k]);
      if (missingKey) {
        const missingIndex = PARAM_KEYS.indexOf(missingKey);
        toast.error(`Please rate parameter ${missingIndex + 1}: "${PARAM_LABELS[missingIndex]}"`);
      }
      return;
    }
    if (currentIdx < allocations.length - 1) {
      setCurrentIdx(i => i + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevFaculty = () => {
    if (currentIdx > 0) {
      setCurrentIdx(i => i - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmit = async () => {
    if (!allComplete) {
      toast.error(
        isInternshipCompulsory
          ? 'Please rate all 16 parameters (including Guidance during Internship) for every faculty'
          : 'Please complete compulsory parameters (1 to 15) for every faculty'
      );
      return;
    }
    setSubmitting(true);

    // Expand scores to cover all underlying allocation_ids for theory + practical
    const expandedScores = {};
    for (const item of allocations) {
      const itemScores = scores[item.id] || {};
      for (const allocId of (item.allocation_ids || [item.id])) {
        expandedScores[allocId] = { ...itemScores };
      }
    }

    try {
      const { data } = await API.post('/feedback/submit', {
        session_id: session.id,
        enrollment_no: student.enrollment_no,
        student_name: student.name,
        department_id: session.department_id || verifyData.department_id || allocations[0]?.department_id,
        semester: session.semester,
        batch: student.batch,
        scores: expandedScores,
      });
      onSubmitted(data.reference_code);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Submission failed');
    } finally { setSubmitting(false); }
  };

  const completedCount = allocations.filter(a => isSectionComplete(a.id)).length;
  const currentSectionScores = currentAlloc ? (scores[currentAlloc.id] || {}) : {};

  return (
    <div className="feedback-form-wrap">
      <div className="gform-header">
        <div className="gform-logo"><img src="/logo.png" alt="Government Polytechnic Awasari (Kh) Logo" /></div>
        <div>
          <h1>Student Feedback Form</h1>
          <p>Govt. Polytechnic Awasari (Kh) · {session.title} · Sem {session.semester} · {session.year_label}</p>
        </div>
      </div>

      {/* Student Info Card */}
      <div className="gform-card gform-student-info">
        <div className="gsi-row">
          <div><span className="gsi-label">Student Name</span><span className="gsi-val">{student.name}</span></div>
          <div><span className="gsi-label">Enrollment No.</span><span className="gsi-val">{student.enrollment_no}</span></div>
          <div><span className="gsi-label">Batch</span><span className="gsi-val">{student.batch}</span></div>
        </div>
      </div>

      {/* Faculty Step Navigation */}
      <div className="gform-card" style={{ padding: '14px 18px', background: '#f8fafc' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, flexWrap: 'wrap', gap: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--gray-700)' }}>
            Evaluation Progress: {completedCount} of {allocations.length} Completed
          </span>
          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--primary-600)' }}>
            Faculty {currentIdx + 1} of {allocations.length}
          </span>
        </div>

        {/* Step Buttons */}
        <div className="no-scrollbar" style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 6, scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {allocations.map((a, i) => {
            const done = isSectionComplete(a.id);
            const active = currentIdx === i;
            const modeBadge = a.is_both || a.allocation_type === 'both'
              ? ' (TH & PR)'
              : a.allocation_type === 'theory'
              ? ' (TH)'
              : ` (PR${a.batch && a.batch !== 'ALL' ? ` - ${a.batch}` : ''})`;
            return (
              <button
                key={a.id}
                type="button"
                onClick={() => { setCurrentIdx(i); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '6px 12px',
                  borderRadius: 20,
                  fontSize: 12,
                  fontWeight: 600,
                  border: active ? '2px solid var(--primary-600)' : done ? '1.5px solid #10b981' : '1.5px solid var(--gray-300)',
                  background: active ? 'var(--primary-50)' : done ? '#ecfdf5' : '#fff',
                  color: active ? 'var(--primary-700)' : done ? '#047857' : 'var(--gray-600)',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease',
                }}
              >
                <span>{i + 1}. {a.subject_name}{modeBadge}</span>
                {done && <CheckCircle size={13} color="#10b981" />}
              </button>
            );
          })}
        </div>

        {/* Progress Bar */}
        <div className="gform-progress-bar" style={{ marginTop: 10 }}>
          <div className="gform-progress-fill" style={{ width: `${(completedCount / allocations.length) * 100}%` }} />
        </div>
      </div>

      {/* Highlighted Faculty & Subject Hero Card */}
      {currentAlloc && (
        <div className="faculty-hero-card animate-fadeIn" key={currentAlloc.id}>
          {/* Top Subject Banner */}
          <div className="faculty-hero-banner">
            <div className="f-subj-group">
              <span className="f-subj-badge">
                <BookOpen size={13} /> Subject
              </span>
              <div className="f-subj-title">
                <span>{currentAlloc.subject_name}</span>
                <span className="f-subj-code">Code: {currentAlloc.subject_code}</span>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div className="f-step-counter">
                Faculty {currentIdx + 1} of {allocations.length}
              </div>
              {isCurrentComplete && (
                <div style={{ background: '#10b981', color: '#fff', borderRadius: '50%', width: 26, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CheckCircle size={17} />
                </div>
              )}
            </div>
          </div>

          {/* Faculty Details Row */}
          <div className="faculty-details-row">
            <div className="f-teacher-info">
              <div className="f-teacher-avatar">
                {currentAlloc.faculty_name
                  ? currentAlloc.faculty_name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
                  : 'FAC'}
              </div>
              <div className="f-teacher-meta">
                <span className="f-teacher-label">Evaluating Faculty</span>
                <div className="f-teacher-name">{currentAlloc.faculty_name}</div>
                {currentAlloc.designation && (
                  <div className="f-teacher-desig">{currentAlloc.designation}</div>
                )}
              </div>
            </div>

            {/* Teaching Mode Badge */}
            <div className={`f-mode-pill ${currentAlloc.is_both || currentAlloc.allocation_type === 'both' ? 'both' : currentAlloc.allocation_type}`}>
              {currentAlloc.is_both || currentAlloc.allocation_type === 'both' ? (
                <>
                  <span style={{ fontSize: 13 }}>📚🔬</span>
                  <span>Theory & Practical{currentAlloc.batch_list?.length ? ` (Batch ${currentAlloc.batch_list.join(', ')})` : ''}</span>
                </>
              ) : currentAlloc.allocation_type === 'theory' ? (
                <>
                  <span style={{ fontSize: 13 }}>📖</span>
                  <span>Theory (All Students)</span>
                </>
              ) : (
                <>
                  <span style={{ fontSize: 13 }}>🔬</span>
                  <span>Practical (Batch {currentAlloc.batch})</span>
                </>
              )}
            </div>
          </div>

          {/* Scale Legend Header & Question Cards */}
          <div style={{ padding: '16px 16px 4px' }}>
            <div className="gform-scale-legend">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <span style={{ fontWeight: 700, color: '#1e293b', fontSize: 13 }}>
                  Rate each parameter on 1 to 5 scale:
                </span>
                <span style={{ fontSize: 12, color: '#64748b' }}>
                  (1 = Very Poor &bull; 5 = Excellent)
                </span>
              </div>
              {isInternshipCompulsory ? (
                <span style={{ fontSize: 11.5, background: '#e0e7ff', color: '#4338ca', fontWeight: 600, padding: '3px 10px', borderRadius: 12, display: 'inline-block' }}>
                  All 16 parameters compulsory for Sem {session.semester}
                </span>
              ) : (
                <span style={{ fontSize: 11.5, background: '#ffffff', color: '#64748b', padding: '3px 10px', borderRadius: 12, border: '1px solid #cbd5e1', display: 'inline-block' }}>
                  Point 16 is optional
                </span>
              )}
            </div>

            {/* Touch Ratings List */}
            <div className="rating-card-list">
              {PARAM_LABELS.map((label, pi) => {
                const pKey = PARAM_KEYS[pi];
                const isOpt = pKey === 'p16_internship' && !isInternshipCompulsory;
                return (
                  <RatingRow
                    key={pi}
                    idx={pi + 1}
                    label={label}
                    paramKey={pKey}
                    value={currentSectionScores[pKey] || ''}
                    onChange={(k, v) => setRating(currentAlloc.id, k, v)}
                    isOptional={isOpt}
                  />
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 24, gap: 12 }}>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={handlePrevFaculty}
          disabled={currentIdx === 0}
          style={{ visibility: currentIdx === 0 ? 'hidden' : 'visible' }}
        >
          <ArrowLeft size={16} /> Previous Faculty
        </button>

        {currentIdx < allocations.length - 1 ? (
          <button
            type="button"
            className="btn btn-primary"
            style={{ padding: '12px 24px', fontSize: 14 }}
            onClick={handleNextFaculty}
          >
            Next Faculty ({currentIdx + 2}/{allocations.length}) <ChevronRight size={16} />
          </button>
        ) : (
          <button
            type="button"
            className={`gform-submit-btn ${allComplete ? 'ready' : ''}`}
            onClick={handleSubmit}
            disabled={submitting || !allComplete}
            id="submit-feedback-btn"
          >
            {submitting ? 'Submitting...' : 'Submit Feedback'}
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Step 3: Thank You ──────────────────────────────────────
function StepDone({ refCode }) {
  const navigate = useNavigate();
  return (
    <div className="feedback-form-wrap">
      <div className="gform-card gform-done">
        <div className="gform-done-icon"><CheckCircle size={56} /></div>
        <h2>Feedback Submitted Successfully!</h2>
        <p>Thank you for your valuable feedback. Your response has been recorded.</p>
        <div className="gform-ref">
          Reference Code: <strong>{refCode}</strong>
        </div>
        <div>
          <button className="btn btn-primary" onClick={() => navigate('/')}>Back to Home</button>
        </div>
        <div style={{ marginTop: 24, fontSize: 12, color: 'var(--gray-500)', borderTop: '1px solid var(--gray-200)', paddingTop: 16 }}>
          Government Polytechnic Awasari (Khurd) · MSBTE CIAAN-2023 K-Scheme
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ──────────────────────────────────────────────
export default function StudentPage() {
  const [step, setStep] = useState('info');
  const [verifyData, setVerifyData] = useState(null);
  const [refCode, setRefCode] = useState('');

  if (step === 'info') return <StepInfo onVerified={d => { setVerifyData(d); setStep('form'); }} />;
  if (step === 'form') return <StepFeedback verifyData={verifyData} onSubmitted={r => { setRefCode(r); setStep('done'); }} />;
  if (step === 'done') return <StepDone refCode={refCode} />;
}
