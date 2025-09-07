import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'special' | 'iching' | 'shop' | 'numerology' | 'palm' | 'tarot' | 'flow' | 'dayselection';
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
  const baseClasses = 'flex items-center justify-center gap-2 font-bold rounded-lg transition-all duration-300 transform hover:-translate-y-px disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:shadow-none focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900/50';

  const variantClasses: Record<ButtonVariant, string> = {
    primary: 'bg-gradient-to-r from-yellow-500 to-amber-600 text-gray-900 hover:from-yellow-400 hover:to-amber-500 focus-visible:ring-yellow-400 shadow-lg shadow-yellow-500/20 hover:shadow-xl hover:shadow-yellow-400/30',
    secondary: 'bg-gray-700/80 text-white hover:bg-gray-700 focus-visible:ring-gray-400 shadow-lg shadow-black/20 hover:shadow-xl hover:shadow-black/30',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-400 shadow-lg shadow-red-500/20 hover:shadow-xl hover:shadow-red-500/30',
    special: 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white hover:brightness-110 focus-visible:ring-purple-400 shadow-lg shadow-purple-500/20 hover:shadow-xl hover:shadow-purple-500/30',
    iching: 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:brightness-110 focus-visible:ring-emerald-400 shadow-lg shadow-emerald-500/20 hover:shadow-xl hover:shadow-emerald-500/30',
    shop: 'bg-gradient-to-r from-amber-400 to-yellow-500 text-gray-900 hover:brightness-110 focus-visible:ring-yellow-400 shadow-lg shadow-amber-500/20 hover:shadow-xl hover:shadow-amber-500/30',
    numerology: 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:brightness-110 focus-visible:ring-cyan-400 shadow-lg shadow-cyan-500/20 hover:shadow-xl hover:shadow-cyan-500/30',
    palm: 'bg-gradient-to-r from-rose-500 to-pink-600 text-white hover:brightness-110 focus-visible:ring-rose-400 shadow-lg shadow-rose-500/20 hover:shadow-xl hover:shadow-rose-500/30',
    tarot: 'bg-gradient-to-r from-purple-600 to-pink-500 text-white hover:brightness-110 focus-visible:ring-purple-400 shadow-lg shadow-purple-500/20 hover:shadow-xl hover:shadow-purple-500/30',
    flow: 'bg-gradient-to-r from-sky-400 to-fuchsia-500 text-white hover:brightness-110 focus-visible:ring-sky-400 shadow-lg shadow-sky-500/20 hover:shadow-xl hover:shadow-sky-500/30',
    dayselection: 'bg-gradient-to-r from-teal-500 to-cyan-600 text-white hover:brightness-110 focus-visible:ring-teal-400 shadow-lg shadow-teal-500/20 hover:shadow-xl hover:shadow-teal-500/30',
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