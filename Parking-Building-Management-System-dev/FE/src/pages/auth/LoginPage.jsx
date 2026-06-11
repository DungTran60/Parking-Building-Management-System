import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import authApi from '../../api/authApi';
import './Auth.css';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    // Kiểm tra dữ liệu đầu vào phía Client
    if (!username.trim() || !password.trim()) {
      setError('Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu.');
      return;
    }

    setLoading(true);
    try {
      // Gọi API Đăng nhập phía Backend
      const response = await authApi.login({
        username: username.trim(),
        password: password
      });

      const { token, user } = response.data;

      // Lưu trữ token và thông tin người dùng vào localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      console.log('[LoginPage] Xác thực đăng nhập thành công! Vai trò:', user.role);

      // Điều hướng động theo vai trò người dùng
      if (user.role === 'admin') {
        navigate('/admin');
      } else if (user.role === 'staff') {
        navigate('/staff');
      } else {
        navigate('/');
      }
    } catch (err) {
      console.error('[LoginPage] Lỗi đăng nhập:', err);
      const serverMessage = err.response?.data?.message;
      setError(serverMessage || 'Không thể kết nối đến máy chủ. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-card-body">
          <div className="auth-header">
            <h1 className="auth-logo">PBMS <span>System</span></h1>
            <p className="auth-subtitle">Hệ thống quản lý tòa nhà gửi xe thông minh</p>
          </div>

          {error && (
            <div className="auth-alert auth-alert-error">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div className="auth-form-group">
              <label className="auth-label" htmlFor="username">TÊN ĐĂNG NHẬP</label>
              <div className="auth-input-wrapper">
                <input
                  type="text"
                  id="username"
                  className="auth-input"
                  placeholder="Nhập tài khoản của bạn..."
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="auth-form-group">
              <label className="auth-label" htmlFor="password">MẬT KHẨU</label>
              <div className="auth-input-wrapper">
                <input
                  type="password"
                  id="password"
                  className="auth-input"
                  placeholder="Nhập mật khẩu..."
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? (
                <>
                  <div className="spinner"></div>
                  <span>Đang đăng nhập...</span>
                </>
              ) : (
                <span>ĐĂNG NHẬP</span>
              )}
            </button>
          </form>

          <div className="auth-footer">
            <span>Chưa có tài khoản? </span>
            <Link to="/register" className="auth-link">Đăng ký ngay</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
