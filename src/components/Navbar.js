import React from 'react';
import './Navbar.css';

const Navbar = ({ currentPage, navigate, user, onLogout }) => {
  const allLinks = [
    { id: 'dashboard',   label: 'Dashboard',     icon: '📊', roles: ['admin', 'hr'] },
    { id: 'employees',   label: 'Employees',     icon: '👥', roles: ['admin', 'hr'] },
    { id: 'attendance',  label: 'Attendance',    icon: '📅', roles: ['admin', 'hr', 'employee'] },
    { id: 'worklog',     label: 'Work Tracker',  icon: '⏱️', roles: ['admin', 'hr', 'employee'] },
    { id: 'performance', label: 'Performance',   icon: '⭐', roles: ['admin', 'hr'] },
    { id: 'leave',       label: 'Leave',         icon: '📝', roles: ['admin', 'hr', 'employee'] },
    { id: 'noticeboard', label: 'Notice Board',  icon: '🔔', roles: ['admin', 'hr', 'employee'] },
    { id: 'reports',     label: 'Reports',       icon: '📈', roles: ['admin', 'hr'] },
    { id: 'myprofile',   label: 'My Profile',    icon: '👤', roles: ['employee'] },
    { id: 'add',         label: 'Add Employee',  icon: '➕', roles: ['admin'] },
  ];

  const links = allLinks.filter(l => l.roles.includes(user.role));

  const roleColor = { admin: '#f5a623', hr: '#3dd68c', employee: '#7c6af5' };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <span className="brand-icon">🏢</span>
        <div>
          <div className="brand-title">EMS</div>
          <div className="brand-sub">Management System</div>
        </div>
      </div>

      <div className="user-info">
        <div className="user-avatar" style={{ background: roleColor[user.role] }}>
          {user.username.charAt(0).toUpperCase()}
        </div>
        <div>
          <div className="user-name">{user.username}</div>
          <div className="user-role" style={{ color: roleColor[user.role] }}>{user.role.toUpperCase()}</div>
        </div>
      </div>

      <ul className="nav-links">
        {links.map(link => (
          <li key={link.id}>
            <button
              className={`nav-btn ${currentPage === link.id ? 'active' : ''}`}
              onClick={() => navigate(link.id)}
            >
              <span className="nav-icon">{link.icon}</span>
              <span>{link.label}</span>
            </button>
          </li>
        ))}
      </ul>

      <button className="logout-btn" onClick={onLogout}>🚪 Logout</button>

      <div className="navbar-footer">
        <p>College Mini Project</p>
        <p>React + Node + MongoDB</p>
      </div>
    </nav>
  );
};

export default Navbar;
