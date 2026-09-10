import React, { useEffect, useState } from 'react';
import { Plus, Play, StopCircle, FileText, Trash2, Calendar } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import API from '../../api/axios';
import toast from 'react-hot-toast';

export default function HODSessions() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [years, setYears] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ academic_year_id: '', semester: '', title: '' });

  const loadSessions = () => {
    setLoading(true);
    Promise.all([
      API.get(`/sessions?department_id=${user.department_id}`),
      API.get('/academic-years'),
    ]).then(([s, y]) => {
      setSessions(s.data.sessions);
      const ay = y.data.academic_years;
      setYears(ay);
      const cur = ay.find(a => a.is_current) || ay[0];
      if (cur && !form.academic_year_id) setForm(f => ({ ...f, academic_year_id: cur.id }));
    }).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { loadSessions(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.semester || !form.title || !form.academic_year_id) { toast.error('All fields required'); return; }
    try {
      await API.post('/sessions', { ...form, department_id: user.department_id });
      toast.success('Session created');
      setShowForm(false);
      setForm(f => ({ ...f, semester: '', title: '' }));
      loadSessions();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create session');
    }
  };

  const handleStatus = async (id, status) => {
    try {
      await API.patch(`/sessions/${id}/status`, { status });
      toast.success(`Session ${status}`);
      loadSessions();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update status');
    }
  };

  const statusColor = { draft: 'warning', active: 'success', closed: 'gray' };
  const statusIcon = { draft: <FileText size={14} />, active: <Play size={14} />, closed: <StopCircle size={14} /> };

  return (
    <div className="animate-fadeIn">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h2 style={{ marginBottom: 4 }}>Feedback Sessions</h2>
          <p style={{ margin: 0 }}>Create and manage feedback sessions for each semester</p>
        </div>
        <button id="create-session-btn" className="btn btn-primary" onClick={() => setShowForm(v => !v)}>
          <Plus size={16} /> New Session
        </button>
      </div>

      {showForm && (
        <div className="card mb-24 animate-slideIn">
          <div className="card-header">
            <Calendar size={18} color="var(--primary-600)" />
            <h3>Create New Session</h3>
          </div>
          <div className="card-body">
            <form onSubmit={handleCreate}>
              <div className="grid-3">
                <div className="form-group">
                  <label className="form-label required">Academic Year</label>
                  <select className="form-control" value={form.academic_year_id} onChange={e => setForm(f => ({ ...f, academic_year_id: e.target.value }))}>
                    {years.map(y => <option key={y.id} value={y.id}>{y.year_label}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label required">Semester</label>
                  <select className="form-control" value={form.semester} onChange={e => setForm(f => ({ ...f, semester: e.target.value }))}>
                    <option value="">Select</option>
                    {[1,2,3,4,5,6].map(s => <option key={s} value={s}>Semester {s}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label required">Session Title</label>
                  <input className="form-control" placeholder="e.g. Mid-Sem 2024-25" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="submit" className="btn btn-primary">Create Session</button>
                <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="card">
        <div className="table-wrapper">
          {loading ? (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--gray-400)' }}>Loading sessions...</div>
          ) : sessions.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--gray-400)' }}>
              No sessions yet. Create your first session above.
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Semester</th>
                  <th>Year</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map(s => (
                  <tr key={s.id}>
                    <td style={{ fontWeight: 600 }}>{s.title}</td>
                    <td>Semester {s.semester}</td>
                    <td>{s.year_label}</td>
                    <td>
                      <span className={`badge badge-${statusColor[s.status]}`}>
                        {statusIcon[s.status]} {s.status}
                      </span>
                    </td>
                    <td style={{ color: 'var(--gray-400)', fontSize: 12 }}>
                      {new Date(s.created_at).toLocaleDateString('en-IN')}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        {s.status === 'draft' && (
                          <button className="btn btn-success btn-sm" onClick={() => handleStatus(s.id, 'active')}>
                            <Play size={13} /> Activate
                          </button>
                        )}
                        {s.status === 'active' && (
                          <button className="btn btn-danger btn-sm" onClick={() => handleStatus(s.id, 'closed')}>
                            <StopCircle size={13} /> Close
                          </button>
                        )}
                        {s.status === 'closed' && (
                          <span style={{ fontSize: 12, color: 'var(--gray-400)' }}>Completed</span>
                        )}
                      </div>
                    </td>
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
