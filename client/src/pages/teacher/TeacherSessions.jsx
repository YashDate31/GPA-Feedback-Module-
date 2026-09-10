import { useEffect, useState } from 'react';
import { Plus, Play, StopCircle, Trash2, Calendar, PlusCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import API from '../../api/axios';
import toast from 'react-hot-toast';

export default function TeacherSessions() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [years, setYears] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ academic_year_id: '', title: '' });

  // Add Academic Year state
  const [showAddYear, setShowAddYear] = useState(false);
  const [yearForm, setYearForm] = useState({ year_label: '', is_current: true });
  const [savingYear, setSavingYear] = useState(false);

  const load = () => {
    if (!user?.department_id) return;
    setLoading(true);
    Promise.all([
      API.get(`/sessions?department_id=${user.department_id}`),
      API.get('/academic-years'),
    ]).then(([s, y]) => {
      setSessions(s.data.sessions.filter(x => x.semester == user.semester));
      const ay = y.data.academic_years;
      setYears(ay);
      const cur = ay.find(a => a.is_current) || ay[0];
      if (cur) setForm(f => ({ ...f, academic_year_id: cur.id }));
    }).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [user]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.title || !form.academic_year_id) { toast.error('All fields required'); return; }
    try {
      await API.post('/sessions', { ...form, department_id: user.department_id, semester: user.semester });
      toast.success('Session created');
      setShowForm(false);
      setForm(f => ({ ...f, title: '' }));
      load();
    } catch (err) { toast.error(err.response?.data?.error || 'Failed'); }
  };

  const handleAddAcademicYear = async (e) => {
    e.preventDefault();
    if (!yearForm.year_label.trim()) { toast.error('Enter year label (e.g. 2025-26)'); return; }
    setSavingYear(true);
    try {
      const { data } = await API.post('/academic-years', yearForm);
      toast.success(`Academic year ${data.academic_year.year_label} added`);
      setShowAddYear(false);
      setYearForm({ year_label: '', is_current: true });
      // Reload years and auto-select
      const res = await API.get('/academic-years');
      setYears(res.data.academic_years);
      setForm(f => ({ ...f, academic_year_id: data.academic_year.id }));
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to add academic year');
    } finally {
      setSavingYear(false);
    }
  };

  const handleStatus = async (id, status) => {
    try {
      await API.patch(`/sessions/${id}/status`, { status });
      toast.success(`Session ${status}`);
      load();
    } catch (err) { toast.error(err.response?.data?.error || 'Failed'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this draft session?')) return;
    try { await API.delete(`/sessions/${id}`); toast.success('Deleted'); load(); }
    catch (err) { toast.error(err.response?.data?.error || 'Failed'); }
  };

  return (
    <div className="animate-fadeIn">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ marginBottom: 4 }}>Feedback Sessions</h2>
          <p style={{ margin: 0 }}>Semester {user?.semester} · {user?.dept_name}</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-secondary btn-sm" onClick={() => setShowAddYear(v => !v)}>
            <PlusCircle size={15} /> Add Academic Year
          </button>
          <button className="btn btn-primary" onClick={() => setShowForm(v => !v)} id="create-session-btn">
            <Plus size={16} /> New Session
          </button>
        </div>
      </div>

      {/* Modal / Card to Add Academic Year */}
      {showAddYear && (
        <div className="card mb-24 animate-slideIn" style={{ borderLeft: '4px solid var(--accent-600)' }}>
          <div className="card-header">
            <Calendar size={18} color="var(--accent-600)" />
            <h3>Add New Academic Year</h3>
          </div>
          <div className="card-body">
            <form onSubmit={handleAddAcademicYear}>
              <div className="grid-2" style={{ alignItems: 'flex-end' }}>
                <div className="form-group mb-0">
                  <label className="form-label required">Academic Year Label</label>
                  <input
                    className="form-control"
                    placeholder="e.g. 2025-26 or 2026-27"
                    value={yearForm.year_label}
                    onChange={e => setYearForm(f => ({ ...f, year_label: e.target.value }))}
                    autoFocus
                  />
                </div>
                <div className="form-group mb-0" style={{ display: 'flex', alignItems: 'center', height: 42 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, fontWeight: 500, color: 'var(--gray-700)' }}>
                    <input
                      type="checkbox"
                      checked={yearForm.is_current}
                      onChange={e => setYearForm(f => ({ ...f, is_current: e.target.checked }))}
                    />
                    Set as Current Active Academic Year
                  </label>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
                <button type="submit" className="btn btn-primary btn-sm" disabled={savingYear}>
                  {savingYear ? 'Saving...' : 'Save Year'}
                </button>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowAddYear(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Session Card */}
      {showForm && (
        <div className="card mb-24 animate-slideIn">
          <div className="card-header"><Calendar size={18} color="var(--primary-600)" /><h3>Create Session</h3></div>
          <div className="card-body">
            <form onSubmit={handleCreate}>
              <div className="grid-2">
                <div className="form-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <label className="form-label required" style={{ marginBottom: 0 }}>Academic Year</label>
                    <button type="button" onClick={() => setShowAddYear(true)} style={{ background: 'none', border: 'none', color: 'var(--primary-600)', fontSize: 12, cursor: 'pointer', fontWeight: 600 }}>
                      + New Year
                    </button>
                  </div>
                  <select className="form-control" value={form.academic_year_id} onChange={e => setForm(f => ({ ...f, academic_year_id: e.target.value }))}>
                    {years.map(y => <option key={y.id} value={y.id}>{y.year_label} {y.is_current ? '(Current)' : ''}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label required">Session Title</label>
                  <input className="form-control" placeholder="e.g. Odd Semester Feedback 2025-26" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button type="submit" className="btn btn-primary btn-sm">Create</button>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowForm(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="card">
        <div className="table-wrapper">
          {loading ? <div style={{ padding: 40, textAlign: 'center', color: 'var(--gray-400)' }}>Loading...</div>
          : sessions.length === 0 ? <div style={{ padding: 40, textAlign: 'center', color: 'var(--gray-400)' }}>No sessions yet.</div>
          : (
            <table>
              <thead><tr><th>Title</th><th>Year</th><th>Status</th><th>Submissions</th><th>Actions</th></tr></thead>
              <tbody>
                {sessions.map(s => (
                  <tr key={s.id}>
                    <td style={{ fontWeight: 600 }}>{s.title}</td>
                    <td>{s.year_label}</td>
                    <td><span className={`badge badge-${s.status === 'active' ? 'success' : s.status === 'closed' ? 'gray' : 'warning'}`}>{s.status}</span></td>
                    <td style={{ fontWeight: 600 }}>{s.submission_count || 0}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        {s.status === 'draft' && <>
                          <button className="btn btn-success btn-sm" onClick={() => handleStatus(s.id, 'active')}><Play size={13} /> Activate</button>
                          <button className="btn btn-danger btn-sm" onClick={() => handleDelete(s.id)}><Trash2 size={13} /></button>
                        </>}
                        {s.status === 'active' && <button className="btn btn-danger btn-sm" onClick={() => handleStatus(s.id, 'closed')}><StopCircle size={13} /> Close</button>}
                        {s.status === 'closed' && <span style={{ fontSize: 12, color: 'var(--gray-400)' }}>Completed</span>}
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
