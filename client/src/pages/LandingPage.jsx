import { useNavigate } from 'react-router-dom';
import { ClipboardList, Lock, Shield, CheckCircle, Info } from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="landing-page">
      {/* Header */}
      <header className="landing-header">
        <div className="landing-header-inner">
          <div className="landing-brand-group">
            <div className="landing-logo">
              <img src="/logo.png" alt="Government Polytechnic Awasari (Kh) Logo" />
            </div>
            <div>
              <div className="landing-inst">Government Polytechnic Awasari (Khurd)</div>
              <div className="landing-scheme">Department of Computer Engineering</div>
            </div>
          </div>

          <div className="landing-header-actions">
            <button className="landing-nav-btn secondary" onClick={() => navigate('/about')}>
              <Info size={14} /> <span>About Developer</span>
            </button>
            <button className="landing-nav-btn primary" onClick={() => navigate('/login')}>
              <Lock size={14} /> <span>Teacher Login</span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <div className="landing-hero">
        <div className="landing-hero-inner">
          <div className="landing-badge">
            <Shield size={14} /> Official Faculty Feedback Portal
          </div>
          <h1 className="landing-title">Student Feedback on<br />Faculty Performance</h1>
          <p className="landing-subtitle">
            Government Polytechnic Awasari (Kh) · Computer Engineering Department · MSBTE K-Scheme
          </p>

          <div className="landing-cards">
            {/* Student Card */}
            <div className="landing-card primary" onClick={() => navigate('/feedback')}>
              <div className="lc-icon"><ClipboardList size={32} /></div>
              <h2>Fill Feedback Form</h2>
              <p>Rate your faculty on 16 MSBTE parameters. Enter your enrollment number to begin.</p>
              <div className="lc-features">
                <span><CheckCircle size={13} /> Enrollment verified</span>
                <span><CheckCircle size={13} /> One-time submission</span>
                <span><CheckCircle size={13} /> Takes ~5 minutes</span>
              </div>
              <button className="btn btn-white" id="student-feedback-btn">
                Start Feedback →
              </button>
            </div>

            {/* Teacher Card */}
            <div className="landing-card secondary" onClick={() => navigate('/login')}>
              <div className="lc-icon"><Lock size={32} /></div>
              <h2>Class Teacher Login</h2>
              <p>Manage sessions, assign faculty, upload rosters, and download result reports.</p>
              <div className="lc-features">
                <span><CheckCircle size={13} /> Create sessions</span>
                <span><CheckCircle size={13} /> Track submissions</span>
                <span><CheckCircle size={13} /> Download Excel</span>
              </div>
              <button className="btn btn-outline" id="teacher-login-btn">
                Login →
              </button>
            </div>
          </div>

          {/* Info strip */}
          <div className="landing-info-strip">
            <span>📋 16 MSBTE Parameters</span>
            <span>🔒 Enrollment Verified</span>
            <span>📊 Excel Reports</span>
            <span>👥 Batch-wise Practical</span>
          </div>
        </div>
      </div>

      {/* Basic Clean Footer */}
      <footer className="landing-footer">
        <p>© 2025 Government Polytechnic Awasari (Khurd) · Department of Computer Engineering</p>
        <p className="landing-footer-sub">MSBTE K-Scheme Faculty Feedback Portal</p>
      </footer>
    </div>
  );
}
