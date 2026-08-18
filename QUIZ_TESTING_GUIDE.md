# Quiz Features - Testing & Development Guide

**Last Updated:** August 17, 2026

## 🚀 Quick Start

### Prerequisites
```bash
# Backend should be running
cd backend && npm start

# Frontend should be running (in another terminal)
cd frontend && npm run dev
```

### Default Test Credentials
- **Faculty**: rajesh.kumar@campus.edu / faculty123
- **Student**: student@campus.edu / student123

---

## 📋 Manual Testing Steps

### 1. Test Quiz Creation

**Login as Faculty**
```
1. Open http://localhost:5173
2. Click "Teacher Login"
3. Enter: rajesh.kumar@campus.edu / faculty123
4. Click "Sign In"
```

**Create Quiz**
```
1. Click "Quizzes" tab on teacher dashboard
2. Click "+ Create New Quiz"
3. Fill form:
   - Title: "Mid-term Assessment"
   - Subject: "Data Structures"
   - Duration: 30 minutes
   - Description: "Test your understanding of DSA concepts"
4. Add questions (at least 1):
   - Q1: "What is a stack?"
   - Options: ["LIFO", "FIFO", "Random", "Queue"]
   - Correct: "LIFO"
   - Explanation: "Stack follows Last-In-First-Out principle"
5. Add more questions as needed
6. Click "Publish Quiz"
```

### 2. Test Quiz Editing

**Edit Existing Quiz**
```
1. Click "Quizzes" tab
2. Find quiz you created
3. Click ✏️ (Edit button)
4. Change some details:
   - Change duration to 45 minutes
   - Modify a question
   - Add new question
5. Click "Update Quiz"
6. Verify changes saved
```

### 3. Test Quiz Status Management

**Publish/Close Quiz**
```
1. Find a quiz in published status
2. Click 🔒 (Close button)
3. Verify status changes to "closed"
4. Click 🔓 (Reopen button)
5. Verify status back to "published"
```

### 4. Test Quiz Deletion

**Delete Quiz**
```
1. Find a quiz to delete
2. Click 🗑️ (Delete button)
3. Confirm deletion in popup
4. Verify quiz removed from list
5. (This also cascades delete all submissions)
```

### 5. Test View Submissions

**As Faculty - View Quiz Submissions**
```
1. Find a quiz (should have at least some submissions)
2. Click 📊 (View Submissions button)
3. See table with:
   - Student names
   - Email addresses
   - Score (e.g., 7/10)
   - Percentage (e.g., 70%)
   - Submission time
4. Click "Close" to hide submissions
```

### 6. Test Student Quiz Taking

**As Student - Take Quiz**
```
1. Logout and login as student: student@campus.edu / student123
2. Navigate to Quizzes section
3. Find available (published) quizzes
4. Click quiz to open
5. Answer questions (select options)
6. Click "Submit Quiz"
7. View score and results
```

---

## 🧪 API Testing (Postman/cURL)

### Test Endpoints

#### Create Quiz
```bash
curl -X POST http://localhost:5000/api/quizzes \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Quiz",
    "description": "Testing API",
    "subject": "Testing",
    "durationMinutes": 30,
    "status": "published",
    "questions": [
      {
        "question": "Test question?",
        "options": ["A", "B", "C", "D"],
        "correctAnswer": "A"
      }
    ]
  }'
```

#### Get All Quizzes
```bash
curl -X GET http://localhost:5000/api/quizzes/teacher/quizzes \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Get Quiz Stats
```bash
curl -X GET http://localhost:5000/api/quizzes/teacher/stats \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Get Quiz Submissions
```bash
curl -X GET http://localhost:5000/api/quizzes/QUIZ_ID/submissions \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Update Quiz
```bash
curl -X PUT http://localhost:5000/api/quizzes/teacher/QUIZ_ID \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated Title",
    "durationMinutes": 45,
    "questions": [...]
  }'
```

#### Toggle Status
```bash
curl -X PUT http://localhost:5000/api/quizzes/teacher/QUIZ_ID/status \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "closed"}'
```

#### Delete Quiz
```bash
curl -X DELETE http://localhost:5000/api/quizzes/teacher/QUIZ_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🐛 Debugging

### Enable Verbose Logging

**Backend (Node.js)**
```bash
# Add to .env
DEBUG=quiz:*
```

**Frontend (Browser Console)**
```javascript
// Check local storage
localStorage.getItem('smartCampusToken')

// Monitor API calls
// Open Network tab in DevTools
```

### Common Issues

**Issue: Quiz creation fails with "Unauthorized"**
```
Solution:
1. Check if logged in as faculty
2. Verify JWT token in localStorage
3. Check if token not expired
4. Make sure Authorization header is correct
```

**Issue: Can't see submitted quizzes as student**
```
Solution:
1. Verify quiz status is "published"
2. Check if current user is student
3. Verify quiz wasn't deleted
4. Clear browser cache/storage
```

**Issue: Edit button doesn't work**
```
Solution:
1. Verify you're logged in as quiz creator
2. Check browser console for errors
3. Verify quiz ID is correct
4. Check if quiz exists
```

**Issue: Submissions showing wrong scores**
```
Solution:
1. Verify correct answer matches an option exactly
2. Check case sensitivity (should be case-insensitive)
3. Verify student selected correct answer
4. Check quiz submission data in DB
```

---

## 📊 Performance Testing

### Load Testing Checklist
- [ ] Create 50+ quizzes
- [ ] Add 20+ questions per quiz
- [ ] Create 100+ submissions
- [ ] Verify list loading time < 2s
- [ ] Verify submission table renders smoothly

### Browser Console Monitoring
```javascript
// Monitor rendering time
console.time('Quiz List Render');
// ... action ...
console.timeEnd('Quiz List Render');

// Monitor API response time
console.time('API Call');
// ... fetch ...
console.timeEnd('API Call');
```

---

## 🔒 Security Testing

### Authorization Tests
```javascript
// Test: Non-faculty cannot create quiz
// Expected: 403 Forbidden

// Test: Student cannot edit quiz
// Expected: 403 Forbidden

// Test: Faculty cannot edit other's quiz
// Expected: 403 Forbidden
```

### Input Validation Tests
```javascript
// Test: Empty title
// Expected: Error "Quiz title is required"

// Test: 0 questions
// Expected: Error "Add at least one valid question"

// Test: Correct answer not in options
// Expected: Error "The correct answer must match one of the options"
```

---

## 📈 Feature Coverage Checklist

### Dashboard
- [ ] Overview tab shows quiz stats
- [ ] Quiz tab loads quizzes
- [ ] Assignment tab still works
- [ ] Tab switching works smoothly

### Quiz Management
- [ ] Create quiz with multiple questions
- [ ] Edit existing quiz
- [ ] Delete quiz (with confirmation)
- [ ] Toggle status (publish/close/reopen)
- [ ] View submissions

### Quiz Form
- [ ] Add question button works
- [ ] Remove question works (min 1)
- [ ] Update question fields
- [ ] Update option fields
- [ ] Set correct answer
- [ ] Add explanation
- [ ] Form validation works

### Submissions View
- [ ] Submissions modal shows
- [ ] Student names display
- [ ] Scores calculate correctly
- [ ] Percentages format properly
- [ ] Dates display correctly
- [ ] Close button works

---

## 📝 Test Scenarios

### Scenario 1: Complete Quiz Workflow
```
1. Faculty creates quiz ✓
2. Quiz published ✓
3. Student sees quiz ✓
4. Student takes quiz ✓
5. Student submits ✓
6. Faculty views submissions ✓
7. Faculty sees correct score ✓
```

### Scenario 2: Quiz Editing
```
1. Faculty creates quiz ✓
2. Faculty edits quiz ✓
3. Changes saved ✓
4. New students see updated version ✓
5. Existing submissions unchanged ✓
```

### Scenario 3: Quiz Lifecycle
```
1. Create (draft) ✓
2. Publish ✓
3. Students take quiz ✓
4. Close quiz ✓
5. Students can't take closed quiz ✓
6. Reopen quiz ✓
7. Delete quiz ✓
8. Submissions cascade deleted ✓
```

---

## 📊 Database Inspection

### MongoDB Queries

**View all quizzes**
```javascript
db.quizzes.find().pretty()
```

**View quiz submissions**
```javascript
db.quizsubmissions.find().pretty()
```

**Count submissions per quiz**
```javascript
db.quizsubmissions.aggregate([
  { $group: { _id: "$quiz", count: { $sum: 1 } } }
])
```

**View specific quiz with questions**
```javascript
db.quizzes.findOne({ title: "Your Quiz Title" })
```

---

## ✅ Production Checklist

Before deploying to production:
- [ ] All tests pass
- [ ] No console errors
- [ ] API responses correct
- [ ] Authorization working
- [ ] Cascade deletion verified
- [ ] Performance acceptable
- [ ] UI responsive
- [ ] Error messages clear
- [ ] No sensitive data exposed
- [ ] Rate limiting in place

---

## 📞 Support Resources

- **Backend Docs**: See quizController.js comments
- **Frontend Docs**: See TeacherDashboard.jsx comments
- **Database Schema**: See models/Quiz.js
- **API Routes**: See routes/quizRoutes.js

---

**Status:** Ready for Testing ✅
