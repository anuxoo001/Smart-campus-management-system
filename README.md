# Smart Campus Management & Student Success Platform

A production-quality MERN full-stack project designed as a final-year B.Tech/MCA campus management system.

## Overview

This platform includes role-based access for students, faculty, and administrators with dashboards, academic tracking, attendance, assignments, notices, events, leave, placement tracking, resume management, notifications, and analytics.

## Features

- JWT authentication with role-based access control
- Student, faculty, and admin dashboards
- Attendance and marks management
- Assignment creation and submissions
- Notices and events
- Leave management
- Placement jobs and applications
- Notification center
- Responsive UI and modular front-end architecture

## Tech Stack

### Frontend
- React.js
- Vite
- React Router
- Redux Toolkit
- Tailwind CSS
- Recharts
- React Hook Form

### Backend
- Node.js
- Express.js
- MongoDB + Mongoose
- JWT
- bcryptjs
- Cloudinary-ready upload architecture

## Project Structure

```text
backend/
  app.js
  server.js
  .env.example
  config/
  controllers/
  middleware/
  models/
  routes/
  utils/
  uploads/

frontend/
  src/
    App.jsx
    main.jsx
    index.css
    store/
```

## Setup

### Backend

1. Go to the backend folder.
2. Copy `.env.example` to `.env`.
3. Update the values for MongoDB, JWT, and Cloudinary.
4. Install dependencies:

```bash
npm install
```

5. Run the backend:

```bash
npm run dev
```

### Frontend

1. Go to the frontend folder.
2. Install dependencies:

```bash
npm install
```

3. Run the frontend:

```bash
npm run dev
```

## Environment Variables

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/smart-campus
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## Demo Credentials

- Admin: admin@smartcampus.com / admin123
- Faculty: faculty@smartcampus.com / faculty123
- Student: student@smartcampus.com / student123

## API Overview

- Auth: `/api/auth/*`
- Students: `/api/students`
- Faculty: `/api/faculty`
- Attendance: `/api/attendance`
- Marks: `/api/marks`
- Assignments: `/api/assignments`
- Notices: `/api/notices`
- Events: `/api/events`
- Leave: `/api/leave`
- Jobs: `/api/jobs`
- Notifications: `/api/notifications`

## Future Enhancements

- AI-based performance prediction
- Smart job recommendations
- Advanced analytics dashboards
- SMS/email notifications
- Deployment automation

## Screenshots

Add screenshots here after running the app.
