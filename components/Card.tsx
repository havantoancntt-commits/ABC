import React from 'react';

interface Props {
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<Props> = ({ children, className = '' }) => {
  return (
    <div className={`relative p-8 bg-gray-900/70 rounded-2xl shadow-2xl border border-gray-800 backdrop-blur-xl transition-all duration-300 ${className}`}>
      {children}
    </div>
  );
};

export default Card;