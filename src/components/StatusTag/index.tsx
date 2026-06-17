import { cn } from '@/lib/utils';
import { AppointmentStatus, AppointmentStatusMap } from '../../types';

interface StatusTagProps {
  status: AppointmentStatus;
  className?: string;
}

const statusStyles: Record<AppointmentStatus, string> = {
  pending: 'bg-gold-50 text-gold-600 border-gold-200',
  checked_in: 'bg-rose-50 text-rose-600 border-rose-200',
  in_service: 'bg-emerald-50 text-emerald-600 border-emerald-200',
  completed: 'bg-brown-50 text-brown-500 border-brown-200',
  cancelled: 'bg-gray-50 text-gray-500 border-gray-200',
};

export function StatusTag({ status, className }: StatusTagProps) {
  return (
    <span className={cn(
      'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border',
      statusStyles[status],
      status === 'in_service' && 'animate-breathe',
      className
    )}>
      {AppointmentStatusMap[status]}
    </span>
  );
}
