import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import authApi from '../../api/authApi';
import './Auth.css';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    phoneNumber: '',
    role: 'user' // Default to Driver ('user')
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value
    }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const { username, password, confirmPassword, fullName, phoneNumber, role } = formData;

    // Kiểm tra dữ liệu đầu vào phía Client
    if (!username.trim() || !password.trim() || !confirmPassword.trim() || !fullName.trim() || !phoneNumber.trim()) {
      setError('Vui lòng điền đầy đủ tất cả các trường thông tin.');
      return;
    }

    if (password.length < 6) {
      setError('Mật khẩu phải dài tối thiểu 6 ký tự.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Xác nhận mật khẩu không khớp. Vui lòng kiểm tra lại.');
      return;
    }

    const phoneRegex = /^\d{9,11}$/;
    if (!phoneRegex.test(phoneNumber.trim())) {
      setError('Số điện thoại không hợp lệ (yêu cầu từ 9 đến 11 chữ số).');
      return;
    }

    setLoading(true);
    try {
      // Gọi API Đăng ký phía Backend
      const response = await authApi.register({
        username: username.trim(),
        password: password,
        fullName: fullName.trim(),
        phoneNumber: phoneNumber.trim(),
        role: role
      });

      setSuccess('Đăng ký tài khoản thành công! Đang chuyển hướng...');
      
      // Tự động chuyển hướng về trang đăng nhập sau 2 giây
      setTimeout(() => {
        navigate('/login');
      }, 2000);

    } catch (err) {
      console.error('[RegisterPage] Lỗi đăng ký:', err);
      const serverMessage = err.response?.data?.message;
      setError(serverMessage || 'Có lỗi xảy ra trong quá trình đăng ký. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-card-body">
          <div className="auth-header">
            <h1 className="auth-logo">PBMS <span>Register</span></h1>
            <p className="auth-subtitle">Tạo tài khoản thành viên hệ thống tòa nhà gửi xe</p>
          </div>

          {error && (
            <div className="auth-alert auth-alert-error">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="auth-alert auth-alert-success">
              <span>✅</span>
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleRegister}>
            <div className="auth-form-group">
              <label className="auth-label" htmlFor="username">TÊN ĐĂNG NHẬP</label>
              <input
                type="text"
                id="username"
                className="auth-input"
                placeholder="Ví dụ: nguyenvana"
                value={formData.username}
                onChange={handleInputChange}
                disabled={loading}
              />
            </div>

            <div className="auth-form-group">
              <label className="auth-label" htmlFor="fullName">HỌ VÀ TÊN</label>
              <input
                type="text"
                id="fullName"
                className="auth-input"
                placeholder="Ví dụ: Nguyễn Văn A"
                value={formData.fullName}
                onChange={handleInputChange}
                disabled={loading}
              />
            </div>

            <div className="auth-form-group">
              <label className="auth-label" htmlFor="phoneNumber">SỐ ĐIỆN THOẠI</label>
              <input
                type="text"
                id="phoneNumber"
                className="auth-input"
                placeholder="Ví dụ: 0912345678"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                disabled={loading}
              />
            </div>

            <div className="auth-form-group">
              <label className="auth-label" htmlFor="role">VAI TRÒ (PHÂN QUYỀN)</label>
              <div className="auth-select-wrapper">
                <select
                  id="role"
                  className="auth-select"
                  value={formData.role}
                  onChange={handleInputChange}
                  disabled={loading}
                >
                  <option value="user">Tài xế (Driver / User)</option>
                  <option value="staff">Nhân viên (Staff)</option>
                  <option value="admin">Quản lý tòa nhà (Admin)</option>
                </select>
              </div>
            </div>

            <div className="auth-form-group">
              <label className="auth-label" htmlFor="password">MẬT KHẨU</label>
              <input
                type="password"
                id="password"
                className="auth-input"
                placeholder="Tối thiểu 6 ký tự..."
                value={formData.password}
                onChange={handleInputChange}
                disabled={loading}
              />
            </div>

            <div className="auth-form-group">
              <label className="auth-label" htmlFor="confirmPassword">XÁC NHẬN MẬT KHẨU</label>
              <input
                type="password"
                id="confirmPassword"
                className="auth-input"
                placeholder="Nhập lại mật khẩu..."
                value={formData.confirmPassword}
                onChange={handleInputChange}
                disabled={loading}
              />
            </div>

            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? (
                <>
                  <div className="spinner"></div>
                  <span>Đang xử lý đăng ký...</span>
                </>
              ) : (
                <span>ĐĂNG KÝ TÀI KHOẢN</span>
              )}
            </button>
          </form>

          <div className="auth-footer">
            <span>Đã có tài khoản? </span>
            <Link to="/login" className="auth-link">Đăng nhập</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
