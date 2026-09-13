import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Eye, EyeOff, Loader2, Lock, CheckCircle } from 'lucide-react';

const UpdatePassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // States to manage the flow strictly
  const [isSessionValid, setIsSessionValid] = useState(false);
  const [isVerifyingSession, setIsVerifyingSession] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  const navigate = useNavigate();

  useEffect(() => {
    console.log('[UpdatePassword] Component mounted');
    
    const verifyRecoverySession = async () => {
      try {
        console.log('[UpdatePassword] Verifying recovery session...');
        
        // Supabase handles the URL hash automatically and establishes a session.
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) throw error;
        
        console.log('[UpdatePassword] getSession result:', session ? 'Valid session found' : 'No session found');
        
        if (!session) {
          setIsSessionValid(false);
        } else {
          setIsSessionValid(true);
        }
      } catch (err) {
        console.error('[UpdatePassword] Error verifying session:', err);
        setIsSessionValid(false);
      } finally {
        setIsVerifyingSession(false);
      }
    };
    
    verifyRecoverySession();

    // Listen for auth state changes (in case the PKCE flow establishes the session slightly after mount)
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'PASSWORD_RECOVERY') {
        if (session) {
          setIsSessionValid(true);
          setIsVerifyingSession(false);
        }
      }
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    
    if (!password || !confirmPassword) {
      setErrorMsg('Please fill in all fields.');
      return;
    }

    if (password.length < 8) {
      setErrorMsg('Password must be at least 8 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    try {
      setIsLoading(true);
      console.log('[UpdatePassword] Requesting password update via Supabase Auth...');
      
      const { error } = await supabase.auth.updateUser({ password });
      
      if (error) {
        throw error;
      }
      
      console.log('[UpdatePassword] Password updated successfully');
      setIsSuccess(true);
      
      // Log them out immediately so they have to use their new password to sign in
      await supabase.auth.signOut();
      console.log('[UpdatePassword] User signed out after password change');
      
    } catch (error) {
      console.error('[UpdatePassword] Failed to update password:', error);
      setErrorMsg(error.message || 'Failed to update password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isVerifyingSession) {
    return (
      <div className="auth-card text-center py-12">
        <Loader2 className="spinner-icon mx-auto text-accent mb-4" size={32} />
        <p className="text-muted">Verifying secure session...</p>
      </div>
    );
  }

  // Strictly block access if no valid recovery session exists
  if (!isSessionValid && !isSuccess) {
    return (
      <div className="auth-card text-center">
        <h1 className="auth-title text-danger">Invalid or Expired Recovery Link</h1>
        <p className="auth-subtitle mb-8" style={{color: 'var(--text-main)', fontSize: '1rem', lineHeight: '1.5'}}>
          This password reset link is no longer valid.<br/><br/>
          Please request a new password recovery email.
        </p>
        <Link to="/recover-password" className="btn btn-primary btn-block">
          Recover Password
        </Link>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="auth-card text-center">
        <CheckCircle size={48} className="text-success mx-auto mb-4" />
        <h1 className="auth-title">Password Updated Successfully</h1>
        <p className="auth-subtitle mb-8" style={{color: 'var(--text-main)'}}>
          Your password has been updated successfully. You can now sign in with your new password.
        </p>
        <Link to="/login" className="btn btn-primary btn-block">
          Go to Login
        </Link>
      </div>
    );
  }

  return (
    <div className="auth-card">
      <h1 className="auth-title">Update Password</h1>
      <p className="auth-subtitle">Create a new password for your account.</p>

      <form onSubmit={handleSubmit} className="auth-form" noValidate>
        
        {errorMsg && (
          <div className="alert alert-danger mb-4 text-sm" style={{color: 'var(--danger-color)', backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: '0.75rem', borderRadius: '4px'}}>
            {errorMsg}
          </div>
        )}

        <div className="form-group">
          <label htmlFor="password">New Password</label>
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
              minLength={8}
              autoComplete="new-password"
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
          <label htmlFor="confirmPassword">Confirm New Password</label>
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
              minLength={8}
              autoComplete="new-password"
            />
          </div>
        </div>

        <button type="submit" className="btn btn-primary btn-block" disabled={isLoading}>
          {isLoading ? <Loader2 className="spinner-icon" size={20} /> : 'Update Password'}
        </button>
      </form>
    </div>
  );
};

export default UpdatePassword;
