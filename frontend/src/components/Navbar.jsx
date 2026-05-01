import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';
import { BACKEND_API } from '../services/backend_api';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, LogOut, User as UserIcon, Mail } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      const fetchUnread = async () => {
        try {
          const res = await api.get(BACKEND_API.UNREAD_COUNT);
          setUnreadCount(res.data.unreadCount);
        } catch (err) {
          console.error('Failed to fetch unread count', err);
        }
      };
      fetchUnread();
    }
  }, [user, location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
      background: 'var(--glass-bg)',
      backdropFilter: 'blur(12px)',
      borderBottom: 'var(--glass-border)'
    }}>
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '4rem' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', color: 'var(--text-primary)' }}>
          <div style={{ background: 'var(--accent-gradient)', padding: '0.5rem', borderRadius: '8px' }}>
            <LayoutDashboard size={20} color="white" />
          </div>
          <span style={{ fontWeight: 600, fontSize: '1.25rem', letterSpacing: '-0.02em' }}>Projex</span>
        </Link>

        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <Link to="/messages" style={{ position: 'relative', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.3rem', textDecoration: 'none' }}>
              <Mail size={20} />
              {unreadCount > 0 && (
                <span style={{
                  position: 'absolute', top: '-5px', right: '-8px',
                  background: '#ef4444', color: 'white', fontSize: '0.65rem',
                  fontWeight: 'bold', width: '16px', height: '16px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  borderRadius: '50%', boxShadow: '0 0 5px rgba(239, 68, 68, 0.5)'
                }}>
                  {unreadCount}
                </span>
              )}
            </Link>
            
            <Link to="/profile" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', textDecoration: 'none' }}>
              <div style={{ background: 'rgba(255,255,255,0.1)', padding: '0.4rem', borderRadius: '50%' }}>
                 <UserIcon size={16} />
              </div>
              <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)' }}>{user.name || user.email}</span>
            </Link>
            
            <button onClick={handleLogout} className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
