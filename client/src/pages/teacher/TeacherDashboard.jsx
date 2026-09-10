import { useEffect, useState } from 'react';
import { ClipboardList, Users, CheckCircle, Clock, BarChart3, BookOpen } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import API from '../../api/axios';

export default function TeacherDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.department_id) return;
    API.get(`/sessions?department_id=${user.department_id}`)
      .then(r => setSessions(r.data.sessions.filter(s => s.semester == user.semester)))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  const active = sessions.filter(s => s.status === 'active');
  const totalSubs = sessions.reduce((a, s) => a + (s.submission_count || 0), 0);

  const stats = [
    { label: 'Total Sessions', value: sessions.length, icon: <ClipboardList size={22} />, color: 'blue', link: '/teacher/sessions' },
    { label: 'Active Sessions', value: active.length, icon: <CheckCircle size={22} />, color: 'green', link: '/teacher/sessions' },
    { label: 'Total Submissions', value: totalSubs, icon: <Users size={22} />, color: 'amber', link: '/teacher/reports' },
  ];

  return (
    <div className="animate-fadeIn">
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ marginBottom: 4 }}>Dashboard</h2>
        <p style={{ margin: 0 }}>{user?.dept_name} · Semester {user?.semester} · {user?.name}</p>
      </div>

      <div className="grid-3" style={{ marginBottom: 28 }}>
        {stats.map((s, i) => (
          <div key={i} className="stat-card" style={{ cursor: 'pointer' }} onClick={() => navigate(s.link)}>
            <div className={`stat-icon ${s.color}`}>{s.icon}</div>
            <div>
              <div className="stat-value">{loading ? '—' : s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-header"><BarChart3 size={18} color="var(--primary-600)" /><h3>Quick Actions</h3></div>
        <div className="card-body">
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {[
              { label: '+ New Session', link: '/teacher/sessions', desc: 'Create a feedback session' },
              { label: 'Assign Faculty', link: '/teacher/allocations', desc: 'Allocate faculty to subjects' },
              { label: 'Upload Roster', link: '/teacher/roster', desc: 'Add students via Excel' },
              { label: 'View Reports', link: '/teacher/reports', desc: 'Results & Excel download' },
            ].map((a, i) => (
              <div key={i} className="quick-action-card" onClick={() => navigate(a.link)}>
                <div style={{ fontWeight: 700, color: 'var(--primary-700)', marginBottom: 4 }}>{a.label}</div>
                <div style={{ fontSize: 12, color: 'var(--gray-500)' }}>{a.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sessions Table */}
      <div className="card">
        <div className="card-header">
          <ClipboardList size={18} color="var(--primary-600)" />
          <h3>Sessions for Semester {user?.semester}</h3>
          <button className="btn btn-primary btn-sm" style={{ marginLeft: 'auto' }} onClick={() => navigate('/teacher/sessions')}>
            Manage
          </button>
        </div>
        <div className="table-wrapper">
          {sessions.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--gray-400)' }}>
              No sessions yet. Go to Sessions to create one.
            </div>
          ) : (
            <table>
              <thead><tr><th>Title</th><th>Year</th><th>Status</th><th>Submissions</th></tr></thead>
              <tbody>
                {sessions.map(s => (
                  <tr key={s.id}>
                    <td style={{ fontWeight: 500 }}>{s.title}</td>
                    <td>{s.year_label}</td>
                    <td><span className={`badge badge-${s.status === 'active' ? 'success' : s.status === 'closed' ? 'gray' : 'warning'}`}>{s.status}</span></td>
                    <td style={{ fontWeight: 600 }}>{s.submission_count || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
