import api from './api';

// Auth endpoints
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  verifyEmail: (token) => api.post('/auth/verify-email', { token }),
  login: (email, password) => api.post('/auth/login', { email, password }),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.post('/auth/reset-password', { token, password }),
  
  // Email OTP Authentication
  sendOTP: (email) => api.post('/auth/send-otp', { email }),
  verifyOTP: (email, otp) => api.post('/auth/verify-otp', { email, otp }),
  resendOTP: (email) => api.post('/auth/resend-otp', { email }),
  
  logout: () => api.post('/auth/logout'),
  getCurrentUser: () => api.get('/auth/me'),
  refreshToken: () => api.post('/auth/refresh-token'),
};

// Student endpoints
export const studentAPI = {
  getDashboard: () => api.get('/students/dashboard/overview'),
  getProfile: () => api.get('/students/me/profile'),
  getAttendance: () => api.get('/students/me/attendance'),
  getMarks: () => api.get('/students/me/marks'),
  getAssignments: () => api.get('/students/me/assignments'),
  getNotices: () => api.get('/students/notices'),
  getEvents: () => api.get('/students/events'),
  updateProfile: (data) => api.put('/students/me/profile', data),
};

// Faculty endpoints
export const facultyAPI = {
  getDashboard: () => api.get('/faculty/dashboard/overview'),
  markAttendance: (data) => api.post('/faculty/attendance/mark', data),
  getSubjectStudents: (subjectId) => api.get(`/faculty/subjects/${subjectId}/students`),
  updateMarks: (data) => api.post('/faculty/marks/update', data),
  createAssignment: (data) => api.post('/faculty/assignments/create', data),
  getSubmittedAssignments: (assignmentId) => api.get(`/faculty/assignments/${assignmentId}/submissions`),
  gradeSubmission: (data) => api.post('/faculty/submissions/grade', data),
};

// Admin endpoints
export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getAllUsers: (role) => api.get(`/admin/users${role ? `?role=${role}` : ''}`),
  createUser: (data) => api.post('/admin/users/create', data),
  updateUser: (userId, data) => api.put(`/admin/users/${userId}`, data),
  deleteUser: (userId) => api.delete(`/admin/users/${userId}`),
  getDepartments: () => api.get('/admin/departments'),
  createDepartment: (data) => api.post('/admin/departments/create', data),
  createCourse: (data) => api.post('/admin/courses/create', data),
  createSubject: (data) => api.post('/admin/subjects/create', data),
  createNotice: (data) => api.post('/admin/notices/create', data),
  getEvents: () => api.get('/admin/events'),
  createEvent: (data) => api.post('/admin/events/create', data),
  getPendingLeaveRequests: () => api.get('/admin/leave-requests/pending'),
  approveLeaveRequest: (leaveRequestId, data) => api.put(`/admin/leave-requests/${leaveRequestId}`, data),
  getJobApplications: () => api.get('/admin/job-applications'),
  updateApplicationStatus: (applicationId, data) => api.put(`/admin/job-applications/${applicationId}/status`, data),
};

// Quiz endpoints (Teacher)
export const quizTeacherAPI = {
  getQuizzes: () => api.get('/quizzes/teacher/quizzes'),
  getStats: () => api.get('/quizzes/teacher/stats'),
  getQuiz: (quizId) => api.get(`/quizzes/teacher/${quizId}`),
  createQuiz: (data) => api.post('/quizzes', data),
  updateQuiz: (quizId, data) => api.put(`/quizzes/teacher/${quizId}`, data),
  deleteQuiz: (quizId) => api.delete(`/quizzes/teacher/${quizId}`),
  toggleStatus: (quizId, status) => api.put(`/quizzes/teacher/${quizId}/status`, { status }),
  getSubmissions: (quizId) => api.get(`/quizzes/${quizId}/submissions`),
};

// Quiz endpoints (Student)
export const quizStudentAPI = {
  getAvailableQuizzes: () => api.get('/quizzes/student/quizzes'),
  submitQuiz: (quizId, answers) => api.post(`/quizzes/${quizId}/submit`, { answers }),
};

export default api;
