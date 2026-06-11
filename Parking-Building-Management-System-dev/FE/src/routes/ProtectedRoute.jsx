import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = ({ allowedRoles }) => {
  // Đọc thông tin token và người dùng từ localStorage
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  
  let user = null;
  try {
    user = userStr ? JSON.parse(userStr) : null;
  } catch (error) {
    console.error('[ProtectedRoute] Lỗi khi chuyển đổi thông tin người dùng JSON:', error);
  }

  // Xác định trạng thái đăng nhập và vai trò
  const isAuthenticated = !!token;
  const userRole = user ? user.role : null;

  if (!isAuthenticated) {
    // Chuyển hướng về trang đăng nhập nếu chưa xác thực
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(userRole)) {
    // Chuyển hướng về trang 404 nếu vai trò không được cấp quyền truy cập
    return <Navigate to="/404" replace />;
  }

  // Hiển thị các thành phần con bên trong nhóm định tuyến được bảo vệ này
  return <Outlet />;
};

export default ProtectedRoute;
