import React, { useEffect, useState } from 'react';
import { Users, ClipboardList, TrendingUp, Award, BookOpen, CheckCircle, Clock, XCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import API from '../../api/axios';
import { useNavigate } from 'react-router-dom';

export default function HODDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [years, setYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState('');
  const [report, setReport] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    API.get('/academic-years').then(r => {
      const ay = r.data.academic_years;
      setYears(ay);
      const cur = ay.find(y => y.is_current) || ay[0];
      if (cur) setSelectedYear(cur.id);
    });
  }, []);

  useEffect(() => {
    if (!selectedYear || !user?.department_id) return;
    setLoading(true);
    Promise.all([
      API.get(`/reports/department?department_id=${user.department_id}&academic_year_id=${selectedYear}`),
      API.get(`/sessions?department_id=${user.department_id}`),
    ]).then(([r, s]) => {
      setReport(r.data);
      setSessions(s.data.sessions);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [selectedYear, user]);

  const stats = [
    { label: 'Total Submissions', value: report?.total_submissions || 0, icon: <ClipboardList size={22} />, color: 'blue' },
    { label: 'Faculty Evaluated', value: report?.faculty_scores?.length || 0, icon: <Users size={22} />, color: 'green' },
    { label: 'Active Sessions', value: sessions.filter(s => s.status === 'active').length, icon: <CheckCircle size={22} />, color: 'amber' },
    { label: 'Dept Avg (/ 25)', value: report?.faculty_scores?.length
        ? (report.faculty_scores.reduce((a, f) => a + parseFloat(f.avg_marks || 0), 0) / report.faculty_scores.length).toFixed(2)
        : '—',
      icon: <TrendingUp size={22} />, color: 'green' },
  ];

  return (
    <div className="animate-fadeIn">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ marginBottom: 4 }}>Department Dashboard</h2>
          <p style={{ margin: 0 }}>Overview for {user?.dept_name} ({user?.dept_code})</p>
        </div>
        <select
          className="form-control"
          style={{ width: 'auto' }}
          value={selectedYear}
          onChange={e => setSelectedYear(e.target.value)}
        >
          {years.map(y => <option key={y.id} value={y.id}>{y.year_label}</option>)}
        </select>
      </div>

      {/* Stats Grid */}
      <div className="grid-4" style={{ marginBottom: 28 }}>
        {stats.map((s, i) => (
          <div key={i} className="stat-card animate-fadeIn" style={{ animationDelay: `${i * 80}ms` }}>
            <div className={`stat-icon ${s.color}`}>{s.icon}</div>
            <div>
              <div className="stat-value">{loading ? '...' : s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid-2" style={{ alignItems: 'start' }}>
        {/* Sessions */}
        <div className="card">
          <div className="card-header">
            <ClipboardList size={18} color="var(--primary-600)" />
            <h3>Recent Sessions</h3>
            <button className="btn btn-primary btn-sm" style={{ marginLeft: 'auto' }} onClick={() => navigate('/hod/sessions')}>
              Manage
            </button>
          </div>
          <div className="table-wrapper">
            {sessions.length === 0 ? (
              <div style={{ padding: '32px', textAlign: 'center', color: 'var(--gray-400)' }}>
                No sessions yet. Create one in Sessions tab.
              </div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Sem</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {sessions.slice(0, 6).map(s => (
                    <tr key={s.id}>
                      <td style={{ fontWeight: 500, maxWidth: 160 }} className="truncate">{s.title}</td>
                      <td>Sem {s.semester}</td>
                      <td>
                        <span className={`badge badge-${s.status === 'active' ? 'success' : s.status === 'closed' ? 'gray' : 'warning'}`}>
                          {s.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Top Faculty */}
        <div className="card">
          <div className="card-header">
            <Award size={18} color="var(--amber-600)" />
            <h3>Faculty Rankings</h3>
          </div>
          <div className="table-wrapper">
            {!report?.faculty_scores?.length ? (
              <div style={{ padding: '32px', textAlign: 'center', color: 'var(--gray-400)' }}>
                No feedback data yet.
              </div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Faculty</th>
                    <th>Avg / 25</th>
                    <th>Evals</th>
                  </tr>
                </thead>
                <tbody>
                  {report.faculty_scores.slice(0, 8).map((f, i) => (
                    <tr key={f.id}>
                      <td>
                        <span style={{ fontSize: 12, fontWeight: 700, color: i < 3 ? 'var(--amber-600)' : 'var(--gray-400)' }}>
                          #{i + 1}
                        </span>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{f.faculty_name}</div>
                        <div style={{ fontSize: 11, color: 'var(--gray-400)' }}>{f.designation}</div>
                      </td>
                      <td>
                        <span className={`badge ${parseFloat(f.avg_marks) >= 20 ? 'badge-success' : parseFloat(f.avg_marks) >= 15 ? 'badge-primary' : 'badge-warning'}`}>
                          {parseFloat(f.avg_marks || 0).toFixed(2)}
                        </span>
                      </td>
                      <td style={{ color: 'var(--gray-500)', fontSize: 13 }}>{f.total_evaluations}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Semester breakdown */}
      {report?.sessions?.length > 0 && (
        <div className="card" style={{ marginTop: 24 }}>
          <div className="card-header">
            <BookOpen size={18} color="var(--primary-600)" />
            <h3>Semester-wise Submission Count</h3>
          </div>
          <div className="card-body">
            <div className="grid-3">
              {report.sessions.map(s => (
                <div key={s.id} style={{ background: 'var(--gray-50)', borderRadius: 10, padding: '14px 18px', border: '1px solid var(--gray-100)' }}>
                  <div style={{ fontSize: 11, color: 'var(--gray-400)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>
                    Semester {s.semester}
                  </div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--gray-900)' }}>{s.submission_count}</div>
                  <div style={{ fontSize: 12, color: 'var(--gray-400)', marginTop: 4 }}>submissions</div>
                  <span className={`badge badge-${s.status === 'active' ? 'success' : s.status === 'closed' ? 'gray' : 'warning'}`} style={{ marginTop: 8 }}>
                    {s.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
