import React, { useEffect, useState } from 'react';
import { getAllEmployees, getAttendance, markAttendance } from '../api';
import './Attendance.css';

const statusColors = {
  Present: '#3dd68c', Absent: '#f05252', 'Half Day': '#f5a623', Late: '#7c6af5'
};

const Attendance = ({ user }) => {
  const [employees, setEmployees] = useState([]);
  const [selectedEmpId, setSelectedEmpId] = useState('');
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState('');
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const today = new Date().toISOString().split('T')[0];

  const isAdminOrHR = user.role === 'admin' || user.role === 'hr';
  const isEmployee = user.role === 'employee';

  useEffect(() => {
    if (isAdminOrHR) {
      getAllEmployees().then(res => {
        setEmployees(res.data);
        if (res.data.length > 0) {
          setSelectedEmpId(res.data[0]._id);
          fetchRecords(res.data[0]._id);
        }
      });
    } else {
      setSelectedEmpId(user.employeeId);
      fetchRecords(user.employeeId);
    }
  }, []);

  const fetchRecords = async (empId) => {
    if (!empId) return;
    setLoading(true);
    try {
      const res = await getAttendance(empId);
      setRecords(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleEmpChange = (e) => {
    setSelectedEmpId(e.target.value);
    fetchRecords(e.target.value);
  };

  const handleMark = async (date, status) => {
    setSaving(date);
    try {
      await markAttendance({ employeeId: selectedEmpId, date, status, markedBy: user.role });
      fetchRecords(selectedEmpId);
    } catch (err) { alert('Failed to mark attendance'); }
    finally { setSaving(''); }
  };

  // get last 30 days
  const getLast30Days = () => {
    const days = [];
    for (let i = 0; i < 30; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push(d.toISOString().split('T')[0]);
    }
    return days;
  };

  const getStatusForDate = (date) => {
    const rec = records.find(r => r.date === date);
    return rec ? rec.status : null;
  };

  // monthly filtered records
  const monthRecords = records.filter(r => r.date.startsWith(month));
  const summary = { Present: 0, Absent: 0, 'Half Day': 0, Late: 0 };
  monthRecords.forEach(r => { summary[r.status] = (summary[r.status] || 0) + 1; });

  const last30 = getLast30Days();

  return (
    <div className="attendance-page">
      <div className="page-header">
        <div>
          <h1>Attendance Tracker</h1>
          <p>{isEmployee ? 'View your attendance history' : 'Mark and manage employee attendance'}</p>
        </div>
      </div>

      {isAdminOrHR && (
        <div className="emp-selector">
          <label>Select Employee:</label>
          <select value={selectedEmpId} onChange={handleEmpChange} className="emp-select">
            {employees.map(e => <option key={e._id} value={e._id}>{e.name} — {e.department}</option>)}
          </select>
        </div>
      )}

      {/* Summary Cards */}
      <div className="att-summary">
        {Object.entries(summary).map(([status, count]) => (
          <div className="att-stat" key={status} style={{ borderColor: statusColors[status] }}>
            <div className="att-stat-num" style={{ color: statusColors[status] }}>{count}</div>
            <div className="att-stat-label">{status}</div>
          </div>
        ))}
        <div className="att-stat">
          <div className="att-stat-num">{monthRecords.length}</div>
          <div className="att-stat-label">Total Marked</div>
        </div>
      </div>

      {/* Month selector */}
      <div className="month-selector">
        <label>View Month:</label>
        <input type="month" value={month} onChange={e => setMonth(e.target.value)} className="month-input" />
      </div>

      {/* Attendance Grid - Last 30 days */}
      {isAdminOrHR && (
        <div className="att-section">
          <h3>Mark Attendance — Last 30 Days</h3>
          {loading ? <p className="loading-text">Loading...</p> : (
            <div className="att-table-wrap">
              <table className="att-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Day</th>
                    <th>Status</th>
                    <th>Mark</th>
                  </tr>
                </thead>
                <tbody>
                  {last30.map(date => {
                    const status = getStatusForDate(date);
                    const dayName = new Date(date + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'short' });
                    return (
                      <tr key={date}>
                        <td>{date}</td>
                        <td>{dayName}</td>
                        <td>
                          {status ? (
                            <span className="att-badge" style={{ background: `${statusColors[status]}22`, color: statusColors[status] }}>
                              {status}
                            </span>
                          ) : <span className="att-badge-none">Not Marked</span>}
                        </td>
                        <td>
                          <div className="mark-btns">
                            {['Present', 'Absent', 'Half Day', 'Late'].map(s => (
                              <button
                                key={s}
                                className={`mark-btn ${status === s ? 'active' : ''}`}
                                style={status === s ? { background: statusColors[s], color: '#fff' } : {}}
                                onClick={() => handleMark(date, s)}
                                disabled={saving === date}
                              >{s === 'Half Day' ? '½' : s.charAt(0)}</button>
                            ))}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Employee view - read only history */}
      {isEmployee && (
        <div className="att-section">
          <h3>My Attendance History</h3>
          {loading ? <p className="loading-text">Loading...</p> : (
            <div className="att-table-wrap">
              <table className="att-table">
                <thead>
                  <tr><th>Date</th><th>Day</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {monthRecords.length === 0 ? (
                    <tr><td colSpan="3" style={{ textAlign: 'center', padding: '20px', color: 'var(--muted)' }}>No records for this month</td></tr>
                  ) : monthRecords.map(rec => (
                    <tr key={rec._id}>
                      <td>{rec.date}</td>
                      <td>{new Date(rec.date + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'short' })}</td>
                      <td>
                        <span className="att-badge" style={{ background: `${statusColors[rec.status]}22`, color: statusColors[rec.status] }}>
                          {rec.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Attendance;
