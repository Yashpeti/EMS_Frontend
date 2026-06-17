import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import EmployeeList from './pages/EmployeeList';
import AddEmployee from './pages/AddEmployee';
import EditEmployee from './pages/EditEmployee';
import Performance from './pages/Performance';
import WorkLog from './pages/WorkLog';
import MyProfile from './pages/MyProfile';
import Login from './pages/Login';
import Attendance from './pages/Attendance';
import NoticeBoard from './pages/NoticeBoard';
import LeaveRequest from './pages/LeaveRequest';
import Reports from './pages/Reports';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [page, setPage] = useState('dashboard');
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem('ems_user');
    if (saved) {
      const u = JSON.parse(saved);
      setUser(u);
      setPage(u.role === 'employee' ? 'myprofile' : 'dashboard');
    }
  }, []);

  const handleLogin = (u) => {
    setUser(u);
    setPage(u.role === 'employee' ? 'myprofile' : 'dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('ems_user');
    setUser(null);
    setPage('dashboard');
  };

  const navigate = (p, id = null) => {
    setEditId(id);
    setPage(p);
  };

  if (!user) return <Login onLogin={handleLogin} />;

  const isAdmin = user.role === 'admin';
  const isAdminOrHR = user.role === 'admin' || user.role === 'hr';
  const isEmployee = user.role === 'employee';

  return (
    <div className="app">
      <Navbar currentPage={page} navigate={navigate} user={user} onLogout={handleLogout} />
      <main className="main-content">
        {page === 'dashboard'   && isAdminOrHR   && <Dashboard navigate={navigate} />}
        {page === 'employees'   && isAdminOrHR   && <EmployeeList navigate={navigate} user={user} />}
        {page === 'performance' && isAdminOrHR   && <Performance user={user} />}
        {page === 'reports'     && isAdminOrHR   && <Reports />}
        {page === 'add'         && isAdmin       && <AddEmployee navigate={navigate} />}
        {page === 'edit'        && isAdmin       && <EditEmployee id={editId} navigate={navigate} />}
        {page === 'attendance'  && <Attendance user={user} />}
        {page === 'worklog'     && <WorkLog user={user} />}
        {page === 'leave'       && <LeaveRequest user={user} />}
        {page === 'noticeboard' && <NoticeBoard user={user} />}
        {page === 'myprofile'   && isEmployee    && <MyProfile user={user} />}
      </main>
    </div>
  );
}

export default App;
