import axios from 'axios';

const BASE = 'https://ems-backend-alpha-silk.vercel.app/api';

const getHeaders = () => {
  const user = JSON.parse(localStorage.getItem('ems_user') || '{}');
  return { 'x-username': user.username || '', 'x-password': user.password || '' };
};

// AUTH
export const loginUser = (data) => axios.post(`${BASE}/auth/login`, data);
export const createEmployeeUser = (data) => axios.post(`${BASE}/auth/create-employee-user`, data, { headers: getHeaders() });
export const getAllUsers = () => axios.get(`${BASE}/auth/users`, { headers: getHeaders() });

// EMPLOYEES
export const getAllEmployees = () => axios.get(`${BASE}/employees`, { headers: getHeaders() });
export const getEmployeeById = (id) => axios.get(`${BASE}/employees/${id}`, { headers: getHeaders() });
export const createEmployee = (data) => axios.post(`${BASE}/employees`, data, { headers: getHeaders() });
export const updateEmployee = (id, data) => axios.put(`${BASE}/employees/${id}`, data, { headers: getHeaders() });
export const deleteEmployee = (id) => axios.delete(`${BASE}/employees/${id}`, { headers: getHeaders() });
export const updatePerformance = (id, data) => axios.patch(`${BASE}/employees/${id}/performance`, data, { headers: getHeaders() });

// WORK LOGS
export const getWorkLogs = (employeeId) => axios.get(`${BASE}/worklogs/${employeeId}`, { headers: getHeaders() });
export const getAllWorkLogs = () => axios.get(`${BASE}/worklogs`, { headers: getHeaders() });
export const addWorkLog = (data) => axios.post(`${BASE}/worklogs`, data, { headers: getHeaders() });
export const deleteWorkLog = (id) => axios.delete(`${BASE}/worklogs/${id}`, { headers: getHeaders() });

// ATTENDANCE
export const getAttendance = (employeeId) => axios.get(`${BASE}/attendance/${employeeId}`, { headers: getHeaders() });
export const getAllAttendance = () => axios.get(`${BASE}/attendance`, { headers: getHeaders() });
export const markAttendance = (data) => axios.post(`${BASE}/attendance`, data, { headers: getHeaders() });
export const getAttendanceSummary = (employeeId, month) => axios.get(`${BASE}/attendance/summary/${employeeId}/${month}`, { headers: getHeaders() });

// NOTICES
export const getAllNotices = () => axios.get(`${BASE}/notices`, { headers: getHeaders() });
export const createNotice = (data) => axios.post(`${BASE}/notices`, data, { headers: getHeaders() });
export const deleteNotice = (id) => axios.delete(`${BASE}/notices/${id}`, { headers: getHeaders() });

// LEAVES
export const getAllLeaves = () => axios.get(`${BASE}/leaves`, { headers: getHeaders() });
export const getMyLeaves = (employeeId) => axios.get(`${BASE}/leaves/employee/${employeeId}`, { headers: getHeaders() });
export const getLeaveBalance = (employeeId) => axios.get(`${BASE}/leaves/balance/${employeeId}`, { headers: getHeaders() });
export const applyLeave = (data) => axios.post(`${BASE}/leaves`, data, { headers: getHeaders() });
export const reviewLeave = (id, data) => axios.patch(`${BASE}/leaves/${id}`, data, { headers: getHeaders() });
export const deleteLeave = (id) => axios.delete(`${BASE}/leaves/${id}`, { headers: getHeaders() });
