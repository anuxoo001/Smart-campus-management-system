import { useEffect, useState, useCallback } from 'react';
import api from './services/api';
import './StudentQuizPanel.css';

export default function StudentQuizPanel() {
  // Quiz listing
  const [quizzes, setQuizzes] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // list, attempting, review, result, attempts
  
  // Quiz attempting
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [totalTimeSpent, setTotalTimeSpent] = useState(0);
  const [quizStartTime, setQuizStartTime] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Results
  const [result, setResult] = useState(null);
  const [studentAttempts, setStudentAttempts] = useState(null);

  const fetchQuizzes = async () => {
    try {
      const response = await api.get('/quizzes/student/quizzes');
      setQuizzes(response.data || []);
    } catch (error) {
      setError('Failed to load quizzes');
      console.error(error);
    }
  };

  useEffect(() => {
    fetchQuizzes();
  }, []);

  // Timer for quiz attempt
  useEffect(() => {
    if (viewMode !== 'attempting' || !selectedQuiz) return;

    const timer = setInterval(() => {
      const now = new Date();
      const elapsed = Math.floor((now - quizStartTime) / 1000);
      const remaining = Math.max(0, selectedQuiz.durationMinutes * 60 - elapsed);
      
      setTimeRemaining(remaining);
      setTotalTimeSpent(elapsed);

      // Auto-submit if time is up
      if (remaining === 0) {
        handleAutoSubmit(elapsed);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [viewMode, selectedQuiz, quizStartTime]);

  const handleStartQuiz = (quiz) => {
    setSelectedQuiz(quiz);
    setCurrentQuestionIndex(0);
    setAnswers({});
    setViewMode('attempting');
    setQuizStartTime(new Date());
    setError('');
  };

  const handleAnswerChange = (questionIndex, option) => {
    setAnswers((prev) => ({
      ...prev,
      [questionIndex]: option,
    }));
  };

  const goToQuestion = (index) => {
    if (index >= 0 && index < selectedQuiz.questions.length) {
      setCurrentQuestionIndex(index);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < selectedQuiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleReviewQuiz = () => {
    setViewMode('review');
  };

  const handleAutoSubmit = async (timeSpent) => {
    const selectedAnswers = Object.entries(answers).map(([questionIndex, selectedOption]) => ({
      questionIndex: Number(questionIndex),
      selectedOption,
    }));

    try {
      const response = await api.post(`/quizzes/${selectedQuiz._id}/submit`, {
        answers: selectedAnswers,
        timeSpentSeconds: timeSpent,
      });
      setResult(response.data);
      setViewMode('result');
    } catch (error) {
      console.error('Auto-submit failed:', error);
    }
  };

  const handleSubmitQuiz = async () => {
    if (viewMode !== 'review') return;

    setLoading(true);
    setError('');

    const selectedAnswers = Object.entries(answers).map(([questionIndex, selectedOption]) => ({
      questionIndex: Number(questionIndex),
      selectedOption,
    }));

    try {
      const response = await api.post(`/quizzes/${selectedQuiz._id}/submit`, {
        answers: selectedAnswers,
        timeSpentSeconds: totalTimeSpent,
      });
      setResult(response.data);
      setViewMode('result');
    } catch (error) {
      setError(error.response?.data?.message || 'Unable to submit quiz.');
    } finally {
      setLoading(false);
    }
  };

  const handleRetakeQuiz = () => {
    setAnswers({});
    setCurrentQuestionIndex(0);
    setResult(null);
    setViewMode('attempting');
    setQuizStartTime(new Date());
  };

  const handleViewAttempts = async (quiz) => {
    try {
      const response = await api.get(`/quizzes/${quiz._id}/student/${quiz._id}/attempts`);
      setStudentAttempts(response.data);
      setSelectedQuiz(quiz);
      setViewMode('attempts');
    } catch (error) {
      console.error('Failed to fetch attempts:', error);
    }
  };

  const handleBackToList = () => {
    setViewMode('list');
    setSelectedQuiz(null);
    setResult(null);
  };

  // Format time for display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Get quiz status display
  const getQuizStatus = (quiz) => {
    const now = new Date();
    
    if (quiz.quizStatus === 'not_yet_available') {
      const daysUntil = quiz.daysUntilDue || 0;
      return { badge: 'warning', text: `Available in ${Math.ceil(-daysUntil)} days` };
    } else if (quiz.quizStatus === 'overdue') {
      return { badge: 'error', text: 'Overdue' };
    } else if (quiz.quizStatus === 'closed') {
      return { badge: 'error', text: 'Closed' };
    } else if (quiz.quizStatus === 'completed') {
      return { badge: 'success', text: 'Completed' };
    }
    return { badge: 'info', text: 'Available' };
  };

  // Render quiz list view
  const renderQuizList = () => (
    <div className="page-panel">
      <div className="topbar">
        <div>
          <h1>My Quizzes</h1>
          <p className="eyebrow">Attempt online assessments assigned by faculty</p>
        </div>
      </div>

      <div className="content-grid">
        {quizzes.length === 0 ? (
          <div className="card" style={{ gridColumn: '1 / -1' }}>
            <p className="empty-message">No quizzes assigned yet. Check back later.</p>
          </div>
        ) : (
          quizzes.map((quiz) => {
            const status = getQuizStatus(quiz);
            const canAttempt = quiz.quizStatus === 'available' && quiz.attemptsRemaining > 0;
            
            return (
              <div key={quiz._id} className="card quiz-card">
                <div className="quiz-card-header">
                  <div>
                    <h3>{quiz.title}</h3>
                    <p className="faculty-name">by {quiz.facultyName}</p>
                  </div>
                  <span className={`badge badge-${status.badge}`}>{status.text}</span>
                </div>

                <p className="quiz-description">{quiz.description || 'No description provided'}</p>

                <div className="quiz-details">
                  <div className="detail-item">
                    <span className="detail-label">Subject:</span>
                    <span>{quiz.subject}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Duration:</span>
                    <span>{quiz.durationMinutes} minutes</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Questions:</span>
                    <span>{quiz.questions?.length}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Attempts:</span>
                    <span>{quiz.attemptsRemaining || 0} remaining</span>
                  </div>
                </div>

                {quiz.dueDate && (
                  <p className="due-date">
                    📅 Due: {new Date(quiz.dueDate).toLocaleDateString()} 
                    {quiz.daysUntilDue && quiz.daysUntilDue > 0 && ` (${quiz.daysUntilDue} days left)`}
                  </p>
                )}

                {quiz.submitted && (
                  <div className="submission-info">
                    <p><strong>Previous Score:</strong> {quiz.submission.score}/{quiz.submission.totalQuestions} ({quiz.submission.percentage}%)</p>
                  </div>
                )}

                <div className="quiz-actions">
                  {canAttempt && (
                    <button
                      className="btn btn-primary"
                      onClick={() => handleStartQuiz(quiz)}
                    >
                      🚀 Start Quiz
                    </button>
                  )}
                  {quiz.submitted && (
                    <>
                      <button
                        className="btn btn-secondary"
                        onClick={() => handleViewAttempts(quiz)}
                      >
                        📋 View Attempts
                      </button>
                      {quiz.attemptsRemaining > 0 && (
                        <button
                          className="btn btn-secondary"
                          onClick={() => handleStartQuiz(quiz)}
                        >
                          🔄 Retake Quiz
                        </button>
                      )}
                    </>
                  )}
                  {!canAttempt && !quiz.submitted && quiz.quizStatus !== 'closed' && (
                    <button className="btn btn-disabled" disabled>
                      {quiz.quizStatus === 'not_yet_available' ? 'Not Available Yet' : 'No Attempts Left'}
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );

  // Render quiz attempting view
  const renderAttemptingView = () => {
    if (!selectedQuiz) return null;

    const currentQuestion = selectedQuiz.questions[currentQuestionIndex];
    const selectedAnswer = answers[currentQuestionIndex];
    const answeredCount = Object.keys(answers).length;
    const totalQuestions = selectedQuiz.questions.length;

    return (
      <div className="page-panel quiz-attempt-panel">
        <div className="quiz-header-bar">
          <div className="quiz-title">
            <h2>{selectedQuiz.title}</h2>
            <p>{currentQuestionIndex + 1} of {totalQuestions}</p>
          </div>
          <div className="timer" style={{ color: timeRemaining < 60 ? '#ef4444' : '#667eea' }}>
            <span className="timer-icon">⏱</span>
            <span className="timer-value">{formatTime(timeRemaining)}</span>
          </div>
        </div>

        <div className="quiz-content">
          <div className="question-section">
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%` }}></div>
            </div>

            <div className="question-box">
              <h3>Question {currentQuestionIndex + 1}</h3>
              <p className="question-text">{currentQuestion.question}</p>

              <div className="options-container">
                {currentQuestion.options.map((option, idx) => (
                  <label key={idx} className={`option-label ${selectedAnswer === option ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name={`question-${currentQuestionIndex}`}
                      value={option}
                      checked={selectedAnswer === option}
                      onChange={() => handleAnswerChange(currentQuestionIndex, option)}
                    />
                    <span className="option-text">{option}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="navigation-buttons">
              <button
                className="btn btn-secondary"
                onClick={handlePreviousQuestion}
                disabled={currentQuestionIndex === 0}
              >
                ← Previous
              </button>

              <button
                className="btn btn-secondary"
                onClick={handleNextQuestion}
                disabled={currentQuestionIndex === totalQuestions - 1}
              >
                Next →
              </button>

              <button
                className="btn btn-primary"
                onClick={handleReviewQuiz}
              >
                Review & Submit
              </button>
            </div>
          </div>

          <div className="question-navigator">
            <h4>Questions ({answeredCount}/{totalQuestions})</h4>
            <div className="question-grid">
              {selectedQuiz.questions.map((_, idx) => (
                <button
                  key={idx}
                  className={`question-btn ${idx === currentQuestionIndex ? 'current' : ''} ${answers[idx] ? 'answered' : 'unanswered'}`}
                  onClick={() => goToQuestion(idx)}
                >
                  {idx + 1}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render review view
  const renderReviewView = () => {
    if (!selectedQuiz) return null;

    const answeredCount = Object.keys(answers).length;
    const totalQuestions = selectedQuiz.questions.length;

    return (
      <div className="page-panel">
        <div className="topbar">
          <div>
            <h1>Review Your Answers</h1>
            <p className="eyebrow">{answeredCount} of {totalQuestions} questions answered</p>
          </div>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <div className="review-container">
          {selectedQuiz.questions.map((question, idx) => {
            const answered = answers[idx];
            return (
              <div key={idx} className={`review-item ${answered ? 'answered' : 'unanswered'}`}>
                <div className="review-header">
                  <h4>Question {idx + 1}</h4>
                  <span className={`status-badge ${answered ? 'answered' : 'unanswered'}`}>
                    {answered ? '✓ Answered' : '⊘ Not Answered'}
                  </span>
                </div>
                <p className="question-text">{question.question}</p>
                {answered && <p className="selected-answer"><strong>Your Answer:</strong> {answers[idx]}</p>}
              </div>
            );
          })}
        </div>

        <div className="review-actions">
          <button className="btn btn-secondary" onClick={() => setViewMode('attempting')}>
            ← Continue Attempting
          </button>
          <button
            className="btn btn-primary"
            onClick={handleSubmitQuiz}
            disabled={loading || answeredCount === 0}
          >
            {loading ? 'Submitting...' : `Submit Quiz (${answeredCount}/${totalQuestions} answered)`}
          </button>
        </div>
      </div>
    );
  };

  // Render result view
  const renderResultView = () => {
    if (!result) return null;

    return (
      <div className="page-panel">
        <div className="topbar">
          <div>
            <h1>Quiz Submitted</h1>
            <p className="eyebrow">Results and feedback</p>
          </div>
        </div>

        <div className="result-container">
          <div className={`result-card ${result.percentage >= 60 ? 'pass' : 'fail'}`}>
            <h2>Your Score</h2>
            <div className="score-display">
              <div className="score-circle">
                <span className="score-percentage">{result.percentage}%</span>
              </div>
              <div className="score-details">
                <p><strong>{result.score}</strong> out of <strong>{result.totalQuestions}</strong></p>
                <p>Time spent: {formatTime(totalTimeSpent)}</p>
                <p>Attempt: {result.attemptNumber} of {result.maxAttempts}</p>
              </div>
            </div>
          </div>

          {selectedQuiz.showCorrectAnswers && (
            <div className="card answer-review">
              <h3>Answer Review</h3>
              {selectedQuiz.questions.map((question, idx) => {
                const userAnswer = answers[idx];
                const isCorrect = userAnswer === question.correctAnswer;
                
                return (
                  <div key={idx} className={`answer-item ${isCorrect ? 'correct' : 'incorrect'}`}>
                    <div className="answer-header">
                      <h4>Question {idx + 1}</h4>
                      <span className={`badge ${isCorrect ? 'badge-success' : 'badge-error'}`}>
                        {isCorrect ? '✓ Correct' : '✗ Incorrect'}
                      </span>
                    </div>
                    <p><strong>Question:</strong> {question.question}</p>
                    <p><strong>Your Answer:</strong> {userAnswer || '(Not answered)'}</p>
                    {!isCorrect && <p><strong>Correct Answer:</strong> {question.correctAnswer}</p>}
                    {question.explanation && <p><strong>Explanation:</strong> {question.explanation}</p>}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="result-actions">
          <button className="btn btn-secondary" onClick={handleBackToList}>
            ← Back to Quiz List
          </button>
          {result.attemptsRemaining > 0 && (
            <button className="btn btn-primary" onClick={handleRetakeQuiz}>
              🔄 Retake Quiz ({result.attemptsRemaining} attempts left)
            </button>
          )}
        </div>
      </div>
    );
  };

  // Render attempts history view
  const renderAttemptsView = () => {
    if (!studentAttempts) return null;

    return (
      <div className="page-panel">
        <div className="topbar">
          <div>
            <h1>Quiz Attempts: {studentAttempts.quizTitle}</h1>
            <p className="eyebrow">Attempt history and best score</p>
          </div>
          <button className="btn btn-secondary" onClick={handleBackToList}>← Back</button>
        </div>

        <div className="attempts-container">
          <div className="attempts-summary card">
            <div className="summary-grid">
              <div className="summary-item">
                <p className="label">Best Score</p>
                <p className="value">{studentAttempts.bestScore}/{studentAttempts.quizTitle.split('').length}</p>
              </div>
              <div className="summary-item">
                <p className="label">Average Score</p>
                <p className="value">{studentAttempts.averageScore}</p>
              </div>
              <div className="summary-item">
                <p className="label">Total Attempts</p>
                <p className="value">{studentAttempts.attempts.length}/{studentAttempts.maxAttempts}</p>
              </div>
            </div>
          </div>

          <div className="card attempts-list">
            <h3>Attempt History</h3>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Attempt</th>
                    <th>Score</th>
                    <th>Percentage</th>
                    <th>Time Spent</th>
                    <th>Submitted</th>
                  </tr>
                </thead>
                <tbody>
                  {studentAttempts.attempts.map((attempt) => (
                    <tr key={attempt._id}>
                      <td>#{attempt.attemptNumber}</td>
                      <td>{attempt.score}/{attempt.totalQuestions}</td>
                      <td>
                        <span className={`badge badge-${attempt.percentage >= 60 ? 'success' : 'error'}`}>
                          {attempt.percentage}%
                        </span>
                      </td>
                      <td>{attempt.timeSpentMinutes} min</td>
                      <td>{new Date(attempt.submittedAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Main render
  if (viewMode === 'list') return renderQuizList();
  if (viewMode === 'attempting') return renderAttemptingView();
  if (viewMode === 'review') return renderReviewView();
  if (viewMode === 'result') return renderResultView();
  if (viewMode === 'attempts') return renderAttemptsView();

  return renderQuizList();
}
