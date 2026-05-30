import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = ({ allowedRoles }) => {
  // This is a placeholder for actual auth logic
  const auth = { token: true, role: 'admin' }; 

  if (!auth.token) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(auth.role)) {
    return <Navigate to="/404" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
