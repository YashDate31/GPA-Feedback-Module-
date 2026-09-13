import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ClipboardList, Lock, Shield, CheckCircle, Info,
  MessageSquareHeart, Mail, Copy, Check, X, Send
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function LandingPage() {
  const navigate = useNavigate();
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [copied, setCopied] = useState(false);

  const developerEmail = 'dypatil311@gmail.com';

  const handleSendEmail = (e) => {
    if (e) e.preventDefault();
    const subject = encodeURIComponent('Website Feedback - GPA Faculty Feedback Portal');
    const body = encodeURIComponent(
      feedbackText.trim()
        ? `Hello,\n\nI would like to share the following feedback about the GPA Feedback Portal website:\n\n${feedbackText.trim()}\n\n---\nSent from GPA Feedback Portal`
        : 'Hello,\n\nI would like to share feedback about the GPA Feedback Portal website.\n\n'
    );
    window.location.href = `mailto:${developerEmail}?subject=${subject}&body=${body}`;
    toast.success('Opening your email app...', { icon: '✉️' });
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(developerEmail);
    setCopied(true);
    toast.success('Email copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

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
              <div className="landing-scheme">All Engineering Departments</div>
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
            Government Polytechnic Awasari (Kh) · All Engineering Departments · MSBTE K-Scheme
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
                <span><CheckCircle size={13} /> Download Excel & PDF</span>
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
            <span>📊 Excel & PDF Reports</span>
            <span>👥 Batch-wise Practical</span>
          </div>
        </div>
      </div>

      {/* Basic Clean Footer */}
      <footer className="landing-footer">
        <p>© 2025 Government Polytechnic Awasari (Khurd) · All Departments</p>
        <p className="landing-footer-sub" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, flexWrap: 'wrap' }}>
          <span>MSBTE K-Scheme Faculty Feedback Portal</span>
          <span style={{ opacity: 0.5 }}>·</span>
          <button
            type="button"
            onClick={() => setShowFeedbackModal(true)}
            style={{
              background: 'none',
              border: 'none',
              color: '#4f46e5',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: 12,
              padding: 0,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4
            }}
          >
            <MessageSquareHeart size={13} />
            <span>Send Website Feedback</span>
          </button>
        </p>
      </footer>

      {/* Floating Website Feedback Button */}
      <div className="landing-feedback-fab">
        <button
          className="feedback-fab-btn"
          onClick={() => setShowFeedbackModal(true)}
          title="Send Website Feedback to Developer"
          aria-label="Send website feedback"
        >
          <MessageSquareHeart size={18} />
          <span className="fab-label">Website Feedback</span>
        </button>
      </div>

      {/* Website Feedback Modal */}
      {showFeedbackModal && (
        <div className="feedback-modal-overlay" onClick={() => setShowFeedbackModal(false)}>
          <div className="feedback-modal-card" onClick={e => e.stopPropagation()}>
            <div className="feedback-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div className="feedback-modal-icon">
                  <MessageSquareHeart size={20} />
                </div>
                <div>
                  <h3>Website Feedback</h3>
                  <p>Share your suggestions or report issues</p>
                </div>
              </div>
              <button
                className="feedback-modal-close"
                onClick={() => setShowFeedbackModal(false)}
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <div className="feedback-modal-body">
              <div className="feedback-email-pill">
                <span className="pill-label">To:</span>
                <span className="pill-email">{developerEmail}</span>
                <button
                  type="button"
                  className="pill-copy-btn"
                  onClick={handleCopyEmail}
                  title="Copy email"
                >
                  {copied ? <Check size={14} color="#16a34a" /> : <Copy size={14} />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              <div className="form-group" style={{ marginBottom: 16 }}>
                <label className="form-label" style={{ fontSize: 13, marginBottom: 6 }}>
                  Your Message / Feedback:
                </label>
                <textarea
                  className="form-control"
                  rows={4}
                  placeholder="Type your feedback, suggestion, or issue you encountered on the website..."
                  value={feedbackText}
                  onChange={e => setFeedbackText(e.target.value)}
                  style={{ resize: 'vertical', fontSize: 13 }}
                  autoFocus
                />
              </div>

              <div className="feedback-modal-actions">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleSendEmail}
                  style={{ flex: 1, justifyContent: 'center', padding: '10px 16px' }}
                >
                  <Send size={15} /> Send via Email
                </button>
                <a
                  href={`mailto:${developerEmail}?subject=Website%20Feedback%20-%20GPA%20Portal`}
                  className="btn btn-secondary"
                  style={{ padding: '10px 14px' }}
                  title="Open in Mail app directly"
                  onClick={() => toast.success('Opening mail app...')}
                >
                  <Mail size={15} />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
