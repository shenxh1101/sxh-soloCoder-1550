import { create } from 'zustand';
import { Appointment, AppointmentStatus } from '../types';
import { mockAppointments } from '../utils/mockData';
import { loadFromStorage, saveToStorage } from '../utils/storage';

interface AppointmentState {
  appointments: Appointment[];
  addAppointment: (appointment: Omit<Appointment, 'id' | 'createdAt'>) => void;
  updateAppointmentStatus: (id: string, status: AppointmentStatus) => void;
  deleteAppointment: (id: string) => void;
  getAppointmentById: (id: string) => Appointment | undefined;
  getTodayAppointments: () => Appointment[];
}

const STORAGE_KEY = 'beauty_appointments';

export const useAppointmentStore = create<AppointmentState>((set, get) => ({
  appointments: loadFromStorage(STORAGE_KEY, mockAppointments),
  
  addAppointment: (appointment) => {
    const newAppointment: Appointment = {
      ...appointment,
      id: `a_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    const updated = [...get().appointments, newAppointment];
    set({ appointments: updated });
    saveToStorage(STORAGE_KEY, updated);
  },
  
  updateAppointmentStatus: (id, status) => {
    const updated = get().appointments.map(a => 
      a.id === id ? { ...a, status } : a
    );
    set({ appointments: updated });
    saveToStorage(STORAGE_KEY, updated);
  },
  
  deleteAppointment: (id) => {
    const updated = get().appointments.filter(a => a.id !== id);
    set({ appointments: updated });
    saveToStorage(STORAGE_KEY, updated);
  },
  
  getAppointmentById: (id) => get().appointments.find(a => a.id === id),
  
  getTodayAppointments: () => {
    const today = new Date().toDateString();
    return get().appointments.filter(a => 
      new Date(a.startTime).toDateString() === today
    ).sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
  },
}));
