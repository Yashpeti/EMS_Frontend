import React, { useEffect, useState } from 'react';
import { getAllEmployees, deleteEmployee, createEmployeeUser } from '../api';
import './EmployeeList.css';

const EmployeeList = ({ navigate, user }) => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterDept, setFilterDept] = useState('All');
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedEmp, setSelectedEmp] = useState(null);
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [userMsg, setUserMsg] = useState('');

  const isAdmin = user.role === 'admin';

  const fetchEmployees = () => {
    getAllEmployees()
      .then(res => setEmployees(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchEmployees(); }, []);

  const handleDelete = async (id) => {
    if (!isAdmin) return;
    if (window.confirm('Are you sure you want to delete this employee?')) {
      try {
        await deleteEmployee(id);
        fetchEmployees();
      } catch (err) {
        alert('Failed to delete employee');
      }
    }
  };

  const openUserModal = (emp) => {
    setSelectedEmp(emp);
    setNewUsername(emp.email.split('@')[0]);
    setNewPassword('emp123');
    setUserMsg('');
    setShowUserModal(true);
  };

  const handleCreateUser = async () => {
    try {
      await createEmployeeUser({
        username: newUsername,
        password: newPassword,
        employeeId: selectedEmp._id
      });
      setUserMsg(`✅ Login created! Username: ${newUsername} | Password: ${newPassword}`);
    } catch (err) {
      setUserMsg('⚠️ ' + (err.response?.data?.message || 'Failed to create user'));
    }
  };

  const filtered = employees.filter(emp => {
    const matchSearch =
      emp.name.toLowerCase().includes(search.toLowerCase()) ||
      emp.email.toLowerCase().includes(search.toLowerCase()) ||
      emp.position.toLowerCase().includes(search.toLowerCase());
    const matchDept = filterDept === 'All' || emp.department === filterDept;
    return matchSearch && matchDept;
  });

  const departments = ['All', 'HR', 'Engineering', 'Marketing', 'Finance', 'Sales', 'Operations'];

  if (loading) return <div className="loading">Loading employees...</div>;

  return (
    <div className="employee-list">
      <div className="page-header">
        <div>
          <h1>Employees</h1>
          <p>{employees.length} total employees</p>
        </div>
        {isAdmin && (
          <button className="btn-primary" onClick={() => navigate('add')}>+ Add Employee</button>
        )}
      </div>

      <div className="filters">
        <input
          type="text"
          placeholder="🔍  Search by name, email, position..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="search-input"
        />
        <select value={filterDept} onChange={e => setFilterDept(e.target.value)} className="filter-select">
          {departments.map(d => <option key={d}>{d}</option>)}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="no-results">
          <span>😶</span>
          <p>No employees found</p>
        </div>
      ) : (
        <div className="table-wrap">
          <table className="emp-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Email</th>
                <th>Department</th>
                <th>Position</th>
                <th>Salary</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((emp, index) => (
                <tr key={emp._id}>
                  <td className="index-cell">{index + 1}</td>
                  <td className="name-cell">
                    <div className="avatar">{emp.name.charAt(0).toUpperCase()}</div>
                    <span>{emp.name}</span>
                  </td>
                  <td>{emp.email}</td>
                  <td><span className="dept-tag">{emp.department}</span></td>
                  <td>{emp.position}</td>
                  <td>₹{emp.salary?.toLocaleString()}</td>
                  <td>
                    <span className={`badge ${emp.status === 'Active' ? 'badge-green' : 'badge-red'}`}>
                      {emp.status}
                    </span>
                  </td>
                  <td>
                    <div className="action-btns">
                      {isAdmin && (
                        <button className="btn-edit" onClick={() => navigate('edit', emp._id)}>Edit</button>
                      )}
                      {isAdmin && (
                        <button className="btn-user" onClick={() => openUserModal(emp)} title="Create Login Account">🔑</button>
                      )}
                      {isAdmin && (
                        <button className="btn-delete" onClick={() => handleDelete(emp._id)}>Delete</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Employee User Modal */}
      {showUserModal && selectedEmp && (
        <div className="modal-overlay" onClick={() => setShowUserModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>🔑 Create Login — {selectedEmp.name}</h3>
              <button className="modal-close" onClick={() => setShowUserModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <p className="modal-desc">Create a login account so this employee can access the system.</p>
              <div className="modal-field">
                <label>Username</label>
                <input
                  type="text"
                  value={newUsername}
                  onChange={e => setNewUsername(e.target.value)}
                />
              </div>
              <div className="modal-field">
                <label>Password</label>
                <input
                  type="text"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                />
              </div>
              {userMsg && (
                <div className={`modal-msg ${userMsg.startsWith('✅') ? 'msg-success' : 'msg-error'}`}>
                  {userMsg}
                </div>
              )}
              <button className="btn-create-user" onClick={handleCreateUser}>
                Create Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeList;
