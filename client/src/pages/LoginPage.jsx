import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username || !form.password) { toast.error('Enter username and password'); return; }
    setLoading(true);
    try {
      const { data } = await API.post('/auth/login', form);
      login(data.user, data.token);
      toast.success(`Welcome, ${data.user.name}!`);
      navigate('/teacher');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <div className="icon"><img src="/logo.png" alt="Government Polytechnic Awasari (Kh) Logo" /></div>
          <h1>Class Teacher Login</h1>
          <p>Government Polytechnic Awasari (Kh) · All Departments</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label required">Username</label>
            <input className="form-control" placeholder="e.g. computer@first, automobile@second, mechanical@third" value={form.username}
              onChange={e => setForm(f => ({ ...f, username: e.target.value.toLowerCase().trim() }))} required autoFocus />
            <div style={{ fontSize: 11, color: 'var(--gray-500)', marginTop: 4 }}>
              Format: <code>&lt;branch&gt;@&lt;sem&gt;</code> (e.g. <code>computer@first</code>, <code>automobile@third</code>, <code>civil@fifth</code>)
            </div>
          </div>

          <div className="form-group">
            <label className="form-label required">Password</label>
            <div style={{ position: 'relative' }}>
              <input type={showPw ? 'text' : 'password'} className="form-control" placeholder="Enter password"
                value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required style={{ paddingRight: 38 }} />
              <button type="button" onClick={() => setShowPw(v => !v)}
                style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--gray-400)', cursor: 'pointer' }}>
                {showPw ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
          </div>

          <button type="submit" className="btn btn-primary" id="login-btn" style={{ width: '100%', justifyContent: 'center', padding: '11px', marginTop: 8, fontSize: 14 }} disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <button className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center', marginTop: 16 }} onClick={() => navigate('/')}>
          <ArrowLeft size={14} /> Back to Home
        </button>

        <div style={{ marginTop: 16, textAlign: 'center', fontSize: 11, color: 'var(--gray-400)' }}>
          Government Polytechnic Awasari (Kh) · All Departments · MSBTE K-Scheme
        </div>
      </div>
    </div>
  );
}
