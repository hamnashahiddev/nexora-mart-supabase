import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { Eye, EyeOff, Loader2, Mail, Lock, User } from 'lucide-react';

const SignUp = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { signUp } = useAuth();
  const { addNotification } = useNotification();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!fullName || !email || !password || !confirmPassword) {
      addNotification('Please fill in all fields', 'error');
      return;
    }

    if (password.length < 6) {
      addNotification('Password must be at least 6 characters', 'error');
      return;
    }

    if (password !== confirmPassword) {
      addNotification('Passwords do not match', 'error');
      return;
    }

    try {
      setIsLoading(true);
      const { error } = await signUp(email, password, fullName);
      
      if (error) {
        throw error;
      }
      
      addNotification('Account created successfully! You can now log in.', 'success');
      navigate('/login');
    } catch (error) {
      addNotification(error.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-card">
      <h1 className="auth-title">Create Account</h1>
      <p className="auth-subtitle">Join Nexora Mart today</p>

      <form onSubmit={handleSubmit} className="auth-form">
        <div className="form-group">
          <label htmlFor="fullName">Full Name</label>
          <div className="input-wrapper">
            <User className="input-icon" size={20} />
            <input
              id="fullName"
              type="text"
              placeholder="John Doe"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="email">Email</label>
          <div className="input-wrapper">
            <Mail className="input-icon" size={20} />
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <div className="input-wrapper">
            <Lock className="input-icon" size={20} />
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              required
              minLength={6}
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm Password</label>
          <div className="input-wrapper">
            <Lock className="input-icon" size={20} />
            <input
              id="confirmPassword"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={isLoading}
              required
              minLength={6}
            />
          </div>
        </div>

        <button type="submit" className="btn btn-primary btn-block" disabled={isLoading}>
          {isLoading ? <Loader2 className="spinner-icon" size={20} /> : 'Create Account'}
        </button>
      </form>

      <div className="auth-footer">
        Already have an account? <Link to="/login" className="auth-link">Log in</Link>
      </div>
    </div>
  );
};

export default SignUp;
