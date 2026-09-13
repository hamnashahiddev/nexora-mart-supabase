import React, { useState } from 'react';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { Eye, EyeOff, Loader2, Mail, Lock } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { signIn } = useAuth();
  const { addNotification } = useNotification();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const from = searchParams.get('redirect') || location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      addNotification('Please fill in all fields', 'error');
      return;
    }

    try {
      setIsLoading(true);
      const { error } = await signIn(email, password);
      
      if (error) {
        throw error;
      }
      
      addNotification('Successfully logged in!', 'success');
      navigate(from, { replace: true });
    } catch (error) {
      addNotification(error.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-card">
      <h1 className="auth-title">Welcome Back</h1>
      <p className="auth-subtitle">Sign in to your Nexora Mart account</p>

      <form onSubmit={handleSubmit} className="auth-form">
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
          <div className="flex-between">
            <label htmlFor="password">Password</label>
            <Link to="/recover-password" className="auth-link small">Forgot password?</Link>
          </div>
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

        <button type="submit" className="btn btn-primary btn-block" disabled={isLoading}>
          {isLoading ? <Loader2 className="spinner-icon" size={20} /> : 'Sign In'}
        </button>
      </form>

      <div className="auth-footer">
        Don't have an account? <Link to="/signup" className="auth-link">Sign up</Link>
      </div>
    </div>
  );
};

export default Login;
