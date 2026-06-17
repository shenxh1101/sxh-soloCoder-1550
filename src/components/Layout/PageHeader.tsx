import { ReactNode, CSSProperties } from 'react';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
}

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <div className="mb-8 flex items-end justify-between">
      <div>
        <h1 className="font-serif text-2xl font-bold text-brown-700 mb-1">{title}</h1>
        {description && (
          <p className="text-brown-400">{description}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-3">{actions}</div>}
    </div>
  );
}

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  style?: CSSProperties;
}

export function Card({ children, className, onClick, style }: CardProps) {
  return (
    <div 
      className={cn(
        'bg-white rounded-2xl shadow-card border border-rose-50 transition-all duration-300',
        onClick && 'cursor-pointer hover:shadow-hover hover:-translate-y-0.5',
        className
      )}
      onClick={onClick}
      style={style}
    >
      {children}
    </div>
  );
}
