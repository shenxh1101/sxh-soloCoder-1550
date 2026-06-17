import { create } from 'zustand';
import { Service } from '../types';
import { mockServices } from '../utils/mockData';
import { loadFromStorage, saveToStorage } from '../utils/storage';

interface ServiceState {
  services: Service[];
  addService: (service: Omit<Service, 'id'>) => void;
  updateService: (id: string, data: Partial<Service>) => void;
  deleteService: (id: string) => void;
  getServiceById: (id: string) => Service | undefined;
  getServicesByCategory: (category: Service['category']) => Service[];
}

const STORAGE_KEY = 'beauty_services';

export const useServiceStore = create<ServiceState>((set, get) => ({
  services: loadFromStorage(STORAGE_KEY, mockServices),
  
  addService: (service) => {
    const newService: Service = {
      ...service,
      id: `s_${Date.now()}`,
    };
    const updated = [...get().services, newService];
    set({ services: updated });
    saveToStorage(STORAGE_KEY, updated);
  },
  
  updateService: (id, data) => {
    const updated = get().services.map(s => 
      s.id === id ? { ...s, ...data } : s
    );
    set({ services: updated });
    saveToStorage(STORAGE_KEY, updated);
  },
  
  deleteService: (id) => {
    const updated = get().services.filter(s => s.id !== id);
    set({ services: updated });
    saveToStorage(STORAGE_KEY, updated);
  },
  
  getServiceById: (id) => get().services.find(s => s.id === id),
  
  getServicesByCategory: (category) => 
    get().services.filter(s => s.category === category),
}));
