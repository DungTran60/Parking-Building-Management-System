import React from 'react';
import { Outlet } from 'react-router-dom';

const UserLayout = () => {
  return (
    <div className="user-layout">
      <nav>User Navigation</nav>
      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default UserLayout;
