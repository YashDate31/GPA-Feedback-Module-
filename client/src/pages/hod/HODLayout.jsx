import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation, NavLink } from 'react-router-dom';
import { GraduationCap, LayoutDashboard, Users, BookOpen, ClipboardList, BarChart3, LogOut, Settings } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const NAV = [
  { to: '/hod', label: 'Dashboard',   icon: <LayoutDashboard size={17} />, exact: true },
  { to: '/hod/sessions',    label: 'Sessions',    icon: <ClipboardList size={17} /> },
  { to: '/hod/allocations', label: 'Allocations', icon: <BookOpen size={17} /> },
  { to: '/hod/roster',      label: 'Student Roster', icon: <Users size={17} /> },
  { to: '/hod/reports',     label: 'Reports',     icon: <BarChart3 size={17} /> },
];

export default function HODLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Navbar */}
      <nav className="navbar">
        <div className="navbar-inner">
          <div className="navbar-brand">
            <div className="brand-icon"><GraduationCap size={20} /></div>
            <div>
              <div className="brand-name">FeedbackPro · HOD</div>
              <div className="brand-tagline">MSBTE CIAAN-2023 K15 · {user?.dept_code}</div>
            </div>
          </div>
          <div className="navbar-nav" style={{ gap: 12 }}>
            <div style={{ fontSize: 13, color: 'var(--gray-500)' }}>
              <strong style={{ color: 'var(--gray-800)' }}>{user?.name}</strong>
              <span className="badge badge-primary" style={{ marginLeft: 8 }}>HOD</span>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={handleLogout} id="hod-logout">
              <LogOut size={14} /> Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="layout-with-sidebar">
        {/* Sidebar */}
        <aside className="sidebar">
          <div className="sidebar-section-title">Navigation</div>
          {NAV.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.exact}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <span className="icon">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
          <div style={{ marginTop: 'auto', paddingTop: 16 }}>
            <div style={{ padding: '12px', background: 'var(--primary-50)', borderRadius: 10, border: '1px solid var(--primary-100)' }}>
              <div style={{ fontSize: 11, color: 'var(--primary-600)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>
                {user?.dept_name}
              </div>
              <div style={{ fontSize: 12, color: 'var(--gray-500)' }}>Department Code: {user?.dept_code}</div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
