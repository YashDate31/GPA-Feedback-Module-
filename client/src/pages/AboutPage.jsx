import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Shield, CheckCircle, GraduationCap, Award, BookOpen, ExternalLink, Code2 } from 'lucide-react';

const GithubIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const InstagramIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

export default function AboutPage() {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#f8fafc' }}>
      {/* Top Header */}
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
          <div>
            <button className="btn btn-secondary btn-sm" onClick={() => navigate('/')}>
              <ArrowLeft size={14} /> Back to Home
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main style={{ flex: 1, padding: '36px 16px 60px', maxWidth: 920, margin: '0 auto', width: '100%' }}>
        {/* Header Title Section */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '4px 14px',
              borderRadius: 20,
              background: '#e0e7ff',
              color: '#3730a3',
              fontSize: 12,
              fontWeight: 700,
              marginBottom: 12,
              letterSpacing: '0.02em',
            }}
          >
            <Shield size={13} /> Project & Developer Profile
          </div>
          <h1 style={{ fontSize: 'clamp(24px, 3.8vw, 34px)', fontWeight: 800, color: '#0f172a', marginBottom: 8, letterSpacing: '-0.02em' }}>
            About the System & Developer
          </h1>
          <p style={{ fontSize: 14.5, color: '#64748b', maxWidth: 580, margin: '0 auto', lineHeight: 1.6 }}>
            Faculty Performance Feedback Evaluation Module developed for Government Polytechnic Awasari (Khurd), across all Engineering Departments.
          </p>
        </div>

        {/* Developer Spotlight Card */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: 16,
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 20px -2px rgba(15, 23, 42, 0.06)',
            overflow: 'hidden',
            marginBottom: 24,
          }}
        >
          {/* Subtle top accent bar */}
          <div style={{ height: 4, background: 'linear-gradient(90deg, #3b82f6 0%, #2563eb 50%, #1d4ed8 100%)' }} />

          <div style={{ padding: '28px 24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap', marginBottom: 20 }}>
              {/* Monogram Avatar */}
              <div
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: 16,
                  background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  fontWeight: 800,
                  fontSize: 26,
                  fontFamily: 'Outfit, sans-serif',
                  boxShadow: '0 6px 16px rgba(15, 23, 42, 0.2)',
                  flexShrink: 0,
                  border: '2px solid #ffffff',
                  outline: '2px solid #cbd5e1',
                }}
              >
                YD
              </div>

              {/* Developer Details */}
              <div style={{ flex: 1, minWidth: 240 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 6 }}>
                  <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    Yash Vijay Date
                  </h2>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      padding: '2px 10px',
                      borderRadius: 12,
                      background: '#eff6ff',
                      color: '#1d4ed8',
                      border: '1px solid #bfdbfe',
                    }}
                  >
                    Lead Developer
                  </span>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      padding: '2px 10px',
                      borderRadius: 12,
                      background: '#f1f5f9',
                      color: '#475569',
                      border: '1px solid #e2e8f0',
                    }}
                  >
                    Batch 2024–27
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, color: '#334155', fontWeight: 600, marginBottom: 4 }}>
                  <span>Enrollment Number:</span>
                  <span
                    style={{
                      fontFamily: 'monospace',
                      fontSize: 14.5,
                      fontWeight: 700,
                      color: '#2563eb',
                      background: '#f8fafc',
                      padding: '2px 8px',
                      borderRadius: 6,
                      border: '1px solid #e2e8f0',
                    }}
                  >
                    24210270230
                  </span>
                </div>

                <div style={{ fontSize: 13, color: '#64748b' }}>
                  Department of Computer Engineering · Government Polytechnic Awasari (Khurd), Pune
                </div>
              </div>
            </div>

            {/* Social & Contact Actions Row */}
            <div
              style={{
                display: 'flex',
                gap: 10,
                flexWrap: 'wrap',
                paddingTop: 18,
                borderTop: '1px solid #f1f5f9',
              }}
            >
              {/* GitHub */}
              <a
                href="https://github.com/YashDate31"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '9px 16px',
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 600,
                  background: '#0f172a',
                  color: '#ffffff',
                  textDecoration: 'none',
                  transition: 'all 0.15s ease',
                  border: '1px solid #0f172a',
                }}
                onMouseOver={e => e.currentTarget.style.background = '#1e293b'}
                onMouseOut={e => e.currentTarget.style.background = '#0f172a'}
              >
                <GithubIcon size={16} /> GitHub: YashDate31 <ExternalLink size={12} style={{ opacity: 0.6 }} />
              </a>

              {/* Instagram */}
              <a
                href="https://instagram.com/_dy.patil_"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '9px 16px',
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 600,
                  background: '#f8fafc',
                  color: '#0f172a',
                  textDecoration: 'none',
                  border: '1px solid #cbd5e1',
                  transition: 'all 0.15s ease',
                }}
                onMouseOver={e => { e.currentTarget.style.borderColor = '#c084fc'; e.currentTarget.style.background = '#faf5ff'; e.currentTarget.style.color = '#7e22ce'; }}
                onMouseOut={e => { e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.color = '#0f172a'; }}
              >
                <InstagramIcon size={16} /> Instagram: @_dy.patil_ <ExternalLink size={12} style={{ opacity: 0.6 }} />
              </a>

              {/* Email */}
              <a
                href="mailto:yashdate31@gmail.com"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '9px 16px',
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 600,
                  background: '#f8fafc',
                  color: '#0f172a',
                  textDecoration: 'none',
                  border: '1px solid #cbd5e1',
                  transition: 'all 0.15s ease',
                }}
                onMouseOver={e => { e.currentTarget.style.borderColor = '#93c5fd'; e.currentTarget.style.background = '#eff6ff'; e.currentTarget.style.color = '#1d4ed8'; }}
                onMouseOut={e => { e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.color = '#0f172a'; }}
              >
                <Mail size={16} /> yashdate31@gmail.com
              </a>
            </div>
          </div>
        </div>

        {/* Two Column Grid: College & Architecture */}
        <div className="grid-2" style={{ gap: 20, marginBottom: 28 }}>
          {/* Institution Card */}
          <div
            style={{
              background: '#ffffff',
              borderRadius: 14,
              border: '1px solid #e2e8f0',
              padding: '22px 20px',
              boxShadow: '0 2px 10px rgba(15, 23, 42, 0.03)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 10,
                  border: '1px solid #e2e8f0',
                  padding: 3,
                  background: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <img src="/logo.png" alt="GPA Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              </div>
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: 0 }}>
                  Government Polytechnic Awasari (Kh)
                </h3>
                <p style={{ fontSize: 11.5, color: '#94a3b8', margin: '2px 0 0' }}>
                  ESTD. 2008 · तेजस्वि नावधीतमस्तु
                </p>
              </div>
            </div>

            <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.6, marginBottom: 16 }}>
              Government Polytechnic, Awasari (Khurd) is an autonomous government polytechnic institution under the Directorate of Technical Education (DTE), Maharashtra.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12.5, color: '#475569' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <GraduationCap size={15} color="#2563eb" />
                <span>Department: <strong style={{ color: '#0f172a' }}>Computer Engineering</strong></span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Award size={15} color="#2563eb" />
                <span>Affiliation: <strong style={{ color: '#0f172a' }}>MSBTE Mumbai (K-Scheme)</strong></span>
              </div>
            </div>
          </div>

          {/* Module Architecture Card */}
          <div
            style={{
              background: '#ffffff',
              borderRadius: 14,
              border: '1px solid #e2e8f0',
              padding: '22px 20px',
              boxShadow: '0 2px 10px rgba(15, 23, 42, 0.03)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 10,
                  background: '#eff6ff',
                  color: '#2563eb',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <BookOpen size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: 0 }}>
                  Feedback Evaluation Module
                </h3>
                <p style={{ fontSize: 11.5, color: '#94a3b8', margin: '2px 0 0' }}>
                  Faculty Performance Evaluation System
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 12.5, color: '#64748b' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                <CheckCircle size={15} color="#10b981" style={{ marginTop: 2, flexShrink: 0 }} />
                <span><strong style={{ color: '#0f172a' }}>16 Parameters:</strong> Detailed evaluation from syllabus delivery to internship mentoring.</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                <CheckCircle size={15} color="#10b981" style={{ marginTop: 2, flexShrink: 0 }} />
                <span><strong style={{ color: '#0f172a' }}>Enrollment Verification:</strong> Ensures authentic, one-time submissions by registered students.</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                <CheckCircle size={15} color="#10b981" style={{ marginTop: 2, flexShrink: 0 }} />
                <span><strong style={{ color: '#0f172a' }}>Class Teacher Controls:</strong> Dedicated management per semester for sessions and Excel reports.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Return Button */}
        <div style={{ textAlign: 'center', marginTop: 32 }}>
          <button
            className="btn btn-primary"
            onClick={() => navigate('/')}
            style={{
              padding: '11px 26px',
              fontSize: 14,
              fontWeight: 700,
              borderRadius: 8,
              background: '#2563eb',
              boxShadow: '0 4px 14px rgba(37, 99, 235, 0.25)',
            }}
          >
            <ArrowLeft size={16} /> Return to Home Portal
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="landing-footer" style={{ borderTop: '1px solid #e2e8f0', background: '#ffffff' }}>
        <div style={{ marginBottom: 4 }}>
          © 2025 Government Polytechnic Awasari (Khurd) · All Departments
        </div>
        <div style={{ fontSize: 11, color: '#64748b' }}>
          Designed & Developed by <strong style={{ color: '#0f172a' }}>Yash Vijay Date</strong> (Enrollment: 24210270230) · Computer Engineering Batch 2024–27
        </div>
      </footer>
    </div>
  );
}
