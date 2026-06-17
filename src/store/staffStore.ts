import { create } from 'zustand';
import { Staff, Schedule } from '../types';
import { mockStaff, mockSchedules } from '../utils/mockData';
import { loadFromStorage, saveToStorage } from '../utils/storage';

interface StaffState {
  staffList: Staff[];
  schedules: Schedule[];
  addStaff: (staff: Omit<Staff, 'id'>) => void;
  updateStaff: (id: string, data: Partial<Staff>) => void;
  deleteStaff: (id: string) => void;
  getStaffById: (id: string) => Staff | undefined;
  getActiveStaff: () => Staff[];
  setSchedule: (schedule: Omit<Schedule, 'id'>) => void;
}

const STORAGE_KEY_STAFF = 'beauty_staff';
const STORAGE_KEY_SCHEDULE = 'beauty_schedules';

export const useStaffStore = create<StaffState>((set, get) => ({
  staffList: loadFromStorage(STORAGE_KEY_STAFF, mockStaff),
  schedules: loadFromStorage(STORAGE_KEY_SCHEDULE, mockSchedules),
  
  addStaff: (staff) => {
    const newStaff: Staff = {
      ...staff,
      id: `st_${Date.now()}`,
    };
    const updated = [...get().staffList, newStaff];
    set({ staffList: updated });
    saveToStorage(STORAGE_KEY_STAFF, updated);
  },
  
  updateStaff: (id, data) => {
    const updated = get().staffList.map(s => 
      s.id === id ? { ...s, ...data } : s
    );
    set({ staffList: updated });
    saveToStorage(STORAGE_KEY_STAFF, updated);
  },
  
  deleteStaff: (id) => {
    const updated = get().staffList.filter(s => s.id !== id);
    set({ staffList: updated });
    saveToStorage(STORAGE_KEY_STAFF, updated);
  },
  
  getStaffById: (id) => get().staffList.find(s => s.id === id),
  
  getActiveStaff: () => get().staffList.filter(s => s.active),
  
  setSchedule: (schedule) => {
    const existing = get().schedules.find(
      s => s.staffId === schedule.staffId && s.date === schedule.date
    );
    let updated: Schedule[];
    if (existing) {
      updated = get().schedules.map(s => 
        s.id === existing.id ? { ...s, ...schedule } : s
      );
    } else {
      const newSchedule: Schedule = {
        ...schedule,
        id: `sch_${Date.now()}`,
      };
      updated = [...get().schedules, newSchedule];
    }
    set({ schedules: updated });
    saveToStorage(STORAGE_KEY_SCHEDULE, updated);
  },
}));
