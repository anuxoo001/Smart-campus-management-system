import { useState, useEffect } from 'react';
import api from './services/api';

export default function StudentTaskDashboard() {
  const [stats, setStats] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchStudentTasks();
  }, []);

  const fetchStudentTasks = async () => {
    try {
      const [statsRes, tasksRes] = await Promise.all([
        api.get('/assignments/student/stats'),
        api.get('/assignments/student/tasks'),
      ]);
      setStats(statsRes.data);
      setTasks(tasksRes.data);
    } catch (error) {
      console.error('Error fetching student tasks:', error);
    }
  };

  const getFilteredTasks = () => {
    const now = new Date();
    switch (filter) {
      case 'pending':
        return tasks.filter((t) => new Date(t.deadline) > now);
      case 'overdue':
        return tasks.filter((t) => new Date(t.deadline) < now);
      case 'high':
        return tasks.filter((t) => t.priority === 'high');
      default:
        return tasks;
    }
  };

  const getTaskStatus = (task) => {
    const now = new Date();
    if (new Date(task.deadline) < now) {
      return 'overdue';
    }
    const daysLeft = Math.ceil((new Date(task.deadline) - now) / (1000 * 60 * 60 * 24));
    if (daysLeft <= 3) return 'urgent';
    return 'normal';
  };

  if (!stats) {
    return <div className="loading">Loading your tasks...</div>;
  }

  const filteredTasks = getFilteredTasks();

  return (
    <div className="page-panel">
      <div className="topbar">
        <div>
          <h1>My Tasks</h1>
          <p className="eyebrow">View and manage your assigned tasks</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stat-grid">
        <div className="card stat-card">
          <div className="stat-icon">📋</div>
          <p>Total Tasks</p>
          <h3>{stats.totalTasks}</h3>
        </div>
        <div className="card stat-card">
          <div className="stat-icon">⏳</div>
          <p>Pending</p>
          <h3>{stats.pendingTasks}</h3>
          <span className="trend positive">Action required</span>
        </div>
        <div className="card stat-card">
          <div className="stat-icon">✓</div>
          <p>Submitted</p>
          <h3>{stats.submittedTasks}</h3>
        </div>
        <div className="card stat-card">
          <div className="stat-icon">⭐</div>
          <p>Graded</p>
          <h3>{stats.gradedTasks}</h3>
        </div>
        <div className="card stat-card">
          <div className="stat-icon">⚠</div>
          <p>Overdue</p>
          <h3>{stats.overdueTasks}</h3>
          <span className="trend" style={{ background: '#fee2e2', color: '#991b1b' }}>
            At risk
          </span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="filter-tabs">
        <button
          className={`tab ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All Tasks ({tasks.length})
        </button>
        <button
          className={`tab ${filter === 'pending' ? 'active' : ''}`}
          onClick={() => setFilter('pending')}
        >
          Upcoming ({tasks.filter((t) => new Date(t.deadline) > new Date()).length})
        </button>
        <button
          className={`tab ${filter === 'high' ? 'active' : ''}`}
          onClick={() => setFilter('high')}
        >
          High Priority ({tasks.filter((t) => t.priority === 'high').length})
        </button>
        <button
          className={`tab ${filter === 'overdue' ? 'active' : ''}`}
          onClick={() => setFilter('overdue')}
        >
          Overdue ({tasks.filter((t) => new Date(t.deadline) < new Date()).length})
        </button>
      </div>

      {/* Tasks Grid */}
      <div className="content-grid">
        {filteredTasks.length === 0 ? (
          <div className="card">
            <p className="empty-message">
              {filter === 'all' ? 'No tasks assigned yet.' : `No ${filter} tasks.`}
            </p>
          </div>
        ) : (
          filteredTasks.map((task) => {
            const status = getTaskStatus(task);
            const daysLeft = Math.ceil((new Date(task.deadline) - new Date()) / (1000 * 60 * 60 * 24));

            return (
              <article
                key={task._id}
                className={`card task-card task-${status}`}
              >
                <div className="task-header">
                  <div>
                    <h4>{task.title}</h4>
                    <p className="task-faculty">{task.faculty?.user?.name || 'Faculty'}</p>
                  </div>
                  <span className={`badge badge-${task.priority}`}>{task.priority}</span>
                </div>

                <p className="task-desc">{task.description}</p>

                <div className="task-meta-row">
                  <span>📚 {task.subject?.name || 'Subject'}</span>
                  <span>⭐ {task.totalPoints} points</span>
                </div>

                <div className="task-deadline">
                  {status === 'overdue' ? (
                    <div className="deadline-overdue">
                      ⚠️ Overdue by {Math.abs(daysLeft)} day(s)
                    </div>
                  ) : (
                    <div className={`deadline-${status}`}>
                      📅 Due in {daysLeft} day{daysLeft !== 1 ? 's' : ''}
                    </div>
                  )}
                </div>

                {task.instructions && (
                  <div className="task-instructions">
                    <strong>Instructions:</strong>
                    <p>{task.instructions.substring(0, 100)}...</p>
                  </div>
                )}

                <div className="task-actions-row">
                  <button type="button" className="btn btn-primary small-btn">
                    View Details
                  </button>
                  <button type="button" className="btn btn-secondary small-btn">
                    Submit Work
                  </button>
                </div>
              </article>
            );
          })
        )}
      </div>
    </div>
  );
}
