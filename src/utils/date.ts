import { format, parseISO, isToday, isSameDay, differenceInMinutes, addDays, startOfDay, endOfDay, isWithinInterval } from 'date-fns';
import { zhCN } from 'date-fns/locale';

export function formatDateTime(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'yyyy-MM-dd HH:mm');
}

export function formatTime(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'HH:mm');
}

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'yyyy-MM-dd');
}

export function formatDateCn(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'M月d日 EEEE', { locale: zhCN });
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}分钟`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}小时${mins}分钟` : `${hours}小时`;
}

export function isTodayFn(date: string | Date): boolean {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return isToday(d);
}

export function isSameDayFn(date1: string | Date, date2: string | Date): boolean {
  const d1 = typeof date1 === 'string' ? parseISO(date1) : date1;
  const d2 = typeof date2 === 'string' ? parseISO(date2) : date2;
  return isSameDay(d1, d2);
}

export function diffInMinutes(start: string | Date, end: string | Date): number {
  const s = typeof start === 'string' ? parseISO(start) : start;
  const e = typeof end === 'string' ? parseISO(end) : end;
  return differenceInMinutes(e, s);
}

export function todayRange() {
  const now = new Date();
  return { start: startOfDay(now), end: endOfDay(now) };
}

export function addDaysFn(date: string | Date, days: number): Date {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return addDays(d, days);
}

export function isTimeOverlap(
  start1: string | Date, end1: string | Date,
  start2: string | Date, end2: string | Date
): boolean {
  const s1 = typeof start1 === 'string' ? parseISO(start1) : start1;
  const e1 = typeof end1 === 'string' ? parseISO(end1) : end1;
  const s2 = typeof start2 === 'string' ? parseISO(start2) : start2;
  const e2 = typeof end2 === 'string' ? parseISO(end2) : end2;
  
  return isWithinInterval(s1, { start: s2, end: e2 }) ||
         isWithinInterval(e1, { start: s2, end: e2 }) ||
         isWithinInterval(s2, { start: s1, end: e1 });
}

export function isBirthdaySoon(birthday: string, daysAhead: number = 7): boolean {
  const today = new Date();
  const birth = parseISO(birthday);
  const thisYearBirthday = new Date(today.getFullYear(), birth.getMonth(), birth.getDate());
  
  if (thisYearBirthday < today) {
    thisYearBirthday.setFullYear(today.getFullYear() + 1);
  }
  
  const diff = differenceInMinutes(thisYearBirthday, today);
  return diff >= 0 && diff <= daysAhead * 24 * 60;
}

export function getDaysUntilBirthday(birthday: string): number {
  const today = new Date();
  const birth = parseISO(birthday);
  let thisYearBirthday = new Date(today.getFullYear(), birth.getMonth(), birth.getDate());
  
  if (thisYearBirthday < startOfDay(today)) {
    thisYearBirthday = new Date(today.getFullYear() + 1, birth.getMonth(), birth.getDate());
  }
  
  return Math.ceil(differenceInMinutes(thisYearBirthday, startOfDay(today)) / (24 * 60));
}
