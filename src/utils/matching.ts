import { Staff, Appointment, Schedule, Service } from '../types';
import { isSameDayFn, isTimeOverlap, formatDate } from './date';
import { parseISO } from 'date-fns';

export function findAvailableStaff(
  staffList: Staff[],
  appointments: Appointment[],
  schedules: Schedule[],
  service: Service,
  startTime: string,
  endTime: string
): { staff: Staff; score: number; todayCount: number }[] {
  const targetDate = formatDate(startTime);
  
  const available: { staff: Staff; score: number; todayCount: number }[] = [];
  
  const DEFAULT_WORK_START = '09:00';
  const DEFAULT_WORK_END = '21:00';
  
  for (const staff of staffList) {
    if (!staff.active) continue;
    
    const schedule = schedules.find(s => s.staffId === staff.id && s.date === targetDate);
    
    if (schedule && schedule.isDayOff) continue;
    
    const workStartStr = schedule ? schedule.workStart : DEFAULT_WORK_START;
    const workEndStr = schedule ? schedule.workEnd : DEFAULT_WORK_END;
    
    const workStart = parseISO(`${targetDate}T${workStartStr}:00`);
    const workEnd = parseISO(`${targetDate}T${workEndStr}:00`);
    const apptStart = parseISO(startTime);
    const apptEnd = parseISO(endTime);
    
    if (apptStart < workStart || apptEnd > workEnd) continue;
    
    const staffAppointments = appointments.filter(
      a => a.staffId === staff.id && isSameDayFn(a.startTime, startTime) && a.status !== 'cancelled'
    );
    
    const hasConflict = staffAppointments.some(a => 
      isTimeOverlap(a.startTime, a.endTime, startTime, endTime)
    );
    
    if (hasConflict) continue;
    
    let score = 0;
    if (staff.specialties.some(s => service.name.includes(s) || service.category === 'facial' && s.includes('面部'))) {
      score += 10;
    }
    if (staff.specialties.some(s => s.includes(service.category === 'body' ? '身体' : service.category === 'nail' ? '美甲' : '脱毛'))) {
      score += 10;
    }
    
    available.push({
      staff,
      score,
      todayCount: staffAppointments.length,
    });
  }
  
  return available.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.todayCount - b.todayCount;
  });
}
