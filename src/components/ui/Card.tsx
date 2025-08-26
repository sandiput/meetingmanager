import React from 'react';
import { twMerge } from 'tailwind-merge';

type CardProps = {
  children: React.ReactNode;
  className?: string;
};

const Card: React.FC<CardProps> & {
  Header: React.FC<CardProps>;
  Body: React.FC<CardProps>;
  Footer: React.FC<CardProps>;
} = ({ children, className = '' }) => {
  const classes = twMerge(
    'bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden',
    className
  );
  
  return <div className={classes}>{children}</div>;
};

const CardHeader: React.FC<CardProps> = ({ children, className = '' }) => {
  const classes = twMerge(
    'px-4 py-3 bg-gray-50 border-b border-gray-200 font-medium',
    className
  );
  
  return <div className={classes}>{children}</div>;
};

const CardBody: React.FC<CardProps> = ({ children, className = '' }) => {
  const classes = twMerge('p-4', className);
  
  return <div className={classes}>{children}</div>;
};

const CardFooter: React.FC<CardProps> = ({ children, className = '' }) => {
  const classes = twMerge(
    'px-4 py-3 bg-gray-50 border-t border-gray-200',
    className
  );
  
  return <div className={classes}>{children}</div>;
};

Card.Header = CardHeader;
Card.Body = CardBody;
Card.Footer = CardFooter;

export default Card;