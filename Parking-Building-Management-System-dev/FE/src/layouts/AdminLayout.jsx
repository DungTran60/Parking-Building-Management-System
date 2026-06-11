import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import authApi from '../api/authApi';
import '../pages/auth/Auth.css';

const AdminLayout = () => {
  const navigate = useNavigate();
  
  // Safely read user info from localStorage
  const userStr = localStorage.getItem('user');
  let user = { fullName: 'Admin', role: 'admin' };
  try {
    if (userStr) {
      user = JSON.parse(userStr);
    }
  } catch (error) {
    console.error('[AdminLayout] Error reading user details:', error);
  }

  const handleLogout = async () => {
    try {
      // Optional background logout call
      await authApi.logout();
    } catch (error) {
      console.warn('[AdminLayout] Logout endpoint failed or bypassed:', error);
    } finally {
      // Always clear localStorage and redirect
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      console.log('[AdminLayout] Logged out successfully.');
      navigate('/login');
    }
  };

  return (
    <div className="admin-layout">
      <header className="layout-header">
        <div style={{ fontWeight: 800, fontSize: '20px', letterSpacing: '-0.3px' }}>
          🏢 PBMS <span style={{ color: '#c084fc' }}>Admin Dashboard</span>
        </div>
        <div className="layout-user-info">
          <span style={{ fontSize: '14.5px', color: 'rgba(255,255,255,0.9)' }}>
            Chào, <strong>{user.fullName}</strong>
          </span>
          <span className="user-badge" style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#fca5a5', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
            {user.role}
          </span>
          <button onClick={handleLogout} className="layout-logout-btn">
            Đăng xuất
          </button>
        </div>
      </header>
      <main style={{ padding: '24px', boxSizing: 'border-box' }}>
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
