import { useState } from 'react';
import { Modal } from '../../components/Modal';
import { Button } from '../../components/Button';
import { StatusTag } from '../../components/StatusTag';
import { useCustomerStore } from '../../store/customerStore';
import { useServiceStore } from '../../store/serviceStore';
import { useStaffStore } from '../../store/staffStore';
import { useInventoryStore } from '../../store/inventoryStore';
import { Appointment, AppointmentStatus } from '../../types';
import { formatDateTime, formatDuration, diffInMinutes } from '../../utils/date';
import { UserCircle, Scissors, Clock, CalendarCheck, Package, Phone, Play, CheckCircle, XCircle } from 'lucide-react';

interface AppointmentDetailModalProps {
  open: boolean;
  onClose: () => void;
  appointment: Appointment | null;
  onUpdateStatus: (id: string, status: AppointmentStatus) => void;
}

export function AppointmentDetailModal({ open, onClose, appointment, onUpdateStatus }: AppointmentDetailModalProps) {
  const customer = useCustomerStore(s => appointment ? s.getCustomerById(appointment.customerId) : undefined);
  const service = useServiceStore(s => appointment ? s.getServiceById(appointment.serviceId) : undefined);
  const staff = useStaffStore(s => appointment ? s.getStaffById(appointment.staffId) : undefined);
  const products = useInventoryStore(s => s.products);

  if (!appointment || !customer || !service) return null;

  const usedProducts = service.products.map(sp => ({
    product: products.find(p => p.id === sp.productId),
    quantity: sp.quantity,
  })).filter(p => p.product);

  const handleStartService = () => {
    onUpdateStatus(appointment.id, 'in_service');
  };

  const handleComplete = () => {
    onUpdateStatus(appointment.id, 'completed');
    onClose();
  };

  const handleCancel = () => {
    if (confirm('确定要取消此预约吗？')) {
      onUpdateStatus(appointment.id, 'cancelled');
      onClose();
    }
  };

  const canCheckIn = appointment.status === 'pending';
  const canStart = appointment.status === 'checked_in';
  const canComplete = appointment.status === 'in_service';
  const canCancel = ['pending', 'checked_in'].includes(appointment.status);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="预约详情"
      footer={
        <>
          {canCancel && (
            <Button variant="danger" onClick={handleCancel} icon={<XCircle className="w-4 h-4" />}>
              取消预约
            </Button>
          )}
          {canCheckIn && (
            <Button variant="secondary" onClick={() => onUpdateStatus(appointment.id, 'checked_in')}>
              客户签到
            </Button>
          )}
          {canStart && (
            <Button onClick={handleStartService} icon={<Play className="w-4 h-4" />}>
              开始服务
            </Button>
          )}
          {canComplete && (
            <Button onClick={handleComplete} icon={<CheckCircle className="w-4 h-4" />}>
              完成服务
            </Button>
          )}
        </>
      }
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-rose-300 to-gold-300 flex items-center justify-center text-white font-medium text-xl">
              {customer.name[0]}
            </div>
            <div>
              <h3 className="font-serif text-xl font-semibold text-brown-700">{customer.name}</h3>
              <div className="flex items-center gap-2 text-sm text-brown-400 mt-1">
                <Phone className="w-3.5 h-3.5" />
                {customer.phone}
              </div>
            </div>
          </div>
          <StatusTag status={appointment.status} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-cream-50 rounded-xl">
            <div className="flex items-center gap-2 text-sm text-brown-400 mb-2">
              <Scissors className="w-4 h-4" />
              <span>服务项目</span>
            </div>
            <p className="font-medium text-brown-700">{service.name}</p>
            <p className="text-sm text-brown-500 mt-1">¥{service.price} · {formatDuration(service.duration)}</p>
          </div>
          <div className="p-4 bg-cream-50 rounded-xl">
            <div className="flex items-center gap-2 text-sm text-brown-400 mb-2">
              <UserCircle className="w-4 h-4" />
              <span>美容师</span>
            </div>
            <p className="font-medium text-brown-700">{staff?.name || '未分配'}</p>
            <p className="text-sm text-brown-500 mt-1">{staff?.specialties.join('、')}</p>
          </div>
          <div className="p-4 bg-cream-50 rounded-xl">
            <div className="flex items-center gap-2 text-sm text-brown-400 mb-2">
              <CalendarCheck className="w-4 h-4" />
              <span>预约时间</span>
            </div>
            <p className="font-medium text-brown-700">{formatDateTime(appointment.startTime)}</p>
          </div>
          <div className="p-4 bg-cream-50 rounded-xl">
            <div className="flex items-center gap-2 text-sm text-brown-400 mb-2">
              <Clock className="w-4 h-4" />
              <span>时长</span>
            </div>
            <p className="font-medium text-brown-700">
              {formatDuration(diffInMinutes(appointment.startTime, appointment.endTime))}
            </p>
          </div>
        </div>

        {usedProducts.length > 0 && (
          <div className="p-4 bg-rose-50 rounded-xl">
            <div className="flex items-center gap-2 text-sm text-brown-500 mb-3">
              <Package className="w-4 h-4 text-rose-500" />
              <span>本次服务将消耗以下产品</span>
            </div>
            <div className="space-y-2">
              {usedProducts.map(({ product, quantity }) => (
                <div key={product!.id} className="flex items-center justify-between text-sm">
                  <span className="text-brown-700">{product!.name}</span>
                  <span className="text-brown-500">{quantity} {product!.unit}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {appointment.isWalkIn && (
          <div className="text-center py-2">
            <span className="px-3 py-1 rounded-full text-xs bg-gold-50 text-gold-600 border border-gold-200">
              到店客户
            </span>
          </div>
        )}
      </div>
    </Modal>
  );
}
