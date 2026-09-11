import React, { useEffect, useRef, useState } from 'react';
import { BarChart3, Printer, Download, Award, TrendingUp, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import API from '../../api/axios';
import toast from 'react-hot-toast';

const PARAM_NAMES = [
  'Coverage of syllabus',
  'Covering relevant topics beyond the syllabus',
  'Effectiveness - technical contents / course contents',
  'Effectiveness - communication skills',
  'Effectiveness - Teaching aids',
  'Motivation and inspiration for self-learning',
  'Student skills: Practical Performance',
  'Student skills: Project and Seminar preparation',
  'Feedback provided on student progress',
  'Punctuality and discipline',
  'Domain Knowledge',
  'Interaction with students',
  'Ability to resolve difficulties',
  'Encourage to participate in co-curricular activities',
  'Encourage to participate in Extracurricular activities',
  'Guidance during Internship',
];

function MsbteReport({ data }) {
  const { session, faculty_reports, total_submissions } = data;
  const today = new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="msbte-report" id="msbte-print-area">
      {/* MSBTE Header */}
      <div style={{ textAlign: 'right', fontSize: 10, marginBottom: 4 }}>
        <strong>CIAAN – 2023</strong><br />
        <strong>K15</strong>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, marginBottom: 2 }}>
        <span>For AICTE Diploma Engineering Courses</span>
        <span>wef – 2023-24</span>
      </div>
      <div style={{ textAlign: 'center', marginBottom: 12 }}>
        <div style={{ fontWeight: 400 }}>Maharashtra State Board of Technical Education</div>
        <div style={{ fontWeight: 700, textDecoration: 'underline', fontSize: 13 }}>STUDENT FEEDBACK</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 24px', fontSize: 11, marginBottom: 12 }}>
        <div>Institute Name: <strong>_______________________</strong></div>
        <div>Semester: <strong>{session.semester}</strong></div>
        <div>Academic Year: <strong>{session.year_label}</strong></div>
        <div>Date: <strong>{today}</strong></div>
        <div>Programme: <strong>{session.dept_name}</strong></div>
        <div></div>
      </div>

      {/* Faculty Reports */}
      {faculty_reports.map((f, fi) => (
        <div key={fi} style={{ marginBottom: 20, pageBreakInside: 'avoid' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 4 }}>
            <span>Name of the Faculty: <strong>{f.faculty_name}</strong></span>
            <span>Subject: <strong>{f.subject_name} ({f.subject_code})</strong></span>
            <span>Type: <strong>{f.allocation_type}</strong></span>
            {f.batch && f.batch !== 'ALL' && <span>Batch: <strong>{f.batch}</strong></span>}
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
            <thead>
              <tr>
                <th style={{ border: '1px solid #333', padding: '4px 8px', width: 40, textAlign: 'center' }}>Enrol. No.</th>
                <th style={{ border: '1px solid #333', padding: '4px 8px' }}>
                  Parameter<br />
                  <span style={{ fontWeight: 400 }}>(Each Parameter to be assessed on the scale of 1 to 5<br />1- Lowest & 5- Highest)</span>
                </th>
                <th style={{ border: '1px solid #333', padding: '4px 8px', width: 60, textAlign: 'center' }}>Max<br />Marks<br />25</th>
              </tr>
            </thead>
            <tbody>
              {PARAM_NAMES.map((pn, pi) => (
                <tr key={pi}>
                  <td style={{ border: '1px solid #333', padding: '3px 6px', textAlign: 'center', fontSize: 10 }}></td>
                  <td style={{ border: '1px solid #333', padding: '3px 8px', fontSize: 10 }}>{pn}</td>
                  <td style={{ border: '1px solid #333', padding: '3px 6px', textAlign: 'center', fontSize: 10 }}>
                    {f[`p${pi + 1}`] ? parseFloat(f[`p${pi + 1}`]).toFixed(1) : ''}
                  </td>
                </tr>
              ))}
              <tr style={{ fontWeight: 700 }}>
                <td colSpan={2} style={{ border: '1px solid #333', padding: '4px 8px' }}>TOTAL MARKS</td>
                <td style={{ border: '1px solid #333', padding: '4px 6px', textAlign: 'center' }}>
                  {f.avg_raw ? parseFloat(f.avg_raw).toFixed(1) : ''}
                </td>
              </tr>
              <tr>
                <td colSpan={2} style={{ border: '1px solid #333', padding: '4px 8px', fontWeight: 600 }}>MARKS OUT OF 25</td>
                <td style={{ border: '1px solid #333', padding: '4px 6px', textAlign: 'center', fontWeight: 700 }}>
                  {f.avg_marks ? parseFloat(f.avg_marks).toFixed(2) : ''}
                </td>
              </tr>
              <tr>
                <td colSpan={2} style={{ border: '1px solid #333', padding: '4px 8px' }}>Average Marks</td>
                <td style={{ border: '1px solid #333', padding: '4px 6px', textAlign: 'center' }}>
                  {f.avg_raw ? (parseFloat(f.avg_raw) / 16).toFixed(2) : ''}
                </td>
              </tr>
              <tr>
                <td colSpan={2} style={{ border: '1px solid #333', padding: '4px 8px' }}>Obtained out of 25</td>
                <td style={{ border: '1px solid #333', padding: '4px 6px', textAlign: 'center', fontWeight: 700, color: '#1e40af' }}>
                  {f.avg_marks ? parseFloat(f.avg_marks).toFixed(2) : ''}
                </td>
              </tr>
            </tbody>
          </table>
          <div style={{ fontSize: 10, marginTop: 6, fontStyle: 'italic', color: '#555' }}>
            Based on {f.evaluation_count} student evaluation(s).
          </div>
        </div>
      ))}

      <div style={{ marginTop: 16, fontSize: 10, fontStyle: 'italic', borderTop: '1px solid #333', paddingTop: 10 }}>
        <strong>Note:</strong> Institute as far as possible shall get developed appropriate Software tool to acquire feedback from student logins and accordingly provide suitable reports to faculty and Head of Programme. The tool developed must follow uniformly across the institutions, confidentiality and security in terms of access.
      </div>

      <div style={{ textAlign: 'right', marginTop: 24, fontSize: 11 }}>
        Signature of HoD<br />
        Name: ___________________
      </div>

      <div style={{ textAlign: 'center', marginTop: 20, borderTop: '1px solid #aaa', paddingTop: 8, fontSize: 10, color: '#666' }}>
        Maharashtra State Board of Technical Education, Mumbai
      </div>
    </div>
  );
}

export default function HODReports() {
  const { user } = useAuth();
  const [years, setYears] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedSession, setSelectedSession] = useState('');
  const [report, setReport] = useState(null);
  const [sessionReport, setSessionReport] = useState(null);
  const [deptReport, setDeptReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('dept');
  const printRef = useRef();

  useEffect(() => {
    Promise.all([API.get('/academic-years'), API.get(`/sessions?department_id=${user.department_id}`)]).then(([y, s]) => {
      const ay = y.data.academic_years;
      setYears(ay);
      setSessions(s.data.sessions);
      const cur = ay.find(a => a.is_current) || ay[0];
      if (cur) setSelectedYear(cur.id);
    });
  }, []);

  useEffect(() => {
    if (!selectedYear) return;
    setLoading(true);
    API.get(`/reports/department?department_id=${user.department_id}&academic_year_id=${selectedYear}`)
      .then(r => setDeptReport(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [selectedYear]);

  const loadSessionReport = async () => {
    if (!selectedSession) { toast.error('Select a session'); return; }
    setLoading(true);
    try {
      const { data } = await API.get(`/reports/session/${selectedSession}`);
      setSessionReport(data);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to load report');
    } finally { setLoading(false); }
  };

  const handlePrint = () => { window.print(); };

  return (
    <div className="animate-fadeIn">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ marginBottom: 4 }}>Reports & Analytics</h2>
          <p style={{ margin: 0 }}>Faculty feedback results and official MSBTE CIAAN-2023 reports</p>
        </div>
        {sessionReport && (
          <button className="btn btn-primary no-print" onClick={handlePrint}>
            <Printer size={16} /> Print MSBTE Report
          </button>
        )}
      </div>

      {/* Tab Switcher */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }} className="no-print">
        {[
          { key: 'dept', label: 'Department Analytics', icon: <TrendingUp size={15} /> },
          { key: 'msbte', label: 'MSBTE Official Report', icon: <Printer size={15} /> },
        ].map(tab => (
          <button key={tab.key} className={`btn ${activeTab === tab.key ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab(tab.key)}>
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Department Analytics */}
      {activeTab === 'dept' && (
        <div>
          <div className="card mb-24">
            <div className="card-body">
              <div className="grid-2">
                <div className="form-group mb-0">
                  <label className="form-label">Academic Year</label>
                  <select className="form-control" value={selectedYear} onChange={e => setSelectedYear(e.target.value)}>
                    {years.map(y => <option key={y.id} value={y.id}>{y.year_label}</option>)}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {loading && <div style={{ textAlign: 'center', padding: 40, color: 'var(--gray-400)' }}>Loading report...</div>}

          {deptReport && !loading && (
            <>
              <div className="grid-2" style={{ marginBottom: 24 }}>
                <div className="stat-card">
                  <div className="stat-icon blue"><BarChart3 size={22} /></div>
                  <div>
                    <div className="stat-value">{deptReport.total_submissions}</div>
                    <div className="stat-label">Total Feedback Submissions</div>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon green"><Award size={22} /></div>
                  <div>
                    <div className="stat-value">
                      {deptReport.faculty_scores?.length
                        ? (deptReport.faculty_scores.reduce((a, f) => a + parseFloat(f.avg_marks || 0), 0) / deptReport.faculty_scores.length).toFixed(2)
                        : '—'}
                    </div>
                    <div className="stat-label">Department Avg Score (/ 25)</div>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="card-header">
                  <Award size={18} color="var(--amber-600)" />
                  <h3>Faculty Performance</h3>
                </div>
                <div className="table-wrapper">
                  {deptReport.faculty_scores?.length === 0 ? (
                    <div style={{ padding: 40, textAlign: 'center', color: 'var(--gray-400)' }}>No feedback data yet.</div>
                  ) : (
                    <table>
                      <thead>
                        <tr>
                          <th>Rank</th>
                          <th>Faculty Name</th>
                          <th>Designation</th>
                          <th>Avg Score / 25</th>
                          <th>Avg Raw / 80</th>
                          <th>Evaluations</th>
                        </tr>
                      </thead>
                      <tbody>
                        {deptReport.faculty_scores?.map((f, i) => (
                          <tr key={f.id}>
                            <td>
                              <span style={{ fontWeight: 800, color: i === 0 ? '#f59e0b' : i === 1 ? '#94a3b8' : i === 2 ? '#cd7c2f' : 'var(--gray-400)' }}>
                                #{i + 1}
                              </span>
                            </td>
                            <td style={{ fontWeight: 600 }}>{f.faculty_name}</td>
                            <td style={{ color: 'var(--gray-500)', fontSize: 13 }}>{f.designation}</td>
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <div style={{ flex: 1, height: 6, background: 'var(--gray-100)', borderRadius: 99, overflow: 'hidden', minWidth: 60 }}>
                                  <div style={{ width: `${(f.avg_marks / 25) * 100}%`, height: '100%', background: 'linear-gradient(90deg, var(--primary-500), var(--primary-600))', borderRadius: 99 }} />
                                </div>
                                <span style={{ fontWeight: 700, color: 'var(--primary-700)', minWidth: 36 }}>{parseFloat(f.avg_marks || 0).toFixed(2)}</span>
                              </div>
                            </td>
                            <td style={{ color: 'var(--gray-600)' }}>{parseFloat(f.avg_raw || 0).toFixed(1)}</td>
                            <td style={{ color: 'var(--gray-500)' }}>{f.total_evaluations}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* MSBTE Official Report */}
      {activeTab === 'msbte' && (
        <div>
          <div className="card mb-24 no-print">
            <div className="card-body">
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }}>
                <div className="form-group mb-0" style={{ flex: 1 }}>
                  <label className="form-label">Select Session</label>
                  <select className="form-control" value={selectedSession} onChange={e => setSelectedSession(e.target.value)}>
                    <option value="">— Choose a closed/active session —</option>
                    {sessions.filter(s => s.status !== 'draft').map(s => (
                      <option key={s.id} value={s.id}>{s.title} (Sem {s.semester}) · {s.status}</option>
                    ))}
                  </select>
                </div>
                <button className="btn btn-primary" onClick={loadSessionReport} disabled={loading}>
                  {loading ? 'Loading...' : 'Generate Report'}
                </button>
              </div>
            </div>
          </div>

          {sessionReport ? (
            <>
              <div className="alert alert-info mb-16 no-print">
                <Printer size={16} style={{ flexShrink: 0 }} />
                <span>MSBTE CIAAN-2023 K15 report ready. Click "Print MSBTE Report" button to print or save as PDF.</span>
              </div>
              <MsbteReport data={sessionReport} />
            </>
          ) : (
            !loading && (
              <div style={{ textAlign: 'center', padding: '60px 24px', color: 'var(--gray-400)' }}>
                <BarChart3 size={48} style={{ opacity: 0.3, marginBottom: 12 }} />
                <p>Select a session and click "Generate Report" to view the official MSBTE feedback report.</p>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}
