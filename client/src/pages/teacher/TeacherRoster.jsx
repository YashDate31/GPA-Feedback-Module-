import { useEffect, useRef, useState } from 'react';
import { Upload, Users, Trash2, Download, AlertCircle, CheckCircle, FileSpreadsheet, PlusCircle, UserPlus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import API from '../../api/axios';
import toast from 'react-hot-toast';

export default function TeacherRoster() {
  const { user } = useAuth();
  const [roster, setRoster] = useState([]);
  const [years, setYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef();

  // Add Academic Year state
  const [showAddYear, setShowAddYear] = useState(false);
  const [yearForm, setYearForm] = useState({ year_label: '', is_current: true });
  const [savingYear, setSavingYear] = useState(false);

  // Manual Add Student state
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [studentForm, setStudentForm] = useState({ enrollment_no: '', name: '' });
  const [savingStudent, setSavingStudent] = useState(false);

  useEffect(() => {
    API.get('/academic-years').then(r => {
      const ay = r.data.academic_years;
      setYears(ay);
      const cur = ay.find(y => y.is_current) || ay[0];
      if (cur) setSelectedYear(cur.id);
    });
  }, []);

  const loadRoster = () => {
    if (!selectedYear || !user?.department_id) return;
    setLoading(true);
    API.get(`/roster?dept_id=${user.department_id}&academic_year_id=${selectedYear}&semester=${user.semester}`)
      .then(r => setRoster(r.data.roster))
      .catch(() => { })
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadRoster(); }, [selectedYear, user]);

  const handleUpload = async (file) => {
    if (!file) return;
    if (!selectedYear) { toast.error('Select Academic Year first'); return; }
    if (!file.name.match(/\.(xlsx|xls|csv)$/i)) { toast.error('Only Excel or CSV files allowed'); return; }

    const fd = new FormData();
    fd.append('file', file);
    fd.append('department_id', user.department_id);
    fd.append('semester', user.semester);
    fd.append('academic_year_id', selectedYear);

    setUploading(true);
    setUploadResult(null);
    try {
      const { data } = await API.post('/roster/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setUploadResult({ success: true, ...data });
      toast.success(data.message);
      loadRoster();
    } catch (err) {
      const msg = err.response?.data?.error || 'Upload failed';
      setUploadResult({ success: false, error: msg });
      toast.error(msg);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
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
      const res = await API.get('/academic-years');
      setYears(res.data.academic_years);
      setSelectedYear(data.academic_year.id);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to add academic year');
    } finally {
      setSavingYear(false);
    }
  };

  const handleAddSingleStudent = async (e) => {
    e.preventDefault();
    if (!studentForm.enrollment_no.trim() || !studentForm.name.trim()) {
      toast.error('Enrollment number and student name required');
      return;
    }
    if (!selectedYear) { toast.error('Select Academic Year first'); return; }

    setSavingStudent(true);
    try {
      // Use roster upload endpoint with a single record or direct roster API
      const fakeCsv = `Enrollment No,Name\n${studentForm.enrollment_no.trim()},${studentForm.name.trim()}\n`;
      const blob = new Blob([fakeCsv], { type: 'text/csv' });
      const file = new File([blob], 'single_student.csv', { type: 'text/csv' });
      const fd = new FormData();
      fd.append('file', file);
      fd.append('department_id', user.department_id);
      fd.append('semester', user.semester);
      fd.append('academic_year_id', selectedYear);

      await API.post('/roster/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Student added to roster');
      setStudentForm({ enrollment_no: '', name: '' });
      setShowAddStudent(false);
      loadRoster();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to add student');
    } finally {
      setSavingStudent(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Remove this student from roster?')) return;
    try {
      await API.delete(`/roster/${id}`);
      setRoster(r => r.filter(s => s.id !== id));
      toast.success('Removed');
    } catch {
      toast.error('Failed');
    }
  };

  const handleClearAll = async () => {
    if (!confirm(`Clear ALL ${roster.length} students for Semester ${user.semester}? This cannot be undone.`)) return;
    try {
      await API.delete('/roster/clear', {
        data: { department_id: user.department_id, semester: user.semester, academic_year_id: selectedYear }
      });
      setRoster([]);
      toast.success('Roster cleared');
    } catch {
      toast.error('Failed');
    }
  };

  const handleToggleAccess = async (studentId, currentStatus) => {
    const newStatus = !currentStatus;
    setRoster(prev => prev.map(s => s.id === studentId ? { ...s, is_active: newStatus ? 1 : 0 } : s));
    try {
      await API.patch(`/roster/${studentId}/toggle`, { is_active: newStatus });
      toast.success(newStatus ? 'Student feedback access allowed' : 'Student feedback access blocked');
    } catch {
      setRoster(prev => prev.map(s => s.id === studentId ? { ...s, is_active: currentStatus ? 1 : 0 } : s));
      toast.error('Failed to update student access');
    }
  };

  const allActive = roster.length > 0 && roster.every(s => s.is_active !== 0);
  const someActive = roster.some(s => s.is_active !== 0);
  const activeCount = roster.filter(s => s.is_active !== 0).length;
  const blockedCount = roster.length - activeCount;

  const handleToggleAll = async () => {
    const targetStatus = !allActive;
    const prev = [...roster];
    setRoster(r => r.map(s => ({ ...s, is_active: targetStatus ? 1 : 0 })));
    try {
      await API.post('/roster/bulk-status', {
        department_id: user.department_id,
        semester: user.semester,
        academic_year_id: selectedYear,
        is_active: targetStatus
      });
      toast.success(targetStatus ? 'All students allowed access' : 'All students blocked');
    } catch {
      setRoster(prev);
      toast.error('Failed to update students');
    }
  };

  const downloadTemplate = () => {
    const content = 'Enrollment No,Name\n24210270001,Student Full Name 1\n24210270002,Student Full Name 2\n';
    const a = document.createElement('a');
    a.href = 'data:text/csv,' + encodeURIComponent(content);
    a.download = `student_roster_template_sem${user.semester}.csv`;
    a.click();
  };

  return (
    <div className="animate-fadeIn">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ marginBottom: 4 }}>Student Roster</h2>
          <p style={{ margin: 0 }}>Semester {user?.semester} — Enrolled students authorized to fill feedback</p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button className="btn btn-secondary btn-sm" onClick={() => setShowAddYear(v => !v)}>
            <PlusCircle size={14} /> Add Academic Year
          </button>
          <button className="btn btn-secondary btn-sm" onClick={() => setShowAddStudent(v => !v)}>
            <UserPlus size={14} /> Add Student
          </button>
          <button className="btn btn-secondary btn-sm" onClick={downloadTemplate}>
            <Download size={14} /> Template
          </button>
          {roster.length > 0 && (
            <button className="btn btn-danger btn-sm" onClick={handleClearAll}>
              Clear All
            </button>
          )}
        </div>
      </div>

      {/* Add Academic Year Card */}
      {showAddYear && (
        <div className="card mb-24 animate-slideIn" style={{ borderLeft: '4px solid var(--accent-600)' }}>
          <div className="card-header">
            <PlusCircle size={18} color="var(--accent-600)" />
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

      {/* Add Single Student Card */}
      {showAddStudent && (
        <div className="card mb-24 animate-slideIn" style={{ borderLeft: '4px solid var(--primary-600)' }}>
          <div className="card-header">
            <UserPlus size={18} color="var(--primary-600)" />
            <h3>Add Single Student</h3>
          </div>
          <div className="card-body">
            <form onSubmit={handleAddSingleStudent}>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label required">Enrollment Number</label>
                  <input
                    className="form-control"
                    placeholder="e.g. 24210270247"
                    value={studentForm.enrollment_no}
                    onChange={e => setStudentForm(f => ({ ...f, enrollment_no: e.target.value.toUpperCase() }))}
                    autoFocus
                  />
                </div>
                <div className="form-group">
                  <label className="form-label required">Student Full Name</label>
                  <input
                    className="form-control"
                    placeholder="e.g. Patil Rahul Suresh"
                    value={studentForm.name}
                    onChange={e => setStudentForm(f => ({ ...f, name: e.target.value }))}
                  />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button type="submit" className="btn btn-primary btn-sm" disabled={savingStudent}>
                  {savingStudent ? 'Adding...' : 'Add Student'}
                </button>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowAddStudent(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Academic Year Selector */}
      <div className="card mb-24">
        <div className="card-body" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <label className="form-label mb-0" style={{ fontWeight: 600 }}>Academic Year:</label>
            <select
              className="form-control"
              style={{ minWidth: 180 }}
              value={selectedYear}
              onChange={e => setSelectedYear(e.target.value)}
            >
              {years.map(y => (
                <option key={y.id} value={y.id}>
                  {y.year_label} {y.is_current ? '(Current)' : ''}
                </option>
              ))}
            </select>
          </div>
          <span style={{ fontSize: 13, color: 'var(--gray-500)' }}>
            Students listed below are verified automatically by enrollment number.
          </span>
        </div>
      </div>

      {/* Upload Zone */}
      <div className="card mb-24">
        <div className="card-header">
          <FileSpreadsheet size={18} color="var(--primary-600)" />
          <h3>Upload Student List (Excel / CSV)</h3>
        </div>
        <div className="card-body">
          <div
            className={`upload-zone ${dragOver ? 'drag-over' : ''}`}
            onClick={() => fileRef.current?.click()}
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={e => { e.preventDefault(); setDragOver(false); handleUpload(e.dataTransfer.files[0]); }}
          >
            <div className="upload-icon">{uploading ? <div className="spinner-sm" /> : <Upload size={28} />}</div>
            <p style={{ margin: '8px 0 4px', fontWeight: 600, color: 'var(--gray-700)' }}>
              {uploading ? 'Uploading...' : 'Drop Excel/CSV here or click to browse'}
            </p>
            <p style={{ fontSize: 12, color: 'var(--gray-400)', margin: 0 }}>
              Columns needed: <strong>Enrollment No</strong> and <strong>Student Name</strong> · Supports .xlsx, .xls, .csv
            </p>
          </div>
          <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" style={{ display: 'none' }} onChange={e => handleUpload(e.target.files[0])} />

          {uploadResult && (
            <div className={`alert ${uploadResult.success ? 'alert-success' : 'alert-danger'}`} style={{ marginTop: 16 }}>
              {uploadResult.success ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
              <span>{uploadResult.success ? uploadResult.message : uploadResult.error}</span>
            </div>
          )}
        </div>
      </div>

      {/* Roster Table with Individual Student Checkboxes */}
      <div className="card">
        <div className="card-header" style={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Users size={18} color="var(--primary-600)" />
            <h3 style={{ margin: 0 }}>
              Enrolled Students {roster.length > 0 && `— ${roster.length} Total`}
            </h3>
            {roster.length > 0 && (
              <span style={{ fontSize: 12, color: 'var(--gray-500)', marginLeft: 6 }}>
                (<strong style={{ color: '#059669' }}>{activeCount} Allowed</strong> · <strong style={{ color: blockedCount > 0 ? '#dc2626' : '#64748b' }}>{blockedCount} Blocked</strong>)
              </span>
            )}
          </div>
          {roster.length > 0 && (
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={handleToggleAll}
                title={allActive ? "Untick to block all students" : "Tick to allow all students"}
              >
                {allActive ? 'Block All Students' : 'Allow All Students'}
              </button>
            </div>
          )}
        </div>
        <div className="table-wrapper">
          {loading ? (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--gray-400)' }}>Loading...</div>
          ) : roster.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--gray-400)' }}>
              No students uploaded yet for this academic year. Upload an Excel file or add manually above.
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th style={{ width: 46, textAlign: 'center' }}>
                    <input
                      type="checkbox"
                      checked={allActive}
                      ref={el => { if (el) el.indeterminate = someActive && !allActive; }}
                      onChange={handleToggleAll}
                      title={allActive ? "Untick to block all students" : "Tick to allow all students"}
                      style={{ cursor: 'pointer', width: 16, height: 16, accentColor: '#4f46e5' }}
                    />
                  </th>
                  <th style={{ width: 50 }}>#</th>
                  <th>Enrollment No.</th>
                  <th>Student Name</th>
                  <th style={{ width: 140 }}>Feedback Access</th>
                  <th>Uploaded Date</th>
                  <th style={{ width: 60, textAlign: 'center' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {roster.map((s, i) => {
                  const isAllowed = s.is_active !== 0;
                  return (
                    <tr
                      key={s.id}
                      style={{
                        background: isAllowed ? undefined : 'rgba(239, 68, 68, 0.03)',
                        transition: 'background 0.15s ease'
                      }}
                    >
                      <td style={{ textAlign: 'center' }}>
                        <input
                          type="checkbox"
                          checked={isAllowed}
                          onChange={() => handleToggleAccess(s.id, isAllowed)}
                          title={isAllowed ? "Untick to block this student from filling feedback" : "Tick to allow this student to fill feedback"}
                          style={{ cursor: 'pointer', width: 16, height: 16, accentColor: '#4f46e5' }}
                        />
                      </td>
                      <td style={{ color: 'var(--gray-400)', fontSize: 12 }}>{i + 1}</td>
                      <td>
                        <code style={{ background: 'var(--gray-100)', padding: '2px 8px', borderRadius: 4, fontSize: 13, fontWeight: 600, color: 'var(--gray-800)' }}>
                          {s.enrollment_no}
                        </code>
                      </td>
                      <td style={{ fontWeight: 500, color: isAllowed ? 'var(--gray-900)' : 'var(--gray-500)' }}>
                        {s.name}
                      </td>
                      <td>
                        {isAllowed ? (
                          <span
                            onClick={() => handleToggleAccess(s.id, isAllowed)}
                            title="Click to block student"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4,
                              fontSize: 11,
                              fontWeight: 700,
                              color: '#047857',
                              background: '#ecfdf5',
                              padding: '2px 8px',
                              borderRadius: 12,
                              border: '1px solid #a7f3d0',
                              cursor: 'pointer',
                              userSelect: 'none'
                            }}
                          >
                            ✓ Allowed
                          </span>
                        ) : (
                          <span
                            onClick={() => handleToggleAccess(s.id, isAllowed)}
                            title="Click to allow student"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4,
                              fontSize: 11,
                              fontWeight: 700,
                              color: '#b91c1c',
                              background: '#fef2f2',
                              padding: '2px 8px',
                              borderRadius: 12,
                              border: '1px solid #fecaca',
                              cursor: 'pointer',
                              userSelect: 'none'
                            }}
                          >
                            ✕ Blocked
                          </span>
                        )}
                      </td>
                      <td style={{ fontSize: 12, color: 'var(--gray-500)' }}>
                        {new Date(s.uploaded_at).toLocaleDateString('en-IN')}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <button
                          className="btn btn-danger btn-sm"
                          style={{ padding: '4px 8px' }}
                          title="Remove student"
                          onClick={() => handleDelete(s.id)}
                        >
                          <Trash2 size={12} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
