import { useState, useMemo } from 'react';
import { useAppointmentStore } from '../../store/appointmentStore';
import { useCustomerStore } from '../../store/customerStore';
import { useServiceStore } from '../../store/serviceStore';
import { useStaffStore } from '../../store/staffStore';
import { useInventoryStore } from '../../store/inventoryStore';
import { PageHeader, Card } from '../../components/Layout/PageHeader';
import { StatusTag } from '../../components/StatusTag';
import { Button } from '../../components/Button';
import { NewAppointmentModal } from './NewAppointmentModal';
import { AppointmentDetailModal } from './AppointmentDetailModal';
import { Appointment, AppointmentStatus, AppointmentStatusMap, AssignmentTypeMap } from '../../types';
import { formatDate, formatTime, formatDateCn, diffInMinutes, formatDuration } from '../../utils/date';
import { Plus, CalendarCheck, UserCircle, Scissors, Search, Filter, Sparkles, UserCheck, Timer } from 'lucide-react';

export function Appointments() {
  const [showNewModal, setShowNewModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [filterDate, setFilterDate] = useState(formatDate(new Date()));
  const [filterStatus, setFilterStatus] = useState<AppointmentStatus | 'all'>('all');
  const [filterStaff, setFilterStaff] = useState<string>('all');
  const [searchKeyword, setSearchKeyword] = useState('');

  const appointments = useAppointmentStore(s => s.appointments);
  const updateAppointmentStatus = useAppointmentStore(s => s.updateAppointmentStatus);
  const startService = useAppointmentStore(s => s.startService);
  const completeService = useAppointmentStore(s => s.completeService);
  const consumeProductsForService = useInventoryStore(s => s.consumeProductsForService);
  const services = useServiceStore(s => s.services);
  const customers = useCustomerStore(s => s.customers);
  const staffList = useStaffStore(s => s.staffList);
  const getServiceById = useServiceStore(s => s.getServiceById);

  const filteredAppointments = useMemo(() => {
    return appointments
      .filter(a => filterDate ? formatDate(a.startTime) === filterDate : true)
      .filter(a => filterStatus === 'all' ? true : a.status === filterStatus)
      .filter(a => filterStaff === 'all' ? true : a.staffId === filterStaff)
      .filter(a => {
        if (!searchKeyword.trim()) return true;
        const customer = customers.find(c => c.id === a.customerId);
        const service = services.find(s => s.id === a.serviceId);
        const kw = searchKeyword.toLowerCase();
        return customer?.name.toLowerCase().includes(kw) || 
               customer?.phone.includes(kw) ||
               service?.name.toLowerCase().includes(kw);
      })
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
  }, [appointments, filterDate, filterStatus, filterStaff, searchKeyword, customers, services]);

  const handleUpdateStatus = (id: string, status: AppointmentStatus) => {
    updateAppointmentStatus(id, status);
    
    if (selectedAppointment?.id === id) {
      setSelectedAppointment({ ...selectedAppointment, status });
    }
  };

  const handleStartService = (id: string) => {
    startService(id);
    const updated = appointments.find(a => a.id === id);
    if (selectedAppointment?.id === id && updated) {
      setSelectedAppointment({ ...updated });
    }
  };

  const handleCompleteService = (id: string) => {
    const apt = appointments.find(a => a.id === id);
    completeService(id);
    if (apt) {
      const service = getServiceById(apt.serviceId);
      if (service) {
        consumeProductsForService(apt.id, service.products);
      }
    }
    const updated = appointments.find(a => a.id === id);
    if (selectedAppointment?.id === id && updated) {
      setSelectedAppointment({ ...updated });
    }
  };

  const openDetail = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setShowDetailModal(true);
  };

  const statusOptions: (AppointmentStatus | 'all')[] = ['all', 'pending', 'checked_in', 'in_service', 'completed', 'cancelled'];

  return (
    <div>
      <PageHeader 
        title="预约管理"
        description="管理所有预约，处理服务流程"
        actions={
          <Button onClick={() => setShowNewModal(true)} icon={<Plus className="w-4 h-4" />}>
            新建预约
          </Button>
        }
      />

      <Card className="mb-6 p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brown-400" />
            <input
              type="text"
              placeholder="搜索客户或项目..."
              value={searchKeyword}
              onChange={e => setSearchKeyword(e.target.value)}
              className="pl-10 pr-4 py-2 rounded-xl border border-rose-100 bg-cream-50 focus:outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100 transition-all w-56"
            />
          </div>
          <div className="flex items-center gap-2">
            <CalendarCheck className="w-4 h-4 text-brown-400" />
            <input
              type="date"
              value={filterDate}
              onChange={e => setFilterDate(e.target.value)}
              className="px-3 py-2 rounded-xl border border-rose-100 bg-cream-50 focus:outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100 transition-all"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-brown-400" />
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value as AppointmentStatus | 'all')}
              className="px-3 py-2 rounded-xl border border-rose-100 bg-cream-50 focus:outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100 transition-all"
            >
              {statusOptions.map(s => (
                <option key={s} value={s}>
                  {s === 'all' ? '全部状态' : AppointmentStatusMap[s]}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <UserCircle className="w-4 h-4 text-brown-400" />
            <select
              value={filterStaff}
              onChange={e => setFilterStaff(e.target.value)}
              className="px-3 py-2 rounded-xl border border-rose-100 bg-cream-50 focus:outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100 transition-all"
            >
              <option value="all">全部美容师</option>
              {staffList.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
          {filterDate && (
            <span className="text-sm text-brown-400 ml-auto">
              {formatDateCn(filterDate)} · 共 {filteredAppointments.length} 条
            </span>
          )}
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAppointments.length === 0 ? (
          <Card className="col-span-full py-16">
            <div className="text-center text-brown-400">
              <CalendarCheck className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <p className="text-lg">暂无预约记录</p>
              <p className="text-sm mt-2">点击右上角按钮创建新预约</p>
            </div>
          </Card>
        ) : (
          filteredAppointments.map((appointment, idx) => {
            const customer = customers.find(c => c.id === appointment.customerId);
            const service = services.find(s => s.id === appointment.serviceId);
            const staff = staffList.find(s => s.id === appointment.staffId);
            const actualDuration = appointment.actualStart && appointment.actualEnd
              ? formatDuration(diffInMinutes(appointment.actualStart, appointment.actualEnd))
              : null;

            return (
              <Card 
                key={appointment.id} 
                className={`opacity-0 animate-fade-in-up cursor-pointer stagger-${(idx % 6) + 1}`}
                onClick={() => openDetail(appointment)}
              >
                <div className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-full bg-gradient-to-br from-rose-300 to-gold-300 flex items-center justify-center text-white font-medium">
                        {customer?.name?.[0] || '?'}
                      </div>
                      <div>
                        <p className="font-medium text-brown-700">{customer?.name || '未知客户'}</p>
                        <p className="text-xs text-brown-400">{customer?.phone}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                      <StatusTag status={appointment.status} />
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full flex items-center gap-0.5 ${
                        appointment.assignmentType === 'specified'
                          ? 'bg-gold-50 text-gold-600 border border-gold-200'
                          : 'bg-rose-50 text-rose-500 border border-rose-200'
                      }`}>
                        {appointment.assignmentType === 'specified' ? (
                          <><UserCheck className="w-2.5 h-2.5" />{AssignmentTypeMap[appointment.assignmentType]}</>
                        ) : (
                          <><Sparkles className="w-2.5 h-2.5" />{AssignmentTypeMap[appointment.assignmentType]}</>
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2 text-sm">
                      <Scissors className="w-4 h-4 text-rose-400" />
                      <span className="text-brown-600">{service?.name || '未知项目'}</span>
                      <span className="ml-auto text-rose-500 font-medium">¥{service?.price || 0}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CalendarCheck className="w-4 h-4 text-rose-400" />
                      <span className="text-brown-600">{formatTime(appointment.startTime)} - {formatTime(appointment.endTime)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <UserCircle className="w-4 h-4 text-rose-400" />
                      <span className="text-brown-600">{staff?.name || '未分配'}</span>
                    </div>
                    {actualDuration && (
                      <div className="flex items-center gap-2 text-sm">
                        <Timer className="w-4 h-4 text-gold-500" />
                        <span className="text-gold-600 font-medium">实际用时 {actualDuration}</span>
                      </div>
                    )}
                  </div>

                  {['pending', 'checked_in', 'in_service'].includes(appointment.status) && (
                    <div className="mt-4 pt-4 border-t border-rose-50 flex gap-2">
                      {appointment.status === 'pending' && (
                        <Button 
                          size="sm" 
                          variant="secondary" 
                          className="flex-1"
                          onClick={e => { e.stopPropagation(); handleUpdateStatus(appointment.id, 'checked_in'); }}
                        >
                          签到
                        </Button>
                      )}
                      {appointment.status === 'checked_in' && (
                        <Button 
                          size="sm" 
                          className="flex-1"
                          onClick={e => { e.stopPropagation(); handleStartService(appointment.id); }}
                        >
                          开始服务
                        </Button>
                      )}
                      {appointment.status === 'in_service' && (
                        <Button 
                          size="sm" 
                          className="flex-1"
                          onClick={e => { e.stopPropagation(); handleCompleteService(appointment.id); }}
                        >
                          完成服务
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </Card>
            );
          })
        )}
      </div>

      <NewAppointmentModal 
        open={showNewModal} 
        onClose={() => setShowNewModal(false)} 
      />
      <AppointmentDetailModal
        open={showDetailModal}
        onClose={() => { setShowDetailModal(false); setSelectedAppointment(null); }}
        appointment={selectedAppointment}
        onUpdateStatus={handleUpdateStatus}
      />
    </div>
  );
}
