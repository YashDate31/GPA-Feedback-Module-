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

      {/* Proper Institutional Footer */}
      <footer className="portal-footer">
        <div className="portal-footer-inner">
          {/* Col 1: College Info */}
          <div className="pf-col pf-brand">
            <div className="pf-logo-group">
              <div className="pf-logo">
                <img src="/logo.png" alt="GPA Logo" />
              </div>
              <div>
                <div className="pf-inst-title">Government Polytechnic Awasari (Kh)</div>
                <div className="pf-inst-sub">Autonomous Institute · DTE Maharashtra · ESTD. 2008</div>
              </div>
            </div>
            <p className="pf-desc">
              Official Faculty Performance Feedback Evaluation Module developed for the Department of Computer Engineering in accordance with MSBTE K-Scheme evaluation standards.
            </p>
            <div className="pf-motto">
              <span>तेजस्वि नावधीतमस्तु</span> · <em>May our study be enlightened</em>
            </div>
          </div>

          {/* Col 2: Navigation Links */}
          <div className="pf-col pf-nav">
            <h4 className="pf-heading">Quick Navigation</h4>
            <ul className="pf-links">
              <li><button type="button" onClick={() => navigate('/')}>Home Portal</button></li>
              <li><button type="button" onClick={() => navigate('/feedback')}>Student Feedback Form</button></li>
              <li><button type="button" onClick={() => navigate('/login')}>Class Teacher Login</button></li>
              <li><button type="button" onClick={() => navigate('/about')}>About System & Developer</button></li>
            </ul>
          </div>

          {/* Col 3: Developer Info */}
          <div className="pf-col pf-dev">
            <h4 className="pf-heading">System Developer</h4>
            <div className="pf-dev-card">
              <div className="pf-dev-avatar">YD</div>
              <div>
                <div className="pf-dev-name">Yash Vijay Date</div>
                <div className="pf-dev-role">Lead Developer · Computer Engineering</div>
                <div className="pf-dev-meta">
                  Enroll: <code>24210270230</code> (Batch 2024–27)
                </div>
              </div>
            </div>
            <div className="pf-social-strip">
              <a href="https://github.com/YashDate31" target="_blank" rel="noopener noreferrer" className="pf-social-pill">
                GitHub
              </a>
              <a href="https://instagram.com/_dy.patil_" target="_blank" rel="noopener noreferrer" className="pf-social-pill">
                Instagram
              </a>
              <a href="mailto:yashdate31@gmail.com" className="pf-social-pill">
                Email
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="portal-footer-bottom">
          <div>
            © 2025 Government Polytechnic Awasari (Khurd) · Department of Computer Engineering
          </div>
          <div className="pf-bottom-sub">
            Confidential Student Feedback Evaluation Module · MSBTE K-Scheme
          </div>
        </div>
      </footer>
    </div>
  );
}
