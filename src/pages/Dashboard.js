import React, { useEffect, useState } from 'react';
import { getAllEmployees } from '../api';
import './Dashboard.css';

const Dashboard = ({ navigate }) => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllEmployees()
      .then(res => setEmployees(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const total = employees.length;
  const active = employees.filter(e => e.status === 'Active').length;
  const inactive = employees.filter(e => e.status === 'Inactive').length;

  const deptCount = employees.reduce((acc, emp) => {
    acc[emp.department] = (acc[emp.department] || 0) + 1;
    return acc;
  }, {});

  const totalSalary = employees.reduce((sum, e) => sum + (e.salary || 0), 0);

  const recent = [...employees].slice(0, 5);

  if (loading) return <div className="loading">Loading dashboard...</div>;

  return (
    <div className="dashboard">
      <div className="page-header">
        <h1>Dashboard</h1>
        <p>Overview of your employee data</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-info">
            <div className="stat-num">{total}</div>
            <div className="stat-label">Total Employees</div>
          </div>
        </div>
        <div className="stat-card green">
          <div className="stat-icon">✅</div>
          <div className="stat-info">
            <div className="stat-num">{active}</div>
            <div className="stat-label">Active</div>
          </div>
        </div>
        <div className="stat-card red">
          <div className="stat-icon">❌</div>
          <div className="stat-info">
            <div className="stat-num">{inactive}</div>
            <div className="stat-label">Inactive</div>
          </div>
        </div>
        <div className="stat-card purple">
          <div className="stat-icon">💰</div>
          <div className="stat-info">
            <div className="stat-num">₹{(totalSalary / 1000).toFixed(0)}K</div>
            <div className="stat-label">Total Payroll/mo</div>
          </div>
        </div>
      </div>

      <div className="dashboard-bottom">
        <div className="dept-card">
          <h3>By Department</h3>
          {Object.keys(deptCount).length === 0 ? (
            <p className="no-data">No data yet</p>
          ) : (
            Object.entries(deptCount).map(([dept, count]) => (
              <div className="dept-row" key={dept}>
                <span>{dept}</span>
                <div className="dept-bar-wrap">
                  <div
                    className="dept-bar"
                    style={{ width: `${(count / total) * 100}%` }}
                  />
                </div>
                <span className="dept-count">{count}</span>
              </div>
            ))
          )}
        </div>

        <div className="recent-card">
          <div className="card-header-row">
            <h3>Recent Employees</h3>
            <button className="view-all-btn" onClick={() => navigate('employees')}>View All →</button>
          </div>
          {recent.length === 0 ? (
            <div className="empty-state">
              <p>No employees added yet.</p>
              <button className="btn-accent" onClick={() => navigate('add')}>Add First Employee</button>
            </div>
          ) : (
            <table className="mini-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Department</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recent.map(emp => (
                  <tr key={emp._id}>
                    <td>{emp.name}</td>
                    <td>{emp.department}</td>
                    <td>
                      <span className={`badge ${emp.status === 'Active' ? 'badge-green' : 'badge-red'}`}>
                        {emp.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
