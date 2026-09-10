import React, { useEffect, useRef, useState } from 'react';
import { Upload, Users, Trash2, Download, AlertCircle, CheckCircle, FileSpreadsheet } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import API from '../../api/axios';
import toast from 'react-hot-toast';

export default function HODRoster() {
  const { user } = useAuth();
  const [roster, setRoster] = useState([]);
  const [years, setYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedSem, setSelectedSem] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef();

  useEffect(() => {
    API.get('/academic-years').then(r => {
      const ay = r.data.academic_years;
      setYears(ay);
      const cur = ay.find(y => y.is_current) || ay[0];
      if (cur) setSelectedYear(cur.id);
    });
  }, []);

  const loadRoster = () => {
    if (!selectedYear) return;
    setLoading(true);
    const params = new URLSearchParams({ dept_id: user.department_id, academic_year_id: selectedYear });
    if (selectedSem) params.append('semester', selectedSem);
    API.get(`/roster?${params}`).then(r => setRoster(r.data.roster)).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { loadRoster(); }, [selectedYear, selectedSem]);

  const handleUpload = async (file) => {
    if (!file) return;
    if (!selectedYear || !selectedSem) { toast.error('Please select Academic Year and Semester first'); return; }
    if (!file.name.match(/\.(xlsx|xls|csv)$/i)) { toast.error('Only Excel (.xlsx, .xls) or CSV files allowed'); return; }

    const fd = new FormData();
    fd.append('file', file);
    fd.append('department_id', user.department_id);
    fd.append('semester', selectedSem);
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

  const handleDelete = async (id) => {
    if (!confirm('Remove this student from roster?')) return;
    try {
      await API.delete(`/roster/${id}`);
      setRoster(r => r.filter(s => s.id !== id));
      toast.success('Student removed');
    } catch { toast.error('Failed to remove'); }
  };

  const downloadTemplate = () => {
    const header = 'Enrollment No,Name,Batch\n';
    const sample = '22001001,Rahul Sharma,B1\n22001002,Priya Patil,B2\n22001003,Amit Desai,B3\n';
    const blob = new Blob([header + sample], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'student_roster_template.csv';
    a.click();
  };

  const batchCounts = roster.reduce((acc, s) => { acc[s.batch] = (acc[s.batch] || 0) + 1; return acc; }, {});

  return (
    <div className="animate-fadeIn">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ marginBottom: 4 }}>Student Roster</h2>
          <p style={{ margin: 0 }}>Upload student list via Excel to enable verified feedback submissions</p>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={downloadTemplate}>
          <Download size={14} /> Download Template
        </button>
      </div>

      <div className="alert alert-info mb-24">
        <AlertCircle size={16} style={{ flexShrink: 0 }} />
        <div>
          <strong>Why upload a roster?</strong> Only students whose Enrollment Numbers appear in this list can submit feedback. This prevents fake/unauthorized form submissions.
          <br /><strong>Required Excel columns:</strong> <code>Enrollment No</code>, <code>Name</code>, <code>Batch</code> (B1/B2/B3)
        </div>
      </div>

      {/* Filters */}
      <div className="card mb-24">
        <div className="card-body">
          <div className="grid-2">
            <div className="form-group mb-0">
              <label className="form-label required">Academic Year</label>
              <select className="form-control" value={selectedYear} onChange={e => setSelectedYear(e.target.value)}>
                {years.map(y => <option key={y.id} value={y.id}>{y.year_label}</option>)}
              </select>
            </div>
            <div className="form-group mb-0">
              <label className="form-label required">Semester</label>
              <select className="form-control" value={selectedSem} onChange={e => setSelectedSem(e.target.value)}>
                <option value="">All Semesters</option>
                {[1,2,3,4,5,6].map(s => <option key={s} value={s}>Semester {s}</option>)}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Upload Zone */}
      <div className="card mb-24">
        <div className="card-header">
          <FileSpreadsheet size={18} color="var(--primary-600)" />
          <h3>Upload Student Excel</h3>
        </div>
        <div className="card-body">
          <div
            className={`upload-zone ${dragOver ? 'drag-over' : ''}`}
            onClick={() => fileRef.current?.click()}
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={e => { e.preventDefault(); setDragOver(false); handleUpload(e.dataTransfer.files[0]); }}
          >
            <div className="upload-icon">
              {uploading ? <span className="spin" style={{ width: 24, height: 24, border: '3px solid var(--primary-200)', borderTopColor: 'var(--primary-600)', borderRadius: '50%', display: 'block' }} />
                : <Upload size={24} />}
            </div>
            <h4 style={{ marginBottom: 8 }}>{uploading ? 'Uploading...' : 'Drag & Drop Excel file here'}</h4>
            <p style={{ fontSize: 13, marginBottom: 12 }}>or click to browse · Supports .xlsx, .xls, .csv</p>
            <span className="btn btn-primary btn-sm" style={{ pointerEvents: 'none' }}>Choose File</span>
          </div>
          <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" style={{ display: 'none' }} onChange={e => handleUpload(e.target.files[0])} />

          {uploadResult && (
            <div className={`alert ${uploadResult.success ? 'alert-success' : 'alert-danger'}`} style={{ marginTop: 16 }}>
              {uploadResult.success ? <CheckCircle size={16} style={{ flexShrink: 0 }} /> : <AlertCircle size={16} style={{ flexShrink: 0 }} />}
              <div>
                {uploadResult.success
                  ? <><strong>{uploadResult.message}</strong>{uploadResult.errors?.length > 0 && <div style={{ marginTop: 4, fontSize: 12 }}>Warnings: {uploadResult.errors.join('; ')}</div>}</>
                  : uploadResult.error}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Roster Table */}
      <div className="card">
        <div className="card-header">
          <Users size={18} color="var(--primary-600)" />
          <h3>
            Student Roster
            {roster.length > 0 && <span className="badge badge-primary" style={{ marginLeft: 10 }}>{roster.length} students</span>}
          </h3>
          {Object.keys(batchCounts).length > 0 && (
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
              {Object.entries(batchCounts).sort().map(([b, c]) => (
                <span key={b} className="badge badge-gray">{b}: {c}</span>
              ))}
            </div>
          )}
        </div>
        <div className="table-wrapper">
          {loading ? (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--gray-400)' }}>Loading roster...</div>
          ) : roster.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--gray-400)' }}>
              No students in roster. Upload an Excel file to add students.
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Enrollment No.</th>
                  <th>Name</th>
                  <th>Semester</th>
                  <th>Batch</th>
                  <th>Uploaded</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {roster.map((s, i) => (
                  <tr key={s.id}>
                    <td style={{ color: 'var(--gray-400)', fontSize: 12 }}>{i + 1}</td>
                    <td><code style={{ background: 'var(--gray-100)', padding: '2px 6px', borderRadius: 4, fontSize: 12 }}>{s.enrollment_no}</code></td>
                    <td style={{ fontWeight: 500 }}>{s.name}</td>
                    <td>Sem {s.semester}</td>
                    <td><span className="badge badge-primary">{s.batch}</span></td>
                    <td style={{ fontSize: 12, color: 'var(--gray-400)' }}>{new Date(s.uploaded_at).toLocaleDateString('en-IN')}</td>
                    <td>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(s.id)}>
                        <Trash2 size={12} />
                      </button>
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
