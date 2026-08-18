import { useEffect, useMemo, useState } from 'react';
import api from './services/api';
import './TeacherQuizPanel.css';

const blankQuestion = () => ({
  question: '',
  options: ['', '', '', ''],
  correctAnswer: '',
  explanation: '',
});

const defaultForm = {
  title: '',
  description: '',
  subject: 'General',
  durationMinutes: 15,
  status: 'draft',
  maxAttempts: 1,
  dueDate: '',
  releaseDate: '',
  showCorrectAnswers: true,
  shuffleQuestions: false,
  shuffleOptions: false,
  questions: [blankQuestion()],
};

export default function TeacherQuizPanel() {
  // Quiz management
  const [quizzes, setQuizzes] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [tab, setTab] = useState('list'); // list, create, assignment, submissions, analytics, settings
  
  // Forms
  const [form, setForm] = useState(defaultForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Assignment
  const [availableStudents, setAvailableStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [studentSearchTerm, setStudentSearchTerm] = useState('');
  
  // Submissions
  const [submissions, setSubmissions] = useState([]);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [submissionFeedback, setSubmissionFeedback] = useState('');
  
  // Analytics
  const [analytics, setAnalytics] = useState(null);
  const [studentAttempts, setStudentAttempts] = useState(null);

  const fetchQuizzes = async () => {
    try {
      const response = await api.get('/quizzes/teacher/quizzes');
      setQuizzes(response.data || []);
    } catch (error) {
      setError('Failed to load quizzes');
      console.error(error);
    }
  };

  const fetchAvailableStudents = async () => {
    try {
      const response = await api.get('/quizzes/teacher/students/assignment');
      setAvailableStudents(response.data || []);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const fetchSubmissions = async (quizId) => {
    try {
      const response = await api.get(`/quizzes/${quizId}/submissions`);
      setSubmissions(response.data || []);
    } catch (error) {
      console.error('Error fetching submissions:', error);
    }
  };

  const fetchAnalytics = async (quizId) => {
    try {
      const response = await api.get(`/quizzes/${quizId}/analytics`);
      setAnalytics(response.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  const fetchSubmissionDetails = async (submissionId) => {
    try {
      const response = await api.get(`/quizzes/submissions/${submissionId}/details`);
      setSelectedSubmission(response.data);
    } catch (error) {
      console.error('Error fetching submission details:', error);
    }
  };

  const fetchStudentAttempts = async (quizId, studentId) => {
    try {
      const response = await api.get(`/quizzes/${quizId}/student/${studentId}/attempts`);
      setStudentAttempts(response.data);
    } catch (error) {
      console.error('Error fetching attempts:', error);
    }
  };

  useEffect(() => {
    fetchQuizzes();
    fetchAvailableStudents();
  }, []);

  const questionCount = useMemo(() => form.questions.length, [form.questions]);

  const filteredStudents = useMemo(() => {
    const searchLower = studentSearchTerm.toLowerCase();
    const selected = new Set(selectedStudents);
    
    return availableStudents
      .filter(student => 
        !selected.has(student._id) &&
        (student.name.toLowerCase().includes(searchLower) || 
         student.studentId.includes(searchLower) ||
         student.email.toLowerCase().includes(searchLower))
      )
      .slice(0, 10);
  }, [availableStudents, studentSearchTerm, selectedStudents]);

  const updateQuestion = (index, field, value) => {
    setForm((prev) => {
      const questions = [...prev.questions];
      questions[index] = { ...questions[index], [field]: value };
      return { ...prev, questions };
    });
  };

  const updateOption = (questionIndex, optionIndex, value) => {
    setForm((prev) => {
      const questions = [...prev.questions];
      const options = [...questions[questionIndex].options];
      options[optionIndex] = value;
      questions[questionIndex] = { ...questions[questionIndex], options };
      return { ...prev, questions };
    });
  };

  const addQuestion = () => {
    setForm((prev) => ({ ...prev, questions: [...prev.questions, blankQuestion()] }));
  };

  const removeQuestion = (index) => {
    if (form.questions.length > 1) {
      setForm((prev) => ({
        ...prev,
        questions: prev.questions.filter((_, i) => i !== index),
      }));
    }
  };

  const handleCreateQuiz = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const payload = {
        ...form,
        questions: form.questions.map((question) => ({
          ...question,
          options: question.options.filter(Boolean),
        })),
      };

      const response = await api.post('/quizzes', payload);
      setQuizzes((prev) => [response.data, ...prev]);
      setForm(defaultForm);
      setTab('list');
    } catch (error) {
      setError(error.response?.data?.message || 'Unable to create quiz.');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignStudents = async () => {
    if (!selectedQuiz || selectedStudents.length === 0) {
      setError('Select students to assign');
      return;
    }

    try {
      await api.post(`/quizzes/${selectedQuiz._id}/assign/students`, {
        studentIds: selectedStudents,
      });
      
      // Refresh quiz data
      const response = await api.get('/quizzes/teacher/quizzes');
      const updated = response.data.find(q => q._id === selectedQuiz._id);
      setSelectedQuiz(updated);
      setQuizzes(response.data);
      
      setSelectedStudents([]);
      setStudentSearchTerm('');
      setError('');
      alert('Students assigned successfully!');
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to assign students');
    }
  };

  const handleRemoveStudent = async (studentId) => {
    if (!selectedQuiz) return;
    
    try {
      await api.delete(`/quizzes/${selectedQuiz._id}/assign/${studentId}`);
      
      const response = await api.get('/quizzes/teacher/quizzes');
      const updated = response.data.find(q => q._id === selectedQuiz._id);
      setSelectedQuiz(updated);
      setQuizzes(response.data);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to remove student');
    }
  };

  const handleAddFeedback = async (submissionId) => {
    try {
      await api.put(`/quizzes/submissions/${submissionId}/feedback`, {
        feedback: submissionFeedback,
      });
      
      setSubmissionFeedback('');
      fetchSubmissions(selectedQuiz._id);
      setSelectedSubmission(null);
      alert('Feedback added successfully!');
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to add feedback');
    }
  };

  const handleQuizSelect = (quiz) => {
    setSelectedQuiz(quiz);
    setTab('submissions');
    fetchSubmissions(quiz._id);
    fetchAnalytics(quiz._id);
  };

  const handleStatusChange = async (quizId, newStatus) => {
    try {
      await api.put(`/quizzes/teacher/${quizId}/status`, { status: newStatus });
      
      const response = await api.get('/quizzes/teacher/quizzes');
      setQuizzes(response.data);
      
      if (selectedQuiz?._id === quizId) {
        const updated = response.data.find(q => q._id === quizId);
        setSelectedQuiz(updated);
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to update status');
    }
  };

  // ============ RENDER SECTIONS ============

  const renderCreateForm = () => (
    <div className="card create-form-card">
      <h2>Create New Quiz</h2>
      {error && <div className="alert alert-error">{error}</div>}
      
      <form onSubmit={handleCreateQuiz}>
        <div className="form-row">
          <div className="form-group">
            <label>Quiz Title *</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Weekly Assessment"
              required
            />
          </div>
          <div className="form-group">
            <label>Subject</label>
            <input
              type="text"
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
              placeholder="Data Structures"
            />
          </div>
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea
            rows="2"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Assessment description"
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Duration (minutes)</label>
            <input
              type="number"
              min="5"
              value={form.durationMinutes}
              onChange={(e) => setForm({ ...form, durationMinutes: Number(e.target.value) || 15 })}
            />
          </div>
          <div className="form-group">
            <label>Max Attempts</label>
            <input
              type="number"
              min="1"
              value={form.maxAttempts}
              onChange={(e) => setForm({ ...form, maxAttempts: Number(e.target.value) || 1 })}
            />
          </div>
          <div className="form-group">
            <label>Status</label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Release Date</label>
            <input
              type="datetime-local"
              value={form.releaseDate}
              onChange={(e) => setForm({ ...form, releaseDate: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Due Date</label>
            <input
              type="datetime-local"
              value={form.dueDate}
              onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group checkbox">
            <input
              type="checkbox"
              checked={form.showCorrectAnswers}
              onChange={(e) => setForm({ ...form, showCorrectAnswers: e.target.checked })}
            />
            <label>Show Correct Answers After Submission</label>
          </div>
          <div className="form-group checkbox">
            <input
              type="checkbox"
              checked={form.shuffleQuestions}
              onChange={(e) => setForm({ ...form, shuffleQuestions: e.target.checked })}
            />
            <label>Shuffle Questions</label>
          </div>
        </div>

        <div className="section-head" style={{ marginTop: '2rem' }}>
          <h3>Questions ({questionCount})</h3>
          <button type="button" className="btn btn-secondary small-btn" onClick={addQuestion}>+ Add Question</button>
        </div>

        {form.questions.map((question, questionIndex) => (
          <div key={questionIndex} className="card" style={{ marginBottom: '1rem', background: '#f8fafc' }}>
            <div className="section-head">
              <h4>Question {questionIndex + 1}</h4>
              {form.questions.length > 1 && (
                <button type="button" className="btn btn-danger small-btn" onClick={() => removeQuestion(questionIndex)}>Remove</button>
              )}
            </div>

            <div className="form-group">
              <label>Question Text *</label>
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
                    onChange={(e) => updateOption(questionIndex, optionIndex, e.target.value)}
                    placeholder={`Option ${optionIndex + 1}`}
                    required
                  />
                </div>
              ))}
            </div>

            <div className="form-group">
              <label>Correct Answer *</label>
              <select
                value={question.correctAnswer}
                onChange={(e) => updateQuestion(questionIndex, 'correctAnswer', e.target.value)}
                required
              >
                <option value="">Select correct answer</option>
                {question.options.filter(Boolean).map((option, idx) => (
                  <option key={idx} value={option}>{option}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Explanation (Optional)</label>
              <textarea
                rows="2"
                value={question.explanation}
                onChange={(e) => updateQuestion(questionIndex, 'explanation', e.target.value)}
                placeholder="Explain the correct answer"
              />
            </div>
          </div>
        ))}

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Creating...' : 'Create Quiz'}
        </button>
      </form>
    </div>
  );

  const renderQuizList = () => (
    <div className="content-grid">
      <div className="card" style={{ gridColumn: '1 / -1' }}>
        <div className="section-head">
          <h2>My Quizzes</h2>
          <button className="btn btn-primary" onClick={() => setTab('create')}>+ Create New Quiz</button>
        </div>
      </div>

      {quizzes.length === 0 ? (
        <div className="card" style={{ gridColumn: '1 / -1' }}>
          <p className="empty-message">No quizzes created yet. Create your first assessment.</p>
        </div>
      ) : (
        quizzes.map((quiz) => (
          <article key={quiz._id} className="card quiz-card">
            <div className="quiz-header">
              <div>
                <h3>{quiz.title}</h3>
                <p className="quiz-meta">
                  <span className={`badge badge-${quiz.status}`}>{quiz.status}</span>
                  {quiz.dueDate && <span className="badge badge-info">📅 {new Date(quiz.dueDate).toLocaleDateString()}</span>}
                </p>
              </div>
            </div>
            <p className="quiz-description">{quiz.description || 'No description'}</p>
            <div className="quiz-stats">
              <span>📚 {quiz.subject}</span>
              <span>⏱ {quiz.durationMinutes} min</span>
              <span>❓ {quiz.questions?.length || 0} Q</span>
              <span>👥 {quiz.assignedTo?.length || 0} assigned</span>
              <span>🔄 Max {quiz.maxAttempts} attempt(s)</span>
            </div>
            <div className="quiz-actions">
              <button className="btn btn-secondary" onClick={() => { setSelectedQuiz(quiz); setTab('assignment'); }}>
                👥 Assign
              </button>
              <button className="btn btn-secondary" onClick={() => handleQuizSelect(quiz)}>
                📊 View Submissions
              </button>
              <button className="btn btn-secondary" onClick={() => { setSelectedQuiz(quiz); setTab('settings'); }}>
                ⚙️ Settings
              </button>
            </div>
          </article>
        ))
      )}
    </div>
  );

  const renderAssignment = () => {
    if (!selectedQuiz) return null;

    const assignedStudents = availableStudents.filter(s => selectedQuiz.assignedTo.includes(s._id));

    return (
      <div className="card">
        <div className="section-head">
          <h2>Assign Quiz: {selectedQuiz.title}</h2>
          <button className="btn btn-secondary" onClick={() => setTab('list')}>← Back</button>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <div className="form-row" style={{ marginBottom: '2rem' }}>
          <div className="form-group" style={{ flex: 1 }}>
            <label>Search and Select Students</label>
            <input
              type="text"
              placeholder="Search by name, ID, or email..."
              value={studentSearchTerm}
              onChange={(e) => setStudentSearchTerm(e.target.value)}
            />
            {studentSearchTerm && (
              <div className="dropdown-list">
                {filteredStudents.length === 0 ? (
                  <p style={{ padding: '10px' }}>No students found</p>
                ) : (
                  filteredStudents.map(student => (
                    <div
                      key={student._id}
                      className="dropdown-item"
                      onClick={() => {
                        setSelectedStudents([...selectedStudents, student._id]);
                        setStudentSearchTerm('');
                      }}
                    >
                      <strong>{student.name}</strong>
                      <p>{student.studentId} - {student.email}</p>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
          <button className="btn btn-primary" onClick={handleAssignStudents} disabled={selectedStudents.length === 0}>
            Assign {selectedStudents.length} Student(s)
          </button>
        </div>

        <h3>Selected for Assignment ({selectedStudents.length})</h3>
        <div className="chips-container">
          {selectedStudents.map(id => {
            const student = availableStudents.find(s => s._id === id);
            return (
              <div key={id} className="chip">
                {student?.name}
                <button onClick={() => setSelectedStudents(selectedStudents.filter(s => s !== id))}>✕</button>
              </div>
            );
          })}
        </div>

        <hr style={{ margin: '2rem 0' }} />

        <h3>Currently Assigned ({assignedStudents.length})</h3>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>ID</th>
                <th>Email</th>
                <th>Semester</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {assignedStudents.length === 0 ? (
                <tr><td colSpan="5" className="empty-message">No students assigned yet</td></tr>
              ) : (
                assignedStudents.map(student => (
                  <tr key={student._id}>
                    <td>{student.name}</td>
                    <td>{student.studentId}</td>
                    <td>{student.email}</td>
                    <td>Sem {student.semester}</td>
                    <td>
                      <button
                        className="btn btn-danger small-btn"
                        onClick={() => handleRemoveStudent(student._id)}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderSubmissions = () => {
    if (!selectedQuiz) return null;

    if (selectedSubmission) {
      return (
        <div className="card">
          <div className="section-head">
            <h2>Submission Details</h2>
            <button className="btn btn-secondary" onClick={() => setSelectedSubmission(null)}>← Back</button>
          </div>

          <div className="submission-header">
            <div>
              <p><strong>Student:</strong> {selectedSubmission.studentName}</p>
              <p><strong>Email:</strong> {selectedSubmission.studentEmail}</p>
            </div>
            <div>
              <p><strong>Score:</strong> {selectedSubmission.score}/{selectedSubmission.totalQuestions} ({selectedSubmission.percentage}%)</p>
              <p><strong>Attempt:</strong> {selectedSubmission.attemptNumber} | <strong>Time:</strong> {selectedSubmission.timeSpentMinutes} min</p>
            </div>
          </div>

          <div className="submission-answers">
            {selectedSubmission.answers.map((answer, idx) => (
              <div key={idx} className={`answer-item ${answer.isCorrect ? 'correct' : 'incorrect'}`}>
                <h4>Question {idx + 1}: {answer.questionText}</h4>
                <p><strong>Student's Answer:</strong> {answer.studentAnswer || '(Not answered)'}</p>
                <p><strong>Correct Answer:</strong> {answer.correctAnswer}</p>
                {answer.explanation && <p><strong>Explanation:</strong> {answer.explanation}</p>}
                <span className={`badge ${answer.isCorrect ? 'badge-success' : 'badge-error'}`}>
                  {answer.isCorrect ? '✓ Correct' : '✗ Incorrect'}
                </span>
              </div>
            ))}
          </div>

          <div className="form-group">
            <label>Add Feedback</label>
            <textarea
              rows="4"
              value={submissionFeedback}
              onChange={(e) => setSubmissionFeedback(e.target.value)}
              placeholder="Provide feedback to the student..."
            />
          </div>

          {selectedSubmission.feedback && (
            <div className="alert alert-info">
              <strong>Previous Feedback:</strong> {selectedSubmission.feedback}
            </div>
          )}

          <button
            className="btn btn-primary"
            onClick={() => handleAddFeedback(selectedSubmission._id)}
            disabled={!submissionFeedback.trim()}
          >
            Save Feedback
          </button>
        </div>
      );
    }

    return (
      <div className="card">
        <div className="section-head">
          <h2>Quiz Submissions: {selectedQuiz.title}</h2>
          <button className="btn btn-secondary" onClick={() => setTab('list')}>← Back</button>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Student</th>
                <th>Score</th>
                <th>Percentage</th>
                <th>Attempt</th>
                <th>Time (min)</th>
                <th>Submitted</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {submissions.length === 0 ? (
                <tr><td colSpan="7" className="empty-message">No submissions yet</td></tr>
              ) : (
                submissions.map(submission => (
                  <tr key={submission._id}>
                    <td><strong>{submission.studentName}</strong></td>
                    <td>{submission.score}/{submission.totalQuestions}</td>
                    <td>
                      <span className={`badge badge-${submission.percentage >= 60 ? 'success' : 'error'}`}>
                        {submission.percentage}%
                      </span>
                    </td>
                    <td>1</td>
                    <td>-</td>
                    <td>{new Date(submission.submittedAt).toLocaleDateString()}</td>
                    <td>
                      <button
                        className="btn btn-secondary small-btn"
                        onClick={() => fetchSubmissionDetails(submission._id)}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderAnalytics = () => {
    if (!selectedQuiz || !analytics) return null;

    return (
      <div>
        <div className="card">
          <div className="section-head">
            <h2>Quiz Analytics: {selectedQuiz.title}</h2>
            <button className="btn btn-secondary" onClick={() => setTab('list')}>← Back</button>
          </div>

          <div className="analytics-grid">
            <div className="stat-card">
              <h4>Total Assigned</h4>
              <p className="stat-value">{analytics.totalAssigned}</p>
            </div>
            <div className="stat-card">
              <h4>Submitted</h4>
              <p className="stat-value">{analytics.totalSubmitted}</p>
            </div>
            <div className="stat-card">
              <h4>Pending</h4>
              <p className="stat-value">{analytics.totalNotSubmitted}</p>
            </div>
            <div className="stat-card">
              <h4>Submission Rate</h4>
              <p className="stat-value">{analytics.submissionRate}%</p>
            </div>
          </div>

          <div className="analytics-grid">
            <div className="stat-card">
              <h4>Average Score</h4>
              <p className="stat-value">{analytics.avgScore}/{analytics.totalQuestions}</p>
            </div>
            <div className="stat-card">
              <h4>Highest Score</h4>
              <p className="stat-value">{analytics.maxScore}/{analytics.totalQuestions}</p>
            </div>
            <div className="stat-card">
              <h4>Lowest Score</h4>
              <p className="stat-value">{analytics.minScore}/{analytics.totalQuestions}</p>
            </div>
            <div className="stat-card">
              <h4>Average Percentage</h4>
              <p className="stat-value">{analytics.avgPercentage}%</p>
            </div>
          </div>

          <div className="card" style={{ marginTop: '2rem' }}>
            <h3>Score Distribution</h3>
            <div className="score-distribution">
              <div className="distribution-bar">
                <div className="bar-section excellent" style={{ width: `${(analytics.scoreDistribution.excellent / analytics.totalSubmitted) * 100}%` }}>
                  <span>Excellent (80-100%)</span>
                </div>
                <div className="bar-section good" style={{ width: `${(analytics.scoreDistribution.good / analytics.totalSubmitted) * 100}%` }}>
                  <span>Good (60-79%)</span>
                </div>
                <div className="bar-section average" style={{ width: `${(analytics.scoreDistribution.average / analytics.totalSubmitted) * 100}%` }}>
                  <span>Average (40-59%)</span>
                </div>
                <div className="bar-section poor" style={{ width: `${(analytics.scoreDistribution.poor / analytics.totalSubmitted) * 100}%` }}>
                  <span>Poor (&lt;40%)</span>
                </div>
              </div>
            </div>
            <div className="distribution-stats">
              <p>Excellent: {analytics.scoreDistribution.excellent} students</p>
              <p>Good: {analytics.scoreDistribution.good} students</p>
              <p>Average: {analytics.scoreDistribution.average} students</p>
              <p>Poor: {analytics.scoreDistribution.poor} students</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderSettings = () => {
    if (!selectedQuiz) return null;

    return (
      <div className="card">
        <div className="section-head">
          <h2>Quiz Settings: {selectedQuiz.title}</h2>
          <button className="btn btn-secondary" onClick={() => setTab('list')}>← Back</button>
        </div>

        <div className="settings-grid">
          <div className="setting-item">
            <h4>Quiz Status</h4>
            <div className="button-group">
              {['draft', 'published', 'closed'].map(status => (
                <button
                  key={status}
                  className={`btn ${selectedQuiz.status === status ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => handleStatusChange(selectedQuiz._id, status)}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="setting-item">
            <h4>Basic Information</h4>
            <p><strong>Created:</strong> {new Date(selectedQuiz.createdAt).toLocaleDateString()}</p>
            <p><strong>Duration:</strong> {selectedQuiz.durationMinutes} minutes</p>
            <p><strong>Max Attempts:</strong> {selectedQuiz.maxAttempts}</p>
            <p><strong>Questions:</strong> {selectedQuiz.questions?.length}</p>
          </div>

          <div className="setting-item">
            <h4>Dates</h4>
            <p><strong>Release Date:</strong> {selectedQuiz.releaseDate ? new Date(selectedQuiz.releaseDate).toLocaleString() : 'Not set'}</p>
            <p><strong>Due Date:</strong> {selectedQuiz.dueDate ? new Date(selectedQuiz.dueDate).toLocaleString() : 'Not set'}</p>
          </div>

          <div className="setting-item">
            <h4>Options</h4>
            <p>Show Correct Answers: {selectedQuiz.showCorrectAnswers ? '✓ Yes' : '✗ No'}</p>
            <p>Shuffle Questions: {selectedQuiz.shuffleQuestions ? '✓ Yes' : '✗ No'}</p>
            <p>Shuffle Options: {selectedQuiz.shuffleOptions ? '✓ Yes' : '✗ No'}</p>
          </div>

          <div className="setting-item alert alert-warning">
            <h4>⚠️ Danger Zone</h4>
            <button className="btn btn-danger" onClick={() => {
              if (window.confirm('Are you sure? This cannot be undone.')) {
                api.delete(`/quizzes/teacher/${selectedQuiz._id}`).then(() => {
                  fetchQuizzes();
                  setTab('list');
                }).catch(err => setError(err.response?.data?.message));
              }
            }}>
              Delete Quiz
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Main render
  return (
    <div className="page-panel">
      <div className="topbar">
        <div>
          <h1>Quiz Management System</h1>
          <p className="eyebrow">Create, assign, and evaluate student quizzes</p>
        </div>
      </div>

      {error && <div className="alert alert-error" style={{ margin: '1rem' }}>{error}</div>}

      {tab === 'list' && renderQuizList()}
      {tab === 'create' && renderCreateForm()}
      {tab === 'assignment' && renderAssignment()}
      {tab === 'submissions' && renderSubmissions()}
      {tab === 'analytics' && renderAnalytics()}
      {tab === 'settings' && renderSettings()}
    </div>
  );
}
