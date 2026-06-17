import { create } from 'zustand';
import { Product, InventoryLog, InventoryLogType, Service } from '../types';
import { mockProducts, mockInventoryLogs } from '../utils/mockData';
import { loadFromStorage, saveToStorage } from '../utils/storage';

interface InventoryState {
  products: Product[];
  inventoryLogs: InventoryLog[];
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, data: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  getProductById: (id: string) => Product | undefined;
  addInventory: (productId: string, quantity: number, remark?: string) => void;
  consumeInventory: (productId: string, quantity: number, remark?: string) => void;
  consumeProductsForService: (service: Service, remark?: string) => void;
  getLowStockProducts: () => Product[];
  addLog: (log: Omit<InventoryLog, 'id' | 'createdAt'>) => void;
}

const STORAGE_KEY_PRODUCTS = 'beauty_products';
const STORAGE_KEY_LOGS = 'beauty_inventory_logs';

export const useInventoryStore = create<InventoryState>((set, get) => ({
  products: loadFromStorage(STORAGE_KEY_PRODUCTS, mockProducts),
  inventoryLogs: loadFromStorage(STORAGE_KEY_LOGS, mockInventoryLogs),
  
  addProduct: (product) => {
    const newProduct: Product = {
      ...product,
      id: `p_${Date.now()}`,
    };
    const updated = [...get().products, newProduct];
    set({ products: updated });
    saveToStorage(STORAGE_KEY_PRODUCTS, updated);
  },
  
  updateProduct: (id, data) => {
    const updated = get().products.map(p => 
      p.id === id ? { ...p, ...data } : p
    );
    set({ products: updated });
    saveToStorage(STORAGE_KEY_PRODUCTS, updated);
  },
  
  deleteProduct: (id) => {
    const updated = get().products.filter(p => p.id !== id);
    set({ products: updated });
    saveToStorage(STORAGE_KEY_PRODUCTS, updated);
  },
  
  getProductById: (id) => get().products.find(p => p.id === id),
  
  addLog: (log) => {
    const newLog: InventoryLog = {
      ...log,
      id: `il_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    const updated = [...get().inventoryLogs, newLog];
    set({ inventoryLogs: updated });
    saveToStorage(STORAGE_KEY_LOGS, updated);
  },
  
  addInventory: (productId, quantity, remark = '入库') => {
    const updated = get().products.map(p => 
      p.id === productId ? { ...p, stock: p.stock + quantity } : p
    );
    set({ products: updated });
    saveToStorage(STORAGE_KEY_PRODUCTS, updated);
    get().addLog({ productId, type: 'in', quantity, remark });
  },
  
  consumeInventory: (productId, quantity, remark = '消耗') => {
    const updated = get().products.map(p => 
      p.id === productId ? { ...p, stock: Math.max(0, p.stock - quantity) } : p
    );
    set({ products: updated });
    saveToStorage(STORAGE_KEY_PRODUCTS, updated);
    get().addLog({ productId, type: 'consume', quantity, remark });
  },
  
  consumeProductsForService: (service, remark = '服务消耗') => {
    const productMap = new Map(get().products.map(p => [p.id, p]));
    const updated = get().products.map(p => {
      const usage = service.products.find(sp => sp.productId === p.id);
      if (usage) {
        return { ...p, stock: Math.max(0, p.stock - usage.quantity) };
      }
      return p;
    });
    set({ products: updated });
    saveToStorage(STORAGE_KEY_PRODUCTS, updated);
    
    for (const sp of service.products) {
      get().addLog({ productId: sp.productId, type: 'consume', quantity: sp.quantity, remark: `${remark} - ${service.name}` });
    }
  },
  
  getLowStockProducts: () => 
    get().products.filter(p => p.stock <= p.warningThreshold),
}));
