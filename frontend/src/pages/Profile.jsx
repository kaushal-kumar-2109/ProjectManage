import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { BACKEND_API } from '../services/backend_api';
import { useAuth } from '../context/AuthContext';
import { User as UserIcon, Copy, CheckCircle2 } from 'lucide-react';

const Profile = () => {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get(BACKEND_API.ME);
        setProfileData(res.data);
      } catch (err) {
        console.error('Failed to load profile', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleCopy = () => {
    if (profileData?.inviteCode) {
      navigator.clipboard.writeText(profileData.inviteCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) return <div style={{ textAlign: 'center', marginTop: '3rem' }}>Loading profile...</div>;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '500px', padding: '2.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ 
            width: '80px', height: '80px', borderRadius: '50%', background: 'var(--accent-gradient)', 
            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', color: 'white' 
          }}>
            <UserIcon size={40} />
          </div>
          <h2 style={{ fontSize: '1.8rem', marginBottom: '0.2rem' }}>{profileData?.name}</h2>
          <p style={{ color: 'var(--text-secondary)' }}>{profileData?.email}</p>
        </div>

        <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Your Invite Code</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', marginBottom: '1rem' }}>
            Share this 15-digit code with project admins so they can invite you to their projects.
          </p>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ 
              flex: 1, background: 'rgba(0,0,0,0.4)', padding: '0.8rem', borderRadius: '8px', 
              fontFamily: 'monospace', fontSize: '1.2rem', letterSpacing: '2px', color: 'var(--accent-primary)', textAlign: 'center'
            }}>
              {profileData?.inviteCode || 'N/A'}
            </div>
            <button onClick={handleCopy} className="btn btn-secondary" style={{ padding: '0.8rem' }} title="Copy Code">
              {copied ? <CheckCircle2 size={20} color="#10b981" /> : <Copy size={20} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
