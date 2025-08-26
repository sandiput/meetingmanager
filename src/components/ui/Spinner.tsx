import React from 'react';
import { twMerge } from 'tailwind-merge';

type SpinnerProps = {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
};

const Spinner: React.FC<SpinnerProps> = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };
  
  const classes = twMerge(
    'animate-spin rounded-full border-2 border-t-transparent',
    sizeClasses[size],
    className
  );
  
  return (
    <div className={classes} role="status">
      <span className="sr-only">Loading...</span>
    </div>
  );
};

export default Spinner;