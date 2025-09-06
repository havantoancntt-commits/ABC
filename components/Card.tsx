import React from 'react';

interface Props {
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<Props> = ({ children, className = '' }) => {
  return (
    <div className={`relative overflow-hidden p-8 bg-gradient-to-br from-gray-900/60 to-gray-950/70 rounded-2xl shadow-2xl border border-gray-800 backdrop-blur-xl transition-all duration-300 shadow-inner shadow-white/5 group ${className}`}>
      {children}
      <div className="absolute top-0 left-[-100%] group-hover:left-[100%] w-1/2 h-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-all duration-700 ease-in-out"></div>
    </div>
  );
};

export default Card;