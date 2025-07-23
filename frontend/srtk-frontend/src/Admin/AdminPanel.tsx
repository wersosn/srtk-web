import React from 'react';
import Sidebar from './Sidebar';
import { Outlet } from 'react-router-dom';
import "./AdminPanel.css";

const AdminPanel: React.FC = () => {
  return (
    <div className="admin-container">
      <div className="admin-card-wrapper">
        <main className="admin-main">
          <Outlet />
        </main>
        <Sidebar />
      </div>
    </div>
  );
};

export default AdminPanel;