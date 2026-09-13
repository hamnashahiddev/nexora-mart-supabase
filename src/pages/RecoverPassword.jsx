import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Loader2, Mail, ArrowLeft } from 'lucide-react';

const RecoverPassword = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const validateEmail = (emailStr) => {
    const trimmed = emailStr.trim();
    if (!trimmed) {
      setErrorMsg('Invalid email address.\nPlease enter a correct email address.');
      return false;
    }
    // Basic format check
    const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
    if (!isValid) {
      setErrorMsg('Invalid email address.\nPlease enter a correct email address.');
      return false;
    }
    return trimmed;
  };

  const handleSendRecovery = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    
    const validEmail = validateEmail(email);
    if (!validEmail) return;

    try {
      setIsLoading(true);

      const { error: resetError } = await supabase.auth.resetPasswordForEmail(validEmail, {
        redirectTo: `${window.location.origin}/update-password`,
      });
      
      if (resetError && resetError.status === 429) {
        throw resetError; 
      }
      
      setIsSent(true);
      
    } catch (error) {
      if (error.status === 429 || error.message.includes('fetch')) {
        setErrorMsg(error.message);
      } else {
        // Fallback generic success on unknown error
        setIsSent(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-card">
      <h1 className="auth-title">{isSent ? 'Check Your Email' : 'Recover Password'}</h1>
      
      {isSent ? (
        <>
          <p className="auth-subtitle mb-8" style={{color: 'var(--text-main)', fontSize: '1rem', lineHeight: '1.5'}}>
            If an account exists for this email address, we've sent password recovery instructions.<br/><br/>
            Please check your inbox and spam folder.
          </p>
          <div className="auth-footer mt-6">
            <Link to="/login" className="btn btn-primary btn-block">
              Back to Login
            </Link>
          </div>
        </>
      ) : (
        <>
          <p className="auth-subtitle">
            Enter your email address and we'll send you instructions to reset your password.
          </p>

          <form onSubmit={handleSendRecovery} className="auth-form" noValidate>
            
            {errorMsg && (
              <div className="alert alert-danger mb-4 text-sm" style={{color: 'var(--danger-color)', backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: '0.75rem', borderRadius: '4px', whiteSpace: 'pre-line'}}>
                {errorMsg}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="email">Email Address</label>
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
                  autoComplete="email"
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-block" disabled={isLoading}>
              {isLoading ? <Loader2 className="spinner-icon" size={20} /> : 'Continue'}
            </button>
          </form>

          <div className="auth-footer mt-6">
            <Link to="/login" className="auth-link flex-center gap-2" style={{justifyContent: 'center'}}>
              <ArrowLeft size={16} /> Back to Login
            </Link>
          </div>
        </>
      )}
    </div>
  );
};

export default RecoverPassword;
