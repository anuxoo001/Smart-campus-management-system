# Quick Reference: Quiz Management Features

## 🎯 What's New

### Teacher Features
- Create, edit, delete quizzes
- View student submissions and scores
- Toggle quiz status (publish/draft/close)
- Statistics overview (total, published, submissions)

### Backend Endpoints
```
GET  /quizzes/teacher/quizzes       - List all quizzes
GET  /quizzes/teacher/stats         - Get stats
GET  /quizzes/teacher/:id           - Get quiz details
POST /quizzes                        - Create quiz
PUT  /quizzes/teacher/:id           - Update quiz
DELETE /quizzes/teacher/:id         - Delete quiz
PUT  /quizzes/teacher/:id/status    - Change status
GET  /quizzes/:id/submissions       - View submissions
```

## 📝 Quiz Data Structure

```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  subject: String,
  faculty: ObjectId (ref: Faculty),
  durationMinutes: Number,
  status: 'draft' | 'published' | 'closed',
  questions: [
    {
      question: String,
      options: [String],
      correctAnswer: String,
      explanation: String
    }
  ],
  assignedTo: [ObjectId],
  timestamps: true
}
```

## 🔧 API Usage Examples

### Create Quiz
```javascript
const response = await api.post('/quizzes', {
  title: 'Math Quiz',
  description: 'Chapter 5 Assessment',
  subject: 'Mathematics',
  durationMinutes: 30,
  status: 'published',
  questions: [
    {
      question: 'What is 2+2?',
      options: ['2', '3', '4', '5'],
      correctAnswer: '4',
      explanation: 'Basic addition'
    }
  ]
});
```

### Get Submissions
```javascript
const submissions = await api.get('/quizzes/:id/submissions');
// Returns array of {studentName, studentEmail, score, totalQuestions, percentage, submittedAt}
```

### Update Quiz Status
```javascript
await api.put(`/quizzes/teacher/:id/status`, { status: 'closed' });
// status: 'draft' | 'published' | 'closed'
```

## 📂 Modified Files

1. **Backend**
   - `controllers/quizController.js` - 10 functions (6 new)
   - `routes/quizRoutes.js` - 8 routes (7 new)

2. **Frontend**
   - `src/TeacherDashboard.jsx` - Complete rewrite with tabs
   - `src/services/endpoints.js` - Added quizTeacherAPI & quizStudentAPI

## 🎯 Component Structure

### TeacherDashboard
- Tabs: Overview | Assignments | Quizzes
- Overview: Statistics cards (8 metrics)
- Assignments: Full assignment management
- Quizzes: Full quiz management with submissions viewer

## 📊 Statistics Available

```javascript
{
  totalQuizzes: Number,
  publishedQuizzes: Number,
  draftQuizzes: Number,
  closedQuizzes: Number,
  totalSubmissions: Number
}
```

## ✅ Validation Rules

- Quiz title: Required
- Questions: Minimum 1
- Each question: Must have text, 2+ options, correct answer
- Correct answer: Must match one of the options
- Duration: 5-999 minutes (suggested: 15-60)

## 🔐 Authorization

- Only faculty can create/edit/delete quizzes
- Only quiz creator can modify their quiz
- Students can only view published quizzes
- Submissions automatically linked to quiz creator

## 🚀 Testing Checklist

- [ ] Create quiz with 3-5 questions
- [ ] Edit quiz and change a question
- [ ] Delete quiz and verify submissions removed
- [ ] View quiz submissions
- [ ] Toggle quiz status (publish → close → open)
- [ ] Try accessing quiz as student
- [ ] Submit quiz and verify score calculation

## 📌 Common Issues & Fixes

| Issue | Cause | Fix |
|-------|-------|-----|
| Can't create quiz | Missing required fields | Fill all * fields |
| Can't edit quiz | Not the creator | Login as original creator |
| Submissions empty | Quiz not published | Publish quiz first |
| Wrong score | Incorrect answer mismatch | Check case sensitivity |
| 403 Unauthorized | Not faculty role | Login as faculty/teacher |

## 💾 Database Cascade

- Deleting quiz → Deletes all submissions
- Cannot undo deletion → Add confirmation prompt

## 📱 Frontend States

- `showCreateQuizForm`: Toggle quiz creation form
- `editingQuiz`: Track which quiz is being edited
- `showQuizSubmissions`: Track which quiz submissions are shown
- `quizFormData`: Form state with questions array
- `loading`: Disable submit button during save

## 🔄 Data Flow

```
TeacherDashboard
├── Fetch stats (useEffect)
├── Fetch quizzes (useEffect)
├── Quiz Tab
│   ├── Show form if showCreateQuizForm
│   ├── List all quizzes
│   ├── Actions: View Submissions, Edit, Delete, Toggle Status
│   └── Submissions modal (if showQuizSubmissions)
└── Update data on any action
```

## 📚 Related Documentation

- Full implementation: `QUIZ_FEATURES_IMPLEMENTATION.md`
- API endpoints: Backend routes documentation
- Quiz model: `models/Quiz.js` and `models/QuizSubmission.js`
- Teacher setup: Smart Campus setup guide

---

**Last Updated:** August 17, 2026  
**Status:** Production Ready ✅
