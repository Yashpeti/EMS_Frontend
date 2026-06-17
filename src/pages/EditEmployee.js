import React, { useState, useEffect } from 'react';
import { getEmployeeById, updateEmployee } from '../api';
import './EmployeeForm.css';

const EditEmployee = ({ id, navigate }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    department: 'Engineering',
    position: '',
    salary: '',
    joiningDate: '',
    status: 'Active'
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    getEmployeeById(id)
      .then(res => {
        const emp = res.data;
        setFormData({
          name: emp.name,
          email: emp.email,
          phone: emp.phone,
          department: emp.department,
          position: emp.position,
          salary: emp.salary,
          joiningDate: emp.joiningDate?.split('T')[0] || '',
          status: emp.status
        });
      })
      .catch(() => setError('Failed to load employee data'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await updateEmployee(id, formData);
      alert('Employee updated successfully!');
      navigate('employees');
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed!');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="loading">Loading employee data...</div>;

  return (
    <div className="form-page">
      <div className="page-header">
        <div>
          <h1>Edit Employee</h1>
          <p>Update the employee information below</p>
        </div>
        <button className="btn-back" onClick={() => navigate('employees')}>← Back</button>
      </div>

      <div className="form-card">
        {error && <div className="error-msg">⚠️ {error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label>Full Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Email Address *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Phone Number *</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Department *</label>
              <select name="department" value={formData.department} onChange={handleChange} required>
                <option>HR</option>
                <option>Engineering</option>
                <option>Marketing</option>
                <option>Finance</option>
                <option>Sales</option>
                <option>Operations</option>
              </select>
            </div>

            <div className="form-group">
              <label>Position / Role *</label>
              <input
                type="text"
                name="position"
                value={formData.position}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Monthly Salary (₹) *</label>
              <input
                type="number"
                name="salary"
                value={formData.salary}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Joining Date *</label>
              <input
                type="date"
                name="joiningDate"
                value={formData.joiningDate}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Status</label>
              <select name="status" value={formData.status} onChange={handleChange}>
                <option>Active</option>
                <option>Inactive</option>
              </select>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn-cancel" onClick={() => navigate('employees')}>
              Cancel
            </button>
            <button type="submit" className="btn-submit" disabled={saving}>
              {saving ? 'Saving...' : '✓ Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditEmployee;
