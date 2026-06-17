import React, { useEffect, useState } from 'react';
import { getAllLeaves, getMyLeaves, getLeaveBalance, applyLeave, reviewLeave, deleteLeave } from '../api';
import './LeaveRequest.css';

const statusColors = { Pending: '#f5a623', Approved: '#3dd68c', Rejected: '#f05252' };

const LeaveRequest = ({ user }) => {
  const [leaves, setLeaves] = useState([]);
  const [balance, setBalance] = useState({ total: 12, used: 0, remaining: 12 });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [reviewModal, setReviewModal] = useState(null);
  const [reviewNote, setReviewNote] = useState('');

  const isEmployee = user.role === 'employee';
  const isAdminOrHR = user.role === 'admin' || user.role === 'hr';

  const today = new Date().toISOString().split('T')[0];

  const [form, setForm] = useState({
    leaveType: 'Sick Leave',
    fromDate: today,
    toDate: today,
    reason: ''
  });

  const calcDays = (from, to) => {
    const d1 = new Date(from), d2 = new Date(to);
    return Math.max(1, Math.floor((d2 - d1) / 86400000) + 1);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      if (isEmployee) {
        const [leavesRes, balanceRes] = await Promise.all([
          getMyLeaves(user.employeeId),
          getLeaveBalance(user.employeeId)
        ]);
        setLeaves(leavesRes.data);
        setBalance(balanceRes.data);
      } else {
        const res = await getAllLeaves();
        setLeaves(res.data);
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleApply = async (e) => {
    e.preventDefault();
    const days = calcDays(form.fromDate, form.toDate);
    if (isEmployee && days > balance.remaining) {
      return alert(`Not enough leaves! You have ${balance.remaining} leaves remaining.`);
    }
    setSaving(true);
    try {
      // get employee name from localStorage
      const empUser = JSON.parse(localStorage.getItem('ems_user') || '{}');
      await applyLeave({
        employeeId: user.employeeId,
        employeeName: empUser.username,
        leaveType: form.leaveType,
        fromDate: form.fromDate,
        toDate: form.toDate,
        days,
        reason: form.reason
      });
      setShowForm(false);
      setForm({ leaveType: 'Sick Leave', fromDate: today, toDate: today, reason: '' });
      fetchData();
    } catch (err) { alert('Failed to apply for leave'); }
    finally { setSaving(false); }
  };

  const handleReview = async (status) => {
    try {
      await reviewLeave(reviewModal._id, { status, reviewedBy: user.username, reviewNote });
      setReviewModal(null);
      setReviewNote('');
      fetchData();
    } catch (err) { alert('Failed to review leave'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this leave request?')) return;
    try { await deleteLeave(id); fetchData(); }
    catch (err) { alert('Failed to delete'); }
  };

  const pending = leaves.filter(l => l.status === 'Pending').length;

  return (
    <div className="leave-page">
      <div className="page-header">
        <div>
          <h1>📝 Leave Requests</h1>
          <p>{isEmployee ? 'Apply for leave and track your requests' : 'Manage employee leave requests'}</p>
        </div>
        {isEmployee && (
          <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? '✕ Cancel' : '+ Apply Leave'}
          </button>
        )}
      </div>

      {/* Leave Balance - Employee Only */}
      {isEmployee && (
        <div className="leave-balance">
          <div className="balance-card total">
            <div className="bal-num">{balance.total}</div>
            <div className="bal-label">Total Leaves/Year</div>
          </div>
          <div className="balance-card used">
            <div className="bal-num">{balance.used}</div>
            <div className="bal-label">Used</div>
          </div>
          <div className="balance-card remaining">
            <div className="bal-num">{balance.remaining}</div>
            <div className="bal-label">Remaining</div>
          </div>
          <div className="balance-progress">
            <div className="bal-prog-label">Leave Usage</div>
            <div className="bal-prog-bar">
              <div className="bal-prog-fill" style={{ width: `${(balance.used / balance.total) * 100}%` }} />
            </div>
            <div className="bal-prog-pct">{Math.round((balance.used / balance.total) * 100)}% used</div>
          </div>
        </div>
      )}

      {/* Admin stats */}
      {isAdminOrHR && (
        <div className="admin-leave-stats">
          <div className="leave-stat-card"><div className="lst-num">{leaves.length}</div><div className="lst-label">Total Requests</div></div>
          <div className="leave-stat-card pending-card"><div className="lst-num">{pending}</div><div className="lst-label">Pending</div></div>
          <div className="leave-stat-card approved-card"><div className="lst-num">{leaves.filter(l => l.status === 'Approved').length}</div><div className="lst-label">Approved</div></div>
          <div className="leave-stat-card rejected-card"><div className="lst-num">{leaves.filter(l => l.status === 'Rejected').length}</div><div className="lst-label">Rejected</div></div>
        </div>
      )}

      {/* Apply Form */}
      {showForm && isEmployee && (
        <div className="leave-form-card">
          <h3>Apply for Leave</h3>
          <form onSubmit={handleApply}>
            <div className="form-grid">
              <div className="form-group">
                <label>Leave Type</label>
                <select value={form.leaveType} onChange={e => setForm({ ...form, leaveType: e.target.value })}>
                  <option>Sick Leave</option>
                  <option>Casual Leave</option>
                  <option>Emergency Leave</option>
                  <option>Other</option>
                </select>
              </div>
              <div className="form-group">
                <label>From Date</label>
                <input type="date" value={form.fromDate} min={today} onChange={e => setForm({ ...form, fromDate: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>To Date</label>
                <input type="date" value={form.toDate} min={form.fromDate} onChange={e => setForm({ ...form, toDate: e.target.value })} required />
              </div>
              <div className="form-group days-display">
                <label>Number of Days</label>
                <div className="days-num">{calcDays(form.fromDate, form.toDate)}</div>
              </div>
            </div>
            <div className="form-group">
              <label>Reason *</label>
              <textarea className="leave-textarea" rows={3} placeholder="Explain the reason for leave..." value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })} required />
            </div>
            <button type="submit" className="btn-apply" disabled={saving}>
              {saving ? 'Submitting...' : '✓ Submit Leave Request'}
            </button>
          </form>
        </div>
      )}

      {/* Leaves Table */}
      {loading ? <p className="loading-text">Loading...</p> : (
        <div className="leaves-table-wrap">
          <table className="leaves-table">
            <thead>
              <tr>
                {isAdminOrHR && <th>Employee</th>}
                <th>Type</th>
                <th>From</th>
                <th>To</th>
                <th>Days</th>
                <th>Reason</th>
                <th>Status</th>
                {isAdminOrHR && <th>Action</th>}
                {isEmployee && <th>Action</th>}
              </tr>
            </thead>
            <tbody>
              {leaves.length === 0 ? (
                <tr><td colSpan="8" style={{ textAlign: 'center', padding: '30px', color: 'var(--muted)' }}>No leave requests found</td></tr>
              ) : leaves.map(leave => (
                <tr key={leave._id}>
                  {isAdminOrHR && <td><strong>{leave.employeeName}</strong></td>}
                  <td><span className="leave-type-tag">{leave.leaveType}</span></td>
                  <td>{leave.fromDate}</td>
                  <td>{leave.toDate}</td>
                  <td><strong>{leave.days}</strong></td>
                  <td className="reason-cell">{leave.reason}</td>
                  <td>
                    <span className="status-badge" style={{ background: `${statusColors[leave.status]}22`, color: statusColors[leave.status] }}>
                      {leave.status}
                    </span>
                  </td>
                  {isAdminOrHR && (
                    <td>
                      {leave.status === 'Pending' ? (
                        <button className="btn-review-leave" onClick={() => { setReviewModal(leave); setReviewNote(''); }}>Review</button>
                      ) : (
                        <span style={{ fontSize: '12px', color: 'var(--muted)' }}>by {leave.reviewedBy}</span>
                      )}
                    </td>
                  )}
                  {isEmployee && (
                    <td>
                      {leave.status === 'Pending' && (
                        <button className="btn-del-leave" onClick={() => handleDelete(leave._id)}>Cancel</button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Review Modal */}
      {reviewModal && (
        <div className="modal-overlay" onClick={() => setReviewModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Review Leave — {reviewModal.employeeName}</h3>
              <button className="modal-close" onClick={() => setReviewModal(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="review-info">
                <div><span>Type:</span> {reviewModal.leaveType}</div>
                <div><span>Dates:</span> {reviewModal.fromDate} → {reviewModal.toDate} ({reviewModal.days} days)</div>
                <div><span>Reason:</span> {reviewModal.reason}</div>
              </div>
              <div className="form-group">
                <label>Review Note (optional)</label>
                <textarea className="leave-textarea" rows={3} placeholder="Add a note..." value={reviewNote} onChange={e => setReviewNote(e.target.value)} />
              </div>
              <div className="review-action-btns">
                <button className="btn-approve" onClick={() => handleReview('Approved')}>✓ Approve</button>
                <button className="btn-reject" onClick={() => handleReview('Rejected')}>✕ Reject</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaveRequest;
