export const dashboardStats = [
  { label: 'Total Students', value: '1,280', trend: '+8.2%', icon: '🎓', type: 'Students' },
  { label: 'Faculty', value: '96', trend: '+3.4%', icon: '👩‍🏫', type: 'Faculty' },
  { label: 'Attendance', value: '92%', trend: '+4.1%', icon: '📅', type: 'System' },
  { label: 'Placement', value: '79%', trend: '+6.7%', icon: '💼', type: 'Jobs' },
  { label: 'Assignments', value: '148', trend: '+14%', icon: '📝', type: 'Tasks' },
  { label: 'Notices', value: '19', trend: '+2', icon: '📣', type: 'Alerts' },
];

export const studentPerformance = [
  { term: 'Sem 1', score: 72 },
  { term: 'Sem 2', score: 75 },
  { term: 'Sem 3', score: 78 },
  { term: 'Sem 4', score: 82 },
  { term: 'Sem 5', score: 86 },
  { term: 'Sem 6', score: 91 },
];

export const attendanceRecords = [
  { subject: 'Mathematics', percentage: 88, classes: 32, attended: 28 },
  { subject: 'Data Structures', percentage: 94, classes: 30, attended: 28 },
  { subject: 'DBMS', percentage: 81, classes: 26, attended: 21 },
  { subject: 'Operating Systems', percentage: 73, classes: 31, attended: 23 },
  { subject: 'Networking', percentage: 90, classes: 28, attended: 25 },
];

export const marks = [
  { subject: 'Mathematics', internal: 88, assignment: 92, final: 90, average: 90 },
  { subject: 'DBMS', internal: 84, assignment: 89, final: 87, average: 86 },
  { subject: 'OS', internal: 79, assignment: 80, final: 82, average: 80 },
  { subject: 'Web Dev', internal: 96, assignment: 94, final: 97, average: 96 },
];

export const notices = [
  { id: 1, title: 'Midterm Exam Schedule', description: 'The timetable has been updated for the next internal assessment cycle.', category: 'Academic', author: 'Academic Office', date: '2026-08-12' },
  { id: 2, title: 'Campus Placement Drive', description: 'Infosys and Capgemini will visit campus next week for recruitment.', category: 'Placement', author: 'Career Cell', date: '2026-08-11' },
  { id: 3, title: 'Hostel Fee Reminder', description: 'Fee dues for the current semester are due before the 20th of this month.', category: 'Administration', author: 'Accounts', date: '2026-08-10' },
];

export const assignments = [
  { id: 1, title: 'UI/UX Case Study', description: 'Prepare a responsive redesign proposal for the campus portal.', subject: 'HCI', deadline: '2026-08-18', status: 'Submitted' },
  { id: 2, title: 'Database Normalization', description: 'Submit a 5-page report on normalization techniques and ERD design.', subject: 'DBMS', deadline: '2026-08-22', status: 'Pending' },
  { id: 3, title: 'Data Structures Lab', description: 'Develop and explain a tree traversal implementation using C++.', subject: 'DSA', deadline: '2026-08-25', status: 'Submitted' },
];

export const events = [
  { id: 1, title: 'Tech Fest 2026', date: '2026-09-04', venue: 'Innovation Hall', color: 'linear-gradient(135deg, #60a5fa, #2563eb)' },
  { id: 2, title: 'Industry Connect', date: '2026-09-11', venue: 'Main Auditorium', color: 'linear-gradient(135deg, #34d399, #0f766e)' },
  { id: 3, title: 'Hackathon Sprint', date: '2026-09-18', venue: 'Coding Lab', color: 'linear-gradient(135deg, #fbbf24, #f97316)' },
];

export const jobs = [
  { id: 1, title: 'Frontend Developer', company: 'Adobe India', location: 'Bengaluru', package: '₹14 LPA', skills: ['React', 'JavaScript', 'UI'], type: 'Job' },
  { id: 2, title: 'Full Stack Intern', company: 'Microsoft', location: 'Hyderabad', package: '₹8 LPA', skills: ['Node.js', 'MongoDB', 'React'], type: 'Internship' },
  { id: 3, title: 'Data Analyst', company: 'Accenture', location: 'Pune', package: '₹10 LPA', skills: ['SQL', 'Power BI', 'Python'], type: 'Job' },
];

export const notifications = [
  { id: 1, title: 'Assignment due soon', message: 'Database Normalization report due in 3 days.' },
  { id: 2, title: 'Attendance alert', message: 'Operating Systems attendance dropped below 75%.' },
  { id: 3, title: 'Placement update', message: 'Your application for Microsoft internship is shortlisted.' },
  { id: 4, title: 'Event registration', message: 'Tech Fest 2026 registration is open.' },
];
