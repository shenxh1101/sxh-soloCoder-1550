import { create } from 'zustand';
import { Coupon } from '../types';
import { mockCoupons } from '../utils/mockData';
import { loadFromStorage, saveToStorage } from '../utils/storage';
import { addDays, format } from 'date-fns';

interface CouponState {
  coupons: Coupon[];
  issueCoupon: (customerId: string, name: string, discount: number, validDays?: number) => void;
  markCouponUsed: (couponId: string) => void;
  getCustomerCoupons: (customerId: string) => Coupon[];
  deleteCoupon: (couponId: string) => void;
}

const STORAGE_KEY = 'beauty_coupons';

export const useCouponStore = create<CouponState>((set, get) => ({
  coupons: loadFromStorage(STORAGE_KEY, mockCoupons),

  issueCoupon: (customerId, name, discount, validDays = 30) => {
    const newCoupon: Coupon = {
      id: `cp_${Date.now()}`,
      customerId,
      name,
      discount,
      expireDate: format(addDays(new Date(), validDays), 'yyyy-MM-dd'),
      used: false,
    };
    const updated = [...get().coupons, newCoupon];
    set({ coupons: updated });
    saveToStorage(STORAGE_KEY, updated);
  },

  markCouponUsed: (couponId) => {
    const updated = get().coupons.map(c =>
      c.id === couponId ? { ...c, used: true } : c
    );
    set({ coupons: updated });
    saveToStorage(STORAGE_KEY, updated);
  },

  getCustomerCoupons: (customerId) => {
    return get().coupons
      .filter(c => c.customerId === customerId)
      .sort((a, b) => new Date(b.expireDate).getTime() - new Date(a.expireDate).getTime());
  },

  deleteCoupon: (couponId) => {
    const updated = get().coupons.filter(c => c.id !== couponId);
    set({ coupons: updated });
    saveToStorage(STORAGE_KEY, updated);
  },
}));
