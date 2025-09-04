import React from 'react';

interface Props {
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<Props> = ({ children, className = '' }) => {
  return (
    <div className={`p-8 bg-gray-800 bg-opacity-50 rounded-2xl shadow-2xl border border-gray-700/50 backdrop-blur-xl ${className}`}>
      {children}
    </div>
  );
};

export default Card;