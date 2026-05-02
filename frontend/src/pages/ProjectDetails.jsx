import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { BACKEND_API } from '../services/backend_api';
import { useAuth } from '../context/AuthContext';
import { Plus, UserPlus, Clock, GripVertical, CheckCircle2 } from 'lucide-react';

const STATUSES = ['To Do', 'In Progress', 'Review', 'Done'];

const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);

  const [newTask, setNewTask] = useState({ title: '', description: '', priority: 'Medium', assignedTo: '', dueDate: '' });
  const [inviteCodeInput, setInviteCodeInput] = useState('');
  const [inviteRoleInput, setInviteRoleInput] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');

  // Since we don't have a get all users API easily, we'll assume there is one or we just ask for User ID directly.
  // Actually, wait, how does addMember work? The backend doesn't seem to have a `GET /api/users` route.
  // We'll just ask for the User ID manually to add them.

  useEffect(() => {
    fetchProjectAndTasks();
  }, [id]);

  const fetchProjectAndTasks = async () => {
    try {
      const [projectRes, tasksRes] = await Promise.all([
        api.get(BACKEND_API.PROJECTS), // Bad performance, but we don't have a single GET project API.
        api.get(`${BACKEND_API.TASKS}/${id}`)
      ]);
      const currentProj = projectRes.data.find(p => p._id === id);
      if (!currentProj) {
        navigate('/');
        return;
      }
      setProject(currentProj);
      setTasks(tasksRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      await api.post(BACKEND_API.TASKS, { ...newTask, projectId: id });
      setShowTaskModal(false);
      setNewTask({ title: '', description: '', priority: 'Medium', assignedTo: '', dueDate: '' });
      fetchProjectAndTasks();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!inviteRoleInput) {
      alert("Please enter a role");
      return;
    }
    try {
      await api.post(BACKEND_API.INVITES, { projectId: id, inviteCode: inviteCodeInput, role: inviteRoleInput });
      setShowMemberModal(false);
      setInviteCodeInput('');
      setInviteRoleInput('');
      alert('Invite sent successfully!');
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || 'Failed to send invite.');
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      // Optimistic UI update
      setTasks(tasks.map(t => t._id === taskId ? { ...t, status: newStatus } : t));
      await api.put(`${BACKEND_API.TASKS}/${taskId}`, { status: newStatus });
    } catch (err) {
      console.error(err);
      // Revert on failure
      fetchProjectAndTasks();
    }
  };

  if (loading || !project) return <div style={{ textAlign: 'center', marginTop: '3rem' }}>Loading project...</div>;

  const isAdmin = project.admin?._id === (user?._id || user?.id);
  const filteredTasks = filterStatus === 'All' ? tasks : tasks.filter(t => t.status === filterStatus);

  return (
    <div className="animate-fade-in" style={{ padding: '0 1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ flex: '1 1 300px' }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem', wordBreak: 'break-word' }}>{project.name}</h1>
          <p>{project.description}</p>
        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
          {isAdmin && (
            <button onClick={() => setShowMemberModal(true)} className="btn btn-secondary">
              <UserPlus size={18} />
              <span>Add Member</span>
            </button>
          )}
          <button onClick={() => setShowTaskModal(true)} className="btn btn-primary">
            <Plus size={18} />
            <span>Add Task</span>
          </button>
        </div>
      </div>

      {/* Task Filters */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
        {['All', ...STATUSES].map(status => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`btn ${filterStatus === status ? 'btn-primary' : 'btn-secondary'}`}
            style={{
              padding: '0.5rem 1.2rem',
              fontSize: '0.9rem',
              borderRadius: '20px',
              background: filterStatus === status ? 'var(--accent-gradient)' : 'rgba(255,255,255,0.05)',
              border: filterStatus === status ? 'none' : '1px solid rgba(255,255,255,0.1)'
            }}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Task List */}
      <div style={{ display: 'flex', flexWrap: "wrap", gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem', paddingBottom: '1rem' }}>
        {filteredTasks.length === 0 ? (
          <div className="glass-panel" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem' }}>
            <p style={{ color: 'var(--text-tertiary)' }}>No tasks found in this category.</p>
          </div>
        ) : (
          filteredTasks.map(task => (
            <div key={task._id} className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', minWidth: "300px" }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <span className={`badge badge-${task.status.toLowerCase().replace(' ', '')}`}>
                  {task.status}
                </span>
                <span className="badge badge-secondary" style={{ opacity: 0.8 }}>
                  {task.priority} Priority
                </span>
              </div>

              <h4 style={{ marginBottom: '0.5rem', fontSize: '1.1rem' }}>{task.title}</h4>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', flex: 1 }}>
                {task.description}
              </p>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-tertiary)', borderTop: 'var(--glass-border)', paddingTop: '1rem', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 600 }}>
                    {task.assignedTo?.name?.charAt(0) || '?'}
                  </div>
                  <span>{task.assignedTo?.name || 'Unassigned'}</span>
                </div>
                {task.dueDate && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <Clock size={12} />
                    <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                  </div>
                )}
              </div>

              {/* Status Update Dropdown and View Task */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', gap: '0.5rem' }}>
                {task.assignedTo?._id === (user?._id || user?.id) ? (
                  <select
                    value={task.status}
                    onChange={(e) => handleStatusChange(task._id, e.target.value)}
                    className="form-control"
                    style={{ padding: '0.4rem', fontSize: '0.85rem', flex: 1 }}
                  >
                    {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                ) : (
                  <div style={{ flex: 1, fontSize: '0.85rem', color: 'var(--text-secondary)', background: 'rgba(0,0,0,0.2)', padding: '0.4rem 0.8rem', borderRadius: '6px', textAlign: 'center' }}>
                    {task.status}
                  </div>
                )}
                <Link to={`/tasks/${task._id}`} className="btn btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
                  View task
                </Link>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Task Modal */}
      {showTaskModal && (
        <div style={{
          position: 'fixed', top: 80, left: 0, right: 0, bottom: 0,
          background: 'black',
          display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999
        }}>
          <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '500px', padding: '2rem', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ marginBottom: '1.5rem' }}>Add New Task</h2>
            <form onSubmit={handleCreateTask}>
              <div className="form-group">
                <label className="form-label">Task Title</label>
                <input
                  type="text" className="form-control"
                  value={newTask.title} onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  required autoFocus
                />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  className="form-control" rows="3"
                  value={newTask.description} onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Due Date (Last Date)</label>
                <input
                  type="date" className="form-control"
                  value={newTask.dueDate} onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                  required
                />
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Priority</label>
                  <select className="form-control" value={newTask.priority} onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}>
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Assign To</label>
                  <select className="form-control" value={newTask.assignedTo} onChange={(e) => setNewTask({ ...newTask, assignedTo: e.target.value })} required>
                    <option value="">Select User...</option>
                    {/* Include Admin in members list for assignment */}
                    <option value={project.admin?._id}>{project.admin?.name} (Admin)</option>
                    {project.members?.map(m => (
                      <option key={m.user?._id} value={m.user?._id}>{m.user?.name} ({m.role})</option>
                    ))}
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setShowTaskModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Create Task</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      {showMemberModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
          display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999
        }}>
          <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '400px', padding: '2rem', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ marginBottom: '1.5rem' }}>Invite Member</h2>
            <form onSubmit={handleAddMember}>
              <div className="form-group">
                <label className="form-label">User's 15-Digit Invite Code</label>
                <input
                  type="text" className="form-control" placeholder="e.g. 123456789012345"
                  value={inviteCodeInput} onChange={(e) => setInviteCodeInput(e.target.value)}
                  required autoFocus minLength={15} maxLength={15}
                />
                <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '0.5rem' }}>
                  Ask the user to find their 15-digit code on their Profile page.
                </p>
              </div>
              <div className="form-group" style={{ marginTop: '1rem' }}>
                <label className="form-label">Role</label>
                <input
                  type="text" className="form-control" placeholder="e.g. Developer, Designer"
                  value={inviteRoleInput} onChange={(e) => setInviteRoleInput(e.target.value)}
                  required
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
                <button type="button" onClick={() => setShowMemberModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Send Invite</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetails;
