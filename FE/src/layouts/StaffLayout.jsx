import React from 'react';
import { Outlet } from 'react-router-dom';

const StaffLayout = () => {
  return (
    <div className="staff-layout">
      <nav>Staff Navigation</nav>
      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default StaffLayout;
