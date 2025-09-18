import React from 'react';

interface Props {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

const Card: React.FC<Props> = ({ children, className = '', style }) => {
  return (
    <div 
      className={`relative p-8 bg-[var(--color-card-bg)] rounded-[var(--border-radius)] shadow-[0_8px_32px_rgba(0,0,0,0.5)] border border-[var(--color-card-border)] backdrop-blur-2xl transition-all duration-300 hover:border-[var(--color-card-border-hover)] ${className}`}
      style={style}
    >
      <div className="animate-shine"></div>
      {children}
    </div>
  );
};

export default Card;