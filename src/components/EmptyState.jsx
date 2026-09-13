import React from 'react';
import { Link } from 'react-router-dom';

const EmptyState = ({ 
  icon: Icon, 
  title, 
  message, 
  actionLabel, 
  actionLink, 
  actionOnClick 
}) => {
  return (
    <div className="empty-state">
      {Icon && <Icon className="empty-state-icon" size={48} />}
      <h3 className="empty-state-title">{title}</h3>
      <p className="empty-state-message">{message}</p>
      
      {actionLabel && actionLink && (
        <Link to={actionLink} className="btn btn-primary mt-4">
          {actionLabel}
        </Link>
      )}
      
      {actionLabel && actionOnClick && (
        <button onClick={actionOnClick} className="btn btn-primary mt-4">
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
