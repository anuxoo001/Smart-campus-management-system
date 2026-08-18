const Faculty = require('../models/Faculty');
const Student = require('../models/Student');
const Quiz = require('../models/Quiz');
const QuizSubmission = require('../models/QuizSubmission');

const normalizeQuestion = (question) => {
  const safeQuestion = String(question?.question || '').trim();
  const safeOptions = Array.isArray(question?.options) ? question.options.map((option) => String(option).trim()).filter(Boolean) : [];
  const safeAnswer = String(question?.correctAnswer || '').trim();

  if (!safeQuestion || safeOptions.length < 2 || !safeAnswer) {
    throw new Error('Each question must include a prompt, at least two options, and the correct answer.');
  }

  if (!safeOptions.includes(safeAnswer)) {
    throw new Error('The correct answer must match one of the options for each question.');
  }

  return {
    question: safeQuestion,
    options: safeOptions,
    correctAnswer: safeAnswer,
    explanation: String(question?.explanation || '').trim(),
  };
};

const getTeacherQuizzes = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const faculty = await Faculty.findOne({ user: userId });

    if (!faculty) {
      return res.status(403).json({ message: 'Only faculty can access teacher quizzes.' });
    }

    const quizzes = await Quiz.find({ faculty: faculty._id }).sort({ createdAt: -1 });
    res.json(quizzes);
  } catch (error) {
    next(error);
  }
};

const getStudentQuizzes = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const student = await Student.findOne({ user: userId });

    if (!student) {
      return res.status(403).json({ message: 'Only students can access assigned quizzes.' });
    }

    // Filter quizzes where student is in assignedTo array (ERP-based assignment)
    const quizzes = await Quiz.find({ 
      status: 'published',
      assignedTo: student._id
    }).populate('faculty').sort({ createdAt: -1 });
    
    const submissions = await QuizSubmission.find({ 
      student: student._id, 
      isLatestAttempt: true 
    }).lean();
    const submissionMap = new Map(submissions.map((submission) => [submission.quiz.toString(), submission]));

    const quizList = quizzes.map((quiz) => {
      const submission = submissionMap.get(quiz._id.toString());
      const now = new Date();
      
      let status = 'available';
      if (quiz.releaseDate && now < quiz.releaseDate) {
        status = 'not_yet_available';
      } else if (quiz.status === 'closed') {
        status = 'closed';
      } else if (quiz.dueDate && now > quiz.dueDate) {
        status = 'overdue';
      } else if (submission && submission.attemptNumber >= quiz.maxAttempts) {
        status = 'completed';
      }

      return {
        ...quiz.toObject(),
        facultyName: quiz.faculty?.user ? quiz.faculty.user.name : 'Faculty',
        submitted: Boolean(submission),
        submission: submission || null,
        quizStatus: status,
        daysUntilDue: quiz.dueDate ? Math.ceil((quiz.dueDate - now) / (1000 * 60 * 60 * 24)) : null,
        attemptsRemaining: quiz.maxAttempts - (submission ? submission.attemptNumber : 0),
      };
    });

    res.json(quizList);
  } catch (error) {
    next(error);
  }
};

const createQuiz = async (req, res, next) => {
  try {
    const { title, description, subject, durationMinutes, questions, status, assignedTo } = req.body;
    const userId = req.user.id;
    const faculty = await Faculty.findOne({ user: userId });

    if (!faculty) {
      return res.status(403).json({ message: 'Only faculty can create quizzes.' });
    }

    if (!title || !String(title).trim()) {
      return res.status(400).json({ message: 'Quiz title is required.' });
    }

    const normalizedQuestions = Array.isArray(questions)
      ? questions.map((question) => normalizeQuestion(question))
      : [];

    if (normalizedQuestions.length === 0) {
      return res.status(400).json({ message: 'Add at least one valid question to the quiz.' });
    }

    const quiz = await Quiz.create({
      title: String(title).trim(),
      description: String(description || '').trim(),
      subject: String(subject || 'General').trim() || 'General',
      durationMinutes: Number(durationMinutes) || 15,
      status: status || 'published',
      assignedTo: Array.isArray(assignedTo) ? assignedTo : [],
      faculty: faculty._id,
      questions: normalizedQuestions,
    });

    res.status(201).json(quiz);
  } catch (error) {
    if (error.message && error.message.includes('Each question must')) {
      return res.status(400).json({ message: error.message });
    }
    next(error);
  }
};

const submitQuiz = async (req, res, next) => {
  try {
    const { answers = [] } = req.body;
    const userId = req.user.id;
    const student = await Student.findOne({ user: userId });

    if (!student) {
      return res.status(403).json({ message: 'Only students can submit quizzes.' });
    }

    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found.' });
    }

    // Check if quiz is published and not closed
    if (quiz.status !== 'published') {
      return res.status(400).json({ message: 'This quiz is not available for submission.' });
    }

    // Check due date
    if (quiz.dueDate && new Date() > quiz.dueDate) {
      return res.status(400).json({ message: 'This quiz is past its due date.' });
    }

    // Check release date
    if (quiz.releaseDate && new Date() < quiz.releaseDate) {
      return res.status(400).json({ message: 'This quiz is not yet available.' });
    }

    // Check student is assigned
    if (!quiz.assignedTo.includes(student._id)) {
      return res.status(403).json({ message: 'This quiz is not assigned to you.' });
    }

    // Get existing submissions to check attempt count
    const existingSubmissions = await QuizSubmission.find({ 
      quiz: quiz._id, 
      student: student._id 
    }).sort({ attemptNumber: -1 });

    // Determine attempt number
    let attemptNumber = 1;
    if (existingSubmissions.length > 0) {
      attemptNumber = existingSubmissions[0].attemptNumber + 1;
      if (attemptNumber > quiz.maxAttempts) {
        return res.status(400).json({ 
          message: `Maximum ${quiz.maxAttempts} attempt(s) allowed for this quiz.` 
        });
      }
    }

    const answersList = Array.isArray(answers) ? answers : [];
    let score = 0;
    const result = quiz.questions.map((question, index) => {
      const selectedAnswer = answersList.find((entry) => Number(entry.questionIndex) === index)?.selectedOption || '';
      const isCorrect = selectedAnswer && selectedAnswer.toLowerCase() === question.correctAnswer.toLowerCase();
      if (isCorrect) score += 1;
      return {
        questionIndex: index,
        selectedOption: selectedAnswer,
        isCorrect,
      };
    });

    const timeSpentSeconds = req.body.timeSpentSeconds || 0;
    const timeSpentMinutes = Math.round(timeSpentSeconds / 60);
    const percentage = Math.round((score / Math.max(1, quiz.questions.length)) * 100);

    // Mark previous attempts as not latest
    if (existingSubmissions.length > 0) {
      await QuizSubmission.updateMany(
        { quiz: quiz._id, student: student._id },
        { isLatestAttempt: false }
      );
    }

    const submission = await QuizSubmission.create({
      quiz: quiz._id,
      student: student._id,
      answers: result,
      score,
      totalQuestions: quiz.questions.length,
      submittedAt: new Date(),
      status: 'submitted',
      attemptNumber,
      timeSpentMinutes,
      ipAddress: req.ip || '',
      browserInfo: req.get('user-agent') || '',
      startedAt: new Date(Date.now() - timeSpentSeconds * 1000),
      percentage,
      isLatestAttempt: true,
    });

    res.json({
      message: 'Quiz submitted successfully.',
      score,
      totalQuestions: quiz.questions.length,
      percentage,
      attemptNumber,
      maxAttempts: quiz.maxAttempts,
      submission,
    });
  } catch (error) {
    next(error);
  }
};

const getQuiz = async (req, res, next) => {
  try {
    const quiz = await Quiz.findById(req.params.id).populate('faculty');
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found.' });
    }

    // Verify faculty ownership
    const userId = req.user.id;
    const faculty = await Faculty.findOne({ user: userId });
    if (!faculty || quiz.faculty._id.toString() !== faculty._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized to view this quiz.' });
    }

    res.json(quiz);
  } catch (error) {
    next(error);
  }
};

const updateQuiz = async (req, res, next) => {
  try {
    const { title, description, subject, durationMinutes, questions, status, assignedTo } = req.body;
    const userId = req.user.id;
    const faculty = await Faculty.findOne({ user: userId });

    if (!faculty) {
      return res.status(403).json({ message: 'Only faculty can update quizzes.' });
    }

    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found.' });
    }

    if (quiz.faculty.toString() !== faculty._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized to update this quiz.' });
    }

    if (!title || !String(title).trim()) {
      return res.status(400).json({ message: 'Quiz title is required.' });
    }

    const normalizedQuestions = Array.isArray(questions)
      ? questions.map((question) => normalizeQuestion(question))
      : [];

    if (normalizedQuestions.length === 0) {
      return res.status(400).json({ message: 'Add at least one valid question to the quiz.' });
    }

    const updatedQuiz = await Quiz.findByIdAndUpdate(
      req.params.id,
      {
        title: String(title).trim(),
        description: String(description || '').trim(),
        subject: String(subject || 'General').trim() || 'General',
        durationMinutes: Number(durationMinutes) || 15,
        status: status || quiz.status,
        assignedTo: Array.isArray(assignedTo) ? assignedTo : quiz.assignedTo,
        questions: normalizedQuestions,
      },
      { new: true }
    );

    res.json(updatedQuiz);
  } catch (error) {
    if (error.message && error.message.includes('Each question must')) {
      return res.status(400).json({ message: error.message });
    }
    next(error);
  }
};

const deleteQuiz = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const faculty = await Faculty.findOne({ user: userId });

    if (!faculty) {
      return res.status(403).json({ message: 'Only faculty can delete quizzes.' });
    }

    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found.' });
    }

    if (quiz.faculty.toString() !== faculty._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized to delete this quiz.' });
    }

    // Delete associated submissions
    await QuizSubmission.deleteMany({ quiz: quiz._id });
    await Quiz.findByIdAndDelete(req.params.id);

    res.json({ message: 'Quiz deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

const toggleQuizStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const userId = req.user.id;
    const faculty = await Faculty.findOne({ user: userId });

    if (!faculty) {
      return res.status(403).json({ message: 'Only faculty can update quiz status.' });
    }

    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found.' });
    }

    if (quiz.faculty.toString() !== faculty._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized to update this quiz.' });
    }

    if (!['draft', 'published', 'closed'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status.' });
    }

    quiz.status = status;
    await quiz.save();

    res.json(quiz);
  } catch (error) {
    next(error);
  }
};

const getQuizSubmissions = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const faculty = await Faculty.findOne({ user: userId });

    if (!faculty) {
      return res.status(403).json({ message: 'Only faculty can view submissions.' });
    }

    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found.' });
    }

    if (quiz.faculty.toString() !== faculty._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized to view these submissions.' });
    }

    const submissions = await QuizSubmission.find({ quiz: req.params.id })
      .populate({
        path: 'student',
        populate: {
          path: 'user',
          select: 'name email',
        },
      })
      .sort({ submittedAt: -1 });

    const enrichedSubmissions = submissions.map((submission) => ({
      _id: submission._id,
      studentName: submission.student?.user?.name || 'Unknown',
      studentEmail: submission.student?.user?.email || 'Unknown',
      score: submission.score,
      totalQuestions: submission.totalQuestions,
      percentage: Math.round((submission.score / Math.max(1, submission.totalQuestions)) * 100),
      submittedAt: submission.submittedAt,
      status: submission.status,
    }));

    res.json(enrichedSubmissions);
  } catch (error) {
    next(error);
  }
};

const getQuizStats = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const faculty = await Faculty.findOne({ user: userId });

    if (!faculty) {
      return res.status(403).json({ message: 'Only faculty can view quiz stats.' });
    }

    const totalQuizzes = await Quiz.countDocuments({ faculty: faculty._id });
    const publishedQuizzes = await Quiz.countDocuments({
      faculty: faculty._id,
      status: 'published',
    });
    const draftQuizzes = await Quiz.countDocuments({
      faculty: faculty._id,
      status: 'draft',
    });
    const closedQuizzes = await Quiz.countDocuments({
      faculty: faculty._id,
      status: 'closed',
    });

    const totalSubmissions = await QuizSubmission.countDocuments({
      quiz: { $in: await Quiz.find({ faculty: faculty._id }).distinct('_id') },
    });

    res.json({
      totalQuizzes,
      publishedQuizzes,
      draftQuizzes,
      closedQuizzes,
      totalSubmissions,
    });
  } catch (error) {
    next(error);
  }
};

const getStudentsForAssignment = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const faculty = await Faculty.findOne({ user: userId });

    if (!faculty) {
      return res.status(403).json({ message: 'Only faculty can view students for assignment.' });
    }

    // Get all students in the same department
    const students = await Student.find({ department: faculty.department })
      .populate('user', 'name email')
      .select('studentId semester batch cgpa')
      .sort({ studentId: 1 });

    const studentList = students.map((student) => ({
      _id: student._id,
      name: student.user?.name || 'Unknown',
      email: student.user?.email || '',
      studentId: student.studentId,
      semester: student.semester,
      batch: student.batch,
      cgpa: student.cgpa,
    }));

    res.json(studentList);
  } catch (error) {
    next(error);
  }
};

// Assign quiz to students (bulk)
const assignQuizToStudents = async (req, res, next) => {
  try {
    const { studentIds } = req.body;
    const userId = req.user.id;
    const faculty = await Faculty.findOne({ user: userId });

    if (!faculty) {
      return res.status(403).json({ message: 'Only faculty can assign quizzes.' });
    }

    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found.' });
    }

    if (quiz.faculty.toString() !== faculty._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized to assign this quiz.' });
    }

    if (!Array.isArray(studentIds) || studentIds.length === 0) {
      return res.status(400).json({ message: 'At least one student must be selected.' });
    }

    // Add new students to assignedTo array (avoid duplicates)
    const currentAssigned = new Set(quiz.assignedTo.map(id => id.toString()));
    const studentsToAdd = studentIds.filter(id => !currentAssigned.has(id.toString()));
    
    quiz.assignedTo = [...quiz.assignedTo, ...studentsToAdd];
    
    // Log assignment to history
    quiz.assignmentHistory.push({
      action: 'assigned',
      performedBy: faculty._id,
      details: `Assigned to ${studentsToAdd.length} student(s)`,
    });

    await quiz.save();

    res.json({
      message: `Quiz assigned to ${studentsToAdd.length} student(s).`,
      quiz,
    });
  } catch (error) {
    next(error);
  }
};

// Remove student from quiz assignment
const removeStudentFromQuiz = async (req, res, next) => {
  try {
    const { studentId } = req.params;
    const userId = req.user.id;
    const faculty = await Faculty.findOne({ user: userId });

    if (!faculty) {
      return res.status(403).json({ message: 'Only faculty can manage assignments.' });
    }

    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found.' });
    }

    if (quiz.faculty.toString() !== faculty._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized.' });
    }

    quiz.assignedTo = quiz.assignedTo.filter(id => id.toString() !== studentId);
    
    quiz.assignmentHistory.push({
      action: 'updated',
      performedBy: faculty._id,
      details: `Removed student from assignment`,
    });

    await quiz.save();

    res.json({ message: 'Student removed from quiz assignment.', quiz });
  } catch (error) {
    next(error);
  }
};

// Get detailed quiz analytics
const getQuizAnalytics = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const faculty = await Faculty.findOne({ user: userId });

    if (!faculty) {
      return res.status(403).json({ message: 'Only faculty can view analytics.' });
    }

    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found.' });
    }

    if (quiz.faculty.toString() !== faculty._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized.' });
    }

    const submissions = await QuizSubmission.find({ quiz: quiz._id, isLatestAttempt: true })
      .populate('student', '_id')
      .lean();

    const totalAssigned = quiz.assignedTo.length;
    const totalSubmitted = submissions.length;
    const totalNotSubmitted = totalAssigned - totalSubmitted;
    
    const scores = submissions.map(s => s.score);
    const percentages = submissions.map(s => s.percentage);
    
    const avgScore = scores.length > 0 ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2) : 0;
    const avgPercentage = percentages.length > 0 ? (percentages.reduce((a, b) => a + b, 0) / percentages.length).toFixed(2) : 0;
    const maxScore = scores.length > 0 ? Math.max(...scores) : 0;
    const minScore = scores.length > 0 ? Math.min(...scores) : 0;

    // Score distribution
    const distribution = {
      excellent: submissions.filter(s => s.percentage >= 80).length,
      good: submissions.filter(s => s.percentage >= 60 && s.percentage < 80).length,
      average: submissions.filter(s => s.percentage >= 40 && s.percentage < 60).length,
      poor: submissions.filter(s => s.percentage < 40).length,
    };

    res.json({
      quizTitle: quiz.title,
      totalQuestions: quiz.questions.length,
      totalAssigned,
      totalSubmitted,
      totalNotSubmitted,
      submissionRate: ((totalSubmitted / totalAssigned) * 100).toFixed(2),
      avgScore,
      maxScore,
      minScore,
      avgPercentage,
      scoreDistribution: distribution,
      submissions: submissions.map(s => ({
        studentId: s.student._id,
        score: s.score,
        percentage: s.percentage,
        timeSpentMinutes: s.timeSpentMinutes,
        submittedAt: s.submittedAt,
        attemptNumber: s.attemptNumber,
      })),
    });
  } catch (error) {
    next(error);
  }
};

// Get submission details including question responses
const getSubmissionDetails = async (req, res, next) => {
  try {
    const { submissionId } = req.params;
    const userId = req.user.id;
    const faculty = await Faculty.findOne({ user: userId });

    if (!faculty) {
      return res.status(403).json({ message: 'Only faculty can view submission details.' });
    }

    const submission = await QuizSubmission.findById(submissionId)
      .populate('quiz')
      .populate({
        path: 'student',
        populate: { path: 'user', select: 'name email' },
      });

    if (!submission) {
      return res.status(404).json({ message: 'Submission not found.' });
    }

    if (submission.quiz.faculty.toString() !== faculty._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized.' });
    }

    const detailedAnswers = submission.answers.map((answer, index) => {
      const question = submission.quiz.questions[index];
      return {
        questionIndex: index,
        questionText: question.question,
        options: question.options,
        correctAnswer: question.correctAnswer,
        studentAnswer: answer.selectedOption,
        isCorrect: answer.isCorrect,
        explanation: question.explanation,
      };
    });

    res.json({
      _id: submission._id,
      studentName: submission.student.user.name,
      studentEmail: submission.student.user.email,
      quizTitle: submission.quiz.title,
      score: submission.score,
      totalQuestions: submission.totalQuestions,
      percentage: submission.percentage,
      attemptNumber: submission.attemptNumber,
      timeSpentMinutes: submission.timeSpentMinutes,
      submittedAt: submission.submittedAt,
      answers: detailedAnswers,
      feedback: submission.feedback,
      reviewed: submission.reviewed,
    });
  } catch (error) {
    next(error);
  }
};

// Add feedback to submission
const addSubmissionFeedback = async (req, res, next) => {
  try {
    const { feedback } = req.body;
    const { submissionId } = req.params;
    const userId = req.user.id;
    const faculty = await Faculty.findOne({ user: userId });

    if (!faculty) {
      return res.status(403).json({ message: 'Only faculty can add feedback.' });
    }

    const submission = await QuizSubmission.findById(submissionId).populate('quiz');
    if (!submission) {
      return res.status(404).json({ message: 'Submission not found.' });
    }

    if (submission.quiz.faculty.toString() !== faculty._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized.' });
    }

    submission.feedback = feedback;
    submission.reviewed = true;
    submission.reviewedBy = faculty._id;
    await submission.save();

    res.json({ message: 'Feedback added successfully.', submission });
  } catch (error) {
    next(error);
  }
};

// Get all attempts by a student for a quiz
const getStudentAttempts = async (req, res, next) => {
  try {
    const { studentId } = req.params;
    const userId = req.user.id;
    const faculty = await Faculty.findOne({ user: userId });

    if (!faculty) {
      return res.status(403).json({ message: 'Only faculty can view student attempts.' });
    }

    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found.' });
    }

    if (quiz.faculty.toString() !== faculty._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized.' });
    }

    const submissions = await QuizSubmission.find({
      quiz: quiz._id,
      student: studentId,
    }).sort({ attemptNumber: 1 });

    const attempts = submissions.map(submission => ({
      _id: submission._id,
      attemptNumber: submission.attemptNumber,
      score: submission.score,
      totalQuestions: submission.totalQuestions,
      percentage: submission.percentage,
      timeSpentMinutes: submission.timeSpentMinutes,
      submittedAt: submission.submittedAt,
      reviewed: submission.reviewed,
      feedback: submission.feedback,
    }));

    res.json({
      quizTitle: quiz.title,
      maxAttempts: quiz.maxAttempts,
      attempts,
      bestScore: Math.max(...attempts.map(a => a.score), 0),
      averageScore: (attempts.reduce((sum, a) => sum + a.score, 0) / attempts.length).toFixed(2),
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTeacherQuizzes,
  getStudentQuizzes,
  createQuiz,
  submitQuiz,
  getQuiz,
  updateQuiz,
  deleteQuiz,
  toggleQuizStatus,
  getQuizSubmissions,
  getQuizStats,
  getStudentsForAssignment,
  assignQuizToStudents,
  removeStudentFromQuiz,
  getQuizAnalytics,
  getSubmissionDetails,
  addSubmissionFeedback,
  getStudentAttempts,
};
