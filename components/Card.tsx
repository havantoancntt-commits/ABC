import React from 'react';

interface Props {
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<Props> = ({ children, className = '' }) => {
  return (
    <div className={`p-8 bg-gradient-to-br from-gray-900/60 to-gray-950/70 rounded-2xl shadow-2xl border border-gray-800 backdrop-blur-xl transition-all duration-300 shadow-inner shadow-white/5 ${className}`}>
      {children}
    </div>
  );
};

export default Card;