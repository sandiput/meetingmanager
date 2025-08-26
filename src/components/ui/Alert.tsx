import React from 'react';
import { twMerge } from 'tailwind-merge';

type AlertProps = {
  children: React.ReactNode;
  variant?: 'info' | 'success' | 'warning' | 'danger';
  className?: string;
};

const Alert: React.FC<AlertProps> = ({
  children,
  variant = 'info',
  className = '',
}) => {
  const variantClasses = {
    info: 'bg-blue-50 text-blue-800 border-blue-200',
    success: 'bg-green-50 text-green-800 border-green-200',
    warning: 'bg-yellow-50 text-yellow-800 border-yellow-200',
    danger: 'bg-red-50 text-red-800 border-red-200',
  };
  
  const classes = twMerge(
    'p-4 mb-4 border rounded-lg',
    variantClasses[variant],
    className
  );
  
  return <div className={classes}>{children}</div>;
};

export default Alert;