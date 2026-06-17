import { create } from 'zustand';
import { Customer } from '../types';
import { mockCustomers } from '../utils/mockData';
import { loadFromStorage, saveToStorage } from '../utils/storage';
import { isBirthdaySoon } from '../utils/date';

interface CustomerState {
  customers: Customer[];
  addCustomer: (customer: Omit<Customer, 'id' | 'createdAt'>) => void;
  updateCustomer: (id: string, data: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;
  getCustomerById: (id: string) => Customer | undefined;
  searchCustomers: (keyword: string) => Customer[];
  getUpcomingBirthdayCustomers: (days?: number) => Customer[];
}

const STORAGE_KEY = 'beauty_customers';

export const useCustomerStore = create<CustomerState>((set, get) => ({
  customers: loadFromStorage(STORAGE_KEY, mockCustomers),
  
  addCustomer: (customer) => {
    const newCustomer: Customer = {
      ...customer,
      id: `c_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    const updated = [...get().customers, newCustomer];
    set({ customers: updated });
    saveToStorage(STORAGE_KEY, updated);
  },
  
  updateCustomer: (id, data) => {
    const updated = get().customers.map(c => 
      c.id === id ? { ...c, ...data } : c
    );
    set({ customers: updated });
    saveToStorage(STORAGE_KEY, updated);
  },
  
  deleteCustomer: (id) => {
    const updated = get().customers.filter(c => c.id !== id);
    set({ customers: updated });
    saveToStorage(STORAGE_KEY, updated);
  },
  
  getCustomerById: (id) => get().customers.find(c => c.id === id),
  
  searchCustomers: (keyword) => {
    const kw = keyword.toLowerCase().trim();
    if (!kw) return get().customers;
    return get().customers.filter(c => 
      c.name.toLowerCase().includes(kw) || c.phone.includes(kw)
    );
  },
  
  getUpcomingBirthdayCustomers: (days = 7) => {
    return get().customers.filter(c => isBirthdaySoon(c.birthday, days));
  },
}));
