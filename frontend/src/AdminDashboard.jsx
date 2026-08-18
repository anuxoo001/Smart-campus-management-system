import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from './store/authSlice';
import api from './services/api';
import './AdminDashboard.css';

const TABS = [
  { key: 'dashboard', label: '📊 Dashboard' },
  { key: 'teachers', label: '👩‍🏫 Teachers' },
  { key: 'students', label: '👨‍🎓 Students' },
  { key: 'users', label: '👥 All Users' },
  { key: 'notices', label: '📣 Notices' },
  { key: 'events', label: '🎉 Events' },
  { key: 'leaves', label: '✋ Leave Requests' },
];

const AdminDashboard = ({ initialTab = 'dashboard' }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState(initialTab);
  const [loading, setLoading] = useState(false);

  // Data
  const [stats, setStats] = useState(null);
  const [faculty, setFaculty] = useState([]);
  const [students, setStudents] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [notices, setNotices] = useState([]);
  const [events, setEvents] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [message, setMessage] = useState(null);

  // Create forms
  const [showCreateTeacher, setShowCreateTeacher] = useState(false);
  const [showCreateStudent, setShowCreateStudent] = useState(false);
  const [showNoticeForm, setShowNoticeForm] = useState(false);
  const [showEventForm, setShowEventForm] = useState(false);
  const [generatedCreds, setGeneratedCreds] = useState(null);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [statsRes, deptRes, courseRes] = await Promise.all([
        api.get('/admin/dashboard'),
        api.get('/admin/departments'),
        api.get('/admin/courses'),
      ]);
      setStats(statsRes.data?.stats || {});
      setDepartments(deptRes.data || []);
      setCourses(courseRes.data || []);
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const [facRes, stuRes, userRes] = await Promise.all([
        api.get('/admin/faculty'),
        api.get('/admin/students'),
        api.get('/admin/users'),
      ]);
      setFaculty(facRes.data || []);
      setStudents(stuRes.data || []);
      setAllUsers(userRes.data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchNotices = async () => {
    try {
      const res = await api.get('/notices');
      setNotices(res.data || []);
    } catch (error) {
      console.error('Error fetching notices:', error);
    }
  };

  const fetchEvents = async () => {
    try {
      const res = await api.get('/events');
      setEvents(res.data || []);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  const fetchLeaves = async () => {
    try {
      const res = await api.get('/admin/leave-requests/pending');
      setLeaves(res.data || []);
    } catch (error) {
      console.error('Error fetching leave requests:', error);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  useEffect(() => {
    if (activeTab === 'teachers' || activeTab === 'students' || activeTab === 'users') {
      fetchUsers();
    } else if (activeTab === 'notices') {
      fetchNotices();
    } else if (activeTab === 'events') {
      fetchEvents();
    } else if (activeTab === 'leaves') {
      fetchLeaves();
    } else if (activeTab === 'dashboard') {
      fetchAll();
    }
  }, [activeTab]);

  const showMessage = (text, isError = false) => {
    setMessage({ text, isError });
    setTimeout(() => setMessage(null), 6000);
  };

  const handleCreateTeacher = async (e) => {
    e.preventDefault();
    const form = e.target;
    try {
      const res = await api.post('/admin/users/create', {
        name: form.name.value,
        email: form.email.value,
        password: form.password.value,
        phone: form.phone.value,
        role: 'faculty',
        department: form.department.value,
        designation: form.designation.value,
        qualification: form.qualification?.value || '',
        experience: Number(form.experience.value || 0),
      });
      setGeneratedCreds(res.data.credentials);
      setShowCreateTeacher(false);
      showMessage(`Teacher account created. Employee ID: ${res.data.credentials.employeeId}`);
      fetchAll();
      fetchUsers();
      form.reset();
    } catch (error) {
      showMessage(error.response?.data?.message || 'Failed to create teacher.', true);
    }
  };

  const handleCreateStudent = async (e) => {
    e.preventDefault();
    const form = e.target;
    try {
      const res = await api.post('/admin/users/create', {
        name: form.name.value,
        email: form.email.value,
        password: form.password.value,
        phone: form.phone.value,
        role: 'student',
        department: form.department.value,
        course: form.course.value,
        semester: Number(form.semester.value),
        batch: form.batch.value,
      });
      setGeneratedCreds(res.data.credentials);
      setShowCreateStudent(false);
      showMessage(`Student account created. Student ID: ${res.data.credentials.studentId}`);
      fetchAll();
      fetchUsers();
      form.reset();
    } catch (error) {
      showMessage(error.response?.data?.message || 'Failed to create student.', true);
    }
  };

  const handleToggleActive = async (userId, isActive) => {
    try {
      await api.put(`/admin/users/${userId}`, { isActive: !isActive });
      showMessage(isActive ? 'Account deactivated.' : 'Account activated.');
      fetchUsers();
    } catch (error) {
      showMessage('Failed to update account status.', true);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Delete this account permanently? This cannot be undone.')) return;
    try {
      await api.delete(`/admin/users/${userId}`);
      showMessage('Account deleted.');
      fetchUsers();
      fetchAll();
    } catch (error) {
      showMessage('Failed to delete account.', true);
    }
  };

  const handleResetPassword = async (userId) => {
    const password = window.prompt('Enter a new password (min 6 characters):');
    if (!password) return;
    try {
      const res = await api.put(`/admin/users/${userId}/reset-password`, { password });
      showMessage(`Password reset for ${res.data.email} to: ${password}`);
    } catch (error) {
      showMessage(error.response?.data?.message || 'Failed to reset password.', true);
    }
  };

  const handleCreateNotice = async (e) => {
    e.preventDefault();
    const form = e.target;
    try {
      await api.post('/notices', {
        title: form.title.value,
        description: form.description.value,
        category: form.category.value,
        targetAudience: form.targetAudience.value,
      });
      setShowNoticeForm(false);
      showMessage('Notice published successfully.');
      fetchNotices();
      form.reset();
    } catch (error) {
      showMessage('Failed to publish notice.', true);
    }
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    const form = e.target;
    try {
      await api.post('/events', {
        name: form.name.value,
        description: form.description.value,
        date: form.date.value,
        time: form.time.value,
        venue: form.venue.value,
        organizer: form.organizer.value,
      });
      setShowEventForm(false);
      showMessage('Event created successfully.');
      fetchEvents();
      form.reset();
    } catch (error) {
      showMessage('Failed to create event.', true);
    }
  };

  const handleLeaveStatus = async (leaveId, status) => {
    try {
      await api.put(`/admin/leave-requests/${leaveId}`, { status });
      showMessage(`Leave request ${status}.`);
      fetchLeaves();
    } catch (error) {
      showMessage('Failed to update leave request.', true);
    }
  };

  const statCards = stats ? [
    { label: 'Total Users', value: stats.userCount || 0, icon: '👥' },
    { label: 'Students', value: stats.studentCount || 0, icon: '👨‍🎓' },
    { label: 'Faculty', value: stats.facultyCount || 0, icon: '👩‍🏫' },
    { label: 'Departments', value: stats.departmentCount || 0, icon: '🏛️' },
    { label: 'Courses', value: stats.courseCount || 0, icon: '📚' },
    { label: 'Job Applications', value: stats.applicationCount || 0, icon: '💼' },
  ] : [];

  const renderCredentialCard = () => (
    <div className="admin-cred-card">
      <h4>🎉 Account Created — Share these credentials</h4>
      <div className="cred-grid">
        <div><label>Email</label><code>{generatedCreds.email}</code></div>
        <div><label>Password</label><code>{generatedCreds.password}</code></div>
        {generatedCreds.employeeId && <div><label>Employee ID</label><code>{generatedCreds.employeeId}</code></div>}
        {generatedCreds.studentId && <div><label>Student ID</label><code>{generatedCreds.studentId}</code></div>}
      </div>
      <button className="btn btn-secondary small-btn" onClick={() => setGeneratedCreds(null)}>Dismiss</button>
    </div>
  );

  return (
    <div className="admin-dashboard">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <div className="brand-mark">SC</div>
          <div>
            <p className="eyebrow">Campus Suite</p>
            <h2>Admin Console</h2>
          </div>
        </div>
        <nav className="admin-nav">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              className={`admin-nav-item ${activeTab === tab.key ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </nav>
        <div className="admin-sidebar-footer">
          <div className="admin-user-info">
            <span className="avatar">🛡️</span>
            <div>
              <strong>{user?.name || 'Admin'}</strong>
              <small>Administrator</small>
            </div>
          </div>
          <button className="btn btn-secondary full-width" onClick={() => dispatch(logoutUser())}>Logout</button>
        </div>
      </aside>

      <main className="admin-main">
        <div className="admin-topbar">
          <div>
            <p className="eyebrow">Campus Administration</p>
            <h1>Smart Campus Admin Panel</h1>
          </div>
          <div className="admin-topbar-actions">
            <span className="admin-welcome">Welcome, {user?.name || 'Administrator'}</span>
          </div>
        </div>

        {message && (
          <div className={`admin-message ${message.isError ? 'error' : 'success'}`}>
            {message.text}
          </div>
        )}

        {loading && <div className="admin-loading">Loading data...</div>}

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="admin-section">
            <div className="admin-section-header">
              <h2>📊 Campus Overview</h2>
              <p>Real-time statistics from the campus database</p>
            </div>
            <div className="admin-stat-grid">
              {statCards.map((card) => (
                <div className="card stat-card" key={card.label}>
                  <div className="stat-icon">{card.icon}</div>
                  <p>{card.label}</p>
                  <h3>{card.value}</h3>
                </div>
              ))}
            </div>
            <div className="admin-quick-grid">
              <div className="card">
                <h3>Quick Actions</h3>
                <div className="quick-actions">
                  <button className="action-pill" onClick={() => { setActiveTab('teachers'); setShowCreateTeacher(true); }}>+ Create Teacher</button>
                  <button className="action-pill" onClick={() => { setActiveTab('students'); setShowCreateStudent(true); }}>+ Create Student</button>
                  <button className="action-pill" onClick={() => setActiveTab('notices')}>Post Notice</button>
                  <button className="action-pill" onClick={() => setActiveTab('events')}>Create Event</button>
                  <button className="action-pill" onClick={() => setActiveTab('leaves')}>Review Leave Requests</button>
                </div>
              </div>
              <div className="card">
                <h3>System Status</h3>
                <ul className="list-flat">
                  <li>✅ Database connection: Live</li>
                  <li>✅ API services: Operational</li>
                  <li>✅ Email service: Configured</li>
                  <li>🛡️ Admin access: Active</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Teachers Tab */}
        {activeTab === 'teachers' && (
          <div className="admin-section">
            <div className="admin-section-header">
              <h2>👩‍🏫 Faculty Management</h2>
              <button className="btn btn-primary" onClick={() => setShowCreateTeacher(!showCreateTeacher)}>
                {showCreateTeacher ? 'Cancel' : '+ Create Teacher Account'}
              </button>
            </div>

            {generatedCreds && renderCredentialCard()}

            {showCreateTeacher && (
              <form className="card admin-form" onSubmit={handleCreateTeacher}>
                <h3>New Teacher Account</h3>
                <p className="admin-form-hint">An Employee ID and default password will be generated automatically. You can set a custom password.</p>
                <div className="form-row">
                  <div className="form-group">
                    <label>Full Name</label>
                    <input type="text" name="name" required placeholder="e.g., Dr. Priya Sharma" />
                  </div>
                  <div className="form-group">
                    <label>Email</label>
                    <input type="email" name="email" required placeholder="teacher@campus.edu" />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Department</label>
                    <select name="department" required>
                      <option value="">Select Department</option>
                      {departments.map((dept) => (
                        <option key={dept._id} value={dept._id}>{dept.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Designation</label>
                    <select name="designation">
                      <option value="Professor">Professor</option>
                      <option value="Associate Professor">Associate Professor</option>
                      <option value="Assistant Professor">Assistant Professor</option>
                      <option value="Lecturer">Lecturer</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Experience (years)</label>
                    <input type="number" name="experience" min="0" defaultValue="0" />
                  </div>
                  <div className="form-group">
                    <label>Qualification</label>
                    <input type="text" name="qualification" placeholder="e.g., Ph.D. in Computer Science" />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Phone</label>
                    <input type="tel" name="phone" placeholder="9876543210" />
                  </div>
                  <div className="form-group">
                    <label>Password (leave blank to auto-generate)</label>
                    <input type="text" name="password" minLength="6" placeholder="Auto-generated if empty" />
                  </div>
                </div>
                <div className="form-actions">
                  <button type="submit" className="btn btn-primary">Create Teacher</button>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowCreateTeacher(false)}>Cancel</button>
                </div>
              </form>
            )}

            <div className="card table-card">
              <table className="table">
                <thead>
                  <tr>
                    <th>Employee ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Department</th>
                    <th>Designation</th>
                    <th>Experience</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {faculty.length === 0 ? (
                    <tr><td colSpan="8" className="empty-message">No faculty members yet.</td></tr>
                  ) : faculty.map((f) => (
                    <tr key={f._id}>
                      <td>{f.employeeId}</td>
                      <td><strong>{f.user?.name || '—'}</strong></td>
                      <td>{f.user?.email}</td>
                      <td>{f.department?.name}</td>
                      <td>{f.designation}</td>
                      <td>{f.experience} yrs</td>
                      <td><span className={`badge ${f.user?.isActive ? 'badge-success' : 'badge-danger'}`}>{f.user?.isActive ? 'Active' : 'Inactive'}</span></td>
                      <td>
                        <button className="btn btn-secondary small-btn" onClick={() => handleToggleActive(f.user?._id, f.user?.isActive)}>{f.user?.isActive ? 'Deactivate' : 'Activate'}</button>
                        <button className="btn btn-secondary small-btn" onClick={() => handleResetPassword(f.user?._id)}>Reset Password</button>
                        <button className="btn btn-danger small-btn" onClick={() => handleDeleteUser(f.user?._id)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Students Tab */}
        {activeTab === 'students' && (
          <div className="admin-section">
            <div className="admin-section-header">
              <h2>👨‍🎓 Student Management</h2>
              <button className="btn btn-primary" onClick={() => setShowCreateStudent(!showCreateStudent)}>
                {showCreateStudent ? 'Cancel' : '+ Create Student Account'}
              </button>
            </div>

            {generatedCreds && renderCredentialCard()}

            {showCreateStudent && (
              <form className="card admin-form" onSubmit={handleCreateStudent}>
                <h3>New Student Account</h3>
                <p className="admin-form-hint">A Student ID and default password will be generated automatically.</p>
                <div className="form-row">
                  <div className="form-group">
                    <label>Full Name</label>
                    <input type="text" name="name" required placeholder="e.g., Rohan Mehta" />
                  </div>
                  <div className="form-group">
                    <label>Email</label>
                    <input type="email" name="email" required placeholder="student@campus.edu" />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Department</label>
                    <select name="department" required onChange={(e) => { /* course options filter */ }}>
                      <option value="">Select Department</option>
                      {departments.map((dept) => (
                        <option key={dept._id} value={dept._id}>{dept.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Course</label>
                    <select name="course" required>
                      <option value="">Select Course</option>
                      {courses.map((course) => (
                        <option key={course._id} value={course._id}>{course.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Semester</label>
                    <select name="semester" required>
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                        <option key={sem} value={sem}>Semester {sem}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Batch</label>
                    <input type="text" name="batch" placeholder="e.g., 2024" required />
                  </div>
                  <div className="form-group">
                    <label>Phone</label>
                    <input type="tel" name="phone" placeholder="9876543210" />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Password (leave blank to auto-generate)</label>
                    <input type="text" name="password" minLength="6" placeholder="Auto-generated if empty" />
                  </div>
                </div>
                <div className="form-actions">
                  <button type="submit" className="btn btn-primary">Create Student</button>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowCreateStudent(false)}>Cancel</button>
                </div>
              </form>
            )}

            <div className="card table-card">
              <table className="table">
                <thead>
                  <tr>
                    <th>Student ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Department</th>
                    <th>Course</th>
                    <th>Semester</th>
                    <th>CGPA</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {students.length === 0 ? (
                    <tr><td colSpan="9" className="empty-message">No students yet.</td></tr>
                  ) : students.map((s) => (
                    <tr key={s._id}>
                      <td>{s.studentId}</td>
                      <td><strong>{s.user?.name || '—'}</strong></td>
                      <td>{s.user?.email}</td>
                      <td>{s.department?.name}</td>
                      <td>{s.course?.name}</td>
                      <td>{s.semester}</td>
                      <td>{s.cgpa}</td>
                      <td><span className={`badge ${s.user?.isActive ? 'badge-success' : 'badge-danger'}`}>{s.user?.isActive ? 'Active' : 'Inactive'}</span></td>
                      <td>
                        <button className="btn btn-secondary small-btn" onClick={() => handleToggleActive(s.user?._id, s.user?.isActive)}>{s.user?.isActive ? 'Deactivate' : 'Activate'}</button>
                        <button className="btn btn-secondary small-btn" onClick={() => handleResetPassword(s.user?._id)}>Reset Password</button>
                        <button className="btn btn-danger small-btn" onClick={() => handleDeleteUser(s.user?._id)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* All Users Tab */}
        {activeTab === 'users' && (
          <div className="admin-section">
            <div className="admin-section-header">
              <h2>👥 All Users</h2>
              <p>Complete account directory across all roles</p>
            </div>
            <div className="card table-card">
              <table className="table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Phone</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {allUsers.length === 0 ? (
                    <tr><td colSpan="6" className="empty-message">No users found.</td></tr>
                  ) : allUsers.map((u) => (
                    <tr key={u._id}>
                      <td><strong>{u.name}</strong></td>
                      <td>{u.email}</td>
                      <td><span className={`badge ${u.role === 'admin' ? 'badge-primary' : u.role === 'faculty' ? 'badge-warning' : 'badge-success'}`}>{u.role}</span></td>
                      <td>{u.phone || '—'}</td>
                      <td><span className={`badge ${u.isActive ? 'badge-success' : 'badge-danger'}`}>{u.isActive ? 'Active' : 'Inactive'}</span></td>
                      <td>
                        <button className="btn btn-secondary small-btn" onClick={() => handleToggleActive(u._id, u.isActive)}>{u.isActive ? 'Deactivate' : 'Activate'}</button>
                        <button className="btn btn-secondary small-btn" onClick={() => handleResetPassword(u._id)}>Reset Password</button>
                        {u.role !== 'admin' && (
                          <button className="btn btn-danger small-btn" onClick={() => handleDeleteUser(u._id)}>Delete</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Notices Tab */}
        {activeTab === 'notices' && (
          <div className="admin-section">
            <div className="admin-section-header">
              <h2>📣 Notice Board</h2>
              <button className="btn btn-primary" onClick={() => setShowNoticeForm(!showNoticeForm)}>
                {showNoticeForm ? 'Cancel' : '+ Publish Notice'}
              </button>
            </div>
            {showNoticeForm && (
              <form className="card admin-form" onSubmit={handleCreateNotice}>
                <h3>New Notice</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label>Title</label>
                    <input type="text" name="title" required placeholder="Notice title" />
                  </div>
                  <div className="form-group">
                    <label>Category</label>
                    <select name="category">
                      <option value="General">General</option>
                      <option value="Academic">Academic</option>
                      <option value="Exam">Exam</option>
                      <option value="Event">Event</option>
                      <option value="Placement">Placement</option>
                      <option value="Urgent">Urgent</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Audience</label>
                    <select name="targetAudience">
                      <option value="all">Everyone</option>
                      <option value="student">Students only</option>
                      <option value="faculty">Faculty only</option>
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea name="description" rows="4" required placeholder="Notice details..."></textarea>
                </div>
                <div className="form-actions">
                  <button type="submit" className="btn btn-primary">Publish Notice</button>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowNoticeForm(false)}>Cancel</button>
                </div>
              </form>
            )}
            <div className="notice-list">
              {notices.length === 0 ? (
                <div className="card"><p className="empty-message">No notices yet.</p></div>
              ) : notices.map((notice) => (
                <article className="card notice-card" key={notice._id}>
                  <div className="section-head">
                    <h3>{notice.title}</h3>
                    <span className="badge badge-primary">{notice.category}</span>
                  </div>
                  <p>{notice.description}</p>
                  <div className="meta-row">
                    <span>{notice.author?.name || 'Admin'}</span>
                    <span>{new Date(notice.date || notice.postedDate).toLocaleDateString()}</span>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}

        {/* Events Tab */}
        {activeTab === 'events' && (
          <div className="admin-section">
            <div className="admin-section-header">
              <h2>🎉 Campus Events</h2>
              <button className="btn btn-primary" onClick={() => setShowEventForm(!showEventForm)}>
                {showEventForm ? 'Cancel' : '+ Create Event'}
              </button>
            </div>
            {showEventForm && (
              <form className="card admin-form" onSubmit={handleCreateEvent}>
                <h3>New Event</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label>Event Name</label>
                    <input type="text" name="name" required placeholder="e.g., Annual Tech Fest" />
                  </div>
                  <div className="form-group">
                    <label>Venue</label>
                    <input type="text" name="venue" required placeholder="Main Auditorium" />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Date</label>
                    <input type="date" name="date" required />
                  </div>
                  <div className="form-group">
                    <label>Time</label>
                    <input type="text" name="time" placeholder="10:00 AM" />
                  </div>
                  <div className="form-group">
                    <label>Organizer</label>
                    <input type="text" name="organizer" placeholder="Student Council" />
                  </div>
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea name="description" rows="3" placeholder="Event details..."></textarea>
                </div>
                <div className="form-actions">
                  <button type="submit" className="btn btn-primary">Create Event</button>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowEventForm(false)}>Cancel</button>
                </div>
              </form>
            )}
            <div className="event-grid">
              {events.length === 0 ? (
                <div className="card"><p className="empty-message">No events yet.</p></div>
              ) : events.map((event) => (
                <article className="card event-card" key={event._id}>
                  <div className="event-banner" style={{ background: 'linear-gradient(135deg, #60a5fa, #2563eb)' }} />
                  <h3>{event.name}</h3>
                  <p>{new Date(event.date).toLocaleDateString()} at {event.time}</p>
                  <p>{event.venue}</p>
                  <p className="meta-row">{event.organizer}</p>
                </article>
              ))}
            </div>
          </div>
        )}

        {/* Leave Requests Tab */}
        {activeTab === 'leaves' && (
          <div className="admin-section">
            <div className="admin-section-header">
              <h2>✋ Leave Requests</h2>
              <p>Approve or reject student leave applications</p>
            </div>
            <div className="requests-list">
              {leaves.length === 0 ? (
                <div className="card"><p className="empty-message">No leave requests found.</p></div>
              ) : leaves.map((leave) => (
                <div key={leave._id} className="request-item card">
                  <div className="request-header">
                    <h4>{leave.student?.user?.name || leave.student?.name || 'Student'}</h4>
                    <span className={`badge badge-${leave.status}`}>{leave.status}</span>
                  </div>
                  <p><strong>Student ID:</strong> {leave.student?.studentId}</p>
                  <p><strong>Duration:</strong> {new Date(leave.fromDate).toLocaleDateString()} to {new Date(leave.toDate).toLocaleDateString()}</p>
                  <p><strong>Reason:</strong> {leave.reason}</p>
                  {leave.status === 'pending' && (
                    <div className="request-actions">
                      <button className="btn-success" onClick={() => handleLeaveStatus(leave._id, 'approved')}>✓ Approve</button>
                      <button className="btn-danger" onClick={() => handleLeaveStatus(leave._id, 'rejected')}>✕ Reject</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;