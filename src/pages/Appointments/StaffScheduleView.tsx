import { useMemo, useState } from 'react';
import { useAppointmentStore } from '../../store/appointmentStore';
import { useStaffStore } from '../../store/staffStore';
import { useServiceStore } from '../../store/serviceStore';
import { useCustomerStore } from '../../store/customerStore';
import { Card } from '../../components/Layout/PageHeader';
import { Button } from '../../components/Button';
import { Appointment, AppointmentStatus } from '../../types';
import { formatTime, formatDate } from '../../utils/date';
import { Clock, User, AlertTriangle, Plus } from 'lucide-react';

interface StaffScheduleViewProps {
  date: string;
  onNewAppointment?: (staffId: string, time: string) => void;
  onAppointmentClick?: (appointment: Appointment) => void;
}

const START_HOUR = 9;
const END_HOUR = 21;
const HOUR_HEIGHT = 60;

export function StaffScheduleView({ date, onNewAppointment, onAppointmentClick }: StaffScheduleViewProps) {
  const appointments = useAppointmentStore(s => s.appointments);
  const staffList = useStaffStore(s => s.staffList);
  const services = useServiceStore(s => s.services);
  const customers = useCustomerStore(s => s.customers);
  const [hoverSlot, setHoverSlot] = useState<{ staffId: string; time: string } | null>(null);

  const dayAppointments = useMemo(() => {
    return appointments.filter(a => formatDate(a.startTime) === date);
  }, [appointments, date]);

  const staffAppointments = useMemo(() => {
    const map: Record<string, Appointment[]> = {};
    for (const staff of staffList) {
      map[staff.id] = dayAppointments.filter(a => a.staffId === staff.id)
        .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
    }
    return map;
  }, [dayAppointments, staffList]);

  const conflicts = useMemo(() => {
    const conflictMap: Record<string, Set<string>> = {};
    for (const staff of staffList) {
      conflictMap[staff.id] = new Set();
      const staffApts = staffAppointments[staff.id] || [];
      for (let i = 0; i < staffApts.length; i++) {
        for (let j = i + 1; j < staffApts.length; j++) {
          const a = staffApts[i];
          const b = staffApts[j];
          if (new Date(a.startTime) < new Date(b.endTime) && new Date(a.endTime) > new Date(b.startTime)) {
            conflictMap[staff.id].add(a.id);
            conflictMap[staff.id].add(b.id);
          }
        }
      }
    }
    return conflictMap;
  }, [staffAppointments, staffList]);

  const timeSlots = useMemo(() => {
    const slots: string[] = [];
    for (let h = START_HOUR; h < END_HOUR; h++) {
      slots.push(`${h.toString().padStart(2, '0')}:00`);
    }
    return slots;
  }, []);

  const getAppointmentStyle = (apt: Appointment) => {
    const start = new Date(apt.startTime);
    const end = new Date(apt.endTime);
    const startMinutes = start.getHours() * 60 + start.getMinutes();
    const endMinutes = end.getHours() * 60 + end.getMinutes();
    const top = ((startMinutes - START_HOUR * 60) / 60) * HOUR_HEIGHT;
    const height = Math.max(28, ((endMinutes - startMinutes) / 60) * HOUR_HEIGHT - 4);
    return { top: `${top}px`, height: `${height}px` };
  };

  const statusColors: Record<AppointmentStatus, string> = {
    pending: 'bg-rose-100 border-rose-300 text-rose-700',
    checked_in: 'bg-gold-100 border-gold-300 text-gold-700',
    in_service: 'bg-emerald-100 border-emerald-300 text-emerald-700',
    completed: 'bg-gray-100 border-gray-300 text-gray-600',
    cancelled: 'bg-gray-50 border-gray-200 text-gray-400 line-through',
  };

  const handleTimeSlotClick = (staffId: string, hour: number) => {
    if (onNewAppointment) {
      onNewAppointment(staffId, `${hour.toString().padStart(2, '0')}:00`);
    }
  };

  return (
    <Card className="overflow-hidden">
      <div className="flex">
        <div className="w-16 flex-shrink-0 border-r border-rose-100">
          <div className="h-14 border-b border-rose-100 flex items-center justify-center">
            <Clock className="w-4 h-4 text-brown-400" />
          </div>
          {timeSlots.map(time => (
            <div 
              key={time} 
              className="text-xs text-brown-400 text-right pr-2 pt-1"
              style={{ height: `${HOUR_HEIGHT}px` }}
            >
              {time}
            </div>
          ))}
        </div>

        <div className="flex-1 overflow-x-auto">
          <div className="flex" style={{ minWidth: `${staffList.length * 180}px` }}>
            {staffList.map(staff => (
              <div key={staff.id} className="flex-1 min-w-[180px] border-r border-rose-100 last:border-r-0">
                <div className="h-14 border-b border-rose-100 flex items-center justify-center px-2">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-rose-400" />
                    <span className="text-sm font-medium text-brown-700">{staff.name}</span>
                  </div>
                </div>

                <div 
                  className="relative" 
                  style={{ height: `${(END_HOUR - START_HOUR) * HOUR_HEIGHT}px` }}
                >
                  {timeSlots.map((_, idx) => {
                    const hour = START_HOUR + idx;
                    const timeStr = `${hour.toString().padStart(2, '0')}:00`;
                    return (
                      <div
                        key={idx}
                        className="absolute left-0 right-0 border-b border-rose-50 hover:bg-rose-50/50 cursor-pointer transition-colors"
                        style={{ top: `${idx * HOUR_HEIGHT}px`, height: `${HOUR_HEIGHT}px` }}
                        onClick={() => handleTimeSlotClick(staff.id, hour)}
                        onMouseEnter={() => setHoverSlot({ staffId: staff.id, time: timeStr })}
                        onMouseLeave={() => setHoverSlot(null)}
                      >
                        {hoverSlot?.staffId === staff.id && hoverSlot?.time === timeStr && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Button size="sm" variant="secondary" icon={<Plus className="w-3 h-3" />}>
                              新建
                            </Button>
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {staffAppointments[staff.id]?.map(apt => {
                    const customer = customers.find(c => c.id === apt.customerId);
                    const service = services.find(s => s.id === apt.serviceId);
                    const style = getAppointmentStyle(apt);
                    const hasConflict = conflicts[staff.id]?.has(apt.id);
                    
                    return (
                      <div
                        key={apt.id}
                        className={`absolute left-1 right-1 rounded-lg border-l-4 px-2 py-1 overflow-hidden cursor-pointer transition-all hover:shadow-md z-10 ${statusColors[apt.status]} ${hasConflict ? 'ring-2 ring-rose-400 ring-offset-1' : ''}`}
                        style={style}
                        onClick={e => { e.stopPropagation(); onAppointmentClick?.(apt); }}
                      >
                        <div className="text-xs font-medium truncate">{customer?.name || '未知'}</div>
                        <div className="text-[10px] truncate opacity-80">{service?.name || ''}</div>
                        <div className="text-[10px] opacity-70">
                          {formatTime(apt.startTime)} - {formatTime(apt.endTime)}
                        </div>
                        {hasConflict && (
                          <div className="absolute top-1 right-1">
                            <AlertTriangle className="w-3 h-3 text-rose-500" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="p-3 bg-cream-50 border-t border-rose-100 flex items-center justify-between">
        <div className="flex items-center gap-4 text-xs text-brown-500">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-rose-100 border border-rose-300"></span>
            <span>待签到</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-gold-100 border border-gold-300"></span>
            <span>已签到</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-emerald-100 border border-emerald-300"></span>
            <span>服务中</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-gray-100 border border-gray-300"></span>
            <span>已完成</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded ring-2 ring-rose-400 ring-offset-1"></span>
            <span>时间冲突</span>
          </div>
        </div>
        <div className="text-xs text-brown-400">
          点击空白时段可快速创建预约
        </div>
      </div>
    </Card>
  );
}
