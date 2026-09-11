import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, ClipboardList, BookOpen, Users, BarChart3, LogOut, GraduationCap } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const NAV = [
  { to: '/teacher', label: 'Dashboard', icon: <LayoutDashboard size={17} />, end: true },
  { to: '/teacher/sessions', label: 'Sessions', icon: <ClipboardList size={17} /> },
  { to: '/teacher/allocations', label: 'Allocations', icon: <BookOpen size={17} /> },
  { to: '/teacher/roster', label: 'Student Roster', icon: <Users size={17} /> },
  { to: '/teacher/reports', label: 'Reports & Download', icon: <BarChart3 size={17} /> },
];

export default function TeacherLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <nav className="navbar">
        <div className="navbar-inner">
          <div className="navbar-brand">
            <div className="brand-icon">
              <img src="/logo.png" alt="Government Polytechnic Awasari (Kh) Logo" />
            </div>
            <div>
              <div className="brand-name">Government Polytechnic Awasari (Kh)</div>
              <div className="brand-tagline">{user?.dept_name ? `Department of ${user.dept_name}` : 'MSBTE Faculty Feedback'} · Class Teacher Portal (Sem {user?.semester})</div>
            </div>
          </div>
          <div className="navbar-nav" style={{ gap: 12 }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 14px',
              background: '#f1f5f9',
              borderRadius: 20,
              border: '1px solid #e2e8f0',
              fontSize: 13,
              fontWeight: 600,
              color: '#1e293b',
            }}>
              <span style={{
                background: '#4f46e5',
                color: '#fff',
                fontSize: 11,
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: 12,
              }}>
                Sem {user?.semester}
              </span>
              <span>{user?.name || 'Class Teacher'}</span>
            </div>
            <button className="btn btn-secondary btn-sm" id="teacher-logout" onClick={() => { logout(); navigate('/'); }} style={{ padding: '7px 14px', borderRadius: 8 }}>
              <LogOut size={14} /> Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="layout-with-sidebar">
        <aside className="sidebar">
          <div className="sidebar-section-title">Navigation</div>
          {NAV.map(item => (
            <NavLink key={item.to} to={item.to} end={item.end}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <span className="icon">{item.icon}</span> {item.label}
            </NavLink>
          ))}
          <div style={{ marginTop: 'auto', paddingTop: 16 }}>
            <div style={{ padding: '10px 12px', background: 'var(--primary-50)', borderRadius: 8, border: '1px solid var(--primary-100)' }}>
              <div style={{ fontSize: 11, color: 'var(--primary-600)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>{user?.dept_code}</div>
              <div style={{ fontSize: 12, color: 'var(--gray-600)' }}>Semester {user?.semester}</div>
            </div>
          </div>
        </aside>
        <main className="main-content"><Outlet /></main>
      </div>
    </div>
  );
}
