import React, { useEffect, useState } from 'react';
import { BookOpen, Plus, Trash2, ChevronDown, Users } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import API from '../../api/axios';
import toast from 'react-hot-toast';

export default function HODAllocations() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState('');
  const [subjects, setSubjects] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [allocations, setAllocations] = useState([]);
  const [selectedSem, setSelectedSem] = useState('');
  const [saving, setSaving] = useState({});
  const [newFacultyForm, setNewFacultyForm] = useState({ name: '', designation: '' });
  const [showAddFaculty, setShowAddFaculty] = useState(false);
  const [submittingFaculty, setSubmittingFaculty] = useState(false);

  useEffect(() => {
    API.get(`/sessions?department_id=${user.department_id}`).then(r => setSessions(r.data.sessions));
    API.get(`/faculties?department_id=${user.department_id}`).then(r => setFaculties(r.data.faculties));
  }, []);

  useEffect(() => {
    if (!selectedSession || !selectedSem) return;
    Promise.all([
      API.get(`/subjects?department_id=${user.department_id}&semester=${selectedSem}`),
      API.get(`/allocations?session_id=${selectedSession}`),
    ]).then(([s, a]) => {
      setSubjects(s.data.subjects);
      setAllocations(a.data.allocations);
    });
  }, [selectedSession, selectedSem]);

  const getAllocFor = (subjectId, type, batch = 'ALL') =>
    allocations.find(a => a.subject_id === subjectId && a.allocation_type === type && a.batch === batch);

  const handleSave = async (subjectId, type, batch, facultyId) => {
    if (!facultyId) return;
    const key = `${subjectId}-${type}-${batch}`;
    setSaving(s => ({ ...s, [key]: true }));
    try {
      await API.post('/allocations', {
        subject_id: subjectId,
        faculty_id: facultyId,
        allocation_type: type,
        batch: type === 'practical' ? batch : 'ALL',
        session_id: selectedSession,
      });
      const r = await API.get(`/allocations?session_id=${selectedSession}`);
      setAllocations(r.data.allocations);
      toast.success('Allocation saved');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save');
    } finally {
      setSaving(s => ({ ...s, [key]: false }));
    }
  };

  const handleDelete = async (allocId) => {
    try {
      await API.delete(`/allocations/${allocId}`);
      setAllocations(a => a.filter(x => x.id !== allocId));
      toast.success('Allocation removed');
    } catch { toast.error('Failed to remove'); }
  };

  const handleAddFaculty = async (e) => {
    e.preventDefault();
    if (submittingFaculty) return;
    if (!newFacultyForm.name.trim()) { toast.error('Name required'); return; }
    setSubmittingFaculty(true);
    try {
      await API.post('/faculties', { ...newFacultyForm, department_id: user.department_id });
      const r = await API.get(`/faculties?department_id=${user.department_id}`);
      setFaculties(r.data.faculties);
      setNewFacultyForm({ name: '', designation: '' });
      setShowAddFaculty(false);
      toast.success('Faculty member saved');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to add faculty');
    } finally {
      setSubmittingFaculty(false);
    }
  };

  const theorySubjects = subjects.filter(s => s.type === 'theory');
  const practicalSubjects = subjects.filter(s => s.type === 'practical');
  const BATCHES = ['B1', 'B2', 'B3'];

  const FacultySelect = ({ subjectId, type, batch = 'ALL' }) => {
    const existing = getAllocFor(subjectId, type, batch);
    const key = `${subjectId}-${type}-${batch}`;
    return (
      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        <select
          className="form-control"
          style={{ fontSize: 12, padding: '6px 10px' }}
          value={existing?.faculty_id || ''}
          onChange={e => handleSave(subjectId, type, batch, e.target.value)}
        >
          <option value="">— Assign Faculty —</option>
          {faculties.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
        </select>
        {saving[key] && <span className="spin" style={{ width: 14, height: 14, border: '2px solid var(--gray-200)', borderTopColor: 'var(--primary-600)', borderRadius: '50%', display: 'inline-block', flexShrink: 0 }} />}
        {existing && !saving[key] && (
          <button className="btn btn-danger btn-sm" style={{ padding: '5px 8px' }} onClick={() => handleDelete(existing.id)}>
            <Trash2 size={12} />
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="animate-fadeIn">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ marginBottom: 4 }}>Faculty Allocations</h2>
          <p style={{ margin: 0 }}>Assign theory and practical faculty (per batch) to subjects</p>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={() => setShowAddFaculty(v => !v)}>
          <Plus size={14} /> Add Faculty
        </button>
      </div>

      {showAddFaculty && (
        <div className="card mb-24 animate-slideIn">
          <div className="card-header">
            <Users size={18} color="var(--primary-600)" />
            <h3>Add New Faculty</h3>
          </div>
          <div className="card-body">
            <form onSubmit={handleAddFaculty}>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label required">Faculty Name</label>
                  <input className="form-control" placeholder="e.g. Prof. A. B. Patil" value={newFacultyForm.name} onChange={e => setNewFacultyForm(f => ({ ...f, name: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Designation</label>
                  <input className="form-control" placeholder="e.g. Lecturer" value={newFacultyForm.designation} onChange={e => setNewFacultyForm(f => ({ ...f, designation: e.target.value }))} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button type="submit" className="btn btn-primary btn-sm" disabled={submittingFaculty}>
                  {submittingFaculty ? 'Saving...' : 'Add Faculty'}
                </button>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowAddFaculty(false)} disabled={submittingFaculty}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="card mb-24">
        <div className="card-body">
          <div className="grid-2">
            <div className="form-group mb-0">
              <label className="form-label">Select Session</label>
              <select className="form-control" value={selectedSession} onChange={e => setSelectedSession(e.target.value)}>
                <option value="">— Select a Session —</option>
                {sessions.map(s => <option key={s.id} value={s.id}>{s.title} (Sem {s.semester}) · {s.status}</option>)}
              </select>
            </div>
            <div className="form-group mb-0">
              <label className="form-label">Semester</label>
              <select className="form-control" value={selectedSem} onChange={e => setSelectedSem(e.target.value)}>
                <option value="">— Select Semester —</option>
                {[1,2,3,4,5,6].map(s => <option key={s} value={s}>Semester {s}</option>)}
              </select>
            </div>
          </div>
        </div>
      </div>

      {selectedSession && selectedSem && subjects.length === 0 && (
        <div className="alert alert-info"><BookOpen size={16} /> No subjects found for selected semester.</div>
      )}

      {/* Theory Subjects */}
      {theorySubjects.length > 0 && (
        <div className="card mb-24">
          <div className="card-header">
            <BookOpen size={18} color="var(--primary-600)" />
            <h3>Theory Subjects — Single Faculty</h3>
            <span className="badge badge-primary" style={{ marginLeft: 'auto' }}>Batch: ALL</span>
          </div>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr><th>Code</th><th>Subject Name</th><th>Assigned Faculty</th></tr>
              </thead>
              <tbody>
                {theorySubjects.map(s => (
                  <tr key={s.id}>
                    <td><span className="badge badge-gray">{s.code}</span></td>
                    <td style={{ fontWeight: 500 }}>{s.name}</td>
                    <td style={{ minWidth: 260 }}><FacultySelect subjectId={s.id} type="theory" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Practical Subjects */}
      {practicalSubjects.length > 0 && (
        <div className="card">
          <div className="card-header">
            <Users size={18} color="var(--accent-600)" />
            <h3>Practical Subjects — Per Batch (B1, B2, B3)</h3>
          </div>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Subject Name</th>
                  {BATCHES.map(b => <th key={b}>Batch {b}</th>)}
                </tr>
              </thead>
              <tbody>
                {practicalSubjects.map(s => (
                  <tr key={s.id}>
                    <td><span className="badge badge-success">{s.code}</span></td>
                    <td style={{ fontWeight: 500 }}>{s.name}</td>
                    {BATCHES.map(b => (
                      <td key={b} style={{ minWidth: 220 }}>
                        <FacultySelect subjectId={s.id} type="practical" batch={b} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
