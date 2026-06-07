import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from '../layouts/AdminLayout';
import StaffLayout from '../layouts/StaffLayout';
import UserLayout from '../layouts/UserLayout';

import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';

import DashboardPage from '../pages/admin/DashboardPage';
import UserManagementPage from '../pages/admin/UserManagementPage';
import VehicleTypePage from '../pages/admin/VehicleTypePage';
import FloorPage from '../pages/admin/FloorPage';

import CheckInPage from '../pages/staff/CheckInPage';
import CheckOutPage from '../pages/staff/CheckOutPage';

import HomePage from '../pages/user/HomePage';
import ReservationPage from '../pages/user/ReservationPage';

import NotFoundPage from '../pages/notfound/NotFoundPage';
import ProtectedRoute from './ProtectedRoute';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* User Routes */}
      <Route element={<ProtectedRoute allowedRoles={['user']} />} >
        <Route element={<UserLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/reservation" element={<ReservationPage />} />
        </Route>
      </Route>

      {/* Staff Routes */}
      <Route element={<ProtectedRoute allowedRoles={['staff']} />} >
        <Route element={<StaffLayout />}>
          <Route path="/staff" element={<CheckInPage />} />
          <Route path="/staff/checkout" element={<CheckOutPage />} />
        </Route>
      </Route>

      {/* Admin Routes */}
      <Route element={<ProtectedRoute allowedRoles={['admin']} />} >
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<DashboardPage />} />
          <Route path="/admin/users" element={<UserManagementPage />} />
          <Route path="/admin/vehicle-types" element={<VehicleTypePage />} />
          <Route path="/admin/floors" element={<FloorPage />} />
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="/404" element={<NotFoundPage />} />
      <Route path="*" element={<Navigate to="/404" />} />
    </Routes>
  );
};

export default AppRoutes;
