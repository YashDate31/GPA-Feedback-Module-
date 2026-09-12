import { useEffect, useState } from 'react';
import { BookOpen, Plus, Trash2, Users, Check, Layers, UserPlus, Copy } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import API from '../../api/axios';
import toast from 'react-hot-toast';

const BATCHES = ['B1', 'B2', 'B3'];

// Reusable Faculty Dropdown Component
function FacultySelect({ subjectId, type, batch = 'ALL', faculties, allocations, sessionId, onSaved }) {
  const existing = allocations.find(
    a => a.subject_id === subjectId && a.allocation_type === type && a.batch === batch
  );
  const [saving, setSaving] = useState(false);

  const handleChange = async (facultyId) => {
    if (!facultyId) return;
    setSaving(true);
    try {
      await API.post('/allocations', {
        subject_id: subjectId,
        faculty_id: facultyId,
        allocation_type: type,
        batch,
        session_id: sessionId,
      });
      onSaved();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to assign faculty');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!existing) return;
    try {
      await API.delete(`/allocations/${existing.id}`);
      onSaved();
      toast.success('Assignment removed');
    } catch {
      toast.error('Failed to remove assignment');
    }
  };

  return (
    <div style={{ display: 'flex', gap: 6, alignItems: 'center', width: '100%' }}>
      <select
        className="form-control"
        style={{ fontSize: 13, padding: '6px 10px', height: 34, flex: 1 }}
        value={existing?.faculty_id || ''}
        onChange={e => handleChange(e.target.value)}
        disabled={saving}
      >
        <option value="">— Select Faculty —</option>
        {faculties.map(f => (
          <option key={f.id} value={f.id}>
            {f.name} {f.designation ? `(${f.designation})` : ''}
          </option>
        ))}
      </select>
      {saving && <span style={{ fontSize: 11, color: 'var(--primary-600)' }}>...</span>}
      {existing && !saving && (
        <button
          className="btn btn-danger btn-sm"
          style={{ padding: '4px 7px', height: 34 }}
          title="Remove assignment"
          onClick={handleDelete}
        >
          <Trash2 size={12} />
        </button>
      )}
    </div>
  );
}

export default function TeacherAllocations() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState('');
  const [subjects, setSubjects] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [allocations, setAllocations] = useState([]);

  // Modals
  const [showAddFaculty, setShowAddFaculty] = useState(false);
  const [newFaculty, setNewFaculty] = useState({ name: '', designation: '' });
  const [submittingFaculty, setSubmittingFaculty] = useState(false);

  const [showAddSubject, setShowAddSubject] = useState(false);
  const [newSubject, setNewSubject] = useState({ code: '', name: '', type: 'both' });
  const [submittingSubject, setSubmittingSubject] = useState(false);

  const loadData = () => {
    if (!user?.department_id) return;
    Promise.all([
      API.get(`/sessions?department_id=${user.department_id}`),
      API.get(`/faculties?department_id=${user.department_id}`),
      API.get(`/subjects?department_id=${user.department_id}&semester=${user.semester}`),
    ]).then(([s, f, sub]) => {
      const userSessions = s.data.sessions.filter(x => x.semester == user.semester);
      setSessions(userSessions);
      if (userSessions.length > 0 && !selectedSession) {
        // Auto-select active or first session
        const active = userSessions.find(x => x.status === 'active') || userSessions[0];
        setSelectedSession(active.id);
      }
      setFaculties(f.data.faculties);
      setSubjects(sub.data.subjects);
    }).catch(() => {});
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const loadAllocations = () => {
    if (!selectedSession) return;
    API.get(`/allocations?session_id=${selectedSession}`)
      .then(r => setAllocations(r.data.allocations))
      .catch(() => {});
  };

  useEffect(() => {
    loadAllocations();
  }, [selectedSession]);

  // Handle changing subject permission: Theory / Practical / Both
  const handleTypeChange = async (subjectId, newType) => {
    try {
      await API.patch(`/subjects/${subjectId}/type`, { type: newType });
      setSubjects(prev => prev.map(s => s.id === subjectId ? { ...s, type: newType } : s));
      toast.success(`Subject permission updated to ${newType === 'both' ? 'Theory & Practical' : newType}`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update subject permission');
    }
  };

  // Copy B1 faculty to B2 and B3
  const handleCopyB1ToAll = async (subjectId) => {
    const b1Alloc = allocations.find(
      a => a.subject_id === subjectId && a.allocation_type === 'practical' && a.batch === 'B1'
    );
    if (!b1Alloc) {
      toast.error('First assign a faculty to Batch B1');
      return;
    }
    try {
      await Promise.all([
        API.post('/allocations', {
          subject_id: subjectId,
          faculty_id: b1Alloc.faculty_id,
          allocation_type: 'practical',
          batch: 'B2',
          session_id: selectedSession,
        }),
        API.post('/allocations', {
          subject_id: subjectId,
          faculty_id: b1Alloc.faculty_id,
          allocation_type: 'practical',
          batch: 'B3',
          session_id: selectedSession,
        }),
      ]);
      loadAllocations();
      toast.success('Assigned same faculty to Batch B2 & B3');
    } catch {
      toast.error('Failed to copy allocation');
    }
  };

  const handleAddFaculty = async (e) => {
    e.preventDefault();
    if (submittingFaculty) return;
    if (!newFaculty.name.trim()) { toast.error('Faculty name required'); return; }
    setSubmittingFaculty(true);
    try {
      await API.post('/faculties', { ...newFaculty, department_id: user.department_id });
      const r = await API.get(`/faculties?department_id=${user.department_id}`);
      setFaculties(r.data.faculties);
      setNewFaculty({ name: '', designation: '' });
      setShowAddFaculty(false);
      toast.success('Faculty member saved');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to add faculty');
    } finally {
      setSubmittingFaculty(false);
    }
  };

  const handleAddSubject = async (e) => {
    e.preventDefault();
    if (submittingSubject) return;
    if (!newSubject.code.trim() || !newSubject.name.trim()) {
      toast.error('Subject code and name required');
      return;
    }
    setSubmittingSubject(true);
    try {
      await API.post('/subjects', {
        ...newSubject,
        department_id: user.department_id,
        semester: user.semester,
      });
      const r = await API.get(`/subjects?department_id=${user.department_id}&semester=${user.semester}`);
      setSubjects(r.data.subjects);
      setNewSubject({ code: '', name: '', type: 'both' });
      setShowAddSubject(false);
      toast.success('Subject added');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to add subject');
    } finally {
      setSubmittingSubject(false);
    }
  };

  const handleDeleteSubject = async (subjectId) => {
    if (!confirm('Remove this subject and all its allocations?')) return;
    try {
      await API.delete(`/subjects/${subjectId}`);
      setSubjects(prev => prev.filter(s => s.id !== subjectId));
      loadAllocations();
      toast.success('Subject removed');
    } catch {
      toast.error('Failed to remove subject');
    }
  };

  return (
    <div className="animate-fadeIn">
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ marginBottom: 4 }}>Faculty Allocations & Subject Permissions</h2>
          <p style={{ margin: 0 }}>Configure subjects (Theory / Practical / Both) and assign faculty for Semester {user?.semester}</p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button className="btn btn-secondary btn-sm" onClick={() => setShowAddSubject(v => !v)}>
            <Plus size={14} /> Add Subject
          </button>
          <button className="btn btn-secondary btn-sm" onClick={() => setShowAddFaculty(v => !v)}>
            <UserPlus size={14} /> Add Faculty Member
          </button>
        </div>
      </div>

      {/* Add Faculty Form */}
      {showAddFaculty && (
        <div className="card mb-24 animate-slideIn" style={{ borderLeft: '4px solid var(--primary-600)' }}>
          <div className="card-header"><Users size={18} color="var(--primary-600)" /><h3>Add New Faculty Member</h3></div>
          <div className="card-body">
            <form onSubmit={handleAddFaculty}>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label required">Full Name</label>
                  <input className="form-control" placeholder="e.g. Prof. Sangita Chavan" value={newFaculty.name} onChange={e => setNewFaculty(f => ({ ...f, name: e.target.value }))} autoFocus />
                </div>
                <div className="form-group">
                  <label className="form-label">Designation</label>
                  <input className="form-control" placeholder="Lecturer / Assistant Professor / HOD" value={newFaculty.designation} onChange={e => setNewFaculty(f => ({ ...f, designation: e.target.value }))} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button type="submit" className="btn btn-primary btn-sm" disabled={submittingFaculty}>
                  {submittingFaculty ? 'Saving...' : 'Save Faculty'}
                </button>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowAddFaculty(false)} disabled={submittingFaculty}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Subject Form */}
      {showAddSubject && (
        <div className="card mb-24 animate-slideIn" style={{ borderLeft: '4px solid var(--accent-600)' }}>
          <div className="card-header"><BookOpen size={18} color="var(--accent-600)" /><h3>Add Subject for Semester {user?.semester}</h3></div>
          <div className="card-body">
            <form onSubmit={handleAddSubject}>
              <div className="grid-3">
                <div className="form-group">
                  <label className="form-label required">Subject Code</label>
                  <input className="form-control" placeholder="e.g. 311009" value={newSubject.code} onChange={e => setNewSubject(s => ({ ...s, code: e.target.value }))} autoFocus />
                </div>
                <div className="form-group">
                  <label className="form-label required">Subject Name</label>
                  <input className="form-control" placeholder="e.g. Artificial Intelligence Lab" value={newSubject.name} onChange={e => setNewSubject(s => ({ ...s, name: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label required">Permission / Type</label>
                  <select className="form-control" value={newSubject.type} onChange={e => setNewSubject(s => ({ ...s, type: e.target.value }))}>
                    <option value="both">Both (Theory & Practical)</option>
                    <option value="theory">Theory Only</option>
                    <option value="practical">Practical Only</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button type="submit" className="btn btn-primary btn-sm" disabled={submittingSubject}>
                  {submittingSubject ? 'Saving...' : 'Create Subject'}
                </button>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowAddSubject(false)} disabled={submittingSubject}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Session Selection */}
      <div className="card mb-24">
        <div className="card-body" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <label className="form-label mb-0" style={{ fontWeight: 600 }}>Feedback Session:</label>
            <select
              className="form-control"
              style={{ minWidth: 260 }}
              value={selectedSession}
              onChange={e => setSelectedSession(e.target.value)}
            >
              <option value="">— Select Session —</option>
              {sessions.map(s => (
                <option key={s.id} value={s.id}>
                  {s.title} · {s.status.toUpperCase()}
                </option>
              ))}
            </select>
          </div>
          <span style={{ fontSize: 13, color: 'var(--gray-500)' }}>
            Allocations saved here automatically connect to student feedback forms.
          </span>
        </div>
      </div>

      {!selectedSession && (
        <div className="alert alert-info">
          Please select a feedback session above to configure faculty allocations.
        </div>
      )}

      {selectedSession && faculties.length === 0 && (
        <div className="alert alert-warning">
          No faculty members added yet. Click <strong>"Add Faculty Member"</strong> to add teachers first.
        </div>
      )}

      {selectedSession && faculties.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {subjects.map(s => {
            const hasTheory = s.type === 'theory' || s.type === 'both';
            const hasPractical = s.type === 'practical' || s.type === 'both';

            return (
              <div
                key={s.id}
                className="card"
                style={{
                  borderLeft: `5px solid ${s.type === 'both' ? 'var(--primary-600)' : s.type === 'theory' ? '#3b82f6' : '#10b981'}`,
                  overflow: 'hidden',
                }}
              >
                {/* Subject Header & Permission Toggle */}
                <div
                  className="card-header"
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: 12,
                    background: 'var(--gray-50)',
                    padding: '12px 18px',
                    borderBottom: '1px solid var(--gray-200)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <code style={{ background: '#fff', border: '1px solid var(--gray-300)', padding: '2px 8px', borderRadius: 4, fontWeight: 700, fontSize: 13 }}>
                      {s.code}
                    </code>
                    <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: 'var(--gray-900)' }}>
                      {s.name}
                    </h3>
                  </div>

                  {/* Subject Permission Selector (Theory / Practical / Both) */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Permission:
                    </span>
                    <div style={{ display: 'inline-flex', background: '#e2e8f0', borderRadius: 8, padding: 3, gap: 2 }}>
                      <button
                        type="button"
                        onClick={() => handleTypeChange(s.id, 'theory')}
                        style={{
                          border: 'none',
                          borderRadius: 6,
                          padding: '5px 12px',
                          fontSize: 12,
                          fontWeight: 600,
                          cursor: 'pointer',
                          background: s.type === 'theory' ? '#3b82f6' : 'transparent',
                          color: s.type === 'theory' ? '#fff' : 'var(--gray-700)',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        Theory
                      </button>
                      <button
                        type="button"
                        onClick={() => handleTypeChange(s.id, 'practical')}
                        style={{
                          border: 'none',
                          borderRadius: 6,
                          padding: '5px 12px',
                          fontSize: 12,
                          fontWeight: 600,
                          cursor: 'pointer',
                          background: s.type === 'practical' ? '#10b981' : 'transparent',
                          color: s.type === 'practical' ? '#fff' : 'var(--gray-700)',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        Practical
                      </button>
                      <button
                        type="button"
                        onClick={() => handleTypeChange(s.id, 'both')}
                        style={{
                          border: 'none',
                          borderRadius: 6,
                          padding: '5px 14px',
                          fontSize: 12,
                          fontWeight: 600,
                          cursor: 'pointer',
                          background: s.type === 'both' ? 'var(--primary-600)' : 'transparent',
                          color: s.type === 'both' ? '#fff' : 'var(--gray-700)',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        Both (TH & PR)
                      </button>
                    </div>

                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      style={{ padding: '4px 8px', color: 'var(--gray-400)' }}
                      title="Delete Subject"
                      onClick={() => handleDeleteSubject(s.id)}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                {/* Faculty Allocation Content Area */}
                <div className="card-body" style={{ padding: '16px 20px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {/* Theory Faculty Section */}
                    {hasTheory && (
                      <div
                        style={{
                          padding: '12px 16px',
                          background: '#eff6ff',
                          borderRadius: 8,
                          border: '1px solid #bfdbfe',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          flexWrap: 'wrap',
                          gap: 12,
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 200 }}>
                          <BookOpen size={16} color="#2563eb" />
                          <span style={{ fontWeight: 600, fontSize: 13, color: '#1e40af' }}>
                            Theory Faculty (All Students)
                          </span>
                        </div>
                        <div style={{ flex: 1, maxWidth: 360 }}>
                          <FacultySelect
                            subjectId={s.id}
                            type="theory"
                            batch="ALL"
                            faculties={faculties}
                            allocations={allocations}
                            sessionId={selectedSession}
                            onSaved={loadAllocations}
                          />
                        </div>
                      </div>
                    )}

                    {/* Practical Faculty Batches Section */}
                    {hasPractical && (
                      <div
                        style={{
                          padding: '12px 16px',
                          background: '#ecfdf5',
                          borderRadius: 8,
                          border: '1px solid #a7f3d0',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, flexWrap: 'wrap', gap: 8 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Users size={16} color="#059669" />
                            <span style={{ fontWeight: 600, fontSize: 13, color: '#065f46' }}>
                              Practical Faculty (Batch-wise B1, B2, B3)
                            </span>
                          </div>
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            style={{ fontSize: 11, padding: '3px 8px', background: '#fff' }}
                            title="Assign the teacher chosen in Batch B1 to Batch B2 and B3 as well"
                            onClick={() => handleCopyB1ToAll(s.id)}
                          >
                            <Copy size={12} /> Copy B1 to B2 & B3
                          </button>
                        </div>

                        <div className="grid-3" style={{ gap: 12 }}>
                          {BATCHES.map(b => (
                            <div key={b} style={{ background: '#fff', padding: '8px 10px', borderRadius: 6, border: '1px solid #d1fae5' }}>
                              <div style={{ fontSize: 11, fontWeight: 700, color: '#047857', marginBottom: 6, textTransform: 'uppercase' }}>
                                Batch {b} Faculty
                              </div>
                              <FacultySelect
                                subjectId={s.id}
                                type="practical"
                                batch={b}
                                faculties={faculties}
                                allocations={allocations}
                                sessionId={selectedSession}
                                onSaved={loadAllocations}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
