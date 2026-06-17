import React, { useState, useEffect, useRef } from 'react';
import { loginUser, createEmployeeUser, getAllEmployees } from '../api';
import './Login.css';

// Animated canvas background
const ParticleCanvas = () => {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = Array.from({ length: 60 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 2 + 0.5,
      dx: (Math.random() - 0.5) * 0.4,
      dy: (Math.random() - 0.5) * 0.4,
      alpha: Math.random() * 0.5 + 0.1
    }));

    let animId;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(120, 100, 255, ${p.alpha})`;
        ctx.fill();
        p.x += p.dx; p.y += p.dy;
        if (p.x < 0 || p.x > canvas.width) p.dx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.dy *= -1;
      });
      // draw connecting lines
      particles.forEach((p, i) => {
        particles.slice(i + 1).forEach(q => {
          const dist = Math.hypot(p.x - q.x, p.y - q.y);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.strokeStyle = `rgba(120,100,255,${0.12 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        });
      });
      animId = requestAnimationFrame(draw);
    };
    draw();
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    window.addEventListener('resize', resize);
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize); };
  }, []);
  return <canvas ref={canvasRef} className="particle-canvas" />;
};

const Login = ({ onLogin }) => {
  const [tab, setTab] = useState('login'); // 'login' or 'register'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPass, setShowPass] = useState(false);

  // Login form
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });

  // Register form
  const [regForm, setRegForm] = useState({
    username: '', password: '', confirmPassword: '',
    employeeId: '', role: 'employee'
  });
  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    // fetch employees for register dropdown
    fetch('http://localhost:5000/api/employees')
      .then(r => r.json())
      .then(data => setEmployees(data))
      .catch(() => {});
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const res = await loginUser(loginForm);
      const user = { ...res.data.user, password: loginForm.password };
      localStorage.setItem('ems_user', JSON.stringify(user));
      onLogin(user);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid username or password');
    } finally { setLoading(false); }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (regForm.password !== regForm.confirmPassword)
      return setError('Passwords do not match!');
    if (regForm.password.length < 4)
      return setError('Password must be at least 4 characters');
    if (regForm.role === 'employee' && !regForm.employeeId)
      return setError('Please select your employee profile');

    setLoading(true);
    try {
      await createEmployeeUser({
        username: regForm.username,
        password: regForm.password,
        employeeId: regForm.employeeId || null,
        role: regForm.role
      });
      setSuccess('✅ Account created! You can now login.');
      setRegForm({ username: '', password: '', confirmPassword: '', employeeId: '', role: 'employee' });
      setTimeout(() => { setTab('login'); setSuccess(''); }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="login-page">
      <ParticleCanvas />

      {/* Gradient orbs */}
      <div className="orb orb1" />
      <div className="orb orb2" />
      <div className="orb orb3" />

      <div className="login-container">
        {/* Left Panel */}
        <div className="login-left">
          <div className="brand-wrap">
            <div className="brand-logo">🏢</div>
            <h1 className="brand-name">EMS</h1>
            <p className="brand-tagline">Employee Management System</p>
          </div>

          <div className="feature-list">
            <div className="feature-item">
              <span className="feature-icon">📊</span>
              <div>
                <div className="feature-title">Smart Dashboard</div>
                <div className="feature-desc">Real-time stats and insights</div>
              </div>
            </div>
            <div className="feature-item">
              <span className="feature-icon">📅</span>
              <div>
                <div className="feature-title">Attendance Tracking</div>
                <div className="feature-desc">Mark and monitor daily attendance</div>
              </div>
            </div>
            <div className="feature-item">
              <span className="feature-icon">📝</span>
              <div>
                <div className="feature-title">Leave Management</div>
                <div className="feature-desc">Apply and approve leaves easily</div>
              </div>
            </div>
            <div className="feature-item">
              <span className="feature-icon">⭐</span>
              <div>
                <div className="feature-title">Performance Reviews</div>
                <div className="feature-desc">Rate and track employee growth</div>
              </div>
            </div>
          </div>

          <div className="default-creds-box">
            <div className="creds-title">🔑 Default Credentials</div>
            <div className="cred-row"><span className="cred-role admin-role">ADMIN</span><span>admin / admin123</span></div>
            <div className="cred-row"><span className="cred-role hr-role">HR</span><span>hr / hr123</span></div>
          </div>
        </div>

        {/* Right Panel - Form */}
        <div className="login-right">
          <div className="form-card">
            {/* Tab Switcher */}
            <div className="tab-switcher">
              <button
                className={`tab-btn ${tab === 'login' ? 'active' : ''}`}
                onClick={() => { setTab('login'); setError(''); setSuccess(''); }}
              >Login</button>
              <button
                className={`tab-btn ${tab === 'register' ? 'active' : ''}`}
                onClick={() => { setTab('register'); setError(''); setSuccess(''); }}
              >Register</button>
              <div className={`tab-slider ${tab === 'register' ? 'right' : ''}`} />
            </div>

            {/* Error / Success */}
            {error && <div className="alert alert-error">⚠️ {error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            {/* LOGIN FORM */}
            {tab === 'login' && (
              <form onSubmit={handleLogin} className="auth-form">
                <div className="welcome-text">
                  <h2>Welcome Back 👋</h2>
                  <p>Login to your account to continue</p>
                </div>

                <div className="input-group">
                  <span className="input-icon">👤</span>
                  <input
                    type="text"
                    placeholder="Username"
                    value={loginForm.username}
                    onChange={e => setLoginForm({ ...loginForm, username: e.target.value })}
                    required
                    autoFocus
                  />
                </div>

                <div className="input-group">
                  <span className="input-icon">🔒</span>
                  <input
                    type={showPass ? 'text' : 'password'}
                    placeholder="Password"
                    value={loginForm.password}
                    onChange={e => setLoginForm({ ...loginForm, password: e.target.value })}
                    required
                  />
                  <button type="button" className="eye-btn" onClick={() => setShowPass(!showPass)}>
                    {showPass ? '🙈' : '👁️'}
                  </button>
                </div>

                <button type="submit" className="submit-btn" disabled={loading}>
                  {loading ? <span className="spinner" /> : '→ Login'}
                </button>

                <p className="switch-hint">
                  Don't have an account?{' '}
                  <button type="button" className="link-btn" onClick={() => setTab('register')}>
                    Register here
                  </button>
                </p>
              </form>
            )}

            {/* REGISTER FORM */}
            {tab === 'register' && (
              <form onSubmit={handleRegister} className="auth-form">
                <div className="welcome-text">
                  <h2>Create Account ✨</h2>
                  <p>Register to access the system</p>
                </div>

                <div className="input-group">
                  <span className="input-icon">👤</span>
                  <input
                    type="text"
                    placeholder="Choose a username"
                    value={regForm.username}
                    onChange={e => setRegForm({ ...regForm, username: e.target.value })}
                    required
                  />
                </div>

                <div className="input-group">
                  <span className="input-icon">🔒</span>
                  <input
                    type={showPass ? 'text' : 'password'}
                    placeholder="Create password"
                    value={regForm.password}
                    onChange={e => setRegForm({ ...regForm, password: e.target.value })}
                    required
                  />
                  <button type="button" className="eye-btn" onClick={() => setShowPass(!showPass)}>
                    {showPass ? '🙈' : '👁️'}
                  </button>
                </div>

                <div className="input-group">
                  <span className="input-icon">🔐</span>
                  <input
                    type={showPass ? 'text' : 'password'}
                    placeholder="Confirm password"
                    value={regForm.confirmPassword}
                    onChange={e => setRegForm({ ...regForm, confirmPassword: e.target.value })}
                    required
                  />
                </div>

                <div className="input-group">
                  <span className="input-icon">🎭</span>
                  <select
                    value={regForm.role}
                    onChange={e => setRegForm({ ...regForm, role: e.target.value })}
                  >
                    <option value="employee">Employee</option>
                    <option value="hr">HR</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                {regForm.role === 'employee' && (
                  <div className="input-group">
                    <span className="input-icon">🏷️</span>
                    <select
                      value={regForm.employeeId}
                      onChange={e => setRegForm({ ...regForm, employeeId: e.target.value })}
                      required
                    >
                      <option value="">— Select your employee profile —</option>
                      {employees.map(emp => (
                        <option key={emp._id} value={emp._id}>
                          {emp.name} — {emp.department}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Password strength bar */}
                {regForm.password && (
                  <div className="strength-wrap">
                    <div className="strength-bar">
                      <div
                        className="strength-fill"
                        style={{
                          width: `${Math.min(regForm.password.length * 10, 100)}%`,
                          background: regForm.password.length < 4 ? '#f05252'
                            : regForm.password.length < 8 ? '#f5a623' : '#3dd68c'
                        }}
                      />
                    </div>
                    <span className="strength-label">
                      {regForm.password.length < 4 ? 'Weak' : regForm.password.length < 8 ? 'Medium' : 'Strong'}
                    </span>
                  </div>
                )}

                <button type="submit" className="submit-btn register-btn" disabled={loading}>
                  {loading ? <span className="spinner" /> : '✓ Create Account'}
                </button>

                <p className="switch-hint">
                  Already have an account?{' '}
                  <button type="button" className="link-btn" onClick={() => setTab('login')}>
                    Login here
                  </button>
                </p>
              </form>
            )}
          </div>

          <div className="login-footer">
            College Mini Project • React + Node.js + MongoDB Atlas
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
