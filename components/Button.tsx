import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'special' | 'iching' | 'shop' | 'numerology' | 'palm' | 'tarot' | 'flow' | 'dayselection' | 'graphology' | 'career' | 'talisman' | 'naming' | 'bioenergy' | 'fortune' | 'wealth' | 'prayer' | 'fengshui';
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
  const baseClasses = 'flex items-center justify-center gap-2 font-bold rounded-lg transition-all duration-300 transform hover:scale-[1.03] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:shadow-none focus:outline-none focus-visible:ring-4 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-background)]';

  const variantClasses: Record<ButtonVariant, string> = {
    primary: 'bg-gradient-to-br from-[var(--color-primary)] to-amber-600 text-[var(--color-background)] hover:brightness-110 focus-visible:ring-yellow-400 shadow-lg shadow-yellow-500/20 hover:shadow-xl hover:shadow-yellow-400/30',
    secondary: 'bg-gray-700/80 text-white hover:bg-gray-700 focus-visible:ring-gray-400 shadow-lg shadow-black/20 hover:shadow-xl hover:shadow-black/40',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-400 shadow-lg shadow-red-500/30 hover:shadow-xl hover:shadow-red-500/40',
    special: 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white hover:brightness-110 focus-visible:ring-purple-400 shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40',
    iching: 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:brightness-110 focus-visible:ring-emerald-400 shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40',
    shop: 'bg-gradient-to-r from-amber-400 to-yellow-500 text-gray-900 hover:brightness-110 focus-visible:ring-yellow-400 shadow-lg shadow-amber-500/30 hover:shadow-xl hover:shadow-amber-500/40',
    numerology: 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:brightness-110 focus-visible:ring-cyan-400 shadow-lg shadow-cyan-500/30 hover:shadow-xl hover:shadow-cyan-500/40',
    palm: 'bg-gradient-to-r from-rose-500 to-pink-600 text-white hover:brightness-110 focus-visible:ring-rose-400 shadow-lg shadow-rose-500/30 hover:shadow-xl hover:shadow-rose-500/40',
    tarot: 'bg-gradient-to-r from-purple-600 to-pink-500 text-white hover:brightness-110 focus-visible:ring-purple-400 shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40',
    flow: 'bg-gradient-to-r from-sky-400 to-fuchsia-500 text-white hover:brightness-110 focus-visible:ring-sky-400 shadow-lg shadow-sky-500/30 hover:shadow-xl hover:shadow-sky-500/40',
    dayselection: 'bg-gradient-to-r from-teal-500 to-cyan-600 text-white hover:brightness-110 focus-visible:ring-teal-400 shadow-lg shadow-teal-500/30 hover:shadow-xl hover:shadow-teal-500/40',
    graphology: 'bg-gradient-to-r from-slate-600 to-indigo-600 text-white hover:brightness-110 focus-visible:ring-indigo-400 shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40',
    career: 'bg-gradient-to-r from-blue-500 to-teal-500 text-white hover:brightness-110 focus-visible:ring-blue-400 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40',
    talisman: 'bg-gradient-to-r from-red-600 to-amber-600 text-white hover:brightness-110 focus-visible:ring-red-400 shadow-lg shadow-red-500/30 hover:shadow-xl hover:shadow-red-500/40',
    naming: 'bg-gradient-to-r from-sky-500 to-green-500 text-white hover:brightness-110 focus-visible:ring-sky-400 shadow-lg shadow-sky-500/30 hover:shadow-xl hover:shadow-sky-500/40',
    bioenergy: 'bg-gradient-to-r from-cyan-400 to-green-500 text-white hover:brightness-110 focus-visible:ring-cyan-400 shadow-lg shadow-cyan-500/30 hover:shadow-xl hover:shadow-cyan-500/40',
    fortune: 'bg-gradient-to-r from-red-600 to-amber-500 text-white hover:brightness-110 focus-visible:ring-red-400 shadow-lg shadow-red-500/30 hover:shadow-xl hover:shadow-red-500/40',
    wealth: 'bg-gradient-to-r from-amber-500 to-yellow-400 text-gray-900 hover:brightness-110 focus-visible:ring-amber-400 shadow-lg shadow-amber-500/30 hover:shadow-xl hover:shadow-amber-500/40',
    prayer: 'bg-gradient-to-r from-emerald-600 to-yellow-600 text-white hover:brightness-110 focus-visible:ring-emerald-400 shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40',
    fengshui: 'bg-gradient-to-r from-green-600 to-emerald-700 text-white hover:brightness-110 focus-visible:ring-green-400 shadow-lg shadow-green-500/30 hover:shadow-xl hover:shadow-green-500/40',
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
