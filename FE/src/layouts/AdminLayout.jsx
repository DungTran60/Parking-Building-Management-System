import React from 'react';
import { Outlet } from 'react-router-dom';

const AdminLayout = () => {
  return (
    <div className="admin-layout">
      <nav>Admin Navigation</nav>
      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
