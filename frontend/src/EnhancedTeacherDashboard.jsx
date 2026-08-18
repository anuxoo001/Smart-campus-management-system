import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import api from './services/api';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './EnhancedTeacherDashboard.css';

const EnhancedTeacherDashboard = ({ initialTab = 'overview' }) => {
  const user = useSelector((state) => state.auth.user);
  const [activeTab, setActiveTab] = useState(initialTab);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);
  
  // Dashboard state
  const [dashboardData, setDashboardData] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [marks, setMarks] = useState([]);
  const [schedule, setSchedule] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [exams, setExams] = useState([]);
  const [forumPosts, setForumPosts] = useState([]);
  const [roster, setRoster] = useState([]);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [classAnalytics, setClassAnalytics] = useState(null);

  // Form states
  const [showAttendanceForm, setShowAttendanceForm] = useState(false);
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [showMaterialForm, setShowMaterialForm] = useState(false);
  const [showExamForm, setShowExamForm] = useState(false);
  const [showForumPost, setShowForumPost] = useState(false);
  const [showMarksForm, setShowMarksForm] = useState(false);
  const [showAnnouncementForm, setShowAnnouncementForm] = useState(false);

  useEffect(() => {
    fetchAllData();
  }, [activeTab]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'overview') {
        const res = await api.get(`/faculty/dashboard/overview`);
        setDashboardData(res.data);
      } else if (activeTab === 'schedule') {
        const res = await api.get(`/schedule/faculty/${user.id || 'me'}`);
        setSchedule(res.data || []);
      } else if (activeTab === 'materials') {
        const res = await api.get(`/materials/faculty/${user.id || 'me'}`);
        setMaterials(res.data || []);
      } else if (activeTab === 'exams') {
        const res = await api.get(`/exams/faculty/${user.id || 'me'}`);
        setExams(res.data || []);
      } else if (activeTab === 'leave-requests') {
        const res = await api.get(`/faculty/${user.id || 'me'}/leave-requests`);
        setLeaveRequests(res.data || []);
      }
    } catch (error) {
      console.error(`Error fetching ${activeTab} data:`, error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveLeave = async (leaveId, status) => {
    try {
      await api.put(`/faculty/leave/${leaveId}`, { status });
      fetchAllData();
      alert(`Leave request ${status}`);
    } catch (error) {
      console.error('Error updating leave request:', error);
      alert('Failed to update leave request');
    }
  };

  if (loading && !dashboardData && activeTab === 'overview') {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <div className="enhanced-dashboard page-panel">
      {/* Header */}
      <div className="topbar" style={{ display: 'none' }}>
        <div>
          <h1>🎓 Enhanced Teacher Dashboard</h1>
          <p className="eyebrow">Manage your class, students, and academic activities</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="dashboard-nav tabs-horizontal">
        <button className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>📊 Overview</button>
        <button className={`tab-btn ${activeTab === 'attendance' ? 'active' : ''}`} onClick={() => setActiveTab('attendance')}>✓ Attendance</button>
        <button className={`tab-btn ${activeTab === 'marks' ? 'active' : ''}`} onClick={() => setActiveTab('marks')}>📝 Marks</button>
        <button className={`tab-btn ${activeTab === 'schedule' ? 'active' : ''}`} onClick={() => setActiveTab('schedule')}>📅 Schedule</button>
        <button className={`tab-btn ${activeTab === 'materials' ? 'active' : ''}`} onClick={() => setActiveTab('materials')}>📚 Materials</button>
        <button className={`tab-btn ${activeTab === 'exams' ? 'active' : ''}`} onClick={() => setActiveTab('exams')}>🧪 Exams</button>
        <button className={`tab-btn ${activeTab === 'roster' ? 'active' : ''}`} onClick={() => setActiveTab('roster')}>👥 Roster</button>
        <button className={`tab-btn ${activeTab === 'forum' ? 'active' : ''}`} onClick={() => setActiveTab('forum')}>💬 Forum</button>
        <button className={`tab-btn ${activeTab === 'announcements' ? 'active' : ''}`} onClick={() => setActiveTab('announcements')}>📣 Announcements</button>
        <button className={`tab-btn ${activeTab === 'analytics' ? 'active' : ''}`} onClick={() => setActiveTab('analytics')}>📈 Analytics</button>
        <button className={`tab-btn ${activeTab === 'leave-requests' ? 'active' : ''}`} onClick={() => setActiveTab('leave-requests')}>✋ Leave Requests</button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {/* Overview Tab */}
        {activeTab === 'overview' && dashboardData && (
          <div className="overview-section">
            <h2>Dashboard Overview</h2>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">📋</div>
                <h3>Assignments</h3>
                <p className="stat-number">{dashboardData.assignmentCount || 0}</p>
              </div>
              <div className="stat-card">
                <div className="stat-icon">⏳</div>
                <h3>Pending Submissions</h3>
                <p className="stat-number">{dashboardData.pendingSubmissions || 0}</p>
              </div>
              <div className="stat-card">
                <div className="stat-icon">👨‍🎓</div>
                <h3>Students</h3>
                <p className="stat-number">{dashboardData.studentCount || 0}</p>
              </div>
              <div className="stat-card">
                <div className="stat-icon">📖</div>
                <h3>Subjects</h3>
                <p className="stat-number">{dashboardData.subjects?.length || 0}</p>
              </div>
            </div>
            
            <div className="overview-actions">
              <h3>Quick Actions</h3>
              <div className="action-buttons">
                <button className="btn-secondary" onClick={() => setActiveTab('attendance')}>Mark Attendance</button>
                <button className="btn-secondary" onClick={() => setActiveTab('marks')}>Enter Marks</button>
                <button className="btn-secondary" onClick={() => setActiveTab('schedule')}>Add Schedule</button>
                <button className="btn-secondary" onClick={() => setActiveTab('materials')}>Upload Material</button>
                <button className="btn-secondary" onClick={() => setActiveTab('exams')}>Create Exam</button>
              </div>
            </div>
          </div>
        )}

        {/* Attendance Tab */}
        {activeTab === 'attendance' && (
          <div className="attendance-section">
            <div className="section-header">
              <h2>📊 Attendance Management</h2>
              <button className="btn-primary" onClick={() => setShowAttendanceForm(!showAttendanceForm)}>+ Mark Attendance</button>
            </div>
            {showAttendanceForm && (
              <form className="form-card">
                <div className="form-row">
                  <div className="form-group">
                    <label>Date</label>
                    <input type="date" required />
                  </div>
                  <div className="form-group">
                    <label>Subject</label>
                    <select required><option>Select Subject</option></select>
                  </div>
                  <div className="form-group">
                    <label>Semester</label>
                    <select required><option>Select Semester</option></select>
                  </div>
                </div>
                <div className="attendance-grid">
                  <div className="student-attendance">
                    <span>Student Name</span>
                    <select><option>Present</option><option>Absent</option><option>Late</option></select>
                  </div>
                </div>
                <div className="form-actions">
                  <button type="submit" className="btn-primary">Submit Attendance</button>
                  <button type="button" className="btn-secondary" onClick={() => setShowAttendanceForm(false)}>Cancel</button>
                </div>
              </form>
            )}
            <div className="info-box">
              <p>📌 Attendance records for this semester will appear here. Use the form above to mark attendance for your classes.</p>
            </div>
          </div>
        )}

        {/* Marks Tab */}
        {activeTab === 'marks' && (
          <div className="marks-section">
            <div className="section-header">
              <h2>📝 Marks Management</h2>
              <button className="btn-primary" onClick={() => setShowMarksForm(!showMarksForm)}>+ Enter Marks</button>
            </div>
            {showMarksForm && (
              <form className="form-card">
                <div className="form-row">
                  <div className="form-group">
                    <label>Subject</label>
                    <select required><option>Select Subject</option></select>
                  </div>
                  <div className="form-group">
                    <label>Exam Type</label>
                    <select required><option>Unit Test</option><option>Midterm</option><option>Final</option></select>
                  </div>
                </div>
                <table className="marks-entry-table">
                  <thead>
                    <tr><th>Student ID</th><th>Name</th><th>Marks</th><th>Out of</th></tr>
                  </thead>
                  <tbody>
                    <tr><td>CS-001</td><td>John Doe</td><td><input type="number" /></td><td>100</td></tr>
                  </tbody>
                </table>
                <button type="submit" className="btn-primary">Save Marks</button>
              </form>
            )}
            <div className="info-box">
              <p>📌 Marks recorded for all exams and assessments will appear here.</p>
            </div>
          </div>
        )}

        {/* Schedule Tab */}
        {activeTab === 'schedule' && (
          <div className="schedule-section">
            <div className="section-header">
              <h2>📅 Class Schedule</h2>
              <button className="btn-primary" onClick={() => setShowScheduleForm(!showScheduleForm)}>+ Add Schedule</button>
            </div>
            {showScheduleForm && (
              <form className="form-card">
                <div className="form-row">
                  <div className="form-group">
                    <label>Subject</label>
                    <select required><option>Select Subject</option></select>
                  </div>
                  <div className="form-group">
                    <label>Day</label>
                    <select required>
                      <option>Monday</option><option>Tuesday</option><option>Wednesday</option>
                      <option>Thursday</option><option>Friday</option><option>Saturday</option>
                    </select>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Start Time</label>
                    <input type="time" required />
                  </div>
                  <div className="form-group">
                    <label>End Time</label>
                    <input type="time" required />
                  </div>
                  <div className="form-group">
                    <label>Room</label>
                    <input type="text" placeholder="Room Number" />
                  </div>
                </div>
                <button type="submit" className="btn-primary">Add Schedule</button>
              </form>
            )}
            <div className="schedule-list">
              {schedule.length === 0 ? (
                <div className="info-box">No class schedule yet. Add one using the form above.</div>
              ) : schedule.map(item => (
                <div key={item._id} className="schedule-item">
                  <div className="schedule-time">{item.dayOfWeek} | {item.startTime} - {item.endTime}</div>
                  <div className="schedule-info">Subject: {item.subject?.name} | Room: {item.room || 'TBD'}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Materials Tab */}
        {activeTab === 'materials' && (
          <div className="materials-section">
            <div className="section-header">
              <h2>📚 Learning Materials</h2>
              <button className="btn-primary" onClick={() => setShowMaterialForm(!showMaterialForm)}>+ Upload Material</button>
            </div>
            {showMaterialForm && (
              <form className="form-card">
                <div className="form-group">
                  <label>Title</label>
                  <input type="text" placeholder="Material Title" required />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea placeholder="Brief description"></textarea>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Type</label>
                    <select required><option>PDF</option><option>Video</option><option>Document</option><option>Link</option></select>
                  </div>
                  <div className="form-group">
                    <label>Category</label>
                    <input type="text" placeholder="e.g., Chapter 1" />
                  </div>
                </div>
                <div className="form-group">
                  <label>File URL</label>
                  <input type="url" placeholder="https://..." required />
                </div>
                <button type="submit" className="btn-primary">Upload</button>
              </form>
            )}
            <div className="materials-list">
              {materials.length === 0 ? (
                <div className="info-box">No materials uploaded yet.</div>
              ) : materials.map(item => (
                <div key={item._id} className="material-item">
                  <div className="material-header">
                    <h4>{item.title}</h4>
                    <span className="material-type">{item.type}</span>
                  </div>
                  <p>{item.description}</p>
                  <small>Category: {item.category} | Downloads: {item.downloads}</small>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Exams Tab */}
        {activeTab === 'exams' && (
          <div className="exams-section">
            <div className="section-header">
              <h2>🧪 Exam Management</h2>
              <button className="btn-primary" onClick={() => setShowExamForm(!showExamForm)}>+ Create Exam</button>
            </div>
            {showExamForm && (
              <form className="form-card">
                <div className="form-group">
                  <label>Exam Title</label>
                  <input type="text" placeholder="e.g., Unit Test 1" required />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Exam Date</label>
                    <input type="date" required />
                  </div>
                  <div className="form-group">
                    <label>Exam Type</label>
                    <select required><option>Unit Test</option><option>Midterm</option><option>Final</option><option>Quiz</option></select>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Start Time</label>
                    <input type="time" required />
                  </div>
                  <div className="form-group">
                    <label>End Time</label>
                    <input type="time" required />
                  </div>
                  <div className="form-group">
                    <label>Total Marks</label>
                    <input type="number" placeholder="100" required />
                  </div>
                </div>
                <div className="form-group">
                  <label>Room</label>
                  <input type="text" placeholder="Room Number" />
                </div>
                <button type="submit" className="btn-primary">Create Exam</button>
              </form>
            )}
            <div className="exams-list">
              {exams.length === 0 ? (
                <div className="info-box">No exams scheduled yet.</div>
              ) : exams.map(item => (
                <div key={item._id} className="exam-item">
                  <div className="exam-header">
                    <h4>{item.title}</h4>
                    <span className={`status status-${item.status}`}>{item.status}</span>
                  </div>
                  <p>Date: {new Date(item.examDate).toLocaleDateString()} | Time: {item.startTime} - {item.endTime}</p>
                  <small>Total Marks: {item.totalMarks} | Type: {item.examType} | Room: {item.room || 'TBD'}</small>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Student Roster Tab */}
        {activeTab === 'roster' && (
          <div className="roster-section">
            <div className="section-header">
              <h2>👥 Student Roster</h2>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Student ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Batch</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {roster.length === 0 ? (
                  <tr><td colSpan="6" className="text-center">No students in roster</td></tr>
                ) : roster.map(student => (
                  <tr key={student._id}>
                    <td>{student.studentId}</td>
                    <td><strong>{student.name}</strong></td>
                    <td>{student.email}</td>
                    <td>{student.phone}</td>
                    <td>{student.batch}</td>
                    <td><button className="btn-small">View</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Forum Tab */}
        {activeTab === 'forum' && (
          <div className="forum-section">
            <div className="section-header">
              <h2>💬 Class Forum</h2>
              <button className="btn-primary" onClick={() => setShowForumPost(!showForumPost)}>+ Create Post</button>
            </div>
            {showForumPost && (
              <form className="form-card">
                <div className="form-group">
                  <label>Title</label>
                  <input type="text" placeholder="Post title" required />
                </div>
                <div className="form-group">
                  <label>Content</label>
                  <textarea placeholder="Write your message..." rows="6" required></textarea>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Category</label>
                    <select required><option>Question</option><option>Discussion</option><option>Announcement</option></select>
                  </div>
                  <div className="form-group">
                    <label className="checkbox">
                      <input type="checkbox" /> Pin this post
                    </label>
                  </div>
                </div>
                <button type="submit" className="btn-primary">Post</button>
              </form>
            )}
            <div className="forum-posts">
              {forumPosts.length === 0 ? (
                <div className="info-box">No forum posts yet. Create one to start discussions!</div>
              ) : forumPosts.map(post => (
                <div key={post._id} className="forum-post">
                  <div className="post-header">
                    <h4>{post.title}</h4>
                    <span className="post-category">{post.category}</span>
                  </div>
                  <p>{post.content.substring(0, 200)}...</p>
                  <div className="post-meta">
                    <small>by {post.author?.name} | {post.replies?.length || 0} replies | {post.likes?.length || 0} likes</small>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Announcements Tab */}
        {activeTab === 'announcements' && (
          <div className="announcements-section">
            <div className="section-header">
              <h2>📣 Class Announcements</h2>
              <button className="btn-primary" onClick={() => setShowAnnouncementForm(!showAnnouncementForm)}>+ Create Announcement</button>
            </div>
            {showAnnouncementForm && (
              <form className="form-card">
                <div className="form-group">
                  <label>Title</label>
                  <input type="text" placeholder="Announcement title" required />
                </div>
                <div className="form-group">
                  <label>Message</label>
                  <textarea placeholder="Write your announcement..." rows="6" required></textarea>
                </div>
                <div className="form-group">
                  <label>Priority</label>
                  <select>
                    <option>Normal</option>
                    <option>Urgent</option>
                    <option>Important</option>
                  </select>
                </div>
                <button type="submit" className="btn-primary">Post Announcement</button>
              </form>
            )}
            <div className="info-box">
              <p>📌 Announcements will be sent to all students via email and displayed on their dashboard.</p>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="analytics-section">
            <h2>📈 Performance Analytics</h2>
            <div className="analytics-grid">
              <div className="chart-container">
                <h3>Class Grade Distribution</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={[
                      { name: 'A (90+)', value: 15 },
                      { name: 'B (80-89)', value: 25 },
                      { name: 'C (70-79)', value: 35 },
                      { name: 'D (60-69)', value: 20 },
                      { name: 'F (< 60)', value: 5 }
                    ]} cx="50%" cy="50%" labelLine={false} label>
                      <Cell fill="#8884d8" />
                      <Cell fill="#82ca9d" />
                      <Cell fill="#ffc658" />
                      <Cell fill="#ff7c7c" />
                      <Cell fill="#ff4444" />
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              
              <div className="analytics-stats">
                <div className="analytics-card">
                  <h4>Average Score</h4>
                  <p className="big-number">72.5%</p>
                </div>
                <div className="analytics-card">
                  <h4>Average Attendance</h4>
                  <p className="big-number">85%</p>
                </div>
                <div className="analytics-card">
                  <h4>Assignment Completion Rate</h4>
                  <p className="big-number">92%</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Leave Requests Tab */}
        {activeTab === 'leave-requests' && (
          <div className="leave-requests-section">
            <h2>✋ Student Leave Requests</h2>
            <div className="requests-list">
              {leaveRequests.length === 0 ? (
                <div className="info-box">No pending leave requests</div>
              ) : leaveRequests.map(request => (
                <div key={request._id} className="request-item card">
                  <div className="request-header">
                    <h4>{request.student?.name}</h4>
                    <span className={`badge badge-${request.status}`}>{request.status}</span>
                  </div>
                  <p><strong>Student ID:</strong> {request.student?.studentId}</p>
                  <p><strong>Duration:</strong> {new Date(request.startDate).toLocaleDateString()} to {new Date(request.endDate).toLocaleDateString()}</p>
                  <p><strong>Reason:</strong> {request.reason}</p>
                  {request.status === 'pending' && (
                    <div className="request-actions">
                      <button className="btn-success" onClick={() => handleApproveLeave(request._id, 'approved')}>✓ Approve</button>
                      <button className="btn-danger" onClick={() => handleApproveLeave(request._id, 'rejected')}>✕ Reject</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedTeacherDashboard;
