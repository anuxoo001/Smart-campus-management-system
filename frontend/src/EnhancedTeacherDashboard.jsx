import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import api from './services/api';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './EnhancedTeacherDashboard.css';

const TABS = [
  { key: 'overview', label: '📊 Overview' },
  { key: 'attendance', label: '✓ Attendance' },
  { key: 'marks', label: '📝 Marks' },
  { key: 'schedule', label: '📅 Schedule' },
  { key: 'materials', label: '📚 Materials' },
  { key: 'exams', label: '🧪 Exams' },
  { key: 'roster', label: '👥 Roster' },
  { key: 'forum', label: '💬 Forum' },
  { key: 'announcements', label: '📣 Announcements' },
  { key: 'analytics', label: '📈 Analytics' },
  { key: 'leave-requests', label: '✋ Leave Requests' },
];

const PIE_COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#ff4444'];

const EnhancedTeacherDashboard = ({ initialTab = 'overview' }) => {
  const user = useSelector((state) => state.auth.user);
  const [activeTab, setActiveTab] = useState(initialTab);
  const [loading, setLoading] = useState(false);

  // Dashboard state
  const [dashboardData, setDashboardData] = useState(null);
  const [schedule, setSchedule] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [exams, setExams] = useState([]);
  const [forumPosts, setForumPosts] = useState([]);
  const [roster, setRoster] = useState([]);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [analyticsData, setAnalyticsData] = useState(null);

  // Form states
  const [showAttendanceForm, setShowAttendanceForm] = useState(false);
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [showMaterialForm, setShowMaterialForm] = useState(false);
  const [showExamForm, setShowExamForm] = useState(false);
  const [showForumPost, setShowForumPost] = useState(false);
  const [showMarksForm, setShowMarksForm] = useState(false);
  const [showAnnouncementForm, setShowAnnouncementForm] = useState(false);

  // Selected subject for forms / lists
  const [selectedSubject, setSelectedSubject] = useState('');

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  const fetchAllData = useCallback(async () => {
    setLoading(true);
    try {
      if (activeTab === 'overview') {
        const res = await api.get(`/faculty/dashboard/overview`);
        setDashboardData(res.data);
      } else if (activeTab === 'schedule') {
        const fac = await getFacultyId();
        if (fac) {
          const res = await api.get(`/schedule/faculty/${fac}`);
          setSchedule(res.data || []);
        }
      } else if (activeTab === 'materials') {
        const fac = await getFacultyId();
        if (fac) {
          const res = await api.get(`/materials/faculty/${fac}`);
          setMaterials(res.data || []);
        }
      } else if (activeTab === 'exams') {
        const fac = await getFacultyId();
        if (fac) {
          const res = await api.get(`/exams/faculty/${fac}`);
          setExams(res.data || []);
        }
      } else if (activeTab === 'leave-requests') {
        const fac = await getFacultyId();
        if (fac) {
          const res = await api.get(`/faculty/${fac}/leave-requests`);
          setLeaveRequests(res.data || []);
        }
      } else if (activeTab === 'analytics') {
        const fac = await getFacultyId();
        if (fac) {
          const res = await api.get(`/faculty/${fac}/class-analytics/${selectedSubject}`);
          setAnalyticsData(res.data);
        }
      } else if (activeTab === 'forum') {
        if (selectedSubject) {
          const res = await api.get(`/forum/subject/${selectedSubject}`);
          setForumPosts(res.data || []);
        }
      } else if (activeTab === 'roster') {
        if (selectedSubject) {
          const res = await api.get(`/faculty/subjects/${selectedSubject}/students`);
          setRoster(res.data || []);
        }
      }
    } catch (error) {
      console.error(`Error fetching ${activeTab} data:`, error);
    } finally {
      setLoading(false);
    }
  }, [activeTab, selectedSubject]);

  const getFacultyId = async () => {
    if (dashboardData?.faculty?.id) return dashboardData.faculty.id;
    try {
      const res = await api.get('/faculty/dashboard/overview');
      setDashboardData(res.data);
      return res.data?.faculty?.id;
    } catch (error) {
      console.error('Error fetching faculty id:', error);
      return null;
    }
  };

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const subjects = dashboardData?.subjectList || [];

  const loadSubjectStudents = async (subjectId) => {
    if (!subjectId) return;
    setSelectedSubject(subjectId);
    try {
      const res = await api.get(`/faculty/subjects/${subjectId}/students`);
      setRoster(res.data || []);
    } catch (error) {
      console.error('Error loading students:', error);
    }
  };

  const handleAttendanceSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    const subjectId = form.subject.value;
    const date = form.date.value;
    try {
      for (const record of roster) {
        const status = form[`status_${record._id}`]?.value || 'present';
        await api.post('/attendance', {
          student: record._id,
          subject: subjectId,
          date,
          status,
          semester: record.semester || 6,
        });
      }
      setShowAttendanceForm(false);
      alert('Attendance saved successfully');
      fetchAllData();
    } catch (error) {
      console.error('Error saving attendance:', error);
      alert('Failed to save attendance');
    }
  };

  const handleMarksSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    const subjectId = form.subject.value;
    const examType = form.examType.value;
    try {
      for (const record of roster) {
        const marksValue = form[`marks_${record._id}`]?.value;
        if (marksValue === '' || marksValue === undefined) continue;
        await api.post('/marks', {
          student: record._id,
          subject: subjectId,
          examType,
          marks: Number(marksValue),
          outOf: Number(form[`outof_${record._id}`]?.value || 100),
          semester: record.semester || 6,
        });
      }
      setShowMarksForm(false);
      alert('Marks saved successfully');
      fetchAllData();
    } catch (error) {
      console.error('Error saving marks:', error);
      alert('Failed to save marks');
    }
  };

  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    try {
      const fac = await getFacultyId();
      await api.post('/schedule', {
        faculty: fac,
        subject: form.subject.value,
        class: form.className.value,
        dayOfWeek: form.day.value,
        startTime: form.startTime.value,
        endTime: form.endTime.value,
        room: form.room.value,
      });
      setShowScheduleForm(false);
      alert('Schedule added successfully');
      fetchAllData();
    } catch (error) {
      console.error('Error adding schedule:', error);
      alert('Failed to add schedule');
    }
  };

  const handleMaterialSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    try {
      const fac = await getFacultyId();
      await api.post('/materials', {
        faculty: fac,
        subject: form.subject.value,
        title: form.title.value,
        description: form.description.value,
        type: form.type.value,
        category: form.category.value,
        fileUrl: form.fileUrl.value,
      });
      setShowMaterialForm(false);
      alert('Material uploaded successfully');
      fetchAllData();
    } catch (error) {
      console.error('Error uploading material:', error);
      alert('Failed to upload material');
    }
  };

  const handleExamSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    try {
      const fac = await getFacultyId();
      await api.post('/exams', {
        faculty: fac,
        subject: form.subject.value,
        title: form.title.value,
        examDate: form.examDate.value,
        startTime: form.startTime.value,
        endTime: form.endTime.value,
        duration: Number(form.duration.value || 60),
        totalMarks: Number(form.totalMarks.value),
        examType: form.examType.value,
        room: form.room.value,
        semester: 6,
      });
      setShowExamForm(false);
      alert('Exam scheduled successfully');
      fetchAllData();
    } catch (error) {
      console.error('Error creating exam:', error);
      alert('Failed to create exam');
    }
  };

  const handleForumPost = async (e) => {
    e.preventDefault();
    const form = e.target;
    try {
      await api.post('/forum', {
        subject: selectedSubject,
        author: user?._id || user?.id,
        title: form.title.value,
        content: form.content.value,
        category: form.category.value,
        isAnnouncement: form.isAnnouncement?.checked || false,
      });
      setShowForumPost(false);
      alert('Post created successfully');
      fetchAllData();
    } catch (error) {
      console.error('Error creating post:', error);
      alert('Failed to create post');
    }
  };

  const handleAnnouncementSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    try {
      await api.post('/notices', {
        title: form.title.value,
        description: form.message.value,
        category: form.priority.value,
        author: user?._id || user?.id,
      });
      setShowAnnouncementForm(false);
      alert('Announcement posted successfully');
      fetchAllData();
    } catch (error) {
      console.error('Error posting announcement:', error);
      alert('Failed to post announcement');
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

  const renderSubjectSelect = (name, required = true, onChange) => (
    <select name={name} required={required} onChange={onChange}>
      <option value="">Select Subject</option>
      {subjects.map((subject) => (
        <option key={subject.id} value={subject.id}>{subject.name} ({subject.code})</option>
      ))}
    </select>
  );

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
        {TABS.map((tab) => (
          <button
            key={tab.key}
            className={`tab-btn ${activeTab === tab.key ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
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
                <p className="stat-number">{dashboardData.assignments || 0}</p>
              </div>
              <div className="stat-card">
                <div className="stat-icon">⏳</div>
                <h3>Pending Submissions</h3>
                <p className="stat-number">{dashboardData.pendingSubmissions || 0}</p>
              </div>
              <div className="stat-card">
                <div className="stat-icon">👨‍🎓</div>
                <h3>Students</h3>
                <p className="stat-number">{dashboardData.students || 0}</p>
              </div>
              <div className="stat-card">
                <div className="stat-icon">📖</div>
                <h3>Subjects</h3>
                <p className="stat-number">{dashboardData.subjects || 0}</p>
              </div>
              <div className="stat-card">
                <div className="stat-icon">📅</div>
                <h3>Classes Today</h3>
                <p className="stat-number">{dashboardData.todaysSchedules || 0}</p>
              </div>
            </div>

            <div className="overview-subjects">
              <h3>Your Subjects</h3>
              <div className="subject-pills">
                {subjects.length === 0 ? (
                  <p>No subjects assigned yet.</p>
                ) : subjects.map((subject) => (
                  <button
                    key={subject.id}
                    className="subject-pill"
                    onClick={() => { setSelectedSubject(subject.id); setActiveTab('roster'); }}
                  >
                    {subject.name} <small>{subject.code} • Sem {subject.semester}</small>
                  </button>
                ))}
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
              <form className="form-card" onSubmit={handleAttendanceSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <label>Date</label>
                    <input type="date" name="date" required />
                  </div>
                  <div className="form-group">
                    <label>Subject</label>
                    {renderSubjectSelect('subject', true, (e) => loadSubjectStudents(e.target.value))}
                  </div>
                </div>
                {roster.length > 0 ? (
                  <div className="attendance-grid">
                    {roster.map((student) => (
                      <div className="student-attendance" key={student._id}>
                        <span>{student.user?.name || student.studentId}</span>
                        <select name={`status_${student._id}`} defaultValue="present">
                          <option value="present">Present</option>
                          <option value="absent">Absent</option>
                          <option value="late">Late</option>
                        </select>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="info-box">Select a subject to load the class roster.</div>
                )}
                <div className="form-actions">
                  <button type="submit" className="btn-primary" disabled={roster.length === 0}>Submit Attendance</button>
                  <button type="button" className="btn-secondary" onClick={() => setShowAttendanceForm(false)}>Cancel</button>
                </div>
              </form>
            )}
            {!showAttendanceForm && (
              <div className="info-box">
                <p>📌 Attendance records are marked per class using the form above. Select a subject and date to take attendance for all enrolled students.</p>
              </div>
            )}
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
              <form className="form-card" onSubmit={handleMarksSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <label>Subject</label>
                    {renderSubjectSelect('subject', true, (e) => loadSubjectStudents(e.target.value))}
                  </div>
                  <div className="form-group">
                    <label>Exam Type</label>
                    <select name="examType" required>
                      <option value="internal">Internal</option>
                      <option value="midterm">Midterm</option>
                      <option value="final">Final</option>
                      <option value="assignment">Assignment</option>
                    </select>
                  </div>
                </div>
                {roster.length > 0 ? (
                  <table className="marks-entry-table">
                    <thead>
                      <tr><th>Student ID</th><th>Name</th><th>Marks</th><th>Out of</th></tr>
                    </thead>
                    <tbody>
                      {roster.map((student) => (
                        <tr key={student._id}>
                          <td>{student.studentId}</td>
                          <td>{student.user?.name || student.studentId}</td>
                          <td><input type="number" name={`marks_${student._id}`} min="0" max="100" /></td>
                          <td><input type="number" name={`outof_${student._id}`} defaultValue="100" min="1" /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="info-box">Select a subject to load the class roster.</div>
                )}
                <button type="submit" className="btn-primary" disabled={roster.length === 0}>Save Marks</button>
              </form>
            )}
            {!showMarksForm && (
              <div className="info-box">
                <p>📌 Enter marks per subject and exam type. Select a subject to load enrolled students.</p>
              </div>
            )}
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
              <form className="form-card" onSubmit={handleScheduleSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <label>Subject</label>
                    {renderSubjectSelect('subject')}
                  </div>
                  <div className="form-group">
                    <label>Class</label>
                    <input type="text" name="className" placeholder="B.Tech CSE - Semester 6" required />
                  </div>
                  <div className="form-group">
                    <label>Day</label>
                    <select name="day" required>
                      <option value="">Select Day</option>
                      <option>Monday</option><option>Tuesday</option><option>Wednesday</option>
                      <option>Thursday</option><option>Friday</option><option>Saturday</option>
                    </select>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Start Time</label>
                    <input type="time" name="startTime" required />
                  </div>
                  <div className="form-group">
                    <label>End Time</label>
                    <input type="time" name="endTime" required />
                  </div>
                  <div className="form-group">
                    <label>Room</label>
                    <input type="text" name="room" placeholder="Room Number" />
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
              <form className="form-card" onSubmit={handleMaterialSubmit}>
                <div className="form-group">
                  <label>Title</label>
                  <input type="text" name="title" placeholder="Material Title" required />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea name="description" placeholder="Brief description"></textarea>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Subject</label>
                    {renderSubjectSelect('subject')}
                  </div>
                  <div className="form-group">
                    <label>Type</label>
                    <select name="type" required>
                      <option value="PDF">PDF</option>
                      <option value="Video">Video</option>
                      <option value="Document">Document</option>
                      <option value="Link">Link</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Category</label>
                    <input type="text" name="category" placeholder="e.g., Chapter 1" />
                  </div>
                </div>
                <div className="form-group">
                  <label>File URL</label>
                  <input type="url" name="fileUrl" placeholder="https://..." required />
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
                  <small>Subject: {item.subject?.name} | Category: {item.category} | Downloads: {item.downloads}</small>
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
              <form className="form-card" onSubmit={handleExamSubmit}>
                <div className="form-group">
                  <label>Exam Title</label>
                  <input type="text" name="title" placeholder="e.g., Unit Test 1" required />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Subject</label>
                    {renderSubjectSelect('subject')}
                  </div>
                  <div className="form-group">
                    <label>Exam Date</label>
                    <input type="date" name="examDate" required />
                  </div>
                  <div className="form-group">
                    <label>Exam Type</label>
                    <select name="examType" required>
                      <option value="Unit Test">Unit Test</option>
                      <option value="Midterm">Midterm</option>
                      <option value="Final">Final</option>
                      <option value="Quiz">Quiz</option>
                    </select>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Start Time</label>
                    <input type="time" name="startTime" required />
                  </div>
                  <div className="form-group">
                    <label>End Time</label>
                    <input type="time" name="endTime" required />
                  </div>
                  <div className="form-group">
                    <label>Total Marks</label>
                    <input type="number" name="totalMarks" placeholder="100" required />
                  </div>
                  <div className="form-group">
                    <label>Duration (min)</label>
                    <input type="number" name="duration" placeholder="60" required />
                  </div>
                  <div className="form-group">
                    <label>Room</label>
                    <input type="text" name="room" placeholder="Room Number" />
                  </div>
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
                  <p>Subject: {item.subject?.name} | Date: {new Date(item.examDate).toLocaleDateString()} | Time: {item.startTime} - {item.endTime}</p>
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
              <div className="form-group">
                {renderSubjectSelect('subject-select', true, (e) => loadSubjectStudents(e.target.value))}
              </div>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Student ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Semester</th>
                  <th>CGPA</th>
                </tr>
              </thead>
              <tbody>
                {roster.length === 0 ? (
                  <tr><td colSpan="5" className="text-center">Select a subject to view the roster</td></tr>
                ) : roster.map(student => (
                  <tr key={student._id}>
                    <td>{student.studentId}</td>
                    <td><strong>{student.user?.name || student.studentId}</strong></td>
                    <td>{student.user?.email}</td>
                    <td>{student.semester}</td>
                    <td>{student.cgpa}</td>
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
              <div className="form-group">
                {renderSubjectSelect('subject-select', true, (e) => setSelectedSubject(e.target.value))}
              </div>
              <button className="btn-primary" onClick={() => setShowForumPost(!showForumPost)} disabled={!selectedSubject}>+ Create Post</button>
            </div>
            {showForumPost && (
              <form className="form-card" onSubmit={handleForumPost}>
                <div className="form-group">
                  <label>Title</label>
                  <input type="text" name="title" placeholder="Post title" required />
                </div>
                <div className="form-group">
                  <label>Content</label>
                  <textarea name="content" placeholder="Write your message..." rows="6" required></textarea>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Category</label>
                    <select name="category" required>
                      <option value="Discussion">Discussion</option>
                      <option value="Question">Question</option>
                      <option value="Announcement">Announcement</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="checkbox">
                      <input type="checkbox" name="isAnnouncement" /> Pin this post
                    </label>
                  </div>
                </div>
                <button type="submit" className="btn-primary">Post</button>
              </form>
            )}
            <div className="forum-posts">
              {!selectedSubject ? (
                <div className="info-box">Select a subject to view its forum.</div>
              ) : forumPosts.length === 0 ? (
                <div className="info-box">No forum posts yet. Create one to start discussions!</div>
              ) : forumPosts.map(post => (
                <div key={post._id} className="forum-post">
                  <div className="post-header">
                    <h4>{post.title}</h4>
                    <span className="post-category">{post.category}</span>
                  </div>
                  <p>{post.content.length > 200 ? `${post.content.substring(0, 200)}...` : post.content}</p>
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
              <form className="form-card" onSubmit={handleAnnouncementSubmit}>
                <div className="form-group">
                  <label>Title</label>
                  <input type="text" name="title" placeholder="Announcement title" required />
                </div>
                <div className="form-group">
                  <label>Message</label>
                  <textarea name="message" placeholder="Write your announcement..." rows="6" required></textarea>
                </div>
                <div className="form-group">
                  <label>Category</label>
                  <select name="priority">
                    <option value="General">General</option>
                    <option value="Academic">Academic</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>
                <button type="submit" className="btn-primary">Post Announcement</button>
              </form>
            )}
            <div className="info-box">
              <p>📌 Announcements are posted to the campus notice board and shown on student dashboards.</p>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="analytics-section">
            <h2>📈 Performance Analytics</h2>
            <div className="form-group">
              {renderSubjectSelect('subject-select', true, async (e) => {
                const subjectId = e.target.value;
                setSelectedSubject(subjectId);
                const fac = await getFacultyId();
                if (fac && subjectId) {
                  const res = await api.get(`/faculty/${fac}/class-analytics/${subjectId}`);
                  setAnalyticsData(res.data);
                }
              })}
            </div>
            {analyticsData ? (
              <div className="analytics-grid">
                <div className="chart-container">
                  <h3>Class Grade Distribution ({analyticsData.subject})</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie data={Object.entries(analyticsData.marks?.distribution || {}).map(([name, value]) => ({ name, value }))} cx="50%" cy="50%" labelLine={false} label>
                        {Object.entries(analyticsData.marks?.distribution || {}).map(([name], index) => (
                          <Cell key={name} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="analytics-stats">
                  <div className="analytics-card">
                    <h4>Average Score</h4>
                    <p className="big-number">{analyticsData.marks?.average || 0}%</p>
                  </div>
                  <div className="analytics-card">
                    <h4>Average Attendance</h4>
                    <p className="big-number">{analyticsData.attendance?.average || 0}%</p>
                  </div>
                  <div className="analytics-card">
                    <h4>Total Students</h4>
                    <p className="big-number">{analyticsData.totalStudents || 0}</p>
                  </div>
                  <div className="analytics-card">
                    <h4>Attendance Records</h4>
                    <p className="big-number">{analyticsData.attendance?.total || 0}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="info-box">Select a subject to view class performance analytics.</div>
            )}
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
                    <h4>{request.student?.user?.name || request.student?.name || 'Student'}</h4>
                    <span className={`badge badge-${request.status}`}>{request.status}</span>
                  </div>
                  <p><strong>Student ID:</strong> {request.student?.studentId}</p>
                  <p><strong>Duration:</strong> {new Date(request.fromDate).toLocaleDateString()} to {new Date(request.toDate).toLocaleDateString()}</p>
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
