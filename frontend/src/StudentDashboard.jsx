import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import api from './services/api';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './StudentDashboard.css';

const StudentDashboard = () => {
  const user = useSelector((state) => state.auth.user);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  
  // Dashboard state
  const [dashboardData, setDashboardData] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [marks, setMarks] = useState([]);
  const [schedule, setSchedule] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [exams, setExams] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [forumPosts, setForumPosts] = useState([]);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [analyticsData, setAnalyticsData] = useState(null);

  // Form states
  const [showLeaveForm, setShowLeaveForm] = useState(false);
  const [showAssignmentSubmission, setShowAssignmentSubmission] = useState(false);

  useEffect(() => {
    fetchAllData();
  }, [activeTab]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'overview') {
        const res = await api.get(`/student/dashboard/overview`);
        setDashboardData(res.data);
      } else if (activeTab === 'attendance') {
        const res = await api.get(`/attendance/student/${user.id || 'me'}`);
        setAttendance(res.data || []);
      } else if (activeTab === 'marks') {
        const res = await api.get(`/marks/student/${user.id || 'me'}`);
        setMarks(res.data || []);
      } else if (activeTab === 'schedule') {
        const res = await api.get(`/schedule/student/${user.id || 'me'}`);
        setSchedule(res.data || []);
      } else if (activeTab === 'assignments') {
        const res = await api.get(`/assignment/student/${user.id || 'me'}`);
        setAssignments(res.data || []);
      } else if (activeTab === 'exams') {
        const res = await api.get(`/exams/student/${user.id || 'me'}`);
        setExams(res.data || []);
      } else if (activeTab === 'materials') {
        const res = await api.get(`/materials/student/${user.id || 'me'}`);
        setMaterials(res.data || []);
      } else if (activeTab === 'forum') {
        const res = await api.get(`/forum/student/${user.id || 'me'}`);
        setForumPosts(res.data || []);
      } else if (activeTab === 'leave') {
        const res = await api.get(`/leave/student/${user.id || 'me'}`);
        setLeaveRequests(res.data || []);
      }
    } catch (error) {
      console.error(`Error fetching ${activeTab} data:`, error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitLeave = async (formData) => {
    try {
      await api.post(`/leave/request`, formData);
      fetchAllData();
      setShowLeaveForm(false);
      alert('Leave request submitted successfully');
    } catch (error) {
      console.error('Error submitting leave request:', error);
      alert('Failed to submit leave request');
    }
  };

  const handleSubmitAssignment = async (formData) => {
    try {
      await api.post(`/submission`, formData);
      fetchAllData();
      setShowAssignmentSubmission(false);
      alert('Assignment submitted successfully');
    } catch (error) {
      console.error('Error submitting assignment:', error);
      alert('Failed to submit assignment');
    }
  };

  if (loading && !dashboardData && activeTab === 'overview') {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <div className="student-dashboard page-panel">
      {/* Header */}
      <div className="topbar">
        <div>
          <h1>🎓 Student Dashboard</h1>
          <p className="eyebrow">Track your academic progress and assignments</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="dashboard-nav tabs-horizontal">
        <button className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>📊 Overview</button>
        <button className={`tab-btn ${activeTab === 'attendance' ? 'active' : ''}`} onClick={() => setActiveTab('attendance')}>✓ Attendance</button>
        <button className={`tab-btn ${activeTab === 'marks' ? 'active' : ''}`} onClick={() => setActiveTab('marks')}>📊 Marks</button>
        <button className={`tab-btn ${activeTab === 'schedule' ? 'active' : ''}`} onClick={() => setActiveTab('schedule')}>📅 Schedule</button>
        <button className={`tab-btn ${activeTab === 'assignments' ? 'active' : ''}`} onClick={() => setActiveTab('assignments')}>📝 Assignments</button>
        <button className={`tab-btn ${activeTab === 'exams' ? 'active' : ''}`} onClick={() => setActiveTab('exams')}>🧪 Exams</button>
        <button className={`tab-btn ${activeTab === 'materials' ? 'active' : ''}`} onClick={() => setActiveTab('materials')}>📚 Materials</button>
        <button className={`tab-btn ${activeTab === 'forum' ? 'active' : ''}`} onClick={() => setActiveTab('forum')}>💬 Forum</button>
        <button className={`tab-btn ${activeTab === 'leave' ? 'active' : ''}`} onClick={() => setActiveTab('leave')}>✋ Leave</button>
        <button className={`tab-btn ${activeTab === 'analytics' ? 'active' : ''}`} onClick={() => setActiveTab('analytics')}>📈 Analytics</button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {/* Overview Tab */}
        {activeTab === 'overview' && dashboardData && (
          <div className="overview-section">
            <h2>Welcome back, {user?.name}!</h2>
            
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">📚</div>
                <h3>Courses</h3>
                <p className="stat-number">{dashboardData.courseCount || 0}</p>
              </div>
              <div className="stat-card">
                <div className="stat-icon">📝</div>
                <h3>Pending Assignments</h3>
                <p className="stat-number">{dashboardData.pendingAssignments || 0}</p>
              </div>
              <div className="stat-card">
                <div className="stat-icon">📊</div>
                <h3>Average Grade</h3>
                <p className="stat-number">{dashboardData.averageGrade || 'N/A'}</p>
              </div>
              <div className="stat-card">
                <div className="stat-icon">✓</div>
                <h3>Attendance</h3>
                <p className="stat-number">{dashboardData.attendancePercentage || 0}%</p>
              </div>
            </div>

            <div className="overview-sections">
              <div className="overview-card">
                <h3>📅 Upcoming Events</h3>
                <div className="event-list">
                  <div className="event-item">
                    <span className="event-date">Tomorrow</span>
                    <span className="event-name">Data Structures Class</span>
                  </div>
                  <div className="event-item">
                    <span className="event-date">In 3 days</span>
                    <span className="event-name">Database Quiz</span>
                  </div>
                  <div className="event-item">
                    <span className="event-date">In 7 days</span>
                    <span className="event-name">Assignment Deadline</span>
                  </div>
                </div>
              </div>

              <div className="overview-card">
                <h3>📢 Recent Announcements</h3>
                <div className="announcement-list">
                  <div className="announcement-item">
                    <strong>Assignment 2 Deadline Extended</strong>
                    <p>Submission deadline has been extended to next Friday.</p>
                  </div>
                  <div className="announcement-item">
                    <strong>Mid-Semester Exam Schedule</strong>
                    <p>Exams start on 15th November. Check your schedule.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Attendance Tab */}
        {activeTab === 'attendance' && (
          <div className="attendance-section">
            <h2>📊 Your Attendance</h2>
            <div className="attendance-summary">
              <div className="attendance-card">
                <h3>Overall Attendance</h3>
                <p className="large-number">85%</p>
              </div>
              <div className="attendance-by-subject">
                <h3>By Subject</h3>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Subject</th>
                      <th>Present</th>
                      <th>Absent</th>
                      <th>Percentage</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendance.length === 0 ? (
                      <tr><td colSpan="4" className="text-center">No attendance records</td></tr>
                    ) : attendance.map((item, idx) => (
                      <tr key={idx}>
                        <td><strong>{item.subject?.name}</strong></td>
                        <td>{item.present || 0}</td>
                        <td>{item.absent || 0}</td>
                        <td>{item.percentage || 0}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="info-box">
              <p>📌 Maintain at least 75% attendance to be eligible for final exams. Contact your class faculty if you need to apply for leave.</p>
            </div>
          </div>
        )}

        {/* Marks Tab */}
        {activeTab === 'marks' && (
          <div className="marks-section">
            <h2>📊 Your Marks</h2>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Subject</th>
                  <th>Exam Type</th>
                  <th>Marks</th>
                  <th>Out of</th>
                  <th>Percentage</th>
                  <th>Grade</th>
                </tr>
              </thead>
              <tbody>
                {marks.length === 0 ? (
                  <tr><td colSpan="6" className="text-center">No marks recorded yet</td></tr>
                ) : marks.map(item => (
                  <tr key={item._id}>
                    <td><strong>{item.subject?.name}</strong></td>
                    <td>{item.examType}</td>
                    <td>{item.marks}</td>
                    <td>{item.outOf}</td>
                    <td>{Math.round((item.marks / item.outOf) * 100)}%</td>
                    <td>
                      <span className={`grade-badge grade-${item.grade || 'NA'}`}>
                        {item.grade || 'N/A'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Schedule Tab */}
        {activeTab === 'schedule' && (
          <div className="schedule-section">
            <h2>📅 Class Schedule</h2>
            <div className="schedule-list">
              {schedule.length === 0 ? (
                <div className="info-box">No schedule available</div>
              ) : schedule.map(item => (
                <div key={item._id} className="schedule-item">
                  <div className="schedule-day">{item.dayOfWeek}</div>
                  <div className="schedule-details">
                    <h4>{item.subject?.name}</h4>
                    <p>⏰ {item.startTime} - {item.endTime}</p>
                    <p>📍 {item.room || 'TBD'}</p>
                  </div>
                  <div className="schedule-status">
                    {item.isCompleted ? <span className="badge-completed">Completed</span> : <span className="badge-upcoming">Upcoming</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Assignments Tab */}
        {activeTab === 'assignments' && (
          <div className="assignments-section">
            <div className="section-header">
              <h2>📝 Assignments</h2>
            </div>
            <div className="assignment-filters">
              <button className="filter-btn active">All</button>
              <button className="filter-btn">Pending</button>
              <button className="filter-btn">Submitted</button>
              <button className="filter-btn">Graded</button>
            </div>
            <div className="assignments-list">
              {assignments.length === 0 ? (
                <div className="info-box">No assignments at the moment</div>
              ) : assignments.map(item => (
                <div key={item._id} className="assignment-card">
                  <div className="assignment-header">
                    <h4>{item.title}</h4>
                    <span className={`status status-${item.submissionStatus || 'pending'}`}>
                      {item.submissionStatus || 'Pending'}
                    </span>
                  </div>
                  <p className="assignment-description">{item.description}</p>
                  <div className="assignment-meta">
                    <span>📚 {item.subject?.name}</span>
                    <span>👨‍🏫 {item.faculty?.name}</span>
                    <span>📅 Due: {item.dueDate ? new Date(item.dueDate).toLocaleDateString() : 'N/A'}</span>
                  </div>
                  <div className="assignment-actions">
                    {item.submissionStatus !== 'submitted' && (
                      <button className="btn-primary" onClick={() => setShowAssignmentSubmission(true)}>
                        Submit Assignment
                      </button>
                    )}
                    {item.grade && (
                      <div className="assignment-grade">
                        <span>Grade: <strong>{item.grade}</strong></span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Exams Tab */}
        {activeTab === 'exams' && (
          <div className="exams-section">
            <h2>🧪 Upcoming Exams</h2>
            <div className="exams-list">
              {exams.length === 0 ? (
                <div className="info-box">No exams scheduled</div>
              ) : exams.map(item => (
                <div key={item._id} className="exam-card">
                  <div className="exam-header">
                    <h4>{item.title}</h4>
                    <span className={`status status-${item.status}`}>{item.status}</span>
                  </div>
                  <div className="exam-details">
                    <p>📚 <strong>Subject:</strong> {item.subject?.name}</p>
                    <p>📅 <strong>Date:</strong> {new Date(item.examDate).toLocaleDateString()}</p>
                    <p>⏰ <strong>Time:</strong> {item.startTime} - {item.endTime}</p>
                    <p>⏱️ <strong>Duration:</strong> {item.duration} minutes</p>
                    <p>📝 <strong>Total Marks:</strong> {item.totalMarks}</p>
                    <p>📍 <strong>Room:</strong> {item.room || 'TBD'}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Learning Materials Tab */}
        {activeTab === 'materials' && (
          <div className="materials-section">
            <h2>📚 Learning Materials</h2>
            <div className="materials-list">
              {materials.length === 0 ? (
                <div className="info-box">No materials available yet</div>
              ) : materials.map(item => (
                <div key={item._id} className="material-item">
                  <div className="material-header">
                    <h4>{item.title}</h4>
                    <span className="material-type">{item.type}</span>
                  </div>
                  <p className="material-description">{item.description}</p>
                  <div className="material-meta">
                    <span>📚 {item.subject?.name}</span>
                    <span>👨‍🏫 {item.faculty?.name}</span>
                    <span>📥 Downloads: {item.downloads}</span>
                  </div>
                  <a href={item.fileUrl} target="_blank" rel="noopener noreferrer" className="btn-small">
                    Download
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Forum Tab */}
        {activeTab === 'forum' && (
          <div className="forum-section">
            <h2>💬 Class Forum</h2>
            <div className="forum-posts">
              {forumPosts.length === 0 ? (
                <div className="info-box">No forum posts yet</div>
              ) : forumPosts.map(post => (
                <div key={post._id} className="forum-post">
                  <div className="post-header">
                    <div>
                      <h4>{post.title}</h4>
                      <small>by {post.author?.name} • {post.category}</small>
                    </div>
                    {post.isPinned && <span className="badge-pinned">📌 Pinned</span>}
                  </div>
                  <p className="post-content">{post.content.substring(0, 300)}...</p>
                  <div className="post-footer">
                    <span>💬 {post.replies?.length || 0} replies</span>
                    <span>👍 {post.likes?.length || 0} likes</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Leave Tab */}
        {activeTab === 'leave' && (
          <div className="leave-section">
            <div className="section-header">
              <h2>✋ Leave Management</h2>
              <button className="btn-primary" onClick={() => setShowLeaveForm(!showLeaveForm)}>
                + Apply for Leave
              </button>
            </div>

            {showLeaveForm && (
              <form className="form-card" onSubmit={(e) => {
                e.preventDefault();
                handleSubmitLeave({
                  startDate: e.target.startDate.value,
                  endDate: e.target.endDate.value,
                  reason: e.target.reason.value,
                });
              }}>
                <div className="form-group">
                  <label>Start Date</label>
                  <input type="date" name="startDate" required />
                </div>
                <div className="form-group">
                  <label>End Date</label>
                  <input type="date" name="endDate" required />
                </div>
                <div className="form-group">
                  <label>Reason for Leave</label>
                  <textarea name="reason" placeholder="Provide reason for your leave request" rows="4" required></textarea>
                </div>
                <div className="form-actions">
                  <button type="submit" className="btn-primary">Submit Request</button>
                  <button type="button" className="btn-secondary" onClick={() => setShowLeaveForm(false)}>Cancel</button>
                </div>
              </form>
            )}

            <div className="leave-history">
              <h3>Your Leave Requests</h3>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>From Date</th>
                    <th>To Date</th>
                    <th>Reason</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {leaveRequests.length === 0 ? (
                    <tr><td colSpan="4" className="text-center">No leave requests submitted</td></tr>
                  ) : leaveRequests.map(request => (
                    <tr key={request._id}>
                      <td>{new Date(request.startDate).toLocaleDateString()}</td>
                      <td>{new Date(request.endDate).toLocaleDateString()}</td>
                      <td>{request.reason}</td>
                      <td><span className={`badge badge-${request.status}`}>{request.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="analytics-section">
            <h2>📈 Your Performance Analytics</h2>
            <div className="analytics-grid">
              <div className="chart-container">
                <h3>Grade Progress Over Time</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={[
                    { name: 'Quiz 1', grade: 85 },
                    { name: 'Assignment 1', grade: 88 },
                    { name: 'Unit Test', grade: 82 },
                    { name: 'Quiz 2', grade: 90 },
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="grade" stroke="#667eea" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="chart-container">
                <h3>Marks by Subject</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={[
                    { subject: 'Data Structures', marks: 85 },
                    { subject: 'Database', marks: 78 },
                    { subject: 'Web Dev', marks: 92 },
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="subject" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="marks" fill="#667eea" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="analytics-stats">
                <div className="stat-box">
                  <h4>Current CGPA</h4>
                  <p className="big-number">8.2</p>
                </div>
                <div className="stat-box">
                  <h4>Average Marks</h4>
                  <p className="big-number">85%</p>
                </div>
                <div className="stat-box">
                  <h4>Attendance</h4>
                  <p className="big-number">87%</p>
                </div>
                <div className="stat-box">
                  <h4>Rank in Class</h4>
                  <p className="big-number">5/120</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
