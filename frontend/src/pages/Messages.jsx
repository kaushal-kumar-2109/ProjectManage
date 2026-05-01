import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { BACKEND_API } from '../services/backend_api';
import { Mail, Check, X, Bell, ExternalLink } from 'lucide-react';

const Messages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const res = await api.get(BACKEND_API.MESSAGES);
      // Filter out messages that have been handled (e.g. read or accepted/declined)
      // or we can display all and style them differently. Let's just filter out for a clean inbox.
      const activeMessages = res.data.filter(m => m.status === 'Pending' || m.status === 'Unread');
      setMessages(activeMessages);
    } catch (err) {
      console.error('Failed to load messages', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (messageId, action) => {
    try {
      await api.post(`${BACKEND_API.MESSAGES}/${messageId}`, { action });
      // Remove from list
      setMessages(messages.filter(m => m._id !== messageId));
    } catch (err) {
      console.error(`Failed to ${action} message`, err);
    }
  };

  if (loading) return <div style={{ textAlign: 'center', marginTop: '3rem' }}>Loading messages...</div>;

  return (
    <div className="animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto', marginTop: '2rem', padding: '0 1rem' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Inbox</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Review your project invitations and alerts.</p>

      {messages.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <Mail size={48} style={{ margin: '0 auto 1rem', color: 'var(--text-tertiary)' }} />
          <h3 style={{ marginBottom: '0.5rem' }}>No new messages</h3>
          <p>You have no pending alerts or invitations at the moment.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {messages.map(msg => (
            <div key={msg._id} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexWrap: 'wrap', gap: '1.5rem', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ flex: '1 1 300px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  {msg.type === 'Invite' ? <Mail size={16} color="var(--accent-primary)" /> : <Bell size={16} color="#eab308" />}
                  <h3 style={{ fontSize: '1.1rem', margin: 0 }}>
                    {msg.type === 'Invite' ? 'Project Invitation' : 'Task Assignment'}
                  </h3>
                </div>
                <p style={{ color: 'var(--text-secondary)' }}>
                  {msg.content}
                </p>
                {msg.type === 'Invite' && msg.project?.description && (
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', marginTop: '0.5rem', borderLeft: '2px solid var(--accent-primary)', paddingLeft: '0.5rem' }}>
                    {msg.project.description}
                  </p>
                )}
              </div>
              
              <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
                {msg.type === 'Invite' ? (
                  <>
                    <button onClick={() => handleAction(msg._id, 'decline')} className="btn btn-secondary" style={{ color: '#ef4444', flex: 1, minWidth: '100px' }}>
                      <X size={16} />
                      <span>Decline</span>
                    </button>
                    <button onClick={() => handleAction(msg._id, 'accept')} className="btn btn-primary" style={{ background: '#10b981', boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)', flex: 1, minWidth: '100px' }}>
                      <Check size={16} />
                      <span>Join</span>
                    </button>
                  </>
                ) : (
                  <>
                    {msg.task?._id && (
                      <Link to={`/tasks/${msg.task._id}`} className="btn btn-secondary" style={{ flex: 1, minWidth: '100px' }}>
                        <ExternalLink size={16} />
                        <span>View Task</span>
                      </Link>
                    )}
                    <button onClick={() => handleAction(msg._id, 'read')} className="btn btn-primary" style={{ flex: 1, minWidth: '100px' }}>
                      <Check size={16} />
                      <span>Mark Read</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Messages;
