import { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import StudentPage from './pages/StudentPage';
import AboutPage from './pages/AboutPage';
import TeacherLayout from './pages/teacher/TeacherLayout';
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import TeacherSessions from './pages/teacher/TeacherSessions';
import TeacherAllocations from './pages/teacher/TeacherAllocations';
import TeacherRoster from './pages/teacher/TeacherRoster';
import TeacherReports from './pages/teacher/TeacherReports';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname]);
  return null;
}

function PrivateRoute({ children }) {
  const { token, loading } = useAuth();
  if (loading) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>Loading...</div>;
  return token ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/feedback" element={<StudentPage />} />
        <Route path="/teacher" element={<PrivateRoute><TeacherLayout /></PrivateRoute>}>
          <Route index element={<TeacherDashboard />} />
          <Route path="sessions" element={<TeacherSessions />} />
          <Route path="allocations" element={<TeacherAllocations />} />
          <Route path="roster" element={<TeacherRoster />} />
          <Route path="reports" element={<TeacherReports />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
