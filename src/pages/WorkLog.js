import React, { useEffect, useState } from 'react';
import { getWorkLogs, addWorkLog, getAllEmployees, getAllWorkLogs, deleteWorkLog } from '../api';
import './WorkLog.css';

const WorkLog = ({ user }) => {
  const [logs, setLogs] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [selectedEmpId, setSelectedEmpId] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const today = new Date().toISOString().split('T')[0];

  const [form, setForm] = useState({
    date: today,
    hoursWorked: '',
    tasksCompleted: '',
    description: ''
  });

  const isEmployee = user.role === 'employee';
  const isAdminOrHR = user.role === 'admin' || user.role === 'hr';

  const fetchLogs = async (empId) => {
    if (!empId) return;
    setLoading(true);
    try {
      const res = await getWorkLogs(empId);
      setLogs(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isEmployee) {
      setSelectedEmpId(user.employeeId);
      fetchLogs(user.employeeId);
    } else {
      // admin/hr - load all employees
      getAllEmployees()
        .then(res => {
          setEmployees(res.data);
          if (res.data.length > 0) {
            setSelectedEmpId(res.data[0]._id);
            fetchLogs(res.data[0]._id);
          }
        })
        .catch(err => console.error(err))
        .finally(() => setLoading(false));
    }
  }, []);

  const handleEmpChange = (e) => {
    setSelectedEmpId(e.target.value);
    fetchLogs(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedEmpId) return alert('Please select an employee');
    setSaving(true);
    setSuccessMsg('');
    try {
      await addWorkLog({
        employeeId: selectedEmpId,
        date: form.date,
        hoursWorked: Number(form.hoursWorked),
        tasksCompleted: Number(form.tasksCompleted),
        description: form.description,
        enteredBy: user.role
      });
      setSuccessMsg('✅ Work log saved successfully!');
      setForm({ date: today, hoursWorked: '', tasksCompleted: '', description: '' });
      fetchLogs(selectedEmpId);
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      alert('Failed to save work log');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this work log?')) return;
    try {
      await deleteWorkLog(id);
      fetchLogs(selectedEmpId);
    } catch (err) {
      alert('Failed to delete');
    }
  };

  const selectedEmp = employees.find(e => e._id === selectedEmpId);

  return (
    <div className="worklog-page">
      <div className="page-header">
        <div>
          <h1>Daily Work Tracker</h1>
          <p>{isEmployee ? 'Log your daily work and view history' : 'Track employee daily work logs'}</p>
        </div>
      </div>

      {/* Employee selector for admin/hr */}
      {isAdminOrHR && (
        <div className="emp-selector">
          <label>Select Employee:</label>
          <select value={selectedEmpId} onChange={handleEmpChange} className="emp-select">
            {employees.map(emp => (
              <option key={emp._id} value={emp._id}>{emp.name} — {emp.department}</option>
            ))}
          </select>
        </div>
      )}

      <div className="worklog-grid">
        {/* Add Log Form */}
        <div className="log-form-card">
          <h3>➕ Add Work Log</h3>
          {selectedEmp && <p className="for-emp">For: <strong>{selectedEmp.name}</strong></p>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Date</label>
              <input
                type="date"
                value={form.date}
                max={today}
                onChange={e => setForm({ ...form, date: e.target.value })}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Hours Worked</label>
                <input
                  type="number"
                  min="0" max="24" step="0.5"
                  placeholder="e.g. 8"
                  value={form.hoursWorked}
                  onChange={e => setForm({ ...form, hoursWorked: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Tasks Completed</label>
                <input
                  type="number"
                  min="0"
                  placeholder="e.g. 5"
                  value={form.tasksCompleted}
                  onChange={e => setForm({ ...form, tasksCompleted: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Work Description</label>
              <textarea
                placeholder="What did you work on today? e.g. Fixed login bug, attended meeting..."
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                rows={4}
                className="work-textarea"
              />
            </div>

            {successMsg && <div className="success-msg">{successMsg}</div>}

            <button type="submit" className="btn-save" disabled={saving}>
              {saving ? 'Saving...' : '✓ Save Work Log'}
            </button>
          </form>
        </div>

        {/* History Table */}
        <div className="log-history-card">
          <h3>📅 Last 5 Days History</h3>
          {loading ? (
            <p className="loading-text">Loading...</p>
          ) : logs.length === 0 ? (
            <div className="no-logs">
              <span>📭</span>
              <p>No work logs found</p>
            </div>
          ) : (
            <div className="log-list">
              {logs.map(log => (
                <div className="log-item" key={log._id}>
                  <div className="log-date-row">
                    <span className="log-date">
                      📅 {new Date(log.date + 'T00:00:00').toLocaleDateString('en-IN', {
                        weekday: 'short', day: '2-digit', month: 'short', year: 'numeric'
                      })}
                    </span>
                    <span className="log-by">by {log.enteredBy}</span>
                    {isAdminOrHR && (
                      <button className="btn-del-log" onClick={() => handleDelete(log._id)}>✕</button>
                    )}
                  </div>

                  <div className="log-stats">
                    <div className="log-stat">
                      <span className="log-stat-icon">⏱️</span>
                      <div>
                        <div className="log-stat-num">{log.hoursWorked}h</div>
                        <div className="log-stat-label">Hours Worked</div>
                      </div>
                    </div>
                    <div className="log-stat">
                      <span className="log-stat-icon">✅</span>
                      <div>
                        <div className="log-stat-num">{log.tasksCompleted}</div>
                        <div className="log-stat-label">Tasks Done</div>
                      </div>
                    </div>
                    <div className="log-productivity">
                      <div className="prod-label">Productivity</div>
                      <div className="prod-bar-wrap">
                        <div
                          className="prod-bar"
                          style={{ width: `${Math.min((log.hoursWorked / 8) * 100, 100)}%` }}
                        />
                      </div>
                      <div className="prod-pct">{Math.min(Math.round((log.hoursWorked / 8) * 100), 100)}%</div>
                    </div>
                  </div>

                  {log.description && (
                    <div className="log-desc">"{log.description}"</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkLog;
