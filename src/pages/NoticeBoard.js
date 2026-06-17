import React, { useEffect, useState } from 'react';
import { getAllNotices, createNotice, deleteNotice } from '../api';
import './NoticeBoard.css';

const NoticeBoard = ({ user }) => {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', message: '', important: false });
  const [saving, setSaving] = useState(false);

  const canPost = user.role === 'admin' || user.role === 'hr';

  const fetchNotices = () => {
    getAllNotices()
      .then(res => setNotices(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchNotices(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await createNotice({ ...form, postedBy: user.username });
      setForm({ title: '', message: '', important: false });
      setShowForm(false);
      fetchNotices();
    } catch (err) { alert('Failed to post notice'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this notice?')) return;
    try {
      await deleteNotice(id);
      fetchNotices();
    } catch (err) { alert('Failed to delete'); }
  };

  const timeAgo = (date) => {
    const diff = Math.floor((new Date() - new Date(date)) / 1000);
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  return (
    <div className="notice-page">
      <div className="page-header">
        <div>
          <h1>🔔 Notice Board</h1>
          <p>Company announcements and updates</p>
        </div>
        {canPost && (
          <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? '✕ Cancel' : '+ Post Notice'}
          </button>
        )}
      </div>

      {/* Post Form */}
      {showForm && canPost && (
        <div className="notice-form-card">
          <h3>Post New Notice</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Title *</label>
              <input
                type="text"
                placeholder="e.g. Office Holiday on 26th Jan"
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Message *</label>
              <textarea
                rows={4}
                placeholder="Write your announcement here..."
                value={form.message}
                onChange={e => setForm({ ...form, message: e.target.value })}
                className="notice-textarea"
                required
              />
            </div>
            <div className="form-check">
              <input
                type="checkbox"
                id="important"
                checked={form.important}
                onChange={e => setForm({ ...form, important: e.target.checked })}
              />
              <label htmlFor="important">⚠️ Mark as Important</label>
            </div>
            <button type="submit" className="btn-post" disabled={saving}>
              {saving ? 'Posting...' : '📢 Post Notice'}
            </button>
          </form>
        </div>
      )}

      {/* Notices List */}
      {loading ? (
        <p className="loading-text">Loading notices...</p>
      ) : notices.length === 0 ? (
        <div className="no-notices">
          <span>📭</span>
          <p>No notices posted yet</p>
        </div>
      ) : (
        <div className="notices-list">
          {notices.map(notice => (
            <div className={`notice-card ${notice.important ? 'important' : ''}`} key={notice._id}>
              <div className="notice-top">
                <div className="notice-title-row">
                  {notice.important && <span className="imp-badge">⚠️ IMPORTANT</span>}
                  <h3 className="notice-title">{notice.title}</h3>
                </div>
                {canPost && (
                  <button className="btn-del-notice" onClick={() => handleDelete(notice._id)}>✕</button>
                )}
              </div>
              <p className="notice-message">{notice.message}</p>
              <div className="notice-footer">
                <span>📌 Posted by <strong>{notice.postedBy}</strong></span>
                <span>{timeAgo(notice.createdAt)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NoticeBoard;
