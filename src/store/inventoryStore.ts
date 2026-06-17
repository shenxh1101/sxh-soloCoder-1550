import { create } from 'zustand';
import { Product, InventoryLog, InventoryLogType, Service, ServiceProductItem } from '../types';
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
  consumeProductsForService: (appointmentId: string, products: ServiceProductItem[], serviceName?: string) => void;
  getLowStockProducts: () => Product[];
  addLog: (log: Omit<InventoryLog, 'id' | 'createdAt'>) => void;
  getProductLogs: (productId: string) => InventoryLog[];
  generateRestockSuggestion: (productId: string) => { quantity: number; reason: string };
  batchRestockLowStock: () => void;
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
  
  consumeProductsForService: (appointmentId, products, serviceName = '') => {
    const updated = get().products.map(p => {
      const usage = products.find(sp => sp.productId === p.id);
      if (usage) {
        return { ...p, stock: Math.max(0, p.stock - usage.quantity) };
      }
      return p;
    });
    set({ products: updated });
    saveToStorage(STORAGE_KEY_PRODUCTS, updated);
    
    for (const sp of products) {
      const remark = serviceName ? `服务消耗 - ${serviceName}` : '服务消耗';
      get().addLog({ 
        productId: sp.productId, 
        type: 'consume', 
        quantity: sp.quantity, 
        remark,
        appointmentId
      });
    }
  },
  
  getLowStockProducts: () => 
    get().products.filter(p => p.stock <= p.warningThreshold),
  
  getProductLogs: (productId) => 
    get().inventoryLogs
      .filter(l => l.productId === productId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
  
  generateRestockSuggestion: (productId) => {
    const product = get().getProductById(productId);
    if (!product) return { quantity: 0, reason: '产品不存在' };
    
    const targetStock = product.warningThreshold * 3;
    const needQuantity = Math.max(0, targetStock - product.stock);
    
    const recentConsume = get().inventoryLogs
      .filter(l => l.productId === productId && l.type === 'consume')
      .slice(0, 10);
    const avgConsume = recentConsume.length > 0
      ? recentConsume.reduce((sum, l) => sum + l.quantity, 0) / recentConsume.length
      : product.warningThreshold * 0.5;
    
    if (needQuantity <= 0) {
      return { quantity: 0, reason: '库存充足，无需补货' };
    }
    
    return {
      quantity: Math.ceil(needQuantity / 10) * 10,
      reason: `目标库存 ${targetStock} ${product.unit}（预警值 3 倍），建议补货约 ${Math.ceil(avgConsume * 10)} ${product.unit}/月`
    };
  },
  
  batchRestockLowStock: () => {
    const lowStock = get().getLowStockProducts();
    for (const p of lowStock) {
      const suggestion = get().generateRestockSuggestion(p.id);
      if (suggestion.quantity > 0) {
        get().addInventory(p.id, suggestion.quantity, '系统建议补货');
      }
    }
  },
}));
