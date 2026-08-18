# Smart Campus Platform - Quick Start Guide

## Prerequisites
- Node.js (v16+)
- MongoDB (running locally or MongoDB Atlas connection)
- npm or yarn

## Installation & Setup

### 1. Clone & Install Dependencies

```bash
# Navigate to backend
cd backend
npm install

# Navigate to frontend
cd ../frontend
npm install
```

### 2. Configure Environment Variables

#### Backend (.env)
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/smart-campus
JWT_SECRET=your-secret-key-here
CLIENT_URL=http://localhost:5173
```

#### Frontend (.env.local)
```env
VITE_API_URL=http://localhost:5000/api
```

### 3. Seed the Database

```bash
cd backend
node scripts/seed.js
```

This will create:
- **4 Departments** (CS, EC, ME, EE)
- **3 Courses**
- **5 Subjects**
- **4 Faculty users** + records
- **5 Student users** + records
- **1 Admin user**
- **Sample data**: Attendance, Marks, Notices, Events, Companies, Jobs

### 4. Start the Backend Server

```bash
cd backend
npm start
```

Server runs on `http://localhost:5000`

### 5. Start the Frontend Development Server

```bash
cd frontend
npm run dev
```

Frontend runs on `http://localhost:5173`

## Test Credentials

### Student Login
- **Email**: student@campus.edu
- **Password**: student123
- **Role**: Student

### Faculty Login
- **Email**: rajesh.kumar@campus.edu
- **Password**: faculty123
- **Role**: Faculty

### Admin Login
- **Email**: admin@campus.edu
- **Password**: admin123
- **Role**: Admin

## Features by Role

### Student
- Dashboard with academic summary
- Attendance tracking
- Marks & grades
- Assignments and submissions
- Event registration
- Job applications
- Profile management

### Faculty
- Dashboard with class overview
- Mark attendance
- Update student marks
- Create & grade assignments
- Subject management

### Admin
- System dashboard
- User management (create, update, delete)
- Department & course management
- Notice & event creation
- Leave request approvals
- Job application tracking

## API Endpoints Reference

### Authentication
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

### Student APIs
- `GET /api/students/dashboard/overview` - Dashboard data
- `GET /api/students/me/profile` - Student profile
- `GET /api/students/me/attendance` - Attendance records
- `GET /api/students/me/marks` - Marks
- `GET /api/students/me/assignments` - Assignments
- `GET /api/students/notices` - All notices
- `GET /api/students/events` - Upcoming events

### Faculty APIs
- `GET /api/faculty/dashboard/overview` - Faculty dashboard
- `POST /api/faculty/attendance/mark` - Mark attendance
- `GET /api/faculty/subjects/:subjectId/students` - Subject students
- `POST /api/faculty/marks/update` - Update marks
- `POST /api/faculty/assignments/create` - Create assignment
- `GET /api/faculty/assignments/:assignmentId/submissions` - Submissions
- `POST /api/faculty/submissions/grade` - Grade submission

### Admin APIs
- `GET /api/admin/dashboard` - Admin dashboard
- `GET /api/admin/users` - All users
- `POST /api/admin/users/create` - Create user
- `GET /api/admin/departments` - All departments
- `POST /api/admin/departments/create` - Create department
- `POST /api/admin/notices/create` - Create notice
- `GET /api/admin/leave-requests/pending` - Pending leaves
- `GET /api/admin/job-applications` - Job applications

## Project Structure

```
Smart Campus Management & Student Success Platform/
├── backend/
│   ├── config/           # Database configuration
│   ├── controllers/      # Business logic
│   ├── middleware/       # Auth & error handling
│   ├── models/           # Mongoose schemas
│   ├── routes/           # API routes
│   ├── scripts/
│   │   └── seed.js       # Database seeding
│   ├── utils/            # Utilities
│   ├── app.js            # Express app
│   ├── server.js         # Server entry
│   └── .env.example      # Environment template
│
├── frontend/
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── data/         # Mock data
│   │   ├── services/     # API client
│   │   ├── store/        # Redux slices
│   │   ├── App.jsx       # Main app
│   │   └── index.css     # Styles
│   ├── vite.config.js    # Vite config
│   └── package.json
│
└── README.md
```

## Next Steps

1. **Test the login flow** - Login as student and verify dashboard loads
2. **Explore student features** - Check attendance, marks, assignments
3. **Faculty features** - Mark attendance, grade submissions
4. **Admin features** - Create notices, manage users, approve leaves
5. **Deploy to production** - Follow deployment guide in README.md

## Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running: `mongosh` (or `mongo`)
- Check `MONGO_URI` in .env
- For MongoDB Atlas, update connection string with credentials

### Port Already in Use
- Backend: Change PORT in .env (default: 5000)
- Frontend: `npm run dev -- --port 3000`

### CORS Error
- Ensure `CLIENT_URL` in backend .env matches frontend URL
- Check CORS middleware in `app.js`

### Module Not Found
- Run `npm install` in both backend and frontend
- Clear `node_modules` and run again if issues persist

## Additional Resources

- [MongoDB Documentation](https://docs.mongodb.com/)
- [Express.js Guide](https://expressjs.com/)
- [React Documentation](https://react.dev/)
- [Redux Toolkit](https://redux-toolkit.js.org/)
- [Vite Documentation](https://vitejs.dev/)

## Support

For issues or questions:
1. Check error messages in console
2. Review backend logs: `npm start` output
3. Check browser console (F12) for frontend errors
4. Verify database connectivity: `mongosh`

---

Happy coding! 🚀
