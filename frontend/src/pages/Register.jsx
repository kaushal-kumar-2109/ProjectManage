import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus, MailCheck } from 'lucide-react';
import api from '../services/api';
import { BACKEND_API } from '../services/backend_api';

const Register = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', otp: ''
  });
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    try {
      await register(formData.name, formData.email, formData.password);
      setStep(2);
      setMessage('An OTP has been sent to your email. Please check your inbox.');
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Failed to register');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post(BACKEND_API.VERIFY_OTP, { email: formData.email, otp: formData.otp });
      // Login the user manually since verify OTP returns the token
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      // Force reload to update context
      window.location.href = '/';
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 8rem)' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '400px', padding: '2.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>
            {step === 1 ? 'Create Account' : 'Verify Email'}
          </h2>
          <p>{step === 1 ? 'Join to start collaborating' : 'Enter the 6-digit code sent to your email'}</p>
        </div>

        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '0.75rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
            {error}
          </div>
        )}
        
        {message && (
          <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '0.75rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
            {message}
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleRegisterSubmit}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input 
                type="text" name="name" className="form-control" placeholder="John Doe"
                value={formData.name} onChange={handleChange} required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input 
                type="email" name="email" className="form-control" placeholder="you@example.com"
                value={formData.email} onChange={handleChange} required
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Password</label>
              <input 
                type="password" name="password" className="form-control" placeholder="Min. 6 characters"
                value={formData.password} onChange={handleChange} required minLength={6}
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={loading}>
              {loading ? 'Creating...' : (
                <>
                  <UserPlus size={18} />
                  <span>Create Account</span>
                </>
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp}>
            <div className="form-group">
              <label className="form-label">6-Digit OTP</label>
              <input 
                type="text" name="otp" className="form-control" placeholder="123456"
                value={formData.otp} onChange={handleChange} required minLength={6} maxLength={6}
                style={{ textAlign: 'center', letterSpacing: '0.5rem', fontSize: '1.2rem' }}
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={loading}>
              {loading ? 'Verifying...' : (
                <>
                  <MailCheck size={18} />
                  <span>Verify Account</span>
                </>
              )}
            </button>
            <button type="button" onClick={handleRegisterSubmit} className="btn btn-secondary" style={{ width: '100%', marginTop: '0.5rem' }} disabled={loading}>
              Resend Code
            </button>
          </form>
        )}

        {step === 1 && (
          <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem' }}>
            Already have an account? <Link to="/login" style={{ color: 'var(--accent-primary)', textDecoration: 'none', fontWeight: 500 }}>Login</Link>
          </p>
        )}
      </div>
    </div>
  );
};

export default Register;
