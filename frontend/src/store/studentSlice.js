import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { studentAPI } from '../services/endpoints';
import api from '../services/api';

const initialState = {
  dashboard: null,
  profile: null,
  attendance: [],
  marks: [],
  assignments: [],
  notices: [],
  events: [],
  jobs: [],
  notifications: [],
  schedule: [],
  exams: [],
  materials: [],
  placements: [],
  jobApplications: [],
  loading: false,
  error: null,
};

export const fetchStudentDashboard = createAsyncThunk(
  'student/fetchDashboard',
  async (_, { rejectWithValue }) => {
    try {
      const response = await studentAPI.getDashboard();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch dashboard');
    }
  }
);

export const fetchStudentProfile = createAsyncThunk(
  'student/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await studentAPI.getProfile();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch profile');
    }
  }
);

export const fetchStudentAttendance = createAsyncThunk(
  'student/fetchAttendance',
  async (_, { rejectWithValue }) => {
    try {
      const response = await studentAPI.getAttendance();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch attendance');
    }
  }
);

export const fetchStudentMarks = createAsyncThunk(
  'student/fetchMarks',
  async (_, { rejectWithValue }) => {
    try {
      const response = await studentAPI.getMarks();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch marks');
    }
  }
);

export const fetchStudentAssignments = createAsyncThunk(
  'student/fetchAssignments',
  async (_, { rejectWithValue }) => {
    try {
      const response = await studentAPI.getAssignments();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch assignments');
    }
  }
);

export const fetchNotices = createAsyncThunk(
  'student/fetchNotices',
  async (_, { rejectWithValue }) => {
    try {
      const response = await studentAPI.getNotices();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch notices');
    }
  }
);

export const fetchEvents = createAsyncThunk(
  'student/fetchEvents',
  async (_, { rejectWithValue }) => {
    try {
      const response = await studentAPI.getEvents();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch events');
    }
  }
);

export const fetchJobs = createAsyncThunk(
  'student/fetchJobs',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/jobs');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch jobs');
    }
  }
);

export const fetchNotifications = createAsyncThunk(
  'student/fetchNotifications',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/notifications');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch notifications');
    }
  }
);

export const fetchStudentSchedule = createAsyncThunk(
  'student/fetchSchedule',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/students/me/schedule');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch schedule');
    }
  }
);

export const fetchStudentExams = createAsyncThunk(
  'student/fetchExams',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/students/me/exams');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch exams');
    }
  }
);

export const fetchStudentMaterials = createAsyncThunk(
  'student/fetchMaterials',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/students/me/materials');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch materials');
    }
  }
);

export const fetchStudentPlacements = createAsyncThunk(
  'student/fetchPlacements',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/students/me/placements');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch placements');
    }
  }
);

export const fetchJobApplications = createAsyncThunk(
  'student/fetchJobApplications',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/jobs/applications');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch applications');
    }
  }
);

const studentSlice = createSlice({
  name: 'student',
  initialState,
  reducers: {
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Dashboard
      .addCase(fetchStudentDashboard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStudentDashboard.fulfilled, (state, action) => {
        state.loading = false;
        state.dashboard = action.payload;
      })
      .addCase(fetchStudentDashboard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Profile
      .addCase(fetchStudentProfile.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchStudentProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
      })
      .addCase(fetchStudentProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Attendance
      .addCase(fetchStudentAttendance.fulfilled, (state, action) => {
        state.attendance = action.payload;
      })
      // Marks
      .addCase(fetchStudentMarks.fulfilled, (state, action) => {
        state.marks = action.payload;
      })
      // Assignments
      .addCase(fetchStudentAssignments.fulfilled, (state, action) => {
        state.assignments = action.payload;
      })
      // Notices
      .addCase(fetchNotices.fulfilled, (state, action) => {
        state.notices = action.payload;
      })
      // Events
      .addCase(fetchEvents.fulfilled, (state, action) => {
        state.events = action.payload;
      })
      // Jobs
      .addCase(fetchJobs.fulfilled, (state, action) => {
        state.jobs = action.payload;
      })
      // Notifications
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.notifications = action.payload;
      })
      // Schedule
      .addCase(fetchStudentSchedule.fulfilled, (state, action) => {
        state.schedule = action.payload;
      })
      // Exams
      .addCase(fetchStudentExams.fulfilled, (state, action) => {
        state.exams = action.payload;
      })
      // Materials
      .addCase(fetchStudentMaterials.fulfilled, (state, action) => {
        state.materials = action.payload;
      })
      // Placements
      .addCase(fetchStudentPlacements.fulfilled, (state, action) => {
        state.placements = action.payload;
      })
      // Job applications
      .addCase(fetchJobApplications.fulfilled, (state, action) => {
        state.jobApplications = action.payload;
      });
  },
});

export const { clearError } = studentSlice.actions;
export default studentSlice.reducer;
