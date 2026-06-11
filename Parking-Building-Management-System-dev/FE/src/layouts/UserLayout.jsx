import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import authApi from '../api/authApi';
import '../pages/auth/Auth.css';

const UserLayout = () => {
  const navigate = useNavigate();
  
  // Safely read user info from localStorage
  const userStr = localStorage.getItem('user');
  let user = { fullName: 'Driver', role: 'user' };
  try {
    if (userStr) {
      user = JSON.parse(userStr);
    }
  } catch (error) {
    console.error('[UserLayout] Error reading user details:', error);
  }

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.warn('[UserLayout] Logout endpoint failed or bypassed:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      console.log('[UserLayout] Logged out successfully.');
      navigate('/login');
    }
  };

  return (
    <div className="user-layout">
      <header className="layout-header" style={{ background: '#10b981' }}>
        <div style={{ fontWeight: 800, fontSize: '20px', letterSpacing: '-0.3px' }}>
          🚗 PBMS <span style={{ color: '#a7f3d0' }}>Driver Portal</span>
        </div>
        <div className="layout-user-info">
          <span style={{ fontSize: '14.5px', color: 'rgba(255,255,255,0.9)' }}>
            Chào, <strong>{user.fullName}</strong>
          </span>
          <span className="user-badge" style={{ background: 'rgba(255, 255, 255, 0.2)', color: '#fff', border: '1px solid rgba(255, 255, 255, 0.3)' }}>
            {user.role}
          </span>
          <button onClick={handleLogout} className="layout-logout-btn" style={{ border: '1px solid #fff', color: '#fff' }}>
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

export default UserLayout;
