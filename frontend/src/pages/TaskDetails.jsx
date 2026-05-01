import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { BACKEND_API } from '../services/backend_api';
import { ArrowLeft, Clock, CalendarDays, User, AlertCircle, CheckCircle2 } from 'lucide-react';

const TaskDetails = () => {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTask = async () => {
      try {
        const res = await api.get(`${BACKEND_API.TASK}/${taskId}`);
        setTask(res.data);
      } catch (err) {
        console.error('Failed to fetch task', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTask();
  }, [taskId]);

  if (loading) return <div style={{ textAlign: 'center', marginTop: '3rem' }}>Loading task...</div>;
  if (!task) return <div style={{ textAlign: 'center', marginTop: '3rem' }}>Task not found</div>;

  return (
    <div className="animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto', marginTop: '1rem', padding: '0 1rem' }}>
      <button onClick={() => navigate(-1)} className="btn btn-secondary" style={{ marginBottom: '2rem', padding: '0.4rem 0.8rem' }}>
        <ArrowLeft size={16} style={{ marginRight: '0.5rem' }} /> Back to Project
      </button>

      <div className="glass-panel" style={{ padding: '2.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
          <h1 style={{ fontSize: '2rem', margin: 0, flex: '1 1 300px', wordBreak: 'break-word' }}>{task.title}</h1>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <span className={`badge badge-${task.status.toLowerCase().replace(' ', '')}`} style={{ fontSize: '0.9rem', padding: '0.4rem 0.8rem' }}>
              {task.status}
            </span>
            <span className="badge badge-secondary" style={{ fontSize: '0.9rem', padding: '0.4rem 0.8rem' }}>
              {task.priority} Priority
            </span>
          </div>
        </div>

        <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Description</h3>
          <p style={{ lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>{task.description}</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ background: 'rgba(255,255,255,0.1)', padding: '0.8rem', borderRadius: '12px' }}>
              <User size={24} color="var(--accent-primary)" />
            </div>
            <div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', margin: 0 }}>Assigned To</p>
              <p style={{ fontWeight: 500, margin: 0 }}>{task.assignedTo?.name || 'Unassigned'}</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ background: 'rgba(255,255,255,0.1)', padding: '0.8rem', borderRadius: '12px' }}>
              <CalendarDays size={24} color="var(--text-secondary)" />
            </div>
            <div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', margin: 0 }}>Due Date</p>
              <p style={{ fontWeight: 500, margin: 0 }}>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No date set'}</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ background: 'rgba(255,255,255,0.1)', padding: '0.8rem', borderRadius: '12px' }}>
              <Clock size={24} color="var(--text-secondary)" />
            </div>
            <div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', margin: 0 }}>Created</p>
              <p style={{ fontWeight: 500, margin: 0 }}>{new Date(task.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetails;
