import { Customer, Service, Staff, Product, Appointment, Coupon, Schedule, InventoryLog, ServiceRecord } from '../types';
import { addDays, addHours, addMinutes, format, setHours, setMinutes, startOfDay } from 'date-fns';

const today = startOfDay(new Date());

export const mockCustomers: Customer[] = [
  { id: 'c1', name: '张美丽', phone: '13800138001', birthday: '1990-06-25', level: 3, createdAt: '2024-01-15T10:00:00' },
  { id: 'c2', name: '李晓华', phone: '13800138002', birthday: '1988-07-02', level: 2, createdAt: '2024-02-20T14:30:00' },
  { id: 'c3', name: '王芳芳', phone: '13800138003', birthday: '1995-06-30', level: 1, createdAt: '2024-03-05T09:15:00' },
  { id: 'c4', name: '赵敏', phone: '13800138004', birthday: '1992-08-12', level: 2, createdAt: '2024-03-18T16:45:00' },
  { id: 'c5', name: '陈静怡', phone: '13800138005', birthday: '1985-06-20', level: 3, createdAt: '2024-04-01T11:20:00' },
  { id: 'c6', name: '刘婷婷', phone: '13800138006', birthday: '1993-07-08', level: 1, createdAt: '2024-04-22T13:50:00' },
  { id: 'c7', name: '周小婷', phone: '13800138007', birthday: '1998-01-15', level: 2, createdAt: '2024-05-10T10:30:00' },
  { id: 'c8', name: '吴雨晴', phone: '13800138008', birthday: '1991-12-03', level: 1, createdAt: '2024-05-25T15:00:00' },
];

export const mockServices: Service[] = [
  { id: 's1', name: '深层补水护理', category: 'facial', duration: 60, price: 388, description: '深层清洁补水，改善干燥肌肤', products: [{ productId: 'p1', quantity: 1 }, { productId: 'p3', quantity: 1 }] },
  { id: 's2', name: '抗衰紧致护理', category: 'facial', duration: 90, price: 688, description: '提拉紧致，淡化细纹', products: [{ productId: 'p1', quantity: 1 }, { productId: 'p4', quantity: 1 }] },
  { id: 's3', name: '基础清洁护理', category: 'facial', duration: 30, price: 188, description: '清洁毛孔，提亮肤色', products: [{ productId: 'p1', quantity: 1 }] },
  { id: 's4', name: '精油SPA全身按摩', category: 'body', duration: 90, price: 588, description: '全身放松，舒缓压力', products: [{ productId: 'p2', quantity: 2 }] },
  { id: 's5', name: '背部疏通护理', category: 'body', duration: 60, price: 368, description: '经络疏通，缓解疲劳', products: [{ productId: 'p2', quantity: 1 }, { productId: 'p5', quantity: 1 }] },
  { id: 's6', name: '精致美甲', category: 'nail', duration: 60, price: 258, description: '基础保养+涂色', products: [] },
  { id: 's7', name: '日式光疗美甲', category: 'nail', duration: 90, price: 458, description: '光疗延长+款式设计', products: [] },
  { id: 's8', name: '腋下脱毛', category: 'hair_removal', duration: 30, price: 128, description: '冰点无痛脱毛', products: [] },
  { id: 's9', name: '四肢脱毛', category: 'hair_removal', duration: 60, price: 488, description: '双臂双腿脱毛', products: [] },
];

export const mockStaff: Staff[] = [
  { id: 'st1', name: '林美容', avatar: '', specialties: ['面部护理', '抗衰护理'], active: true },
  { id: 'st2', name: '王美体', avatar: '', specialties: ['身体护理', 'SPA按摩'], active: true },
  { id: 'st3', name: '陈美甲', avatar: '', specialties: ['美甲', '手部护理'], active: true },
  { id: 'st4', name: '小美', avatar: '', specialties: ['面部护理', '脱毛'], active: true },
];

function createTime(dayOffset: number, hour: number, minute: number, durationMin: number) {
  const start = setMinutes(setHours(addDays(today, dayOffset), hour), minute);
  return {
    startTime: start.toISOString(),
    endTime: addMinutes(start, durationMin).toISOString(),
  };
}

export const mockAppointments: Appointment[] = [
  { id: 'a1', customerId: 'c1', serviceId: 's1', staffId: 'st1', ...createTime(0, 10, 0, 60), status: 'completed', isWalkIn: false, createdAt: '2026-06-16T09:00:00' },
  { id: 'a2', customerId: 'c2', serviceId: 's4', staffId: 'st2', ...createTime(0, 11, 0, 90), status: 'in_service', isWalkIn: false, createdAt: '2026-06-16T09:30:00' },
  { id: 'a3', customerId: 'c3', serviceId: 's6', staffId: 'st3', ...createTime(0, 13, 0, 60), status: 'checked_in', isWalkIn: false, createdAt: '2026-06-16T10:00:00' },
  { id: 'a4', customerId: 'c4', serviceId: 's2', staffId: 'st1', ...createTime(0, 14, 30, 90), status: 'pending', isWalkIn: false, createdAt: '2026-06-16T10:15:00' },
  { id: 'a5', customerId: 'c5', serviceId: 's8', staffId: 'st4', ...createTime(0, 15, 0, 30), status: 'pending', isWalkIn: true, createdAt: '2026-06-17T08:00:00' },
  { id: 'a6', customerId: 'c6', serviceId: 's5', staffId: 'st2', ...createTime(0, 16, 0, 60), status: 'pending', isWalkIn: false, createdAt: '2026-06-16T14:00:00' },
  { id: 'a7', customerId: 'c1', serviceId: 's3', staffId: 'st4', ...createTime(1, 10, 0, 30), status: 'pending', isWalkIn: false, createdAt: '2026-06-16T15:00:00' },
  { id: 'a8', customerId: 'c7', serviceId: 's7', staffId: 'st3', ...createTime(1, 14, 0, 90), status: 'pending', isWalkIn: false, createdAt: '2026-06-16T16:30:00' },
];

export const mockProducts: Product[] = [
  { id: 'p1', name: '玻尿酸补水面膜', unit: '片', stock: 45, warningThreshold: 20, costPrice: 35 },
  { id: 'p2', name: '薰衣草精油', unit: 'ml', stock: 180, warningThreshold: 50, costPrice: 8 },
  { id: 'p3', name: '保湿精华液', unit: 'ml', stock: 25, warningThreshold: 30, costPrice: 45 },
  { id: 'p4', name: '抗衰面霜', unit: 'g', stock: 12, warningThreshold: 15, costPrice: 80 },
  { id: 'p5', name: '身体磨砂膏', unit: 'g', stock: 8, warningThreshold: 20, costPrice: 55 },
  { id: 'p6', name: '玫瑰纯露', unit: 'ml', stock: 200, warningThreshold: 100, costPrice: 5 },
  { id: 'p7', name: '卸妆乳', unit: 'ml', stock: 60, warningThreshold: 30, costPrice: 25 },
];

export const mockCoupons: Coupon[] = [
  { id: 'cp1', customerId: 'c1', name: '生日专属8折券', discount: 0.8, expireDate: format(addDays(today, 30), 'yyyy-MM-dd'), used: false },
  { id: 'cp2', customerId: 'c5', name: '生日专属8折券', discount: 0.8, expireDate: format(addDays(today, 7), 'yyyy-MM-dd'), used: false },
];

export const mockSchedules: Schedule[] = mockStaff.map((s, idx) => ({
  id: `sch_${s.id}`,
  staffId: s.id,
  date: format(today, 'yyyy-MM-dd'),
  workStart: '09:00',
  workEnd: '21:00',
  isDayOff: idx === 3,
}));

export const mockInventoryLogs: InventoryLog[] = [
  { id: 'il1', productId: 'p1', type: 'in', quantity: 50, remark: '月初进货', createdAt: '2026-06-01T10:00:00' },
  { id: 'il2', productId: 'p2', type: 'in', quantity: 200, remark: '月初进货', createdAt: '2026-06-01T10:00:00' },
  { id: 'il3', productId: 'p1', type: 'consume', quantity: 5, remark: '服务消耗', createdAt: '2026-06-10T14:30:00' },
  { id: 'il4', productId: 'p3', type: 'consume', quantity: 8, remark: '服务消耗', createdAt: '2026-06-12T16:00:00' },
];

export const mockServiceRecords: ServiceRecord[] = [
  { id: 'sr1', appointmentId: 'a1', actualStart: createTime(0, 10, 0, 60).startTime, actualEnd: createTime(0, 10, 0, 60).endTime, remark: '客户对补水效果很满意' },
];
