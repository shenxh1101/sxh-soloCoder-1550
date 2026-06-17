import { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: ReactNode;
}

export function Button({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className, 
  icon,
  ...props 
}: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center gap-2 font-medium rounded-xl transition-all duration-200 active:scale-95';
  
  const variants = {
    primary: 'bg-gradient-to-r from-rose-400 to-rose-500 text-white hover:shadow-hover hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed',
    secondary: 'bg-cream-100 text-brown-700 hover:bg-cream-200 border border-rose-100',
    ghost: 'text-brown-500 hover:bg-cream-100',
    danger: 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-100',
  };
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  return (
    <button 
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      {icon}
      {children}
    </button>
  );
}
