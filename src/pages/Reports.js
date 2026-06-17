import React, { useEffect, useState } from 'react';
import { getAllEmployees } from '../api';
import './Reports.css';

const Reports = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllEmployees()
      .then(res => setEmployees(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading">Loading reports...</div>;

  // Department count
  const deptCount = employees.reduce((acc, e) => {
    acc[e.department] = (acc[e.department] || 0) + 1;
    return acc;
  }, {});

  // Salary by department (average)
  const deptSalary = employees.reduce((acc, e) => {
    if (!acc[e.department]) acc[e.department] = { total: 0, count: 0 };
    acc[e.department].total += e.salary;
    acc[e.department].count += 1;
    return acc;
  }, {});

  // Active vs Inactive
  const active = employees.filter(e => e.status === 'Active').length;
  const inactive = employees.filter(e => e.status === 'Inactive').length;

  // Performance rating distribution
  const ratingDist = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0, 'Not Rated': 0 };
  employees.forEach(e => {
    if (e.performanceRating) ratingDist[e.performanceRating]++;
    else ratingDist['Not Rated']++;
  });

  const maxDeptCount = Math.max(...Object.values(deptCount));
  const maxSalary = Math.max(...Object.values(deptSalary).map(d => d.total / d.count));

  const deptColors = {
    HR: '#7c6af5', Engineering: '#3dd68c', Marketing: '#f5a623',
    Finance: '#f05252', Sales: '#38bdf8', Operations: '#fb7185'
  };

  const ratingColors = { 5: '#3dd68c', 4: '#7c6af5', 3: '#f5a623', 2: '#f97316', 1: '#f05252', 'Not Rated': '#6b6b80' };
  const ratingLabels = { 5: 'Excellent ⭐', 4: 'Good 👍', 3: 'Average 😐', 2: 'Below Avg', 1: 'Poor', 'Not Rated': 'Not Rated' };

  const totalSalary = employees.reduce((sum, e) => sum + (e.salary || 0), 0);
  const avgSalary = employees.length ? Math.round(totalSalary / employees.length) : 0;
  const topSalary = employees.length ? Math.max(...employees.map(e => e.salary || 0)) : 0;

  return (
    <div className="reports-page">
      <div className="page-header">
        <div>
          <h1>📊 Reports & Charts</h1>
          <p>Visual overview of your workforce</p>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-icon">👥</div>
          <div className="metric-num">{employees.length}</div>
          <div className="metric-label">Total Employees</div>
        </div>
        <div className="metric-card">
          <div className="metric-icon">💰</div>
          <div className="metric-num">₹{(totalSalary / 1000).toFixed(0)}K</div>
          <div className="metric-label">Monthly Payroll</div>
        </div>
        <div className="metric-card">
          <div className="metric-icon">📈</div>
          <div className="metric-num">₹{(avgSalary / 1000).toFixed(1)}K</div>
          <div className="metric-label">Avg Salary</div>
        </div>
        <div className="metric-card">
          <div className="metric-icon">🏆</div>
          <div className="metric-num">₹{(topSalary / 1000).toFixed(0)}K</div>
          <div className="metric-label">Highest Salary</div>
        </div>
      </div>

      <div className="charts-grid">
        {/* Employees by Department */}
        <div className="chart-card">
          <h3>👥 Employees by Department</h3>
          <div className="bar-chart">
            {Object.entries(deptCount).map(([dept, count]) => (
              <div className="bar-row" key={dept}>
                <div className="bar-label">{dept}</div>
                <div className="bar-wrap">
                  <div
                    className="bar-fill"
                    style={{
                      width: `${(count / maxDeptCount) * 100}%`,
                      background: deptColors[dept] || 'var(--accent)'
                    }}
                  />
                </div>
                <div className="bar-value">{count}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Active vs Inactive */}
        <div className="chart-card">
          <h3>✅ Active vs Inactive</h3>
          <div className="donut-chart-wrap">
            <div className="donut-chart">
              <svg viewBox="0 0 120 120" width="160" height="160">
                {employees.length > 0 && (() => {
                  const activeAngle = (active / employees.length) * 360;
                  const r = 45, cx = 60, cy = 60;
                  const toRad = deg => (deg - 90) * Math.PI / 180;
                  const x1 = cx + r * Math.cos(toRad(0));
                  const y1 = cy + r * Math.sin(toRad(0));
                  const x2 = cx + r * Math.cos(toRad(activeAngle));
                  const y2 = cy + r * Math.sin(toRad(activeAngle));
                  const large = activeAngle > 180 ? 1 : 0;
                  return (
                    <>
                      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f05252" strokeWidth="18" />
                      <path
                        d={`M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`}
                        fill="none" stroke="#3dd68c" strokeWidth="18"
                      />
                    </>
                  );
                })()}
                <text x="60" y="56" textAnchor="middle" fill="white" fontSize="16" fontWeight="bold">{employees.length}</text>
                <text x="60" y="70" textAnchor="middle" fill="#6b6b80" fontSize="8">Total</text>
              </svg>
            </div>
            <div className="donut-legend">
              <div className="legend-item"><span className="legend-dot" style={{ background: '#3dd68c' }} /><span>Active: <strong>{active}</strong></span></div>
              <div className="legend-item"><span className="legend-dot" style={{ background: '#f05252' }} /><span>Inactive: <strong>{inactive}</strong></span></div>
              <div className="legend-item"><span className="legend-dot" style={{ background: '#7c6af5' }} /><span>Active Rate: <strong>{employees.length ? Math.round((active / employees.length) * 100) : 0}%</strong></span></div>
            </div>
          </div>
        </div>

        {/* Average Salary by Department */}
        <div className="chart-card">
          <h3>💰 Avg Salary by Department</h3>
          <div className="bar-chart">
            {Object.entries(deptSalary).map(([dept, data]) => {
              const avg = Math.round(data.total / data.count);
              return (
                <div className="bar-row" key={dept}>
                  <div className="bar-label">{dept}</div>
                  <div className="bar-wrap">
                    <div
                      className="bar-fill"
                      style={{
                        width: `${(avg / maxSalary) * 100}%`,
                        background: deptColors[dept] || 'var(--accent)'
                      }}
                    />
                  </div>
                  <div className="bar-value">₹{(avg / 1000).toFixed(0)}K</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Performance Distribution */}
        <div className="chart-card">
          <h3>⭐ Performance Distribution</h3>
          <div className="perf-dist">
            {Object.entries(ratingDist).reverse().map(([rating, count]) => (
              <div className="perf-dist-row" key={rating}>
                <div className="perf-dist-label">{ratingLabels[rating]}</div>
                <div className="perf-dist-bar-wrap">
                  <div
                    className="perf-dist-bar"
                    style={{
                      width: employees.length ? `${(count / employees.length) * 100}%` : '0%',
                      background: ratingColors[rating]
                    }}
                  />
                </div>
                <div className="perf-dist-count">{count}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Earners Table */}
      <div className="chart-card top-earners">
        <h3>🏆 Top 5 Earners</h3>
        <table className="earners-table">
          <thead>
            <tr><th>#</th><th>Name</th><th>Department</th><th>Position</th><th>Salary</th></tr>
          </thead>
          <tbody>
            {[...employees].sort((a, b) => b.salary - a.salary).slice(0, 5).map((emp, i) => (
              <tr key={emp._id}>
                <td>
                  <span className="rank-badge">{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}</span>
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div className="mini-avatar">{emp.name.charAt(0)}</div>
                    {emp.name}
                  </div>
                </td>
                <td><span className="dept-tag">{emp.department}</span></td>
                <td>{emp.position}</td>
                <td><strong style={{ color: 'var(--success)' }}>₹{emp.salary?.toLocaleString()}</strong></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Reports;
