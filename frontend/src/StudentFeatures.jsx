import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import api from './services/api';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function SectionHead({ title, description, right }) {
  return (
    <div className="page-header">
      <div>
        <p className="eyebrow">Module</p>
        <h2>{title}</h2>
      </div>
      <p>{description}</p>
      {right}
    </div>
  );
}

export function StudentSchedulePage() {
  const { schedule } = useSelector((state) => state.student);

  const grouped = DAYS.map((day) => ({
    day,
    classes: schedule.filter((s) => s.dayOfWeek === day).sort((a, b) => a.startTime.localeCompare(b.startTime)),
  }));

  return (
    <section className="page-panel">
      <SectionHead title="Weekly Class Schedule" description="Your timetable across all subjects" />
      <div className="schedule-grid">
        {grouped.map(({ day, classes }) => (
          <div className="card" key={day}>
            <h3>{day}</h3>
            {classes.length === 0 ? (
              <p className="empty-message">No classes</p>
            ) : classes.map((c) => (
              <div className="schedule-item" key={c._id}>
                <div className="schedule-time">{c.startTime} - {c.endTime}</div>
                <div className="schedule-subject">{c.subject?.name}</div>
                <div className="schedule-room">{c.room} {c.isCompleted ? '• Completed' : ''}</div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}

export function StudentExamsPage() {
  const { exams } = useSelector((state) => state.student);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(t);
  }, []);

  const formatCountdown = (dateStr) => {
    const diff = new Date(dateStr) - now;
    if (diff < 0) return 'Completed';
    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    return `${days}d ${hours}h remaining`;
  };

  const upcoming = exams.filter((e) => new Date(e.examDate) >= now);
  const past = exams.filter((e) => new Date(e.examDate) < now);

  return (
    <section className="page-panel">
      <SectionHead title="Exam Schedule" description="Upcoming exams with countdown" />
      <div className="stat-grid">
        {[
          { label: 'Total Exams', value: exams.length, icon: '🧪' },
          { label: 'Upcoming', value: upcoming.length, icon: '⏳' },
          { label: 'Completed', value: past.length, icon: '✅' },
        ].map((item) => (
          <div className="card stat-card" key={item.label}>
            <div className="stat-icon">{item.icon}</div>
            <p>{item.label}</p>
            <h3>{item.value}</h3>
          </div>
        ))}
      </div>
      <div className="exam-grid">
        {upcoming.length === 0 && <div className="card"><p className="empty-message">No upcoming exams.</p></div>}
        {upcoming.map((e) => (
          <article className="card exam-card" key={e._id}>
            <div className="section-head">
              <h3>{e.title}</h3>
              <span className="badge badge-success">{e.examType}</span>
            </div>
            <p><strong>{e.subject?.name}</strong></p>
            <p>{new Date(e.examDate).toLocaleDateString()} · {e.startTime} - {e.endTime}</p>
            <p className="meta-row">Room: {e.room} | Max Marks: {e.totalMarks}</p>
            <p className="countdown">{formatCountdown(e.examDate)}</p>
          </article>
        ))}
      </div>
      {past.length > 0 && (
        <>
          <h3 style={{ marginTop: 24 }}>Past Exams</h3>
          <div className="card table-card">
            <table className="table">
              <thead>
                <tr><th>Subject</th><th>Title</th><th>Date</th><th>Type</th></tr>
              </thead>
              <tbody>
                {past.map((e) => (
                  <tr key={e._id}>
                    <td>{e.subject?.name}</td>
                    <td>{e.title}</td>
                    <td>{new Date(e.examDate).toLocaleDateString()}</td>
                    <td>{e.examType}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  );
}

export function StudentMaterialsPage() {
  const { materials } = useSelector((state) => state.student);
  const [message, setMessage] = useState('');

  const handleDownload = async (material) => {
    try {
      await api.put(`/materials/${material._id}/download`);
      if (material.fileUrl) {
        window.open(material.fileUrl, '_blank');
      } else {
        setMessage('No file link attached for this material.');
        setTimeout(() => setMessage(''), 4000);
      }
    } catch (error) {
      setMessage('Failed to open material.');
      setTimeout(() => setMessage(''), 4000);
    }
  };

  const byType = (materials || []).reduce((acc, m) => {
    const key = m.type || 'Other';
    if (!acc[key]) acc[key] = [];
    acc[key].push(m);
    return acc;
  }, {});

  return (
    <section className="page-panel">
      <SectionHead title="Study Materials" description="Learning resources shared by your teachers" />
      {message && <div className="admin-message success">{message}</div>}
      {Object.keys(byType).length === 0 && <div className="card"><p className="empty-message">No materials uploaded yet.</p></div>}
      {Object.entries(byType).map(([type, items]) => (
        <div key={type}>
          <h3>{type} ({items.length})</h3>
          <div className="materials-list">
            {items.map((m) => (
              <article className="card material-card" key={m._id}>
                <div className="section-head">
                  <h4>{m.title}</h4>
                  <span className="badge badge-primary">{m.category || m.type}</span>
                </div>
                <p>{m.description}</p>
                <p className="meta-row">
                  {m.subject?.name} · {m.faculty?.user?.name} · Downloads: {m.downloads || 0}
                </p>
                <button className="btn btn-secondary small-btn" onClick={() => handleDownload(m)}>Open Material</button>
              </article>
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}

export function StudentNotificationsPage() {
  const { notifications } = useSelector((state) => state.student);
  const [list, setList] = useState(notifications);

  useEffect(() => setList(notifications), [notifications]);

  const markRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setList((prev) => prev.map((n) => (n._id === id ? { ...n, read: true } : n)));
    } catch (error) {
      // ignore
    }
  };

  const unread = list.filter((n) => !n.read).length;

  return (
    <section className="page-panel">
      <SectionHead title="Notifications" description={`${unread} unread notification(s)`} />
      <div className="notification-list">
        {list.length === 0 && <div className="card"><p className="empty-message">No notifications.</p></div>}
        {list.map((n) => (
          <article className={`card notification-card ${n.read ? '' : 'unread'}`} key={n._id}>
            <div className="section-head">
              <h4>{n.title}</h4>
              <span className="badge badge-primary">{n.type}</span>
            </div>
            <p>{n.message}</p>
            <p className="meta-row">
              {new Date(n.createdAt).toLocaleString()}
              {!n.read && <button className="btn btn-secondary small-btn" onClick={() => markRead(n._id)}>Mark read</button>}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}

export function PlacementBoardPage() {
  const { placements, jobs, jobApplications } = useSelector((state) => state.student);
  const [applied, setApplied] = useState({});
  const [applyMessage, setApplyMessage] = useState('');

  useEffect(() => {
    const map = {};
    (jobApplications || []).forEach((a) => {
      map[a.job?._id || a.job] = true;
    });
    setApplied(map);
  }, [jobApplications]);

  const handleApply = async (jobId) => {
    try {
      await api.post(`/jobs/${jobId}/apply`);
      setApplied((prev) => ({ ...prev, [jobId]: true }));
      setApplyMessage('Application submitted successfully!');
    } catch (error) {
      setApplyMessage(error.response?.data?.message || 'Application failed.');
    }
    setTimeout(() => setApplyMessage(''), 5000);
  };

  const myApplications = jobApplications || [];

  return (
    <section className="page-panel">
      <SectionHead title="Placement Board" description="Jobs, internships and teacher-shared placement information" />
      {applyMessage && <div className="admin-message success">{applyMessage}</div>}

      <h3>Teacher Placement Updates</h3>
      <div className="job-list">
        {placements.length === 0 && <div className="card"><p className="empty-message">No placement updates posted by teachers yet.</p></div>}
        {placements.map((p) => (
          <article className="card job-card" key={p._id}>
            <div className="section-head">
              <h3>{p.title}</h3>
              <span className="badge badge-success">{p.status}</span>
            </div>
            <p><strong>{p.company}</strong> {p.role ? `· ${p.role}` : ''}</p>
            <div className="meta-row">
              <span>{p.location}</span>
              {p.package && <span>Package: {p.package}</span>}
              {p.minCGPA > 0 && <span>Min CGPA: {p.minCGPA}</span>}
            </div>
            <p>{p.description}</p>
            {p.eligibility && <p className="meta-row">Eligibility: {p.eligibility}</p>}
            <p className="meta-row">
              {p.deadline ? `Deadline: ${new Date(p.deadline).toLocaleDateString()}` : ''} · Posted by {p.postedBy?.name}
            </p>
          </article>
        ))}
      </div>

      <h3 style={{ marginTop: 24 }}>Open Positions</h3>
      <div className="job-list">
        {jobs.length === 0 && <div className="card"><p className="empty-message">No job openings right now.</p></div>}
        {jobs.map((job) => (
          <article key={job._id} className="card job-card">
            <div className="section-head">
              <h3>{job.title}</h3>
              <span className="badge badge-success">{job.type}</span>
            </div>
            <p>{job.company?.name}</p>
            <div className="meta-row">
              <span>{job.location}</span>
              <span>{job.salary}</span>
            </div>
            <p>{(job.requiredSkills || []).join(' • ')}</p>
            <p className="meta-row">Deadline: {new Date(job.applicationDeadline).toLocaleDateString()} | Min CGPA: {job.minCGPA}</p>
            <button className="btn btn-primary" onClick={() => handleApply(job._id)} disabled={applied[job._id]}>
              {applied[job._id] ? 'Applied ✓' : 'Apply'}
            </button>
          </article>
        ))}
      </div>

      <h3 style={{ marginTop: 24 }}>My Applications</h3>
      <div className="card table-card">
        {myApplications.length === 0 ? (
          <p className="empty-message">You have not applied to any positions yet.</p>
        ) : (
          <table className="table">
            <thead>
              <tr><th>Job</th><th>Company</th><th>Applied On</th><th>Status</th></tr>
            </thead>
            <tbody>
              {myApplications.map((a) => (
                <tr key={a._id}>
                  <td>{a.job?.title || 'Job'}</td>
                  <td>{a.job?.company?.name || '—'}</td>
                  <td>{new Date(a.createdAt).toLocaleDateString()}</td>
                  <td><span className={`badge ${a.status === 'Applied' ? 'badge-warning' : a.status === 'Selected' ? 'badge-success' : 'badge-primary'}`}>{a.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}

export function AcademicAnalyticsPage() {
  const { marks, attendance } = useSelector((state) => state.student);

  const subjectMap = {};
  (marks || []).forEach((m) => {
    const name = m.subject?.name || 'Subject';
    if (!subjectMap[name]) subjectMap[name] = { subject: name, total: 0, outOf: 0, count: 0 };
    subjectMap[name].total += m.marks || 0;
    subjectMap[name].outOf += m.outOf || 100;
    subjectMap[name].count += 1;
  });
  const subjectRows = Object.values(subjectMap).map((r) => ({
    ...r,
    pct: r.outOf > 0 ? Math.round((r.total / r.outOf) * 100) : 0,
  }));

  const attMap = {};
  (attendance || []).forEach((a) => {
    const name = a.subject?.name || 'Subject';
    if (!attMap[name]) attMap[name] = { subject: name, total: 0, attended: 0 };
    attMap[name].total += 1;
    if (a.status !== 'absent') attMap[name].attended += 1;
  });
  const attRows = Object.values(attMap).map((r) => ({
    ...r,
    pct: r.total > 0 ? Math.round((r.attended / r.total) * 100) : 0,
  }));

  const overallMarks = subjectRows.length > 0
    ? Math.round(subjectRows.reduce((s, r) => s + r.pct, 0) / subjectRows.length)
    : 0;
  const overallAtt = attRows.length > 0
    ? Math.round(attRows.reduce((s, r) => s + r.pct, 0) / attRows.length)
    : 0;

  return (
    <section className="page-panel">
      <SectionHead title="Academic Analytics" description="Subject-wise performance and attendance insights" />
      <div className="stat-grid">
        {[
          { label: 'Avg Marks %', value: `${overallMarks}%`, icon: '📊' },
          { label: 'Avg Attendance', value: `${overallAtt}%`, icon: '📅' },
          { label: 'Subjects', value: subjectRows.length, icon: '📚' },
        ].map((item) => (
          <div className="card stat-card" key={item.label}>
            <div className="stat-icon">{item.icon}</div>
            <p>{item.label}</p>
            <h3>{item.value}</h3>
          </div>
        ))}
      </div>

      <div className="content-grid two-col">
        <div className="card">
          <div className="section-head"><h3>Marks by Subject</h3></div>
          {subjectRows.length === 0 && <p className="empty-message">No marks recorded.</p>}
          {subjectRows.map((r) => (
            <div className="progress-row" key={r.subject}>
              <div className="progress-label"><span>{r.subject}</span><span>{r.pct}%</span></div>
              <div className="progress-track">
                <div className="progress-fill" style={{ width: `${Math.min(r.pct, 100)}%` }} />
              </div>
            </div>
          ))}
        </div>
        <div className="card">
          <div className="section-head"><h3>Attendance by Subject</h3></div>
          {attRows.length === 0 && <p className="empty-message">No attendance recorded.</p>}
          {attRows.map((r) => (
            <div className="progress-row" key={r.subject}>
              <div className="progress-label"><span>{r.subject}</span><span>{r.pct}%</span></div>
              <div className="progress-track">
                <div className={`progress-fill ${r.pct < 75 ? 'fill-warning' : ''}`} style={{ width: `${Math.min(r.pct, 100)}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}