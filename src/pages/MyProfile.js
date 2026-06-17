import React, { useEffect, useState } from 'react';
import { getEmployeeById } from '../api';
import './MyProfile.css';

const StarDisplay = ({ value }) => (
  <div className="stars">
    {[1,2,3,4,5].map(s => (
      <span key={s} className={`star ${s <= value ? 'filled' : ''}`}>★</span>
    ))}
  </div>
);

const getRatingLabel = (rating) => {
  if (!rating) return { label: 'Not Reviewed Yet', color: '#6b6b80' };
  if (rating === 5) return { label: 'Excellent ⭐', color: '#3dd68c' };
  if (rating === 4) return { label: 'Good 👍', color: '#7c6af5' };
  if (rating === 3) return { label: 'Average 😐', color: '#f5a623' };
  if (rating === 2) return { label: 'Below Average', color: '#f05252' };
  return { label: 'Poor', color: '#f05252' };
};

const MyProfile = ({ user }) => {
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user.employeeId) {
      getEmployeeById(user.employeeId)
        .then(res => setEmployee(res.data))
        .catch(err => console.error(err))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [user]);

  if (loading) return <div className="loading">Loading your profile...</div>;
  if (!employee) return <div className="loading">Profile not linked. Contact admin.</div>;

  const { label, color } = getRatingLabel(employee.performanceRating);

  return (
    <div className="profile-page">
      <div className="page-header">
        <h1>My Profile</h1>
        <p>Your personal information and performance</p>
      </div>

      <div className="profile-grid">
        {/* Profile Card */}
        <div className="profile-card">
          <div className="profile-avatar">{employee.name.charAt(0).toUpperCase()}</div>
          <h2 className="profile-name">{employee.name}</h2>
          <p className="profile-position">{employee.position}</p>
          <span className={`profile-status ${employee.status === 'Active' ? 'status-active' : 'status-inactive'}`}>
            {employee.status}
          </span>
        </div>

        {/* Details Card */}
        <div className="details-card">
          <h3>Personal Details</h3>
          <div className="detail-grid">
            <div className="detail-item">
              <div className="detail-label">📧 Email</div>
              <div className="detail-value">{employee.email}</div>
            </div>
            <div className="detail-item">
              <div className="detail-label">📱 Phone</div>
              <div className="detail-value">{employee.phone}</div>
            </div>
            <div className="detail-item">
              <div className="detail-label">🏢 Department</div>
              <div className="detail-value">{employee.department}</div>
            </div>
            <div className="detail-item">
              <div className="detail-label">💼 Position</div>
              <div className="detail-value">{employee.position}</div>
            </div>
            <div className="detail-item">
              <div className="detail-label">💰 Salary</div>
              <div className="detail-value">₹{employee.salary?.toLocaleString()}/month</div>
            </div>
            <div className="detail-item">
              <div className="detail-label">📅 Joining Date</div>
              <div className="detail-value">
                {employee.joiningDate ? new Date(employee.joiningDate).toLocaleDateString('en-IN') : 'N/A'}
              </div>
            </div>
          </div>
        </div>

        {/* Performance Card */}
        <div className="perf-card">
          <h3>My Performance Rating</h3>
          <div className="perf-content">
            <StarDisplay value={employee.performanceRating || 0} />
            <div className="perf-label" style={{ color }}>{label}</div>
            {employee.performanceNote && (
              <div className="perf-note">
                <strong>Review Note:</strong>
                <p>"{employee.performanceNote}"</p>
              </div>
            )}
            {employee.reviewDate && (
              <div className="perf-date">
                Reviewed on: {new Date(employee.reviewDate).toLocaleDateString('en-IN')}
              </div>
            )}
            {!employee.performanceRating && (
              <p className="no-review">Your performance has not been reviewed yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyProfile;
