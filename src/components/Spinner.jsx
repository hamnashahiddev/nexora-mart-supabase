import React from 'react';
import { Loader2 } from 'lucide-react';

const Spinner = ({ size = 24, className = '' }) => {
  return (
    <div className={`flex-center ${className}`}>
      <Loader2 size={size} className="spinner-icon text-accent" />
    </div>
  );
};

export default Spinner;
