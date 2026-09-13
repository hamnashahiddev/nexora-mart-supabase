import React from 'react';
import { Outlet, Link } from 'react-router-dom';

export const AuthLayout = () => {
  return (
    <div className="auth-layout">
      <div className="auth-container">
        <div className="auth-header">
          <Link to="/" className="auth-logo">
            Nexora Mart
          </Link>
          <p className="auth-tagline">Shop smarter. Live better.</p>
        </div>
        <div className="auth-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
};
