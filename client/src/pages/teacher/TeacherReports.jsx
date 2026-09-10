import { useEffect, useState } from 'react';
import { BarChart3, Download, CheckCircle, Clock, RefreshCw, Printer, Users } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import API from '../../api/axios';
import toast from 'react-hot-toast';

const PARAM_LABELS = [
  'Coverage of Syllabus','Topics Beyond Syllabus','Technical Content','Communication Skills',
  'Teaching Aids','Motivation','Practical Skills','Project & Seminar',
  'Student Progress Feedback','Punctuality','Domain Knowledge','Interaction',
  'Resolve Difficulties','Co-curricular','Extra-curricular','Internship Guidance',
];

export default function TeacherReports() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState('');
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('tracking');

  useEffect(() => {
    if (!user?.department_id) return;
    API.get(`/sessions?department_id=${user.department_id}`)
      .then(r => setSessions(r.data.sessions.filter(s => s.semester == user.semester)))
      .catch(() => {});
  }, [user]);

  const loadReport = async (sessionId) => {
    if (!sessionId) return;
    setLoading(true);
    setReport(null);
    try {
      const { data } = await API.get(`/reports/session/${sessionId}`);
      setReport(data);
    } catch (err) { toast.error(err.response?.data?.error || 'Failed'); }
    finally { setLoading(false); }
  };

  const handleSessionChange = (id) => { setSelectedSession(id); loadReport(id); };

  const handleDownloadExcel = () => {
    if (!selectedSession) { toast.error('Select a session first'); return; }
    window.open(`${API.defaults.baseURL}/reports/download/session/${selectedSession}`, '_blank');
  };

  const handlePrint = () => window.print();

  const participationPct = report
    ? Math.round((report.submitted.length / (report.roster_count || 1)) * 100)
    : 0;

  return (
    <div className="animate-fadeIn">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ marginBottom: 4 }}>Reports & Download</h2>
          <p style={{ margin: 0 }}>View feedback results and download Excel reports</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }} className="no-print">
          {report && (
            <>
              <button className="btn btn-success" onClick={handleDownloadExcel}><Download size={15} /> Download Excel</button>
              <button className="btn btn-secondary" onClick={handlePrint}><Printer size={15} /> Print</button>
            </>
          )}
        </div>
      </div>

      {/* Session selector */}
      <div className="card mb-24 no-print">
        <div className="card-body" style={{ display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div className="form-group mb-0" style={{ flex: 1 }}>
            <label className="form-label">Select Session</label>
            <select className="form-control" value={selectedSession} onChange={e => handleSessionChange(e.target.value)}>
              <option value="">— Select a session —</option>
              {sessions.map(s => <option key={s.id} value={s.id}>{s.title} · {s.status}</option>)}
            </select>
          </div>
          <button className="btn btn-secondary" onClick={() => loadReport(selectedSession)} disabled={!selectedSession || loading}>
            <RefreshCw size={15} className={loading ? 'spin' : ''} /> Refresh
          </button>
        </div>
      </div>

      {!selectedSession && !loading && (
        <div style={{ textAlign: 'center', padding: '60px 24px', color: 'var(--gray-400)' }}>
          <BarChart3 size={48} style={{ opacity: 0.3, marginBottom: 12 }} />
          <p>Select a feedback session to view results</p>
        </div>
      )}

      {loading && <div style={{ textAlign: 'center', padding: 40, color: 'var(--gray-400)' }}>Loading report...</div>}

      {report && !loading && (
        <>
          {/* Stats */}
          <div className="grid-3 mb-24">
            <div className="stat-card">
              <div className="stat-icon green"><CheckCircle size={22} /></div>
              <div><div className="stat-value">{report.submitted.length}</div><div className="stat-label">Submitted</div></div>
            </div>
            <div className="stat-card">
              <div className="stat-icon amber"><Clock size={22} /></div>
              <div><div className="stat-value">{report.pending.length}</div><div className="stat-label">Pending</div></div>
            </div>
            <div className="stat-card">
              <div className="stat-icon blue"><Users size={22} /></div>
              <div><div className="stat-value">{participationPct}%</div><div className="stat-label">Participation</div></div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="card mb-24">
            <div className="card-body">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontWeight: 600, color: 'var(--gray-700)' }}>Participation Rate</span>
                <span style={{ fontWeight: 700, color: 'var(--primary-700)' }}>{report.submitted.length} / {report.roster_count}</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${participationPct}%` }} />
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 20 }} className="no-print">
            {['tracking', 'results'].map(t => (
              <button key={t} className={`btn ${activeTab === t ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab(t)}>
                {t === 'tracking' ? '📋 Submission Tracking' : '📊 Faculty Results'}
              </button>
            ))}
          </div>

          {/* Submission Tracking */}
          {activeTab === 'tracking' && (
            <div className="grid-2">
              <div className="card">
                <div className="card-header"><CheckCircle size={16} color="var(--accent-600)" /><h3>Submitted ({report.submitted.length})</h3></div>
                <div className="table-wrapper" style={{ maxHeight: 400, overflowY: 'auto' }}>
                  {report.submitted.length === 0 ? <div style={{ padding: 24, textAlign: 'center', color: 'var(--gray-400)' }}>None yet</div> : (
                    <table><thead><tr><th>Enrollment</th><th>Name</th><th>Batch</th><th>Time</th></tr></thead>
                    <tbody>{report.submitted.map((s, i) => (
                      <tr key={i}>
                        <td><code style={{ fontSize: 11, background: 'var(--gray-100)', padding: '1px 5px', borderRadius: 3 }}>{s.enrollment_no}</code></td>
                        <td style={{ fontSize: 13 }}>{s.student_name}</td>
                        <td><span className="badge badge-success">{s.batch}</span></td>
                        <td style={{ fontSize: 11, color: 'var(--gray-400)' }}>{new Date(s.submitted_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</td>
                      </tr>
                    ))}</tbody></table>
                  )}
                </div>
              </div>
              <div className="card">
                <div className="card-header"><Clock size={16} color="var(--amber-600)" /><h3>Pending ({report.pending.length})</h3></div>
                <div className="table-wrapper" style={{ maxHeight: 400, overflowY: 'auto' }}>
                  {report.pending.length === 0 ? (
                    <div style={{ padding: 24, textAlign: 'center', color: 'var(--accent-600)', fontWeight: 600 }}>
                      <CheckCircle size={24} style={{ marginBottom: 8 }} /><div>All students submitted!</div>
                    </div>
                  ) : (
                    <table><thead><tr><th>Enrollment</th><th>Name</th></tr></thead>
                    <tbody>{report.pending.map((s, i) => (
                      <tr key={i}>
                        <td><code style={{ fontSize: 11, background: 'var(--amber-50)', padding: '1px 5px', borderRadius: 3, color: 'var(--amber-700)' }}>{s.enrollment_no}</code></td>
                        <td style={{ fontSize: 13 }}>{s.name}</td>
                      </tr>
                    ))}</tbody></table>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Faculty Results */}
          {activeTab === 'results' && (
            <div className="card">
              <div className="card-header"><BarChart3 size={18} color="var(--primary-600)" /><h3>Faculty Score Summary</h3>
                <button className="btn btn-success btn-sm" style={{ marginLeft: 'auto' }} onClick={handleDownloadExcel}>
                  <Download size={14} /> Download Excel
                </button>
              </div>
              <div className="table-wrapper">
                {report.faculty_reports.length === 0 ? (
                  <div style={{ padding: 40, textAlign: 'center', color: 'var(--gray-400)' }}>No responses received yet.</div>
                ) : (
                  <table>
                    <thead>
                      <tr>
                        <th>Faculty</th><th>Subject</th><th>Type</th><th>Batch</th>
                        {PARAM_LABELS.slice(0, 8).map((l, i) => <th key={i} title={l} style={{ fontSize: 10, minWidth: 36 }}>P{i+1}</th>)}
                        <th>Score /25</th><th>Evals</th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.faculty_reports.map((f, i) => (
                        <tr key={i}>
                          <td style={{ fontWeight: 600, whiteSpace: 'nowrap' }}>{f.faculty_name}</td>
                          <td style={{ fontSize: 12 }}>{f.subject_name}</td>
                          <td><span className={`badge badge-${f.allocation_type === 'theory' ? 'primary' : 'success'}`} style={{ fontSize: 10 }}>{f.allocation_type}</span></td>
                          <td>{f.batch !== 'ALL' ? <span className="badge badge-gray">{f.batch}</span> : '—'}</td>
                          {[f.p1,f.p2,f.p3,f.p4,f.p5,f.p6,f.p7,f.p8].map((v, pi) => (
                            <td key={pi} style={{ textAlign: 'center', fontSize: 12, color: v >= 4 ? 'var(--accent-700)' : v >= 3 ? 'var(--gray-700)' : 'var(--red-500)' }}>
                              {v ? parseFloat(v).toFixed(1) : '—'}
                            </td>
                          ))}
                          <td>
                            <span className={`badge ${parseFloat(f.avg_marks) >= 20 ? 'badge-success' : parseFloat(f.avg_marks) >= 15 ? 'badge-primary' : 'badge-warning'}`}>
                              {f.avg_marks ? parseFloat(f.avg_marks).toFixed(2) : '—'}
                            </span>
                          </td>
                          <td style={{ color: 'var(--gray-500)', textAlign: 'center' }}>{f.evaluation_count}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
