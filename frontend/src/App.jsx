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
import {
  attendanceRecords,
  assignments,
  dashboardStats,
  events,
  jobs,
  marks,
  notices,
  notifications,
  studentPerformance,
} from './data/mockData';
import { fetchCurrentUser, loginUser, logoutUser, registerUser, requestPasswordReset, resetPassword, verifyEmail } from './store/authSlice';
import { fetchStudentDashboard, fetchNotices, fetchEvents, fetchStudentAttendance, fetchStudentMarks, fetchStudentAssignments } from './store/studentSlice';
import LoginTypeSelector from './LoginTypeSelector';
import StudentLoginPage from './StudentLoginPage';
import TeacherLoginPage from './TeacherLoginPage';
import TeacherDashboard from './TeacherDashboard';
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
            <button className="btn btn-secondary">Export</button>
            <button className="btn btn-primary">New Notice</button>
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
          <Route path="/students" element={<SectionPage title="Students" description="Student directory and performance monitoring"><TableList data={dashboardStats} /></SectionPage>} />
          <Route path="/faculty" element={<SectionPage title="Faculty" description="Faculty workload and subject allocation"><TableList data={dashboardStats} /></SectionPage>} />
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

function AdminDashboardShell() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  return (
    <div className="role-dashboard">
      <div className="role-header">
        <div>
          <p className="eyebrow">Administrative overview</p>
          <h1>Admin Dashboard</h1>
        </div>
        <button className="btn btn-secondary" onClick={() => dispatch(logoutUser())}>Logout</button>
      </div>

      <div className="role-grid">
        <div className="card role-card">
          <h3>Welcome, {user?.name || 'Admin'}</h3>
          <p>Manage users, notices, events, and campus operations in one place.</p>
        </div>
        <div className="card role-card">
          <h3>System Health</h3>
          <p>Student engagement rate: 96%</p>
          <p>Attendance reporting: Live</p>
        </div>
        <div className="card role-card">
          <h3>Quick Actions</h3>
          <ul className="list-flat">
            <li>Create notice</li>
            <li>Add event</li>
            <li>View leave requests</li>
          </ul>
        </div>
      </div>
    </div>
  );
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
          <Route path="/teacher/submissions" element={<div className="page-panel"><p className="empty-message">Student submissions view coming soon</p></div>} />
          <Route path="/teacher/settings" element={<div className="page-panel"><p className="empty-message">Settings page coming soon</p></div>} />
          <Route path="*" element={<Navigate to="/teacher/dashboard" replace />} />
        </Routes>
      </main>
    </div>
  );
}

function DashboardPage() {
  const { dashboard } = useSelector((state) => state.student);
  const stats = dashboard || {
    student: { name: 'Loading...', cgpa: '0.0' },
    attendanceSummary: { percentage: 0 },
    marksAverage: 0,
    pendingAssignments: 0,
    notifications: 0,
    upcomingEvents: 0,
  };

  const smartInsights = [
    {
      title: 'Attendance alert',
      detail: 'Operating Systems is below 75% - review class participation.',
      action: 'View attendance',
      tone: 'warning',
    },
    {
      title: 'Assignment due soon',
      detail: 'Database Normalization is due in 3 days.',
      action: 'Open assignment',
      tone: 'info',
    },
    {
      title: 'Placement update',
      detail: 'Microsoft internship shortlist is now live.',
      action: 'Apply now',
      tone: 'success',
    },
    {
      title: 'Campus event',
      detail: 'Tech Fest registration closes this weekend.',
      action: 'Register',
      tone: 'primary',
    },
  ];

  return (
    <>
      <div className="stat-grid">
        {dashboardStats.map((item) => (
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
            <span>Last 6 terms</span>
          </div>
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer>
              <AreaChart data={studentPerformance}>
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
            <h3>Attendance Summary</h3>
            <span>This month</span>
          </div>
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer>
              <BarChart data={attendanceRecords}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="subject" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Bar dataKey="percentage" fill="#10b981" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="content-grid two-col">
        <div className="card">
          <div className="section-head">
            <h3>Smart Recommendations</h3>
            <span>AI-assisted guidance</span>
          </div>
          <div className="insight-list">
            {smartInsights.map((item) => (
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
            <button className="action-pill">View attendance</button>
            <button className="action-pill">Submit assignment</button>
            <button className="action-pill">Check notices</button>
            <button className="action-pill">Apply for jobs</button>
            <button className="action-pill">Register for event</button>
            <button className="action-pill">Open profile</button>
          </div>
        </div>
      </div>

      <div className="content-grid">
        <div className="card">
          <div className="section-head">
            <h3>Latest Notices</h3>
            <span>Updated today</span>
          </div>
          <ul className="list-stack">
            {notices.slice(0, 3).map((notice) => (
              <li key={notice.id}>
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
            {notifications.slice(0, 4).map((item) => (
              <li key={item.id}>
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
  return (
    <SectionPage title="Attendance Tracking" description="Monitor class attendance and performance thresholds">
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
            {attendanceRecords.map((row) => (
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
  return (
    <SectionPage title="Academic Marks" description="Internal, assignment, and semester performance tracking">
      <div className="card table-card">
        <table className="table">
          <thead>
            <tr>
              <th>Subject</th>
              <th>Internal</th>
              <th>Assignment</th>
              <th>Final</th>
              <th>Average</th>
            </tr>
          </thead>
          <tbody>
            {marks.map((row) => (
              <tr key={row.subject}>
                <td>{row.subject}</td>
                <td>{row.internal}</td>
                <td>{row.assignment}</td>
                <td>{row.final}</td>
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
  return (
    <SectionPage title="Assignments" description="Submission tracking and review workflow">
      <div className="assignment-list">
        {assignments.map((assignment) => (
          <article className="card assignment-card" key={assignment.id}>
            <div className="section-head">
              <h3>{assignment.title}</h3>
              <span className={`badge ${assignment.status === 'Submitted' ? 'badge-success' : 'badge-warning'}`}>{assignment.status}</span>
            </div>
            <p>{assignment.description}</p>
            <div className="meta-row">
              <span>Subject: {assignment.subject}</span>
              <span>Deadline: {assignment.deadline}</span>
            </div>
          </article>
        ))}
      </div>
    </SectionPage>
  );
}

function NoticesPage() {
  return (
    <SectionPage title="Notice Board" description="Announcements from admin and faculty">
      <div className="notice-list">
        {notices.map((notice) => (
          <article className="card notice-card" key={notice.id}>
            <div className="section-head">
              <h3>{notice.title}</h3>
              <span className="badge badge-primary">{notice.category}</span>
            </div>
            <p>{notice.description}</p>
            <div className="meta-row">
              <span>{notice.author}</span>
              <span>{notice.date}</span>
            </div>
          </article>
        ))}
      </div>
    </SectionPage>
  );
}

function EventsPage() {
  return (
    <SectionPage title="Campus Events" description="Upcomings and registration details">
      <div className="event-grid">
        {events.map((event) => (
          <article className="card event-card" key={event.id}>
            <div className="event-banner" style={{ background: event.color }} />
            <h3>{event.title}</h3>
            <p>{event.date}</p>
            <p>{event.venue}</p>
            <button className="btn btn-primary">Register</button>
          </article>
        ))}
      </div>
    </SectionPage>
  );
}

function PlacementPage() {
  return (
    <SectionPage title="Placement Opportunities" description="Jobs and internships across departments">
      <div className="job-list">
        {jobs.map((job) => (
          <article key={job.id} className="card job-card">
            <div className="section-head">
              <h3>{job.title}</h3>
              <span className="badge badge-success">{job.type}</span>
            </div>
            <p>{job.company}</p>
            <div className="meta-row">
              <span>{job.location}</span>
              <span>{job.package}</span>
            </div>
            <p>{job.skills.join(' • ')}</p>
            <button className="btn btn-primary">Apply</button>
          </article>
        ))}
      </div>
    </SectionPage>
  );
}

function ProfilePage() {
  return (
    <SectionPage title="Student Profile" description="Academic records and personal information">
      <div className="profile-grid">
        <div className="card">
          <h3>Profile Summary</h3>
          <ul className="list-flat">
            <li>Name: Aisha Verma</li>
            <li>Roll No: CS-18-204</li>
            <li>Department: Computer Science</li>
            <li>Semester: 6</li>
          </ul>
        </div>
        <div className="card">
          <h3>Skills</h3>
          <div className="tag-row">
            {['React', 'Node.js', 'MongoDB', 'UI/UX', 'DSA'].map((skill) => (
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

function TableList({ data }) {
  return (
    <div className="card table-card">
      <table className="table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Type</th>
            <th>Value</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row.label}>
              <td>{row.label}</td>
              <td>{row.type || 'System'}</td>
              <td>{row.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;
