import { useState, useMemo } from 'react';
import { Modal } from '../../components/Modal';
import { Button } from '../../components/Button';
import { StatusTag } from '../../components/StatusTag';
import { useCustomerStore } from '../../store/customerStore';
import { useServiceStore } from '../../store/serviceStore';
import { useStaffStore } from '../../store/staffStore';
import { useInventoryStore } from '../../store/inventoryStore';
import { Appointment, AppointmentStatus, AssignmentTypeMap } from '../../types';
import { formatDateTime, formatDuration, diffInMinutes } from '../../utils/date';
import { UserCircle, Scissors, Clock, CalendarCheck, Package, Phone, Play, CheckCircle, XCircle, Sparkles, UserCheck, Timer } from 'lucide-react';
import { useAppointmentStore } from '../../store/appointmentStore';

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
  const startService = useAppointmentStore(s => s.startService);
  const completeService = useAppointmentStore(s => s.completeService);
  const consumeProductsForService = useInventoryStore(s => s.consumeProductsForService);

  if (!appointment || !customer || !service) return null;

  const usedProducts = service.products.map(sp => ({
    product: products.find(p => p.id === sp.productId),
    quantity: sp.quantity,
  })).filter(p => p.product);

  const actualDuration = useMemo(() => {
    if (!appointment.actualStart || !appointment.actualEnd) return null;
    return diffInMinutes(appointment.actualStart, appointment.actualEnd);
  }, [appointment.actualStart, appointment.actualEnd]);

  const handleStartService = () => {
    startService(appointment.id);
  };

  const handleComplete = () => {
    completeService(appointment.id);
    consumeProductsForService(appointment.id, service.products);
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
          <div className="flex flex-col items-end gap-2">
            <StatusTag status={appointment.status} />
            <span className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 ${
              appointment.assignmentType === 'specified'
                ? 'bg-gold-50 text-gold-600 border border-gold-200'
                : 'bg-rose-50 text-rose-500 border border-rose-200'
            }`}>
              {appointment.assignmentType === 'specified' ? (
                <><UserCheck className="w-3 h-3" />{AssignmentTypeMap[appointment.assignmentType]}</>
              ) : (
                <><Sparkles className="w-3 h-3" />{AssignmentTypeMap[appointment.assignmentType]}</>
              )}
            </span>
          </div>
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
            <p className="text-sm text-brown-500 mt-0.5">预计 {formatDateTime(appointment.endTime).split(' ')[1]} 结束</p>
          </div>
          <div className="p-4 bg-cream-50 rounded-xl">
            <div className="flex items-center gap-2 text-sm text-brown-400 mb-2">
              <Clock className="w-4 h-4" />
              <span>预约时长</span>
            </div>
            <p className="font-medium text-brown-700">
              {formatDuration(diffInMinutes(appointment.startTime, appointment.endTime))}
            </p>
          </div>
        </div>

        {(appointment.actualStart || appointment.actualEnd || actualDuration !== null) && (
          <div className="p-4 bg-gold-50 rounded-xl border border-gold-100">
            <div className="flex items-center gap-2 text-sm text-gold-600 font-medium mb-3">
              <Timer className="w-4 h-4" />
              <span>服务实际记录</span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <p className="text-xs text-brown-400 mb-1">实际开始</p>
                <p className="text-sm font-medium text-brown-700">
                  {appointment.actualStart ? formatDateTime(appointment.actualStart).split(' ')[1] : '--:--'}
                </p>
              </div>
              <div>
                <p className="text-xs text-brown-400 mb-1">实际结束</p>
                <p className="text-sm font-medium text-brown-700">
                  {appointment.actualEnd ? formatDateTime(appointment.actualEnd).split(' ')[1] : '--:--'}
                </p>
              </div>
              <div>
                <p className="text-xs text-brown-400 mb-1">实际用时</p>
                <p className="text-sm font-medium text-gold-600">
                  {actualDuration !== null ? formatDuration(actualDuration) : '--'}
                </p>
              </div>
            </div>
          </div>
        )}

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
