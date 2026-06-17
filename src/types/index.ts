export type CustomerLevel = 1 | 2 | 3;

export interface Customer {
  id: string;
  name: string;
  phone: string;
  birthday: string;
  level: CustomerLevel;
  createdAt: string;
}

export type ServiceCategory = 'facial' | 'body' | 'nail' | 'hair_removal';

export const ServiceCategoryMap: Record<ServiceCategory, string> = {
  facial: '面部护理',
  body: '身体护理',
  nail: '美甲',
  hair_removal: '脱毛',
};

export type ServiceDuration = 30 | 60 | 90;

export interface ServiceProductItem {
  productId: string;
  quantity: number;
}

export interface Service {
  id: string;
  name: string;
  category: ServiceCategory;
  duration: ServiceDuration;
  price: number;
  description: string;
  products: ServiceProductItem[];
}

export interface Staff {
  id: string;
  name: string;
  avatar: string;
  specialties: string[];
  active: boolean;
}

export interface Schedule {
  id: string;
  staffId: string;
  date: string;
  workStart: string;
  workEnd: string;
  isDayOff: boolean;
}

export type AppointmentStatus = 'pending' | 'checked_in' | 'in_service' | 'completed' | 'cancelled';

export const AppointmentStatusMap: Record<AppointmentStatus, string> = {
  pending: '待签到',
  checked_in: '已签到',
  in_service: '服务中',
  completed: '已完成',
  cancelled: '已取消',
};

export type AssignmentType = 'auto' | 'specified';

export const AssignmentTypeMap: Record<AssignmentType, string> = {
  auto: '系统推荐',
  specified: '客户指定',
};

export interface Appointment {
  id: string;
  customerId: string;
  serviceId: string;
  staffId: string;
  startTime: string;
  endTime: string;
  status: AppointmentStatus;
  isWalkIn: boolean;
  assignmentType: AssignmentType;
  actualStart?: string;
  actualEnd?: string;
  createdAt: string;
  originalPrice?: number;
  actualPrice?: number;
  usedCouponId?: string;
}

export interface ServiceRecord {
  id: string;
  appointmentId: string;
  actualStart: string;
  actualEnd: string;
  remark: string;
}

export interface Product {
  id: string;
  name: string;
  unit: string;
  stock: number;
  warningThreshold: number;
  costPrice: number;
}

export type InventoryLogType = 'in' | 'out' | 'consume';

export const InventoryLogTypeMap: Record<InventoryLogType, string> = {
  in: '入库',
  out: '出库',
  consume: '消耗',
};

export interface InventoryLog {
  id: string;
  productId: string;
  type: InventoryLogType;
  quantity: number;
  remark: string;
  createdAt: string;
  appointmentId?: string;
}

export interface Coupon {
  id: string;
  customerId: string;
  name: string;
  discount: number;
  expireDate: string;
  used: boolean;
  usedAt?: string;
  usedInAppointmentId?: string;
}
