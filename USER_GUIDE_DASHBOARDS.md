# 📚 Complete User Guide - Teacher & Student Dashboards

## 🎯 Quick Start

### Server URLs
- **Frontend**: http://localhost:5175
- **Backend API**: http://localhost:5000
- **Database**: MongoDB (localhost:27017)

### Test Credentials
```
ADMIN LOGIN:
Email: admin@campus.edu
Password: admin123

FACULTY LOGIN:
Email: rajesh.kumar@campus.edu
Password: faculty123
Email: priya.sharma@campus.edu
Password: faculty123

STUDENT LOGIN:
Email: aaa.verma@campus.edu
Password: student123
Email: rohan.gupta@campus.edu
Password: student123
(5 student accounts available)
```

---

## 🏫 TEACHER DASHBOARD - Complete Guide

### Access & Login
1. Navigate to http://localhost:5175
2. Enter faculty credentials
3. Click "Teacher Dashboard" or similar navigation
4. You'll see 11 tabs at the top

### Tab 1: 📊 Overview
**What You See**:
- 4 stat cards showing:
  - Total Assignments
  - Pending Submissions
  - Total Students
  - Number of Subjects
- Quick action buttons

**What You Can Do**:
- Get quick stats on your class status
- Jump to any feature via buttons
- Track important metrics at a glance

**Try This**:
1. Look at the stat cards
2. Click on "Mark Attendance" button to jump to attendance tab
3. Click "Enter Marks" to jump to marks tab

---

### Tab 2: ✓ Attendance Management
**What You See**:
- Form to mark attendance
- Attendance history list (below form)

**What You Can Do**:
1. Select date for attendance
2. Select subject
3. Select semester
4. Mark each student as Present/Absent/Late
5. Submit to save

**Sample Data**:
- 15 existing attendance records in database
- Multiple dates covered
- Shows attendance tracking

**Try This**:
1. Toggle "Mark Attendance" button
2. Fill in the form
3. Mark students with different statuses
4. Click "Submit Attendance"
5. View the record in the list below

---

### Tab 3: 📝 Marks/Grading System
**What You See**:
- Form to enter marks
- Table for bulk mark entry
- Marks history list

**What You Can Do**:
1. Select subject for marking
2. Select exam type (Unit Test, Midterm, Final)
3. Enter marks for multiple students at once
4. Save marks
5. View all previously entered marks

**Sample Data**:
- 30 marks records in database
- Different exam types
- Multiple subjects covered

**Try This**:
1. Toggle "Enter Marks" button
2. Select "Data Structures" as subject
3. Select "Midterm" as exam type
4. Fill in marks for students (0-100)
5. Click "Save Marks"
6. See record appear in history below

---

### Tab 4: 📅 Class Schedule/Timetable
**What You See**:
- Form to add schedule
- Schedule list showing all classes

**What You Can Do**:
1. Add a new class schedule
2. Select subject
3. Choose day (Monday-Saturday)
4. Set start and end times
5. Specify room number
6. Mark classes as completed
7. View your week's schedule

**Sample Data**:
- 6 existing schedules:
  - Dr. Rajesh: Data Structures (Mon, Wed, Fri)
  - Dr. Priya: Database Systems (Tue, Thu)
  - Prof. Amit: Digital Electronics (Mon)

**Schedule Format**:
```
Data Structures
Monday | 09:00 - 10:30 | Room: A101 | Upcoming
Wednesday | 10:45 - 12:15 | Room: A101 | Upcoming
Friday | 14:00 - 15:30 | Room: Lab-1 | Upcoming
```

**Try This**:
1. Click "+ Add Schedule"
2. Select "Data Structures" subject
3. Choose "Thursday" day
4. Set time 13:00 to 14:30
5. Enter "A102" as room
6. Click "Add Schedule"
7. New schedule appears in list

---

### Tab 5: 📚 Learning Materials
**What You See**:
- Form to upload materials
- Materials library showing all resources

**What You Can Do**:
1. Upload course materials (title, description, type)
2. Choose material type: PDF, Video, Document, Link, Image
3. Add category/chapter info
4. Provide file URL or upload file
5. Set visibility (public/private)
6. Track downloads

**Sample Data**:
- 5 materials already uploaded:
  1. "Data Structures Fundamentals" (PDF) - 45 downloads
  2. "Algorithms in Action" (Video) - 32 downloads
  3. "Database Design Principles" (Document) - 28 downloads
  4. "SQL Query Optimization" (PDF) - 19 downloads
  5. "Web Development Stack Overview" (Link) - 67 downloads

**Material Types**:
- 📄 PDF - Document files
- 🎬 Video - Video lectures
- 📋 Document - Word, PPT files
- 🔗 Link - External resources
- 🖼️ Image - Diagrams, images

**Try This**:
1. Click "+ Upload Material"
2. Title: "Advanced Data Structures"
3. Description: "Advanced topics in DSA"
4. Type: "Video"
5. Category: "Chapter 3"
6. URL: "https://example.com/video.mp4"
7. Click "Upload"
8. Material appears in library

---

### Tab 6: 🧪 Exam Management
**What You See**:
- Form to create exams
- Exam schedule showing all exams

**What You Can Do**:
1. Create new exam with title
2. Set exam date
3. Set start and end times
4. Set duration
5. Set total marks
6. Choose exam type (Unit Test, Midterm, Final, Quiz)
7. Specify room
8. Track exam status

**Sample Data**:
- 4 exams already created:
  1. "Unit Test 1 - Data Structures" (Aug 31, 10:00-11:30)
  2. "Mid-Semester Exam - Data Structures" (Sep 16, 09:00-11:00)
  3. "Quiz 1 - Database Systems" (Aug 24, 14:00-14:30)
  4. "Web Development Project Evaluation" (Sep 7, 10:00-13:00)

**Exam Types**:
- 🎯 Unit Test - Short assessment
- 📚 Midterm - Mid-semester examination
- 🏆 Final - End-of-semester exam
- ❓ Quiz - Quick quiz

**Status Types**:
- 📋 Scheduled - Not yet started
- ⏳ Ongoing - Currently happening
- ✅ Completed - Exam finished

**Try This**:
1. Click "+ Create Exam"
2. Title: "Assignment Test"
3. Date: (pick a future date)
4. Time: 15:00 to 15:45
5. Duration: 45 minutes
6. Total Marks: 30
7. Type: "Quiz"
8. Room: "Online"
9. Click "Create Exam"
10. Exam appears in list with "scheduled" status

---

### Tab 7: 👥 Student Roster
**What You See**:
- Table with all students in your class
- Each row shows: Student ID, Name, Email, Phone, Batch

**What You Can Do**:
1. View all enrolled students
2. See student contact information
3. Click "View" to see individual student details
4. Export roster (feature ready)

**Sample Data**:
```
CS-18-204 | Aisha Verma | aaa.verma@campus.edu | 9876543220 | 2020
CS-18-205 | Rohan Gupta | rohan.gupta@campus.edu | 9876543221 | 2020
CS-18-206 | Priya Sharma | priya.student@campus.edu | 9876543222 | 2020
EC-18-301 | Arjun Singh | arjun.singh@campus.edu | 9876543223 | 2020
ME-18-401 | Sneha Das | sneha.das@campus.edu | 9876543224 | 2021
```

**Try This**:
1. Look at the roster table
2. Click "View" on any student to see details
3. Note the student ID and batch information
4. Check contact methods

---

### Tab 8: 💬 Class Forum
**What You See**:
- Form to create forum posts
- Discussion threads list

**What You Can Do**:
1. Create discussion posts
2. Post announcements
3. Answers can be marked as solutions
4. Like/upvote posts
5. Reply to discussions
6. Pin important posts
7. Categorize posts

**Post Categories**:
- ❓ Question - Questions from class
- 💬 Discussion - Open discussion
- 📢 Announcement - Important notices
- 📚 Resource - Useful materials/links

**Sample Data**:
- 4 forum posts:
  1. "How to optimize tree traversal?" (Question) - 2 replies
  2. "Assignment 2 Submission Deadline Extended" (Announcement) - Pinned
  3. "Database Design Best Practices Discussion" (Discussion) - 2 replies
  4. "MERN Stack Resources" (Resource) - Pinned

**Try This**:
1. Click "+ Create Post"
2. Title: "Web Development Tips"
3. Content: "Share your best practices for web dev"
4. Category: "Discussion"
5. Click "Post"
6. Your post appears in forum
7. Students can reply and like it

---

### Tab 9: 📣 Announcements
**What You See**:
- Form to broadcast announcements
- Important info section

**What You Can Do**:
1. Create class-wide announcements
2. Set priority level (Normal, Urgent, Important)
3. Automatically send email to all students
4. Pin announcements
5. Mark as important
6. Students receive email notifications

**Priority Levels**:
- 🟢 Normal - Regular announcements
- 🟡 Important - Should be noted
- 🔴 Urgent - Requires immediate attention

**Try This**:
1. Click "+ Create Announcement"
2. Title: "Important: Exam Format Changed"
3. Message: "Please note the new exam format for next unit test"
4. Priority: "Urgent"
5. Click "Post Announcement"
6. All students get email

---

### Tab 10: 📈 Analytics
**What You See**:
- Pie chart of grade distribution
- Performance statistics
- Visual analytics

**Grade Distribution Shows**:
- 🟢 A Grade (90+)
- 🟡 B Grade (80-89)
- 🟠 C Grade (70-79)
- 🔴 D Grade (60-69)
- ❌ F Grade (< 60)

**Statistics Displayed**:
- Average Score percentage
- Average Attendance percentage
- Assignment Completion Rate

**Try This**:
1. Go to Analytics tab
2. Review pie chart
3. Check stat cards
4. Understand class performance at a glance
5. Identify areas needing improvement

---

### Tab 11: ✋ Leave Requests
**What You See**:
- List of student leave requests
- Request status (pending, approved, rejected)

**What You Can Do**:
1. View all leave requests from students
2. See student name and request duration
3. Read leave reason
4. Approve or Reject with remarks
5. Send email notification to student
6. View approval history

**Request Status**:
- ⏳ Pending - Awaiting decision
- ✅ Approved - Leave granted
- ❌ Rejected - Leave denied

**Try This**:
1. Go to Leave Requests tab
2. Find a pending request
3. Click "Approve" or "Reject"
4. Add remarks (optional)
5. Student receives email notification
6. Status updates

---

## 👨‍🎓 STUDENT DASHBOARD - Complete Guide

### Access & Login
1. Navigate to http://localhost:5175
2. Enter student credentials
3. Click "Student Dashboard"
4. You'll see 10 tabs showing your academic info

### Tab 1: 📊 Overview
**What You See**:
- 4 stat cards:
  - Number of Courses enrolled
  - Pending Assignments
  - Average Grade
  - Overall Attendance percentage
- Upcoming Events list
- Recent Announcements

**Try This**:
1. Check your overall stats
2. See what's due soon
3. Read class announcements

---

### Tab 2: ✓ Attendance
**What You See**:
- Overall attendance percentage
- Attendance by subject breakdown
- Requirements (75% minimum for exams)

**Try This**:
1. Check your attendance in each subject
2. See which classes you might be missing
3. Plan attendance to meet 75% requirement

---

### Tab 3: 📊 Marks
**What You See**:
- Table of all marks received
- Subject, exam type, marks, percentage
- Grade for each exam

**Marks Table Shows**:
- Subject name
- Exam type (Quiz, Midterm, Assignment)
- Marks obtained
- Total marks
- Percentage (calculated)
- Grade (A, B, C, D, F)

**Try This**:
1. Review all your marks
2. Compare subjects
3. Identify strengths and weaknesses
4. Check grade improvement over time

---

### Tab 4: 📅 Schedule
**What You See**:
- Your class schedule
- Time and room for each class
- Completion status

**Schedule Card Shows**:
- Day of week
- Subject name
- Time (start - end)
- Room number
- Status (Upcoming/Completed)

**Try This**:
1. Check when your classes are
2. Note down room numbers
3. Plan your day around class times
4. See which classes are upcoming

---

### Tab 5: 📝 Assignments
**What You See**:
- All assignments from your courses
- Assignment filters (All, Pending, Submitted, Graded)
- Status of each assignment

**Assignment Card Shows**:
- Assignment title
- Status badge (Pending, Submitted, Graded)
- Description
- Subject and Faculty
- Due date
- Submit button (if pending)
- Grade (if graded)

**Try This**:
1. Click "Pending" filter
2. See assignments due soon
3. Click "Submit Assignment"
4. Choose file to submit
5. Status changes to "Submitted"

---

### Tab 6: 🧪 Exams
**What You See**:
- List of exams you need to take
- Exam details and status

**Exam Card Shows**:
- Exam title
- Subject name
- Date and time
- Duration
- Total marks
- Room number
- Status badge

**Try This**:
1. Review all upcoming exams
2. Note dates and times
3. Check duration and marks
4. Plan exam preparation

---

### Tab 7: 📚 Learning Materials
**What You See**:
- Course materials uploaded by faculty
- Search by subject or category
- Download count

**Material Card Shows**:
- Title
- Type (PDF, Video, Document, Link)
- Description
- Subject and Faculty
- Download count
- Download button

**Try This**:
1. Browse materials by subject
2. Click "Download" to access
3. Save resources for study
4. Find lecture notes and reference materials

---

### Tab 8: 💬 Forum
**What You See**:
- Class discussion forum
- Discussion threads
- Pinned important posts
- Announcements

**Forum Post Shows**:
- Title
- Author (faculty or student)
- Category (Question, Discussion, Announcement)
- Preview of content
- Reply count and likes
- Pinned indicator if important

**Try This**:
1. Read announcements (check pinned)
2. Look for Q&A posts
3. Find resources shared
4. Participate in discussions

---

### Tab 9: ✋ Leave Management
**What You See**:
- Form to apply for leave
- Your leave request history

**What You Can Do**:
1. Click "+ Apply for Leave"
2. Select start date
3. Select end date
4. Write reason
5. Submit request
6. Get email when approved/rejected

**Leave Request Shows**:
- From and To dates
- Reason for leave
- Status (Pending, Approved, Rejected)
- Faculty response if any

**Try This**:
1. Click "+ Apply for Leave"
2. From Date: Pick a date
3. To Date: Pick an end date
4. Reason: "Family event" or "Medical"
5. Click "Submit Request"
6. Faculty will approve/reject
7. Check status in history table

---

### Tab 10: 📈 Analytics
**What You See**:
- Line chart of grade progress
- Bar chart of marks by subject
- Personal statistics

**Charts Show**:
1. **Grade Progress**: Your marks over time
   - Shows trend of improvement
   - Helps identify patterns
   
2. **Marks by Subject**: Performance in each subject
   - Compare subjects
   - Identify best and weakest subjects

3. **Statistics Cards**:
   - Current CGPA
   - Average marks
   - Attendance percentage
   - Rank in class

**Try This**:
1. Review grade progress line
2. See which subjects you excel in
3. Note your CGPA
4. Check your class rank
5. Plan improvement strategy

---

## 📱 Common Tasks & How-To

### How to Submit an Assignment (Student)
```
1. Go to Student Dashboard
2. Click "Assignments" tab
3. Find pending assignment
4. Click "Submit Assignment"
5. Choose your file
6. Add any notes
7. Click "Submit"
8. Status changes to "Submitted"
9. Wait for faculty to grade
10. Check "Graded" tab for feedback
```

### How to Mark Attendance (Faculty)
```
1. Go to Teacher Dashboard
2. Click "Attendance" tab
3. Click "+ Mark Attendance"
4. Select date
5. Select subject
6. Mark each student:
   - Present (✓)
   - Absent (✗)
   - Late (L)
7. Click "Submit Attendance"
8. Record saved in database
```

### How to Enter Marks (Faculty)
```
1. Go to Teacher Dashboard
2. Click "Marks" tab
3. Click "+ Enter Marks"
4. Select subject
5. Select exam type
6. Fill marks for each student (0-100)
7. Click "Save Marks"
8. Students can view immediately
9. System auto-calculates grades
```

### How to Create an Exam (Faculty)
```
1. Go to Teacher Dashboard
2. Click "Exams" tab
3. Click "+ Create Exam"
4. Fill exam details:
   - Title: "Unit Test 1"
   - Date: Pick date
   - Time: 10:00 to 11:30
   - Duration: 90 minutes
   - Total Marks: 50
   - Type: Unit Test
   - Room: A101
5. Click "Create Exam"
6. All students get notified
7. Appears in their exam list
```

### How to Apply for Leave (Student)
```
1. Go to Student Dashboard
2. Click "Leave" tab
3. Click "+ Apply for Leave"
4. From Date: Select start
5. To Date: Select end
6. Reason: Explain why
7. Click "Submit Request"
8. Faculty reviews
9. You get email notification
10. Check history for status
```

### How to Upload Materials (Faculty)
```
1. Go to Teacher Dashboard
2. Click "Materials" tab
3. Click "+ Upload Material"
4. Title: Course notes or lecture name
5. Description: Brief info
6. Type: PDF/Video/Document/Link
7. Category: Chapter number or topic
8. File URL: Link to resource
9. Visibility: Public/Private
10. Click "Upload"
11. Students can download
```

---

## 🎯 Best Practices

### For Faculty
1. ✅ Mark attendance regularly (within 24 hours of class)
2. ✅ Enter marks soon after exams (students can see)
3. ✅ Create exam schedule in advance
4. ✅ Upload materials at start of topic
5. ✅ Post announcements for important changes
6. ✅ Respond to leave requests promptly
7. ✅ Use forum to address common questions
8. ✅ Review analytics to identify struggling students

### For Students
1. ✅ Maintain 75%+ attendance
2. ✅ Submit assignments before deadline
3. ✅ Download materials early and study
4. ✅ Participate in forum discussions
5. ✅ Check announcements regularly
6. ✅ Track your grades
7. ✅ Plan ahead for exams
8. ✅ Ask questions in forum if confused

---

## 🔧 Technical Details

### API Endpoints Used
- Faculty endpoints for teacher dashboard
- Student endpoints for student dashboard
- Authentication endpoints for login/logout
- Material endpoints for downloads
- Exam endpoints for scheduling
- Forum endpoints for discussions
- Leave endpoints for requests

### Data Storage
- All data stored in MongoDB
- Seeded with 70+ test records
- Automatically timestamped
- Soft deletes where applicable

### Email Notifications
- Registration confirmation
- Assignment deadlines
- Exam schedules
- Leave request status
- Grade notifications
- Announcement broadcasts

---

## 💡 Tips & Tricks

1. **Keyboard Shortcuts**: Use Tab to move between form fields
2. **Filters**: Use status filters to quickly find what you need
3. **Export**: Most tables can be exported (feature ready)
4. **Search**: Use search to quickly find materials or students
5. **Mobile**: Dashboards are responsive for mobile viewing
6. **Notifications**: Email provides notifications of important events
7. **Charts**: Hover over charts for detailed information
8. **Sorting**: Click column headers to sort tables

---

## ❓ FAQ

**Q: How do I reset my password?**
A: Contact admin or use "Forgot Password" link (feature ready)

**Q: Can I change my profile information?**
A: Yes, go to Settings/Profile page (feature ready)

**Q: Where can I see my grades?**
A: Student Dashboard → Marks tab

**Q: How do I know exam schedule?**
A: Check Announcements or Exams tab

**Q: Can I change assignment after submission?**
A: Contact faculty - may be allowed before deadline

**Q: How is attendance calculated?**
A: (Present days / Total class days) × 100 = Percentage

**Q: What's the minimum attendance required?**
A: 75% attendance required to take final exams

**Q: How are grades calculated?**
A: Based on exam marks and internal assessments

---

## 🎓 Sample Workflows

### Faculty Workflow - First Day of Class
```
1. Login to dashboard
2. Check student roster
3. Upload first day materials
4. Post welcome announcement
5. Create first assignment
6. Set up class schedule
7. Post introduction forum post
8. Send welcome emails
```

### Student Workflow - Day 1
```
1. Login to dashboard
2. Check overview for important info
3. Read announcements
4. Note class schedule
5. Download materials
6. Check first assignment
7. Introduce yourself in forum
8. Check first exam date
```

---

## 📞 Getting Help

- **For Technical Issues**: Check server status
- **For Feature Questions**: Refer to specific tab guide
- **For Data Questions**: Check sample data section
- **For Account Issues**: Contact admin

---

**Version**: 1.0.0  
**Last Updated**: August 18, 2026  
**Created for**: Smart Campus Management Platform
