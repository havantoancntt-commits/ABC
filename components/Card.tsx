import React from 'react';

interface Props {
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<Props> = ({ children, className = '' }) => {
  return (
    <div className={`relative p-8 bg-[var(--color-card-bg)] rounded-[var(--border-radius)] shadow-[0_8px_32px_rgba(0,0,0,0.5)] border border-[var(--color-card-border)] backdrop-blur-xl ${className}`}>
      {children}
    </div>
  );
};

export default Card;