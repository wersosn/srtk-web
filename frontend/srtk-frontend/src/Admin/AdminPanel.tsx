import React, { useState } from 'react';
import Sidebar from './Sidebar';
import { Outlet } from 'react-router-dom';
import "./AdminPanel.css";
import burgerMenu from '../assets/menu-burger.png';
import burgerMenuLight from '../assets/menu-burger-light.png';
import { usePrefersDark } from '../Hooks/usePrefersDark';

const AdminPanel: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isDark = usePrefersDark();
    const icon = isDark ? burgerMenuLight : burgerMenu;
    
  return (
    <div className="admin-container">
      <div className="admin-card-wrapper">
        <main className="admin-main">
          <button className="sidebar-button icon-button" onClick={() => setSidebarOpen(!sidebarOpen)} title="Sidebar">
             <img src={icon} alt="Sidebar" style={{ width: '24px', height: '24px' }} />
          </button>
          <Outlet />
        </main>
        <Sidebar isOpen={sidebarOpen} />
      </div>
    </div>
  );
};

export default AdminPanel;