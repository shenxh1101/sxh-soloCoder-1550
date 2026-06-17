import { useState, useMemo, useEffect } from 'react';
import { Modal } from '../../components/Modal';
import { Button } from '../../components/Button';
import { useCustomerStore } from '../../store/customerStore';
import { useServiceStore } from '../../store/serviceStore';
import { useStaffStore } from '../../store/staffStore';
import { useAppointmentStore } from '../../store/appointmentStore';
import { useInventoryStore } from '../../store/inventoryStore';
import { Customer, ServiceCategory, ServiceCategoryMap, Appointment, AssignmentType } from '../../types';
import { findAvailableStaff } from '../../utils/matching';
import { formatDate, formatDateTime } from '../../utils/date';
import { addMinutes, parseISO, format } from 'date-fns';
import { UserPlus, Search, Check, ChevronRight, Scissors, UserCircle, Clock, CalendarCheck, Sparkles, UserCheck } from 'lucide-react';

interface NewAppointmentModalProps {
  open: boolean;
  onClose: () => void;
  onCreated?: (date: string) => void;
}

type Step = 1 | 2 | 3 | 4;

export function NewAppointmentModal({ open, onClose, onCreated }: NewAppointmentModalProps) {
  const [step, setStep] = useState<Step>(1);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newCustomerPhone, setNewCustomerPhone] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedServiceId, setSelectedServiceId] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState(formatDate(new Date()));
  const [selectedTime, setSelectedTime] = useState('10:00');
  const [selectedStaffId, setSelectedStaffId] = useState<string>('');
  const [isNewCustomer, setIsNewCustomer] = useState(false);
  const [assignmentType, setAssignmentType] = useState<AssignmentType>('auto');

  const { customers, searchCustomers, addCustomer } = useCustomerStore();
  const services = useServiceStore(s => s.services);
  const { staffList, schedules } = useStaffStore();
  const appointments = useAppointmentStore(s => s.appointments);
  const addAppointment = useAppointmentStore(s => s.addAppointment);

  const filteredCustomers = useMemo(() => 
    searchCustomers(searchKeyword), [searchKeyword, searchCustomers]
  );

  const selectedService = services.find(s => s.id === selectedServiceId);

  const availableStaff = useMemo(() => {
    if (!selectedService || !selectedDate || !selectedTime) return [];
    const startTime = parseISO(`${selectedDate}T${selectedTime}:00`);
    const endTime = addMinutes(startTime, selectedService.duration);
    return findAvailableStaff(
      staffList, appointments, schedules, selectedService,
      startTime.toISOString(), endTime.toISOString()
    );
  }, [selectedService, selectedDate, selectedTime, staffList, appointments, schedules]);

  useEffect(() => {
    if (assignmentType === 'auto' && availableStaff.length > 0) {
      setSelectedStaffId(availableStaff[0].staff.id);
    }
  }, [availableStaff, assignmentType]);

  const handleStaffSelect = (staffId: string) => {
    setSelectedStaffId(staffId);
    const recommendedId = availableStaff[0]?.staff.id;
    if (staffId !== recommendedId) {
      setAssignmentType('specified');
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1: return isNewCustomer ? (newCustomerName.trim() && newCustomerPhone.trim()) : !!selectedCustomer;
      case 2: return !!selectedServiceId;
      case 3: return !!selectedDate && !!selectedTime;
      case 4: return !!selectedStaffId;
      default: return false;
    }
  };

  const handleNext = () => {
    if (step < 4) setStep((step + 1) as Step);
  };

  const handlePrev = () => {
    if (step > 1) setStep((step - 1) as Step);
  };

  const handleSubmit = () => {
    let customerId = selectedCustomer?.id;
    
    if (isNewCustomer) {
      const newCustomer: Customer = {
        id: '',
        name: newCustomerName.trim(),
        phone: newCustomerPhone.trim(),
        birthday: '',
        level: 1,
        createdAt: '',
      };
      addCustomer(newCustomer);
      const customers = useCustomerStore.getState().customers;
      customerId = customers[customers.length - 1].id;
    }

    if (!customerId || !selectedService || !selectedStaffId) return;

    const startTime = parseISO(`${selectedDate}T${selectedTime}:00`);
    const endTime = addMinutes(startTime, selectedService.duration);

    addAppointment({
      customerId,
      serviceId: selectedServiceId,
      staffId: selectedStaffId,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      status: 'pending',
      isWalkIn: false,
      assignmentType,
    });

    resetForm();
    if (onCreated) {
      onCreated(selectedDate);
    } else {
      onClose();
    }
  };

  const resetForm = () => {
    setStep(1);
    setSelectedCustomer(null);
    setNewCustomerName('');
    setNewCustomerPhone('');
    setSearchKeyword('');
    setSelectedServiceId('');
    setSelectedDate(formatDate(new Date()));
    setSelectedTime('10:00');
    setSelectedStaffId('');
    setIsNewCustomer(false);
    setAssignmentType('auto');
  };

  const stepLabels = ['选择客户', '选择项目', '选择时间', '分配美容师'];

  const categories: ServiceCategory[] = ['facial', 'body', 'nail', 'hair_removal'];

  return (
    <Modal
      open={open}
      onClose={() => { resetForm(); onClose(); }}
      title="新建预约"
      footer={
        <>
          {step > 1 && (
            <Button variant="secondary" onClick={handlePrev}>上一步</Button>
          )}
          {step < 4 ? (
            <Button onClick={handleNext} disabled={!canProceed()}>下一步</Button>
          ) : (
            <Button onClick={handleSubmit} disabled={!canProceed()}>确认预约</Button>
          )}
        </>
      }
    >
      <div className="mb-6">
        <div className="flex items-center gap-2">
          {stepLabels.map((label, idx) => (
            <div key={label} className="flex-1">
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                  idx + 1 <= step 
                    ? 'bg-gradient-to-br from-rose-400 to-rose-500 text-white' 
                    : 'bg-cream-200 text-brown-400'
                }`}>
                  {idx + 1 < step ? <Check className="w-4 h-4" /> : idx + 1}
                </div>
                <span className={`text-sm ${idx + 1 <= step ? 'text-brown-700 font-medium' : 'text-brown-400'}`}>
                  {label}
                </span>
              </div>
              {idx < stepLabels.length - 1 && (
                <div className={`h-0.5 mt-2 ${idx + 1 < step ? 'bg-rose-400' : 'bg-cream-200'}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {step === 1 && (
        <div className="space-y-4">
          {!isNewCustomer ? (
            <>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brown-400" />
                <input
                  type="text"
                  placeholder="搜索客户姓名或手机号..."
                  value={searchKeyword}
                  onChange={e => setSearchKeyword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-rose-100 bg-cream-50 focus:outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100 transition-all"
                />
              </div>
              <div className="max-h-64 overflow-y-auto space-y-2">
                {filteredCustomers.length === 0 ? (
                  <div className="py-8 text-center text-brown-400 text-sm">
                    未找到客户，可创建新客户
                  </div>
                ) : (
                  filteredCustomers.map(customer => (
                    <div
                      key={customer.id}
                      onClick={() => setSelectedCustomer(customer)}
                      className={`p-3 rounded-xl cursor-pointer transition-all flex items-center gap-3 ${
                        selectedCustomer?.id === customer.id
                          ? 'bg-rose-50 border-2 border-rose-300'
                          : 'bg-cream-50 hover:bg-cream-100 border-2 border-transparent'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-rose-300 to-gold-300 flex items-center justify-center text-white font-medium">
                        {customer.name[0]}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-brown-700">{customer.name}</p>
                        <p className="text-sm text-brown-400">{customer.phone}</p>
                      </div>
                      {selectedCustomer?.id === customer.id && (
                        <Check className="w-5 h-5 text-rose-500" />
                      )}
                    </div>
                  ))
                )}
              </div>
              <button
                onClick={() => setIsNewCustomer(true)}
                className="w-full py-2.5 rounded-xl border-2 border-dashed border-rose-200 text-rose-500 hover:bg-rose-50 transition-colors flex items-center justify-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                创建新客户
              </button>
            </>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-brown-600 mb-2">客户姓名</label>
                <input
                  type="text"
                  value={newCustomerName}
                  onChange={e => setNewCustomerName(e.target.value)}
                  placeholder="请输入客户姓名"
                  className="w-full px-4 py-2.5 rounded-xl border border-rose-100 bg-cream-50 focus:outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-brown-600 mb-2">手机号码</label>
                <input
                  type="tel"
                  value={newCustomerPhone}
                  onChange={e => setNewCustomerPhone(e.target.value)}
                  placeholder="请输入手机号码"
                  className="w-full px-4 py-2.5 rounded-xl border border-rose-100 bg-cream-50 focus:outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100 transition-all"
                />
              </div>
              <button
                onClick={() => setIsNewCustomer(false)}
                className="text-sm text-brown-400 hover:text-brown-600"
              >
                ← 从已有客户中选择
              </button>
            </div>
          )}
        </div>
      )}

      {step === 2 && (
        <div className="space-y-6">
          {categories.map(cat => {
            const catServices = services.filter(s => s.category === cat);
            if (catServices.length === 0) return null;
            return (
              <div key={cat}>
                <h4 className="text-sm font-medium text-brown-500 mb-3 flex items-center gap-2">
                  <Scissors className="w-4 h-4 text-rose-400" />
                  {ServiceCategoryMap[cat]}
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {catServices.map(service => (
                    <div
                      key={service.id}
                      onClick={() => setSelectedServiceId(service.id)}
                      className={`p-3 rounded-xl cursor-pointer transition-all ${
                        selectedServiceId === service.id
                          ? 'bg-rose-50 border-2 border-rose-300'
                          : 'bg-cream-50 hover:bg-cream-100 border-2 border-transparent'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-1">
                        <p className="font-medium text-brown-700">{service.name}</p>
                        {selectedServiceId === service.id && (
                          <Check className="w-4 h-4 text-rose-500 flex-shrink-0" />
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-sm text-brown-400">
                        <span>{service.duration}分钟</span>
                        <span className="text-rose-500 font-medium">¥{service.price}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {step === 3 && (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-brown-600 mb-2 flex items-center gap-2">
              <CalendarCheck className="w-4 h-4 text-rose-400" />
              选择日期
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-rose-100 bg-cream-50 focus:outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100 transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-brown-600 mb-2 flex items-center gap-2">
              <Clock className="w-4 h-4 text-rose-400" />
              选择时间
            </label>
            <div className="grid grid-cols-5 gap-2">
              {['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'].map(time => (
                <button
                  key={time}
                  onClick={() => setSelectedTime(time)}
                  className={`py-2 rounded-xl text-sm transition-all ${
                    selectedTime === time
                      ? 'bg-gradient-to-r from-rose-400 to-rose-500 text-white shadow-soft'
                      : 'bg-cream-50 hover:bg-cream-100 text-brown-600'
                  }`}
                >
                  {time}
                </button>
              ))}
            </div>
          </div>
          {selectedService && (
            <div className="p-4 bg-rose-50 rounded-xl">
              <p className="text-sm text-brown-500">
                服务时长：<span className="font-medium text-brown-700">{selectedService.duration}分钟</span>
                ，预计结束时间：<span className="font-medium text-brown-700">
                  {format(addMinutes(parseISO(`${selectedDate}T${selectedTime}:00`), selectedService.duration), 'HH:mm')}
                </span>
              </p>
            </div>
          )}
        </div>
      )}

      {step === 4 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 p-1 bg-cream-100 rounded-xl">
            <button
              onClick={() => {
                setAssignmentType('auto');
                if (availableStaff.length > 0) {
                  setSelectedStaffId(availableStaff[0].staff.id);
                }
              }}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-1.5 ${
                assignmentType === 'auto'
                  ? 'bg-white shadow-sm text-rose-500'
                  : 'text-brown-500 hover:text-brown-700'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              系统智能推荐
            </button>
            <button
              onClick={() => setAssignmentType('specified')}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-1.5 ${
                assignmentType === 'specified'
                  ? 'bg-white shadow-sm text-gold-600'
                  : 'text-brown-500 hover:text-brown-700'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              客户主动指定
            </button>
          </div>

          {availableStaff.length === 0 ? (
            <div className="py-12 text-center text-brown-400">
              <UserCircle className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p>该时段暂无空闲美容师</p>
              <p className="text-sm mt-2">请更换时间或项目</p>
            </div>
          ) : (
            availableStaff.map(({ staff, score, todayCount }, idx) => (
              <div
                key={staff.id}
                onClick={() => handleStaffSelect(staff.id)}
                className={`p-4 rounded-xl cursor-pointer transition-all ${
                  selectedStaffId === staff.id
                    ? 'bg-rose-50 border-2 border-rose-300'
                    : 'bg-cream-50 hover:bg-cream-100 border-2 border-transparent'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-rose-300 to-gold-300 flex items-center justify-center text-white font-medium text-lg">
                    {staff.name[0]}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-brown-700">{staff.name}</p>
                      {idx === 0 && assignmentType === 'auto' && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-rose-100 text-rose-500 flex items-center gap-1">
                          <Sparkles className="w-3 h-3" />
                          最优推荐
                        </span>
                      )}
                      {score > 0 && assignmentType !== 'auto' && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-gold-100 text-gold-600">擅长匹配</span>
                      )}
                      {selectedStaffId === staff.id && assignmentType === 'specified' && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-gold-100 text-gold-600 flex items-center gap-1">
                          <UserCheck className="w-3 h-3" />
                          客户指定
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-brown-400">
                      <span>擅长：{staff.specialties.join('、')}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-brown-500">今日已安排</p>
                    <p className="font-medium text-brown-700">{todayCount} 个预约</p>
                  </div>
                  {selectedStaffId === staff.id && (
                    <Check className="w-5 h-5 text-rose-500" />
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </Modal>
  );
}
