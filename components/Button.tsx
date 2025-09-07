import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'special' | 'iching' | 'shop' | 'numerology' | 'palm' | 'tarot';
type ButtonSize = 'sm' | 'md' | 'lg';

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
}

const Button: React.FC<Props> = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}) => {
  const baseClasses = 'flex items-center justify-center gap-2 font-bold rounded-lg transition-all duration-300 shadow-lg transform hover:-translate-y-px hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:shadow-none focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900/50';

  const variantClasses: Record<ButtonVariant, string> = {
    primary: 'bg-gradient-to-r from-yellow-500 to-amber-600 text-gray-900 hover:brightness-110 focus-visible:ring-yellow-400',
    secondary: 'bg-gray-700/80 text-white hover:bg-gray-700 hover:brightness-110 focus-visible:ring-gray-400',
    danger: 'bg-red-600 text-white hover:bg-red-700 hover:brightness-110 focus-visible:ring-red-400',
    special: 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white hover:brightness-110 focus-visible:ring-purple-400',
    iching: 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:brightness-110 focus-visible:ring-emerald-400',
    shop: 'bg-gradient-to-r from-amber-400 to-yellow-500 text-gray-900 hover:brightness-110 focus-visible:ring-yellow-400',
    numerology: 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:brightness-110 focus-visible:ring-cyan-400',
    palm: 'bg-gradient-to-r from-rose-500 to-pink-600 text-white hover:brightness-110 focus-visible:ring-rose-400',
    tarot: 'bg-gradient-to-r from-purple-600 to-pink-500 text-white hover:brightness-110 focus-visible:ring-purple-400',
  };

  const sizeClasses: Record<ButtonSize, string> = {
    sm: 'py-2 px-4 text-sm',
    md: 'py-3 px-6',
    lg: 'py-4 px-8 text-lg',
  };

  const combinedClasses = [
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    className
  ].join(' ');

  return (
    <button className={combinedClasses} {...props}>
      {children}
    </button>
  );
};

export default Button;