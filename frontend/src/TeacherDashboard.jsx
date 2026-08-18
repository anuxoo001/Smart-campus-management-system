import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import api from './services/api';

const blankQuestion = () => ({
  question: '',
  options: ['', '', '', ''],
  correctAnswer: '',
  explanation: '',
});

const defaultQuizForm = {
  title: '',
  description: '',
  subject: 'General',
  durationMinutes: 15,
  status: 'published',
  questions: [blankQuestion()],
};

export default function TeacherDashboard() {
  const user = useSelector((state) => state.auth.user);
  const [activeTab, setActiveTab] = useState('overview'); // overview, assignments, quizzes
  const [stats, setStats] = useState(null);
  const [quizStats, setQuizStats] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [quizSubmissions, setQuizSubmissions] = useState({});
  const [students, setStudents] = useState([]);
  const [showCreateAssignmentForm, setShowCreateAssignmentForm] = useState(false);
  const [showCreateQuizForm, setShowCreateQuizForm] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState(null);
  const [showQuizSubmissions, setShowQuizSubmissions] = useState(null);
  const [loading, setLoading] = useState(false);

  const [assignmentFormData, setAssignmentFormData] = useState({
    title: '',
    description: '',
    subject: '',
    deadline: '',
    priority: 'medium',
    totalPoints: 100,
    instructions: '',
  });

  const [quizFormData, setQuizFormData] = useState(defaultQuizForm);

  useEffect(() => {
    fetchTeacherData();
    fetchStudentsForAssignment();
  }, []);

  const fetchTeacherData = async () => {
    try {
      const [statsRes, assignmentsRes, quizzesRes, quizStatsRes] = await Promise.all([
        api.get('/assignments/teacher/stats'),
        api.get('/assignments/teacher/assignments'),
        api.get('/quizzes/teacher/quizzes'),
        api.get('/quizzes/teacher/stats'),
      ]);
      setStats(statsRes.data);
      setAssignments(assignmentsRes.data || []);
      setQuizzes(quizzesRes.data || []);
      setQuizStats(quizStatsRes.data);
    } catch (error) {
      console.error('Error fetching teacher data:', error);
    }
  };

  const fetchStudentsForAssignment = async () => {
    try {
      const response = await api.get('/quizzes/teacher/students/assignment');
      setStudents(response.data || []);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  // ============ ASSIGNMENT HANDLERS ============
  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/assignments', {
        ...assignmentFormData,
        faculty: user.id,
        status: 'published',
        assignedTo: [],
      });
      setAssignments([response.data, ...assignments]);
      setAssignmentFormData({
        title: '',
        description: '',
        subject: '',
        deadline: '',
        priority: 'medium',
        totalPoints: 100,
        instructions: '',
      });
      setShowCreateAssignmentForm(false);
      fetchTeacherData();
    } catch (error) {
      console.error('Error creating assignment:', error);
      alert(error.response?.data?.message || 'Failed to create assignment');
    }
  };

  const handleDeleteAssignment = async (id) => {
    if (window.confirm('Are you sure you want to delete this assignment?')) {
      try {
        await api.delete(`/assignments/${id}`);
        setAssignments(assignments.filter((a) => a._id !== id));
        fetchTeacherData();
      } catch (error) {
        console.error('Error deleting assignment:', error);
        alert('Failed to delete assignment');
      }
    }
  };

  const handleCloseAssignment = async (id) => {
    try {
      const response = await api.put(`/assignments/${id}/close`, {});
      setAssignments(assignments.map((a) => (a._id === id ? response.data : a)));
      fetchTeacherData();
    } catch (error) {
      console.error('Error closing assignment:', error);
      alert('Failed to close assignment');
    }
  };

  // ============ QUIZ HANDLERS ============
  const handleCreateQuiz = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Validate quiz form
    if (!quizFormData.title.trim()) {
      alert('Please enter a quiz title');
      setLoading(false);
      return;
    }

    // Validate questions
    for (let i = 0; i < quizFormData.questions.length; i++) {
      const q = quizFormData.questions[i];
      const validOptions = q.options.filter(Boolean);

      if (!q.question.trim()) {
        alert(`Question ${i + 1} needs a question text`);
        setLoading(false);
        return;
      }

      if (validOptions.length < 2) {
        alert(`Question ${i + 1} needs at least 2 options`);
        setLoading(false);
        return;
      }

      if (!q.correctAnswer.trim()) {
        alert(`Question ${i + 1} needs a correct answer selected`);
        setLoading(false);
        return;
      }

      if (!validOptions.includes(q.correctAnswer)) {
        alert(`Question ${i + 1}: Correct answer must match one of the options`);
        setLoading(false);
        return;
      }
    }

    try {
      const payload = {
        ...quizFormData,
        questions: quizFormData.questions.map((q) => ({
          ...q,
          options: q.options.filter(Boolean),
        })),
      };

      let response;
      if (editingQuiz) {
        response = await api.put(`/quizzes/teacher/${editingQuiz._id}`, payload);
        setQuizzes(quizzes.map((q) => (q._id === editingQuiz._id ? response.data : q)));
      } else {
        response = await api.post('/quizzes', payload);
        setQuizzes([response.data, ...quizzes]);
      }

      setQuizFormData(defaultQuizForm);
      setEditingQuiz(null);
      setShowCreateQuizForm(false);
      alert(editingQuiz ? 'Quiz updated successfully!' : 'Quiz created successfully!');
      fetchTeacherData();
    } catch (error) {
      console.error('Error creating quiz:', error);
      alert(error.response?.data?.message || 'Failed to create quiz');
    } finally {
      setLoading(false);
    }
  };

  const handleEditQuiz = (quiz) => {
    setEditingQuiz(quiz);
    setQuizFormData({
      title: quiz.title,
      description: quiz.description,
      subject: quiz.subject,
      durationMinutes: quiz.durationMinutes,
      status: quiz.status,
      questions: quiz.questions,
    });
    setShowCreateQuizForm(true);
  };

  const handleDeleteQuiz = async (id) => {
    if (window.confirm('Are you sure you want to delete this quiz? This will also delete all submissions.')) {
      try {
        await api.delete(`/quizzes/teacher/${id}`);
        setQuizzes(quizzes.filter((q) => q._id !== id));
        fetchTeacherData();
      } catch (error) {
        console.error('Error deleting quiz:', error);
        alert('Failed to delete quiz');
      }
    }
  };

  const handleToggleQuizStatus = async (quizId, newStatus) => {
    try {
      const response = await api.put(`/quizzes/teacher/${quizId}/status`, { status: newStatus });
      setQuizzes(quizzes.map((q) => (q._id === quizId ? response.data : q)));
      fetchTeacherData();
    } catch (error) {
      console.error('Error updating quiz status:', error);
      alert('Failed to update quiz status');
    }
  };

  const fetchQuizSubmissions = async (quizId) => {
    try {
      const response = await api.get(`/quizzes/${quizId}/submissions`);
      setQuizSubmissions((prev) => ({
        ...prev,
        [quizId]: response.data,
      }));
      setShowQuizSubmissions(quizId);
    } catch (error) {
      console.error('Error fetching submissions:', error);
      alert('Failed to fetch submissions');
    }
  };

  // ============ QUIZ FORM HANDLERS ============
  const updateQuestion = (index, field, value) => {
    setQuizFormData((prev) => {
      const questions = [...prev.questions];
      questions[index] = { ...questions[index], [field]: value };
      return { ...prev, questions };
    });
  };

  const updateOption = (questionIndex, optionIndex, value) => {
    setQuizFormData((prev) => {
      const questions = [...prev.questions];
      const options = [...questions[questionIndex].options];
      options[optionIndex] = value;
      questions[questionIndex] = { ...questions[questionIndex], options };
      return { ...prev, questions };
    });
  };

  const addQuestion = () => {
    setQuizFormData((prev) => ({
      ...prev,
      questions: [...prev.questions, blankQuestion()],
    }));
  };

  const removeQuestion = (index) => {
    setQuizFormData((prev) => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index),
    }));
  };

  if (!stats) {
    return <div className="loading">Loading teacher dashboard...</div>;
  }

  return (
    <div className="page-panel">
      {/* TAB NAVIGATION */}
      <div className="topbar">
        <div>
          <h1>Teacher Dashboard</h1>
          <p className="eyebrow">Manage assignments and quizzes</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            className={`btn ${activeTab === 'overview' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('overview')}
          >
            📊 Overview
          </button>
          <button
            className={`btn ${activeTab === 'assignments' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('assignments')}
          >
            📋 Assignments
          </button>
          <button
            className={`btn ${activeTab === 'quizzes' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('quizzes')}
          >
            ✓ Quizzes
          </button>
        </div>
      </div>

      {/* OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <>
          <div className="stat-grid">
            <div className="card stat-card">
              <div className="stat-icon">📋</div>
              <p>Total Tasks</p>
              <h3>{stats.totalAssignments || 0}</h3>
            </div>
            <div className="card stat-card">
              <div className="stat-icon">✓</div>
              <p>Published Tasks</p>
              <h3>{stats.publishedAssignments || 0}</h3>
            </div>
            <div className="card stat-card">
              <div className="stat-icon">📝</div>
              <p>Pending Submissions</p>
              <h3>{stats.pendingSubmissions || 0}</h3>
            </div>
            <div className="card stat-card">
              <div className="stat-icon">👥</div>
              <p>Students Assigned</p>
              <h3>{stats.totalStudentsAssigned || 0}</h3>
            </div>

            <div className="card stat-card">
              <div className="stat-icon">✏️</div>
              <p>Total Quizzes</p>
              <h3>{quizStats?.totalQuizzes || 0}</h3>
            </div>
            <div className="card stat-card">
              <div className="stat-icon">🎯</div>
              <p>Published Quizzes</p>
              <h3>{quizStats?.publishedQuizzes || 0}</h3>
            </div>
            <div className="card stat-card">
              <div className="stat-icon">📊</div>
              <p>Quiz Submissions</p>
              <h3>{quizStats?.totalSubmissions || 0}</h3>
            </div>
            <div className="card stat-card">
              <div className="stat-icon">📌</div>
              <p>Draft Quizzes</p>
              <h3>{quizStats?.draftQuizzes || 0}</h3>
            </div>
          </div>
        </>
      )}

      {/* ASSIGNMENTS TAB */}
      {activeTab === 'assignments' && (
        <>
          <div style={{ marginBottom: '20px' }}>
            <button
              className="btn btn-primary"
              onClick={() => setShowCreateAssignmentForm(!showCreateAssignmentForm)}
            >
              {showCreateAssignmentForm ? 'Cancel' : '+ Create New Task'}
            </button>
          </div>

          {showCreateAssignmentForm && (
            <div className="card create-form-card">
              <h3>Create New Task</h3>
              <form onSubmit={handleCreateAssignment}>
                <div className="form-row">
                  <div className="form-group">
                    <label>Task Title</label>
                    <input
                      type="text"
                      placeholder="E.g., Database Design Project"
                      value={assignmentFormData.title}
                      onChange={(e) =>
                        setAssignmentFormData({ ...assignmentFormData, title: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Priority</label>
                    <select
                      value={assignmentFormData.priority}
                      onChange={(e) =>
                        setAssignmentFormData({ ...assignmentFormData, priority: e.target.value })
                      }
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    placeholder="Task details and requirements..."
                    value={assignmentFormData.description}
                    onChange={(e) =>
                      setAssignmentFormData({ ...assignmentFormData, description: e.target.value })
                    }
                    rows="3"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Instructions</label>
                  <textarea
                    placeholder="Step-by-step instructions..."
                    value={assignmentFormData.instructions}
                    onChange={(e) =>
                      setAssignmentFormData({ ...assignmentFormData, instructions: e.target.value })
                    }
                    rows="2"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Deadline</label>
                    <input
                      type="datetime-local"
                      value={assignmentFormData.deadline}
                      onChange={(e) =>
                        setAssignmentFormData({ ...assignmentFormData, deadline: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Total Points</label>
                    <input
                      type="number"
                      min="10"
                      max="200"
                      value={assignmentFormData.totalPoints}
                      onChange={(e) =>
                        setAssignmentFormData({
                          ...assignmentFormData,
                          totalPoints: Number(e.target.value),
                        })
                      }
                    />
                  </div>
                </div>

                <button type="submit" className="btn btn-primary">
                  Create Task
                </button>
              </form>
            </div>
          )}

          <div className="content-grid">
            <div className="card">
              <div className="section-head">
                <h3>Your Created Tasks</h3>
                <span>{assignments.length} tasks</span>
              </div>

              {assignments.length === 0 ? (
                <p className="empty-message">No tasks created yet. Create your first task!</p>
              ) : (
                <div className="task-list">
                  {assignments.map((assignment) => (
                    <article key={assignment._id} className="card task-card">
                      <div className="task-header">
                        <div>
                          <h4>{assignment.title}</h4>
                          <p className="task-meta">
                            <span className={`badge badge-${assignment.priority}`}>
                              {assignment.priority}
                            </span>
                            <span className={`badge badge-${assignment.status}`}>
                              {assignment.status}
                            </span>
                          </p>
                        </div>
                        <div className="task-actions">
                          {assignment.status === 'published' && (
                            <button
                              type="button"
                              className="btn-icon"
                              onClick={() => handleCloseAssignment(assignment._id)}
                              title="Close assignment"
                            >
                              ✕
                            </button>
                          )}
                          <button
                            type="button"
                            className="btn-icon delete"
                            onClick={() => handleDeleteAssignment(assignment._id)}
                            title="Delete assignment"
                          >
                            🗑
                          </button>
                        </div>
                      </div>
                      <p>{assignment.description}</p>
                      <div className="task-footer">
                        <span>📅 {new Date(assignment.deadline).toLocaleDateString()}</span>
                        <span>👥 {assignment.assignedTo?.length || 0} students</span>
                        <span>⭐ {assignment.totalPoints} points</span>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* QUIZZES TAB */}
      {activeTab === 'quizzes' && (
        <>
          <div style={{ marginBottom: '20px' }}>
            <button
              className="btn btn-primary"
              onClick={() => {
                setShowCreateQuizForm(!showCreateQuizForm);
                setEditingQuiz(null);
                setQuizFormData(defaultQuizForm);
              }}
            >
              {showCreateQuizForm ? 'Cancel' : '+ Create New Quiz'}
            </button>
          </div>

          {showCreateQuizForm && (
            <div className="card create-form-card">
              <h3>{editingQuiz ? 'Edit Quiz' : 'Create New Quiz'}</h3>
              <form onSubmit={handleCreateQuiz}>
                <div className="form-row">
                  <div className="form-group">
                    <label>Quiz Title</label>
                    <input
                      type="text"
                      value={quizFormData.title}
                      onChange={(e) => setQuizFormData({ ...quizFormData, title: e.target.value })}
                      placeholder="Weekly Assessment"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Subject</label>
                    <input
                      type="text"
                      value={quizFormData.subject}
                      onChange={(e) => setQuizFormData({ ...quizFormData, subject: e.target.value })}
                      placeholder="Data Structures"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    rows="2"
                    value={quizFormData.description}
                    onChange={(e) =>
                      setQuizFormData({ ...quizFormData, description: e.target.value })
                    }
                    placeholder="Assessment description"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Duration (minutes)</label>
                    <input
                      type="number"
                      min="5"
                      value={quizFormData.durationMinutes}
                      onChange={(e) =>
                        setQuizFormData({
                          ...quizFormData,
                          durationMinutes: Number(e.target.value) || 15,
                        })
                      }
                    />
                  </div>
                  <div className="form-group">
                    <label>Status</label>
                    <select
                      value={quizFormData.status}
                      onChange={(e) => setQuizFormData({ ...quizFormData, status: e.target.value })}
                    >
                      <option value="published">Published</option>
                      <option value="draft">Draft</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Assign to Students (ERP-Based)</label>
                  <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid #ddd', borderRadius: '4px', padding: '10px' }}>
                    {students.length === 0 ? (
                      <p style={{ color: '#999' }}>No students available in your department</p>
                    ) : (
                      students.map((student) => (
                        <div key={student._id} style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <input
                            type="checkbox"
                            id={`student-${student._id}`}
                            checked={quizFormData.assignedTo?.includes(student._id) || false}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setQuizFormData({
                                  ...quizFormData,
                                  assignedTo: [...(quizFormData.assignedTo || []), student._id],
                                });
                              } else {
                                setQuizFormData({
                                  ...quizFormData,
                                  assignedTo: quizFormData.assignedTo.filter((id) => id !== student._id),
                                });
                              }
                            }}
                          />
                          <label htmlFor={`student-${student._id}`} style={{ marginBottom: 0, cursor: 'pointer', flex: 1 }}>
                            <strong>{student.name}</strong> ({student.studentId}) - {student.semester} sem, CGPA: {student.cgpa}
                          </label>
                        </div>
                      ))
                    )}
                  </div>
                  <small style={{ color: '#999', marginTop: '5px', display: 'block' }}>
                    {quizFormData.assignedTo?.length || 0} student(s) selected
                  </small>
                </div>

                <div className="section-head" style={{ marginTop: '1rem' }}>
                  <h3>Questions ({quizFormData.questions.length})</h3>
                  <button
                    type="button"
                    className="btn btn-secondary small-btn"
                    onClick={addQuestion}
                  >
                    + Add Question
                  </button>
                </div>

                {quizFormData.questions.map((question, questionIndex) => (
                  <div
                    key={questionIndex}
                    className="card"
                    style={{ marginBottom: '1rem', background: '#f8fafc' }}
                  >
                    <div className="section-head">
                      <h4>Question {questionIndex + 1}</h4>
                      {quizFormData.questions.length > 1 && (
                        <button
                          type="button"
                          className="btn btn-secondary small-btn"
                          onClick={() => removeQuestion(questionIndex)}
                        >
                          Remove
                        </button>
                      )}
                    </div>

                    <div className="form-group">
                      <label>Question</label>
                      <textarea
                        rows="2"
                        value={question.question}
                        onChange={(e) => updateQuestion(questionIndex, 'question', e.target.value)}
                        placeholder="Type the question"
                        required
                      />
                    </div>

                    <div className="form-row">
                      {question.options.map((option, optionIndex) => (
                        <div className="form-group" key={optionIndex}>
                          <label>Option {optionIndex + 1}</label>
                          <input
                            type="text"
                            value={option}
                            onChange={(e) =>
                              updateOption(questionIndex, optionIndex, e.target.value)
                            }
                            placeholder={`Option ${optionIndex + 1}`}
                            required
                          />
                        </div>
                      ))}
                    </div>

                    <div className="form-group">
                      <label>Correct Answer</label>
                      <input
                        type="text"
                        value={question.correctAnswer}
                        onChange={(e) =>
                          updateQuestion(questionIndex, 'correctAnswer', e.target.value)
                        }
                        placeholder="Write the exact correct option text"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Explanation (Optional)</label>
                      <textarea
                        rows="2"
                        value={question.explanation}
                        onChange={(e) =>
                          updateQuestion(questionIndex, 'explanation', e.target.value)
                        }
                        placeholder="Optional explanation"
                      />
                    </div>
                  </div>
                ))}

                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Saving...' : editingQuiz ? 'Update Quiz' : 'Publish Quiz'}
                </button>
              </form>
            </div>
          )}

          {/* QUIZ SUBMISSIONS MODAL */}
          {showQuizSubmissions && (
            <div className="card" style={{ marginBottom: '20px', border: '2px solid #0066cc' }}>
              <div className="section-head">
                <h3>Quiz Submissions</h3>
                <button
                  className="btn btn-secondary small-btn"
                  onClick={() => setShowQuizSubmissions(null)}
                >
                  Close
                </button>
              </div>
              {quizSubmissions[showQuizSubmissions]?.length === 0 ? (
                <p className="empty-message">No submissions yet.</p>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #ddd' }}>
                      <th style={{ padding: '10px', textAlign: 'left' }}>Student Name</th>
                      <th style={{ padding: '10px', textAlign: 'left' }}>Email</th>
                      <th style={{ padding: '10px', textAlign: 'center' }}>Score</th>
                      <th style={{ padding: '10px', textAlign: 'center' }}>Percentage</th>
                      <th style={{ padding: '10px', textAlign: 'left' }}>Submitted</th>
                    </tr>
                  </thead>
                  <tbody>
                    {quizSubmissions[showQuizSubmissions]?.map((sub) => (
                      <tr key={sub._id} style={{ borderBottom: '1px solid #eee' }}>
                        <td style={{ padding: '10px' }}>{sub.studentName}</td>
                        <td style={{ padding: '10px' }}>{sub.studentEmail}</td>
                        <td style={{ padding: '10px', textAlign: 'center' }}>
                          {sub.score}/{sub.totalQuestions}
                        </td>
                        <td style={{ padding: '10px', textAlign: 'center' }}>{sub.percentage}%</td>
                        <td style={{ padding: '10px' }}>
                          {new Date(sub.submittedAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* QUIZZES LIST */}
          <div className="content-grid">
            {quizzes.length === 0 ? (
              <div className="card">
                <p className="empty-message">No quizzes created yet. Create your first assessment.</p>
              </div>
            ) : (
              <div className="card">
                <div className="section-head">
                  <h3>Your Quizzes</h3>
                  <span>{quizzes.length} quizzes</span>
                </div>
                <div className="task-list">
                  {quizzes.map((quiz) => (
                    <article key={quiz._id} className="card task-card">
                      <div className="task-header">
                        <div>
                          <h4>{quiz.title}</h4>
                          <p className="task-meta">
                            <span className={`badge badge-${quiz.status}`}>{quiz.status}</span>
                          </p>
                        </div>
                        <div className="task-actions">
                          <button
                            className="btn-icon"
                            onClick={() => fetchQuizSubmissions(quiz._id)}
                            title="View submissions"
                          >
                            📊
                          </button>
                          <button
                            className="btn-icon"
                            onClick={() => handleEditQuiz(quiz)}
                            title="Edit quiz"
                          >
                            ✏️
                          </button>
                          {quiz.status === 'published' && (
                            <button
                              className="btn-icon"
                              onClick={() => handleToggleQuizStatus(quiz._id, 'closed')}
                              title="Close quiz"
                            >
                              🔒
                            </button>
                          )}
                          {quiz.status === 'closed' && (
                            <button
                              className="btn-icon"
                              onClick={() => handleToggleQuizStatus(quiz._id, 'published')}
                              title="Reopen quiz"
                            >
                              🔓
                            </button>
                          )}
                          <button
                            className="btn-icon delete"
                            onClick={() => handleDeleteQuiz(quiz._id)}
                            title="Delete quiz"
                          >
                            🗑
                          </button>
                        </div>
                      </div>
                      <p>{quiz.description || 'No description provided.'}</p>
                      <div className="task-footer">
                        <span>📚 {quiz.subject || 'General'}</span>
                        <span>⏱ {quiz.durationMinutes} mins</span>
                        <span>❓ {quiz.questions?.length || 0} questions</span>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
