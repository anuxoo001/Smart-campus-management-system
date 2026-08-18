import { Routes, Route, NavLink, Navigate, Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useState, useEffect } from 'react';
import {
  Bell,
  BookOpen,
  BriefcaseBusiness,
  CalendarCheck2,
  GraduationCap,
  LayoutDashboard,
  LogIn,
  Megaphone,
  School,
  Sparkles,
  Users,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Area,
  AreaChart,
} from 'recharts';
import './App.css';
import { fetchCurrentUser, loginUser, logoutUser, registerUser, requestPasswordReset, resetPassword, verifyEmail } from './store/authSlice';
import { fetchStudentDashboard, fetchNotices, fetchEvents, fetchStudentAttendance, fetchStudentMarks, fetchStudentAssignments, fetchStudentProfile, fetchJobs, fetchNotifications } from './store/studentSlice';
import api from './services/api';
import LoginTypeSelector from './LoginTypeSelector';
import StudentLoginPage from './StudentLoginPage';
import TeacherLoginPage from './TeacherLoginPage';
import AdminLoginPage from './AdminLoginPage';
import AdminDashboard from './AdminDashboard';
import EnhancedTeacherDashboard from './EnhancedTeacherDashboard';
import StudentTaskDashboard from './StudentTaskDashboard';
import TeacherQuizPanel from './TeacherQuizPanel';
import StudentQuizPanel from './StudentQuizPanel';

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/my-tasks', label: 'My Tasks', icon: BookOpen },
  { to: '/attendance', label: 'Attendance', icon: CalendarCheck2 },
  { to: '/marks', label: 'Marks', icon: BookOpen },
  { to: '/assignments', label: 'Assignments', icon: School },
  { to: '/notices', label: 'Notices', icon: Megaphone },
  { to: '/events', label: 'Events', icon: Sparkles },
  { to: '/jobs', label: 'Placements', icon: BriefcaseBusiness },
  { to: '/profile', label: 'Profile', icon: Bell },
  { to: '/login', label: 'Login', icon: LogIn },
];

function App() {
  const { isAuthenticated } = useSelector((state) => state.auth);

  if (!isAuthenticated) {
    return (
      <div className="auth-shell">
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginTypeSelector />} />
          <Route path="/login/student" element={<StudentLoginPage />} />
          <Route path="/login/teacher" element={<TeacherLoginPage />} />
          <Route path="/login/admin" element={<AdminLoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    );
  }

  return <AuthenticatedApp />;
}

function AuthenticatedApp() {
  const dispatch = useDispatch();
  const { isAuthenticated, user, token, loading } = useSelector((state) => state.auth);
  const { dashboard, attendance, marks: marksData, assignments: assignmentsData, notices: noticesData, events: eventsData } = useSelector((state) => state.student);

  useEffect(() => {
    if (token && !user && !loading) {
      dispatch(fetchCurrentUser());
    }
  }, [dispatch, token, user, loading]);

  useEffect(() => {
    if (isAuthenticated && user?.role === 'student') {
      dispatch(fetchStudentDashboard());
      dispatch(fetchNotices());
      dispatch(fetchEvents());
      dispatch(fetchStudentAttendance());
      dispatch(fetchStudentMarks());
      dispatch(fetchStudentAssignments());
      dispatch(fetchStudentProfile());
      dispatch(fetchJobs());
      dispatch(fetchNotifications());
    }
  }, [isAuthenticated, dispatch, user]);

  if (isAuthenticated && !user) {
    return (
      <div className="app-shell">
        <main className="main-panel">
          <div className="page-panel" style={{ display: 'grid', placeItems: 'center', minHeight: '40vh' }}>
            <p className="empty-message">Loading your dashboard...</p>
          </div>
        </main>
      </div>
    );
  }

  const role = user?.role || 'student';

  if (role === 'admin') {
    return <AdminDashboardShell />;
  }

  if (role === 'faculty') {
    return <FacultyDashboardShell />;
  }

  const navigate = useNavigate();

  const handleExport = () => {
    const lines = [];
    lines.push('Student Academic Summary');
    lines.push(`Name,${dashboard?.student?.name || ''}`);
    lines.push(`CGPA,${dashboard?.student?.cgpa || ''}`);
    lines.push(`Semester,${dashboard?.student?.semester || ''}`);
    lines.push(`Attendance %,${dashboard?.attendanceSummary?.percentage || ''}`);
    lines.push(`Marks Average,${dashboard?.marksAverage || ''}`);
    lines.push('');
    lines.push('Attendance Records');
    lines.push('Date,Status,Subject');
    (attendance || []).forEach((a) => lines.push(`${a.date ? new Date(a.date).toLocaleDateString() : ''},${a.status || ''},${a.subject?.name || ''}`));
    lines.push('');
    lines.push('Marks Records');
    lines.push('Subject,Exam Type,Marks,Out Of');
    (marksData || []).forEach((m) => lines.push(`${m.subject?.name || ''},${m.examType || ''},${m.marks || ''},${m.outOf || ''}`));

    const blob = new Blob([lines.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'student-summary.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-wrap">
          <div className="brand-mark">SC</div>
          <div>
            <p className="eyebrow">Campus Suite</p>
            <h2>Smart Campus</h2>
          </div>
        </div>

        <nav className="side-nav">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
          <NavLink to="/quizzes" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <BookOpen size={18} />
            Quizzes
          </NavLink>
        </nav>
      </aside>

      <main className="main-panel">
        <div className="topbar">
          <div>
            <p className="eyebrow">Overview</p>
            <h1>Student Success Platform</h1>
          </div>
          <div className="topbar-actions">
            <button className="btn btn-secondary" onClick={handleExport}>Export</button>
            <button className="btn btn-primary" onClick={() => navigate('/notices')}>Notices</button>
            {isAuthenticated && (
              <button
                className="btn btn-secondary"
                onClick={() => dispatch(logoutUser())}
              >
                Logout
              </button>
            )}
          </div>
        </div>

        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/my-tasks" element={<StudentTaskDashboard />} />
          <Route path="/students" element={<StudentsDirectory />} />
          <Route path="/faculty" element={<FacultyDirectory />} />
          <Route path="/attendance" element={<AttendancePage />} />
          <Route path="/marks" element={<MarksPage />} />
          <Route path="/assignments" element={<AssignmentsPage />} />
          <Route path="/notices" element={<NoticesPage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/jobs" element={<PlacementPage />} />
          <Route path="/quizzes" element={<StudentQuizPanel />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/login" element={<Navigate to="/" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

function StudentsDirectory() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/students')
      .then((res) => setRows(res.data))
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  }, []);

  const mapped = rows.map((row) => ({
    id: row._id,
    name: row.user?.name || '—',
    studentId: row.studentId,
    department: row.department?.name || row.department,
    course: row.course?.name || row.course,
    semester: row.semester,
    cgpa: row.cgpa,
  }));

  return (
    <SectionPage title="Students" description="Student directory and performance monitoring">
      <div className="card table-card">
        {loading ? (
          <p className="empty-message">Loading students...</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Roll No</th>
                <th>Department</th>
                <th>Course</th>
                <th>Semester</th>
                <th>CGPA</th>
              </tr>
            </thead>
            <tbody>
              {mapped.length === 0 ? (
                <tr><td colSpan="6" className="empty-message">No students found.</td></tr>
              ) : mapped.map((row) => (
                <tr key={row.id}>
                  <td>{row.name}</td>
                  <td>{row.studentId}</td>
                  <td>{row.department}</td>
                  <td>{row.course}</td>
                  <td>{row.semester}</td>
                  <td>{row.cgpa}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </SectionPage>
  );
}

function TeacherSubmissionsPage() {
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    Promise.all([
      api.get('/assignments/teacher/assignments'),
      api.get('/assignments/submissions'),
    ])
      .then(([aRes, sRes]) => {
        setAssignments(aRes.data || []);
        setSubmissions(sRes.data || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = selected
    ? submissions.filter((s) => s.assignment?._id === selected || s.assignment === selected)
    : submissions;

  const handleGrade = async (submissionId, e) => {
    const score = e.target.value;
    try {
      await api.post('/faculty/submissions/grade', { submissionId, score, feedback: '' });
      setMessage(`Graded submission (${score}).`);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to grade.');
    }
    setTimeout(() => setMessage(''), 4000);
  };

  return (
    <div className="page-panel">
      <div className="topbar">
        <div>
          <h1>Student Submissions</h1>
          <p className="eyebrow">Review and grade submitted work</p>
        </div>
      </div>
      {message && <div className="admin-message success">{message}</div>}
      <div className="card table-card">
        {loading ? (
          <p className="empty-message">Loading submissions...</p>
        ) : (
          <>
            <div className="form-group" style={{ maxWidth: 320 }}>
              <label>Filter by assignment</label>
              <select value={selected} onChange={(e) => setSelected(e.target.value)}>
                <option value="">All assignments</option>
                {assignments.map((a) => (
                  <option key={a._id} value={a._id}>{a.title}</option>
                ))}
              </select>
            </div>
            <table className="table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Assignment</th>
                  <th>Submitted</th>
                  <th>Status</th>
                  <th>Score</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan="6" className="empty-message">No submissions yet.</td></tr>
                ) : filtered.map((s) => (
                  <tr key={s._id}>
                    <td>{s.student?.user?.name || s.student?.name || 'Student'}</td>
                    <td>{s.assignment?.title || 'Assignment'}</td>
                    <td>{s.submittedAt ? new Date(s.submittedAt).toLocaleDateString() : '—'}</td>
                    <td><span className={`badge ${s.status === 'Graded' ? 'badge-success' : 'badge-warning'}`}>{s.status}</span></td>
                    <td>{s.score ?? s.marks ?? '—'}</td>
                    <td>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        defaultValue={s.score ?? ''}
                        placeholder="Score"
                        style={{ width: 70, marginRight: 8 }}
                        onBlur={(e) => handleGrade(s._id, e)}
                      />
                      <a className="btn btn-secondary small-btn" href={s.fileUrl} target="_blank" rel="noreferrer">View</a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>
    </div>
  );
}

function TeacherSettingsPage() {
  const { user } = useSelector((state) => state.auth);
  const [message, setMessage] = useState('');

  const handleSave = async (e) => {
    e.preventDefault();
    const form = e.target;
    try {
      const res = await api.put('/auth/me', {
        name: form.name.value,
        phone: form.phone.value,
      });
      setMessage(`Profile updated successfully.`);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to update profile.');
    }
    setTimeout(() => setMessage(''), 4000);
  };

  return (
    <div className="page-panel">
      <div className="topbar">
        <div>
          <h1>Settings</h1>
          <p className="eyebrow">Update your account details</p>
        </div>
      </div>
      {message && <div className="admin-message success">{message}</div>}
      <form className="card admin-form" onSubmit={handleSave}>
        <h3>Account Settings</h3>
        <div className="form-row">
          <div className="form-group">
            <label>Full Name</label>
            <input type="text" name="name" defaultValue={user?.name || ''} required />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" defaultValue={user?.email || ''} disabled />
          </div>
          <div className="form-group">
            <label>Phone</label>
            <input type="tel" name="phone" defaultValue={user?.phone || ''} />
          </div>
        </div>
        <div className="form-actions">
          <button type="submit" className="btn btn-primary">Save Changes</button>
        </div>
      </form>
    </div>
  );
}

function FacultyDirectory() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/faculty')
      .then((res) => setRows(res.data))
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  }, []);

  const mapped = rows.map((row) => ({
    id: row._id,
    name: row.user?.name || '—',
    employeeId: row.employeeId,
    department: row.department?.name || row.department,
    designation: row.designation,
    experience: row.experience,
  }));

  return (
    <SectionPage title="Faculty" description="Faculty workload and subject allocation">
      <div className="card table-card">
        {loading ? (
          <p className="empty-message">Loading faculty...</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>ID</th>
                <th>Department</th>
                <th>Designation</th>
                <th>Experience</th>
              </tr>
            </thead>
            <tbody>
              {mapped.length === 0 ? (
                <tr><td colSpan="5" className="empty-message">No faculty found.</td></tr>
              ) : mapped.map((row) => (
                <tr key={row.id}>
                  <td>{row.name}</td>
                  <td>{row.employeeId}</td>
                  <td>{row.department}</td>
                  <td>{row.designation}</td>
                  <td>{row.experience} yrs</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </SectionPage>
  );
}

function AdminDashboardShell() {
  return <AdminDashboard />;
}

function FacultyDashboardShell() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-wrap">
          <div className="brand-mark">SC</div>
          <div>
            <p className="eyebrow">Campus Suite</p>
            <h2>Smart Campus</h2>
          </div>
        </div>

        <nav className="side-nav">
          <NavLink to="/teacher/dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <LayoutDashboard size={18} />
            Overview
          </NavLink>
          <NavLink to="/teacher/attendance" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <CalendarCheck2 size={18} />
            Attendance
          </NavLink>
          <NavLink to="/teacher/marks" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <BookOpen size={18} />
            Marks
          </NavLink>
          <NavLink to="/teacher/schedule" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <CalendarCheck2 size={18} />
            Schedule
          </NavLink>
          <NavLink to="/teacher/materials" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <BookOpen size={18} />
            Materials
          </NavLink>
          <NavLink to="/teacher/exams" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <GraduationCap size={18} />
            Exams
          </NavLink>
          <NavLink to="/teacher/roster" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <Users size={18} />
            Roster
          </NavLink>
          <NavLink to="/teacher/forum" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <Bell size={18} />
            Forum
          </NavLink>
          <NavLink to="/teacher/announcements" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <Megaphone size={18} />
            Announcements
          </NavLink>
          <NavLink to="/teacher/analytics" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <Sparkles size={18} />
            Analytics
          </NavLink>
          <NavLink to="/teacher/leave-requests" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <Users size={18} />
            Leave Requests
          </NavLink>
          <NavLink to="/teacher/quizzes" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <BookOpen size={18} />
            Quizzes
          </NavLink>
          <NavLink to="/teacher/submissions" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <BookOpen size={18} />
            Submissions
          </NavLink>
          <NavLink to="/teacher/settings" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <Users size={18} />
            Settings
          </NavLink>
        </nav>
      </aside>

      <main className="main-panel">
        <div className="topbar">
          <div>
            <p className="eyebrow">Faculty workspace</p>
            <h1>Teacher Dashboard</h1>
          </div>
          <div className="topbar-actions">
            {user && (
              <>
                <span style={{ color: '#64748b', marginRight: '1rem' }}>Welcome, {user.name}</span>
                <button
                  className="btn btn-secondary"
                  onClick={() => dispatch(logoutUser())}
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </div>

        <Routes>
          <Route path="/teacher/dashboard" element={<EnhancedTeacherDashboard initialTab="overview" />} />
          <Route path="/teacher/overview" element={<EnhancedTeacherDashboard initialTab="overview" />} />
          <Route path="/teacher/attendance" element={<EnhancedTeacherDashboard initialTab="attendance" />} />
          <Route path="/teacher/marks" element={<EnhancedTeacherDashboard initialTab="marks" />} />
          <Route path="/teacher/schedule" element={<EnhancedTeacherDashboard initialTab="schedule" />} />
          <Route path="/teacher/materials" element={<EnhancedTeacherDashboard initialTab="materials" />} />
          <Route path="/teacher/exams" element={<EnhancedTeacherDashboard initialTab="exams" />} />
          <Route path="/teacher/roster" element={<EnhancedTeacherDashboard initialTab="roster" />} />
          <Route path="/teacher/forum" element={<EnhancedTeacherDashboard initialTab="forum" />} />
          <Route path="/teacher/announcements" element={<EnhancedTeacherDashboard initialTab="announcements" />} />
          <Route path="/teacher/analytics" element={<EnhancedTeacherDashboard initialTab="analytics" />} />
          <Route path="/teacher/leave-requests" element={<EnhancedTeacherDashboard initialTab="leave-requests" />} />
          <Route path="/teacher/quizzes" element={<TeacherQuizPanel />} />
          <Route path="/teacher/submissions" element={<TeacherSubmissionsPage />} />
          <Route path="/teacher/settings" element={<TeacherSettingsPage />} />
          <Route path="*" element={<Navigate to="/teacher/dashboard" replace />} />
        </Routes>
      </main>
    </div>
  );
}

function DashboardPage() {
  const { dashboard, attendance, notices, notifications, events } = useSelector((state) => state.student);
  const { user } = useSelector((state) => state.auth);

  const stats = dashboard || {
    student: { name: user?.name || 'Student', cgpa: '0.0', semester: '-', course: '-' },
    attendanceSummary: { percentage: 0, totalClasses: 0, classesAttended: 0 },
    marksAverage: 0,
    pendingAssignments: 0,
    notifications: 0,
    upcomingEvents: 0,
  };

  // Per-subject attendance for chart
  const subjectAttendance = attendance.reduce((acc, record) => {
    const name = record.subject?.name || 'Subject';
    if (!acc[name]) {
      acc[name] = { subject: name, total: 0, attended: 0 };
    }
    acc[name].total += 1;
    if (record.status !== 'absent') acc[name].attended += 1;
    return acc;
  }, {});
  const attendanceChartData = Object.values(subjectAttendance).map((row) => ({
    subject: row.subject,
    percentage: row.total > 0 ? Math.round((row.attended / row.total) * 100) : 0,
  }));

  const performanceData = [
    { term: 'Internal', score: stats.marksAverage || 0 },
    { term: 'Attendance', score: stats.attendanceSummary?.percentage || 0 },
  ];

  const smartInsights = [];
  if (stats.attendanceSummary?.percentage < 75) {
    smartInsights.push({
      title: 'Attendance alert',
      detail: `Your overall attendance is ${stats.attendanceSummary.percentage}%, below the 75% requirement.`,
      action: 'View attendance',
      tone: 'warning',
    });
  }
  if (stats.pendingAssignments > 0) {
    smartInsights.push({
      title: 'Assignments pending',
      detail: `You have ${stats.pendingAssignments} assignment(s) not yet submitted.`,
      action: 'Open assignments',
      tone: 'info',
    });
  }
  if (stats.upcomingEvents > 0) {
    smartInsights.push({
      title: 'Campus event',
      detail: `${stats.upcomingEvents} upcoming event(s) on campus. Check the events tab.`,
      action: 'Register',
      tone: 'primary',
    });
  }

  return (
    <>
      <div className="stat-grid">
        {[
          { label: 'CGPA', value: stats.student?.cgpa || '—', icon: '🎓', trend: 'Overall' },
          { label: 'Attendance', value: `${stats.attendanceSummary?.percentage || 0}%`, icon: '📅', trend: `${stats.attendanceSummary?.classesAttended || 0}/${stats.attendanceSummary?.totalClasses || 0} classes` },
          { label: 'Marks Average', value: stats.marksAverage || '—', icon: '📝', trend: 'All subjects' },
          { label: 'Pending Tasks', value: stats.pendingAssignments || 0, icon: '⏳', trend: 'Action required' },
          { label: 'Notifications', value: notifications.length || 0, icon: '🔔', trend: 'Inbox' },
          { label: 'Events', value: events.length || 0, icon: '📣', trend: 'Upcoming' },
        ].map((item) => (
          <div className="card stat-card" key={item.label}>
            <div className="stat-icon">{item.icon}</div>
            <p>{item.label}</p>
            <h3>{item.value}</h3>
            <span className="trend positive">{item.trend}</span>
          </div>
        ))}
      </div>

      <div className="content-grid two-col">
        <div className="card chart-card">
          <div className="section-head">
            <h3>Academic Performance</h3>
            <span>This semester</span>
          </div>
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer>
              <AreaChart data={performanceData}>
                <defs>
                  <linearGradient id="fillColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.7} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0.08} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="term" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Area type="monotone" dataKey="score" stroke="#2563eb" fill="url(#fillColor)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card chart-card">
          <div className="section-head">
            <h3>Attendance by Subject</h3>
            <span>This semester</span>
          </div>
          <div style={{ width: '100%', height: 260 }}>
            {attendanceChartData.length === 0 ? (
              <p className="empty-message">No attendance records yet.</p>
            ) : (
              <ResponsiveContainer>
                <BarChart data={attendanceChartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="subject" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Bar dataKey="percentage" fill="#10b981" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      <div className="content-grid two-col">
        <div className="card">
          <div className="section-head">
            <h3>Smart Recommendations</h3>
            <span>Personalized guidance</span>
          </div>
          <div className="insight-list">
            {smartInsights.length === 0 ? (
              <p className="empty-message">You are all caught up. Keep up the good work!</p>
            ) : smartInsights.map((item) => (
              <div key={item.title} className={`insight-card insight-${item.tone}`}>
                <div>
                  <strong>{item.title}</strong>
                  <p>{item.detail}</p>
                </div>
                <button type="button" className="btn btn-secondary small-btn">{item.action}</button>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="section-head">
            <h3>Quick Actions</h3>
            <span>Fast access</span>
          </div>
          <div className="quick-actions">
            <Link to="/attendance" className="action-pill">View attendance</Link>
            <Link to="/assignments" className="action-pill">Submit assignment</Link>
            <Link to="/notices" className="action-pill">Check notices</Link>
            <Link to="/jobs" className="action-pill">Apply for jobs</Link>
            <Link to="/events" className="action-pill">Register for event</Link>
            <Link to="/profile" className="action-pill">Open profile</Link>
          </div>
        </div>
      </div>

      <div className="content-grid">
        <div className="card">
          <div className="section-head">
            <h3>Latest Notices</h3>
            <span>From campus office</span>
          </div>
          <ul className="list-stack">
            {notices.length === 0 ? (
              <li className="empty-message">No notices yet.</li>
            ) : notices.slice(0, 3).map((notice) => (
              <li key={notice._id}>
                <strong>{notice.title}</strong>
                <p>{notice.category}</p>
              </li>
            ))}
          </ul>
        </div>

        <div className="card">
          <div className="section-head">
            <h3>Notifications</h3>
            <span>Inbox</span>
          </div>
          <ul className="list-stack">
            {notifications.length === 0 ? (
              <li className="empty-message">No notifications.</li>
            ) : notifications.slice(0, 4).map((item) => (
              <li key={item._id}>
                <strong>{item.title}</strong>
                <p>{item.message}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}

function AttendancePage() {
  const { attendance } = useSelector((state) => state.student);

  const rows = attendance.reduce((acc, record) => {
    const name = record.subject?.name || 'Subject';
    if (!acc[name]) {
      acc[name] = { subject: name, classes: 0, attended: 0 };
    }
    acc[name].classes += 1;
    if (record.status !== 'absent') acc[name].attended += 1;
    return acc;
  }, {});

  const tableRows = Object.values(rows).map((row) => ({
    ...row,
    percentage: row.classes > 0 ? Math.round((row.attended / row.classes) * 100) : 0,
  }));

  return (
    <SectionPage title="Attendance Tracking" description="Your class attendance and performance thresholds">
      <div className="card table-card">
        <table className="table">
          <thead>
            <tr>
              <th>Subject</th>
              <th>Classes</th>
              <th>Attended</th>
              <th>Percentage</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {tableRows.length === 0 ? (
              <tr><td colSpan="5" className="empty-message">No attendance records yet.</td></tr>
            ) : tableRows.map((row) => (
              <tr key={row.subject}>
                <td>{row.subject}</td>
                <td>{row.classes}</td>
                <td>{row.attended}</td>
                <td>{row.percentage}%</td>
                <td><span className={`badge ${row.percentage >= 75 ? 'badge-success' : 'badge-warning'}`}>{row.percentage >= 75 ? 'Healthy' : 'Warning'}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SectionPage>
  );
}

function MarksPage() {
  const { marks } = useSelector((state) => state.student);

  const rows = marks.reduce((acc, record) => {
    const name = record.subject?.name || 'Subject';
    if (!acc[name]) {
      acc[name] = { subject: name, total: 0, count: 0 };
    }
    acc[name].total += record.marks || 0;
    acc[name].count += 1;
    return acc;
  }, {});

  const tableRows = Object.values(rows).map((row) => ({
    ...row,
    average: row.count > 0 ? Math.round(row.total / row.count) : 0,
  }));

  return (
    <SectionPage title="Academic Marks" description="Internal, midterm, and final performance tracking">
      <div className="card table-card">
        <table className="table">
          <thead>
            <tr>
              <th>Subject</th>
              <th>Exams</th>
              <th>Total Marks</th>
              <th>Average</th>
            </tr>
          </thead>
          <tbody>
            {tableRows.length === 0 ? (
              <tr><td colSpan="4" className="empty-message">No marks recorded yet.</td></tr>
            ) : tableRows.map((row) => (
              <tr key={row.subject}>
                <td>{row.subject}</td>
                <td>{row.count}</td>
                <td>{row.total}</td>
                <td>{row.average}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SectionPage>
  );
}

function AssignmentsPage() {
  const { assignments } = useSelector((state) => state.student);

  return (
    <SectionPage title="Assignments" description="Your submissions and deadlines">
      <div className="assignment-list">
        {assignments.length === 0 ? (
          <div className="card"><p className="empty-message">No assignments assigned yet.</p></div>
        ) : assignments.map((assignment) => (
          <article className="card assignment-card" key={assignment._id}>
            <div className="section-head">
              <h3>{assignment.title}</h3>
              <span className={`badge ${assignment.priority === 'high' ? 'badge-warning' : 'badge-primary'}`}>{assignment.priority}</span>
            </div>
            <p>{assignment.description}</p>
            <div className="meta-row">
              <span>Subject: {assignment.subject?.name || 'Subject'}</span>
              <span>Deadline: {new Date(assignment.deadline).toLocaleDateString()}</span>
              <span>Points: {assignment.totalPoints || 100}</span>
            </div>
          </article>
        ))}
      </div>
    </SectionPage>
  );
}

function NoticesPage() {
  const { notices } = useSelector((state) => state.student);

  return (
    <SectionPage title="Notice Board" description="Announcements from admin and faculty">
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
              <span>{notice.author?.name || 'Campus Office'}</span>
              <span>{new Date(notice.postedDate || notice.date).toLocaleDateString()}</span>
            </div>
          </article>
        ))}
      </div>
    </SectionPage>
  );
}

function EventsPage() {
  const { events } = useSelector((state) => state.student);
  const [registered, setRegistered] = useState({});
  const [regMessage, setRegMessage] = useState('');

  const handleRegister = async (eventId) => {
    try {
      await api.post(`/events/${eventId}/register`);
      setRegistered((prev) => ({ ...prev, [eventId]: true }));
      setRegMessage('Successfully registered for the event!');
    } catch (error) {
      setRegMessage(error.response?.data?.message || 'Registration failed.');
    }
    setTimeout(() => setRegMessage(''), 5000);
  };

  return (
    <SectionPage title="Campus Events" description="Upcoming events and registration">
      {regMessage && <div className="admin-message success">{regMessage}</div>}
      <div className="event-grid">
        {events.length === 0 ? (
          <div className="card"><p className="empty-message">No upcoming events.</p></div>
        ) : events.map((event) => (
          <article className="card event-card" key={event._id}>
            <div className="event-banner" style={{ background: 'linear-gradient(135deg, #60a5fa, #2563eb)' }} />
            <h3>{event.name}</h3>
            <p>{new Date(event.date).toLocaleDateString()} at {event.time}</p>
            <p>{event.venue}</p>
            <p className="meta-row">{event.organizer}</p>
            <button className="btn btn-primary" onClick={() => handleRegister(event._id)} disabled={registered[event._id]}>
              {registered[event._id] ? 'Registered ✓' : 'Register'}
            </button>
          </article>
        ))}
      </div>
    </SectionPage>
  );
}

function PlacementPage() {
  const { jobs } = useSelector((state) => state.student);
  const [applied, setApplied] = useState({});
  const [applyMessage, setApplyMessage] = useState('');

  const handleApply = async (jobId) => {
    try {
      await api.post(`/jobs/${jobId}/apply`);
      setApplied((prev) => ({ ...prev, [jobId]: true }));
      setApplyMessage('Application submitted successfully!');
    } catch (error) {
      setApplyMessage(error.response?.data?.message || 'Application failed.');
    }
    setTimeout(() => setApplyMessage(''), 5000);
  };

  return (
    <SectionPage title="Placement Opportunities" description="Jobs and internships for eligible students">
      {applyMessage && <div className="admin-message success">{applyMessage}</div>}
      <div className="job-list">
        {jobs.length === 0 ? (
          <div className="card"><p className="empty-message">No job openings right now.</p></div>
        ) : jobs.map((job) => (
          <article key={job._id} className="card job-card">
            <div className="section-head">
              <h3>{job.title}</h3>
              <span className="badge badge-success">{job.type}</span>
            </div>
            <p>{job.company?.name}</p>
            <div className="meta-row">
              <span>{job.location}</span>
              <span>{job.salary}</span>
            </div>
            <p>{(job.requiredSkills || []).join(' • ')}</p>
            <p className="meta-row">Deadline: {new Date(job.applicationDeadline).toLocaleDateString()} | Min CGPA: {job.minCGPA}</p>
            <button className="btn btn-primary" onClick={() => handleApply(job._id)} disabled={applied[job._id]}>
              {applied[job._id] ? 'Applied ✓' : 'Apply'}
            </button>
          </article>
        ))}
      </div>
    </SectionPage>
  );
}

function ProfilePage() {
  const { dashboard, profile } = useSelector((state) => state.student);
  const { user } = useSelector((state) => state.auth);
  const studentData = profile?.studentData || dashboard?.student || {};

  return (
    <SectionPage title="Student Profile" description="Academic records and personal information">
      <div className="profile-grid">
        <div className="card">
          <h3>Profile Summary</h3>
          <ul className="list-flat">
            <li>Name: {user?.name || studentData.name}</li>
            <li>Roll No: {studentData.studentId}</li>
            <li>Department: {studentData.department?.name || studentData.department}</li>
            <li>Course: {studentData.course?.name || studentData.course}</li>
            <li>Semester: {studentData.semester}</li>
            <li>CGPA: {studentData.cgpa}</li>
            <li>Email: {user?.email || profile?.email}</li>
          </ul>
        </div>
        <div className="card">
          <h3>Skills</h3>
          <div className="tag-row">
            {(studentData.skills || []).length === 0 ? (
              <span className="empty-message">No skills added.</span>
            ) : studentData.skills.map((skill) => (
              <span key={skill} className="tag">{skill}</span>
            ))}
          </div>
        </div>
      </div>
    </SectionPage>
  );
}

function AuthLayout({ eyebrow, title, subtitle, children, footerText, footerLink }) {
  const socialProviders = ['Google', 'Microsoft', 'GitHub'];

  return (
    <div className="auth-page">
      <div className="auth-card-shell">
        <div className="auth-panel auth-panel-brand">
          <div className="brand-mark large">SC</div>
          <p className="eyebrow eyebrow-light">Campus Suite</p>
          <h1>Smart Campus</h1>
          <p className="brand-copy">Track attendance, performance, assignments, and student success from a single connected platform.</p>

          <div className="mini-stats">
            <div>
              <strong>96%</strong>
              <span>Engagement</span>
            </div>
            <div>
              <strong>12k+</strong>
              <span>Students</span>
            </div>
          </div>
        </div>

        <div className="auth-panel auth-panel-form">
          <div className="auth-header">
            <p className="eyebrow">{eyebrow}</p>
            <h2>{title}</h2>
            <p className="auth-subtitle">{subtitle}</p>
          </div>

          <div className="social-row">
            {socialProviders.map((provider) => (
              <button key={provider} type="button" className="social-btn">
                {provider}
              </button>
            ))}
          </div>

          <div className="divider"><span>or continue with email</span></div>

          {children}

          {footerText && (
            <div className="auth-links">
              <Link to={footerLink}>{footerText}</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function RegisterPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
  });

  const submitRegistration = async (event) => {
    event.preventDefault();
    const resultAction = await dispatch(registerUser(formData));
    if (registerUser.fulfilled.match(resultAction)) {
      navigate('/login');
    }
  };

  return (
    <AuthLayout
      eyebrow="New account"
      title="Register as a student"
      subtitle="Create your campus account and access your student portal."
      footerText="Already have an account?"
      footerLink="/login"
    >
      <form className="auth-form" onSubmit={submitRegistration}>
        <div className="form-group">
          <label>Full name</label>
          <input
            type="text"
            placeholder="Ananya Sharma"
            value={formData.name}
            onChange={(event) => setFormData({ ...formData, name: event.target.value })}
          />
        </div>
        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            placeholder="you@campus.edu"
            value={formData.email}
            onChange={(event) => setFormData({ ...formData, email: event.target.value })}
          />
        </div>
        <div className="form-group">
          <label>Phone</label>
          <input
            type="tel"
            placeholder="+91 98765 43210"
            value={formData.phone}
            onChange={(event) => setFormData({ ...formData, phone: event.target.value })}
          />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            placeholder="Create a password"
            value={formData.password}
            onChange={(event) => setFormData({ ...formData, password: event.target.value })}
          />
        </div>
        {error && <p className="error-message">{error}</p>}
        <button className="btn btn-primary full-width" type="submit" disabled={loading}>
          {loading ? 'Creating account...' : 'Create Account'}
        </button>
      </form>
    </AuthLayout>
  );
}

function ForgotPasswordPage() {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const submitRequest = async (event) => {
    event.preventDefault();
    const resultAction = await dispatch(requestPasswordReset({ email }));
    if (requestPasswordReset.fulfilled.match(resultAction)) {
      setMessage('If an account exists with that email, a reset link has been sent.');
    }
  };

  return (
    <AuthLayout
      eyebrow="Account help"
      title="Forgot password?"
      subtitle="We will send a secure reset link to your email."
      footerText="Back to login"
      footerLink="/login"
    >
      <form className="auth-form" onSubmit={submitRequest}>
        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>
        {error && <p className="error-message">{error}</p>}
        {message && <p className="success-message">{message}</p>}
        <button className="btn btn-primary full-width" type="submit" disabled={loading}>
          {loading ? 'Sending link...' : 'Send Reset Link'}
        </button>
      </form>
    </AuthLayout>
  );
}

function ResetPasswordPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { loading, error } = useSelector((state) => state.auth);
  const [formData, setFormData] = useState({ password: '', confirmPassword: '' });
  const [message, setMessage] = useState('');

  const submitReset = async (event) => {
    event.preventDefault();
    const token = searchParams.get('token');

    if (!token) {
      setMessage('This reset link is invalid or expired.');
      return;
    }

    if (formData.password.length < 6) {
      setMessage('Password must be at least 6 characters.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setMessage('Passwords do not match.');
      return;
    }

    const resultAction = await dispatch(resetPassword({ token, password: formData.password }));
    if (resetPassword.fulfilled.match(resultAction)) {
      setMessage('Password reset successfully. Redirecting to login...');
      setTimeout(() => navigate('/login'), 1200);
    }
  };

  return (
    <AuthLayout
      eyebrow="Secure access"
      title="Reset password"
      subtitle="Create a new password for your account."
      footerText="Back to login"
      footerLink="/login"
    >
      <form className="auth-form" onSubmit={submitReset}>
        <div className="form-group">
          <label>New password</label>
          <input
            type="password"
            placeholder="Enter new password"
            value={formData.password}
            onChange={(event) => setFormData({ ...formData, password: event.target.value })}
          />
        </div>
        <div className="form-group">
          <label>Confirm password</label>
          <input
            type="password"
            placeholder="Confirm new password"
            value={formData.confirmPassword}
            onChange={(event) => setFormData({ ...formData, confirmPassword: event.target.value })}
          />
        </div>
        {error && <p className="error-message">{error}</p>}
        {message && <p className={error ? 'error-message' : 'success-message'}>{message}</p>}
        <button className="btn btn-primary full-width" type="submit" disabled={loading}>
          {loading ? 'Resetting...' : 'Reset Password'}
        </button>
      </form>
    </AuthLayout>
  );
}

function VerifyEmailPage() {
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const [message, setMessage] = useState('');
  const { loading, error } = useSelector((state) => state.auth);

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setMessage('This verification link is invalid or expired.');
      return;
    }

    const handleVerify = async () => {
      const resultAction = await dispatch(verifyEmail({ token }));
      if (verifyEmail.fulfilled.match(resultAction)) {
        setMessage('Email verified successfully. Redirecting to login...');
        setTimeout(() => window.location.href = '/login', 1500);
      }
    };

    handleVerify();
  }, [dispatch, searchParams]);

  return (
    <AuthLayout
      eyebrow="Account setup"
      title="Verify your email"
      subtitle="Complete your registration and access your campus account."
      footerText="Back to login"
      footerLink="/login"
    >
      <div className="auth-form">
        {error && <p className="error-message">{error}</p>}
        {message && <p className={error ? 'error-message' : 'success-message'}>{message}</p>}
        {loading ? <p className="success-message">Verifying email...</p> : null}
      </div>
    </AuthLayout>
  );
}

function SectionPage({ title, description, children }) {
  return (
    <section className="page-panel">
      <div className="page-header">
        <div>
          <p className="eyebrow">Module</p>
          <h2>{title}</h2>
        </div>
        <p>{description}</p>
      </div>
      {children}
    </section>
  );
}

export default App;
