import React, { useEffect, useState } from 'react';
import { getAllEmployees, updatePerformance } from '../api';
import './Performance.css';

const StarRating = ({ value, onChange, readonly }) => {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="stars">
      {[1,2,3,4,5].map(star => (
        <span
          key={star}
          className={`star ${star <= (hovered || value) ? 'filled' : ''} ${readonly ? 'readonly' : ''}`}
          onClick={() => !readonly && onChange(star)}
          onMouseEnter={() => !readonly && setHovered(star)}
          onMouseLeave={() => !readonly && setHovered(0)}
        >★</span>
      ))}
    </div>
  );
};

const getRatingLabel = (rating) => {
  if (!rating) return { label: 'Not Reviewed', color: '#6b6b80' };
  if (rating === 5) return { label: 'Excellent ⭐', color: '#3dd68c' };
  if (rating === 4) return { label: 'Good 👍', color: '#7c6af5' };
  if (rating === 3) return { label: 'Average 😐', color: '#f5a623' };
  if (rating === 2) return { label: 'Below Average', color: '#f05252' };
  return { label: 'Poor', color: '#f05252' };
};

const Performance = ({ user }) => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEmp, setSelectedEmp] = useState(null);
  const [rating, setRating] = useState(0);
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const canRate = user && (user.role === 'admin' || user.role === 'hr');

  const fetchEmployees = () => {
    getAllEmployees()
      .then(res => setEmployees(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchEmployees(); }, []);

  const openReview = (emp) => {
    setSelectedEmp(emp);
    setRating(emp.performanceRating || 0);
    setNote(emp.performanceNote || '');
    setSuccessMsg('');
  };

  const handleSave = async () => {
    if (!rating) return alert('Please select a rating!');
    setSaving(true);
    try {
      await updatePerformance(selectedEmp._id, { performanceRating: rating, performanceNote: note });
      setSuccessMsg('✅ Performance saved!');
      fetchEmployees();
      setTimeout(() => setSelectedEmp(null), 1200);
    } catch (err) {
      alert('Failed to save performance');
    } finally {
      setSaving(false);
    }
  };

  const reviewed = employees.filter(e => e.performanceRating);
  const notReviewed = employees.filter(e => !e.performanceRating);
  const avgRating = reviewed.length
    ? (reviewed.reduce((sum, e) => sum + e.performanceRating, 0) / reviewed.length).toFixed(1)
    : 'N/A';
  const topPerformer = [...reviewed].sort((a, b) => b.performanceRating - a.performanceRating)[0];

  if (loading) return <div className="loading">Loading performance data...</div>;

  return (
    <div className="performance-page">
      <div className="page-header">
        <div>
          <h1>Performance Tracker</h1>
          <p>{canRate ? 'Rate and review your employees' : 'View employee performance ratings'}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="perf-stats">
        <div className="perf-stat-card">
          <div className="perf-stat-icon">⭐</div>
          <div><div className="perf-stat-num">{avgRating}</div><div className="perf-stat-label">Average Rating</div></div>
        </div>
        <div className="perf-stat-card">
          <div className="perf-stat-icon">✅</div>
          <div><div className="perf-stat-num">{reviewed.length}</div><div className="perf-stat-label">Reviewed</div></div>
        </div>
        <div className="perf-stat-card">
          <div className="perf-stat-icon">⏳</div>
          <div><div className="perf-stat-num">{notReviewed.length}</div><div className="perf-stat-label">Pending Review</div></div>
        </div>
        <div className="perf-stat-card">
          <div className="perf-stat-icon">🏆</div>
          <div><div className="perf-stat-num">{topPerformer ? topPerformer.name.split(' ')[0] : 'N/A'}</div><div className="perf-stat-label">Top Performer</div></div>
        </div>
      </div>

      {/* Employee Cards */}
      <div className="emp-perf-grid">
        {employees.map(emp => {
          const { label, color } = getRatingLabel(emp.performanceRating);
          return (
            <div className="emp-perf-card" key={emp._id}>
              <div className="emp-perf-top">
                <div className="avatar">{emp.name.charAt(0).toUpperCase()}</div>
                <div className="emp-perf-info">
                  <div className="emp-perf-name">{emp.name}</div>
                  <div className="emp-perf-pos">{emp.position} • {emp.department}</div>
                </div>
              </div>
              <div className="emp-perf-rating">
                <StarRating value={emp.performanceRating || 0} readonly={true} />
                <span className="rating-label" style={{ color }}>{label}</span>
              </div>
              {emp.performanceNote && (
                <div className="emp-perf-note">"{emp.performanceNote}"</div>
              )}
              {emp.reviewDate && (
                <div className="review-date">
                  Last reviewed: {new Date(emp.reviewDate).toLocaleDateString('en-IN')}
                </div>
              )}
              {canRate && (
                <button className="btn-review" onClick={() => openReview(emp)}>
                  {emp.performanceRating ? '✏️ Update Review' : '⭐ Add Review'}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Review Modal - only for admin/hr */}
      {selectedEmp && canRate && (
        <div className="modal-overlay" onClick={() => setSelectedEmp(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Review — {selectedEmp.name}</h3>
              <button className="modal-close" onClick={() => setSelectedEmp(null)}>✕</button>
            </div>
            <div className="modal-body">
              <label>Performance Rating *</label>
              <StarRating value={rating} onChange={setRating} />
              <label style={{ marginTop: '20px', display: 'block' }}>Review Note</label>
              <textarea
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="e.g. Great team player, completed all tasks on time..."
                rows={4}
                className="review-textarea"
              />
              {successMsg && <div className="success-msg">{successMsg}</div>}
              <button className="btn-save-review" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : '✓ Save Review'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Performance;
