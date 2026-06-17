import { useState } from 'react';
import { useCustomerStore } from '../../store/customerStore';
import { useAppointmentStore } from '../../store/appointmentStore';
import { useServiceStore } from '../../store/serviceStore';
import { PageHeader, Card } from '../../components/Layout/PageHeader';
import { Button } from '../../components/Button';
import { Modal } from '../../components/Modal';
import { Customer, CustomerLevel } from '../../types';
import { formatDateTime, getDaysUntilBirthday, isBirthdaySoon } from '../../utils/date';
import { Plus, Search, Phone, Cake, CalendarCheck, Scissors, Star, Gift } from 'lucide-react';

const levelMap: Record<CustomerLevel, { label: string; color: string }> = {
  1: { label: '普通会员', color: 'bg-brown-50 text-brown-500 border-brown-200' },
  2: { label: '银卡会员', color: 'bg-gray-50 text-gray-600 border-gray-200' },
  3: { label: '金卡会员', color: 'bg-gold-50 text-gold-600 border-gold-200' },
};

export function Customers() {
  const { customers, searchCustomers, addCustomer, updateCustomer } = useCustomerStore();
  const appointments = useAppointmentStore(s => s.appointments);
  const services = useServiceStore(s => s.services);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [showNewModal, setShowNewModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newBirthday, setNewBirthday] = useState('');
  const [newLevel, setNewLevel] = useState<CustomerLevel>(1);

  const filteredCustomers = searchCustomers(searchKeyword);

  const handleAddCustomer = () => {
    if (!newName.trim() || !newPhone.trim()) return;
    addCustomer({
      name: newName.trim(),
      phone: newPhone.trim(),
      birthday: newBirthday,
      level: newLevel,
    });
    setNewName('');
    setNewPhone('');
    setNewBirthday('');
    setNewLevel(1);
    setShowNewModal(false);
  };

  const customerAppointments = (customerId: string) => 
    appointments.filter(a => a.customerId === customerId).length;

  const customerSpent = (customerId: string) =>
    appointments
      .filter(a => a.customerId === customerId && a.status === 'completed')
      .reduce((sum, a) => sum + (services.find(s => s.id === a.serviceId)?.price || 0), 0);

  const openDetail = (customer: Customer) => {
    setSelectedCustomer(customer);
    setShowDetailModal(true);
  };

  const customerApptList = selectedCustomer 
    ? appointments
        .filter(a => a.customerId === selectedCustomer.id)
        .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
        .slice(0, 10)
    : [];

  return (
    <div>
      <PageHeader 
        title="客户管理"
        description="管理客户档案和会员信息"
        actions={
          <Button onClick={() => setShowNewModal(true)} icon={<Plus className="w-4 h-4" />}>
            添加客户
          </Button>
        }
      />

      <Card className="mb-6 p-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brown-400" />
          <input
            type="text"
            placeholder="搜索客户姓名或手机号..."
            value={searchKeyword}
            onChange={e => setSearchKeyword(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-rose-100 bg-cream-50 focus:outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100 transition-all"
          />
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCustomers.map((customer, idx) => (
          <Card 
            key={customer.id} 
            className="cursor-pointer opacity-0 animate-fade-in-up"
            style={{ animationDelay: `${idx * 0.05}s`, animationFillMode: 'forwards' }}
            onClick={() => openDetail(customer)}
          >
            <div className="p-5">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-rose-300 to-gold-300 flex items-center justify-center text-white font-medium text-xl shadow-soft">
                  {customer.name[0]}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-serif font-semibold text-lg text-brown-700">{customer.name}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-xs border ${levelMap[customer.level].color}`}>
                      {levelMap[customer.level].label}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-brown-400">
                    <Phone className="w-3.5 h-3.5" />
                    {customer.phone}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2 bg-cream-50 rounded-lg">
                  <p className="text-lg font-semibold text-rose-500">{customerAppointments(customer.id)}</p>
                  <p className="text-xs text-brown-400">到店次数</p>
                </div>
                <div className="p-2 bg-cream-50 rounded-lg">
                  <p className="text-lg font-semibold text-gold-500">¥{customerSpent(customer.id)}</p>
                  <p className="text-xs text-brown-400">累计消费</p>
                </div>
                <div className="p-2 bg-cream-50 rounded-lg">
                  {customer.birthday && isBirthdaySoon(customer.birthday, 30) ? (
                    <>
                      <p className="text-sm font-semibold text-rose-500 animate-breathe">
                        {getDaysUntilBirthday(customer.birthday)}天后
                      </p>
                      <p className="text-xs text-rose-400 flex items-center justify-center gap-1">
                        <Cake className="w-3 h-3" /> 生日
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-sm font-semibold text-brown-500">-</p>
                      <p className="text-xs text-brown-400">生日提醒</p>
                    </>
                  )}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Modal
        open={showNewModal}
        onClose={() => setShowNewModal(false)}
        title="添加新客户"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowNewModal(false)}>取消</Button>
            <Button onClick={handleAddCustomer} disabled={!newName.trim() || !newPhone.trim()}>确认添加</Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-brown-600 mb-2">客户姓名 *</label>
            <input
              type="text"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              placeholder="请输入客户姓名"
              className="w-full px-4 py-2.5 rounded-xl border border-rose-100 bg-cream-50 focus:outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100 transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-brown-600 mb-2">手机号码 *</label>
            <input
              type="tel"
              value={newPhone}
              onChange={e => setNewPhone(e.target.value)}
              placeholder="请输入手机号码"
              className="w-full px-4 py-2.5 rounded-xl border border-rose-100 bg-cream-50 focus:outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100 transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-brown-600 mb-2 flex items-center gap-2">
              <Cake className="w-4 h-4 text-rose-400" /> 生日日期
            </label>
            <input
              type="date"
              value={newBirthday}
              onChange={e => setNewBirthday(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-rose-100 bg-cream-50 focus:outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100 transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-brown-600 mb-2 flex items-center gap-2">
              <Star className="w-4 h-4 text-gold-400" /> 会员等级
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3].map(level => (
                <button
                  key={level}
                  onClick={() => setNewLevel(level as CustomerLevel)}
                  className={`py-2.5 rounded-xl text-sm font-medium transition-all border ${
                    newLevel === level
                      ? `${levelMap[level as CustomerLevel].color} border-2`
                      : 'bg-cream-50 text-brown-500 border-transparent hover:bg-cream-100'
                  }`}
                >
                  {levelMap[level as CustomerLevel].label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Modal>

      <Modal
        open={showDetailModal}
        onClose={() => { setShowDetailModal(false); setSelectedCustomer(null); }}
        title="客户详情"
      >
        {selectedCustomer && (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-rose-300 to-gold-300 flex items-center justify-center text-white font-medium text-2xl shadow-soft">
                {selectedCustomer.name[0]}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-serif font-bold text-xl text-brown-700">{selectedCustomer.name}</h3>
                  <span className={`px-2.5 py-1 rounded-full text-xs border ${levelMap[selectedCustomer.level].color}`}>
                    {levelMap[selectedCustomer.level].label}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-sm text-brown-400">
                  <Phone className="w-3.5 h-3.5" />
                  {selectedCustomer.phone}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 bg-rose-50 rounded-xl text-center">
                <CalendarCheck className="w-6 h-6 text-rose-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-rose-600">{customerAppointments(selectedCustomer.id)}</p>
                <p className="text-xs text-brown-500">累计到店</p>
              </div>
              <div className="p-4 bg-gold-50 rounded-xl text-center">
                <Scissors className="w-6 h-6 text-gold-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gold-600">¥{customerSpent(selectedCustomer.id)}</p>
                <p className="text-xs text-brown-500">累计消费</p>
              </div>
              <div className="p-4 bg-cream-100 rounded-xl text-center">
                <Gift className="w-6 h-6 text-brown-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-brown-600">
                  {selectedCustomer.birthday ? getDaysUntilBirthday(selectedCustomer.birthday) : '-'}
                </p>
                <p className="text-xs text-brown-500">距生日(天)</p>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-brown-700 mb-3 flex items-center gap-2">
                <CalendarCheck className="w-4 h-4 text-rose-400" />
                最近到店记录
              </h4>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {customerApptList.length === 0 ? (
                  <p className="text-center py-6 text-brown-400 text-sm">暂无到店记录</p>
                ) : (
                  customerApptList.map(apt => {
                    const service = services.find(s => s.id === apt.serviceId);
                    return (
                      <div key={apt.id} className="flex items-center justify-between p-3 bg-cream-50 rounded-lg">
                        <div>
                          <p className="text-sm font-medium text-brown-700">{service?.name || '未知项目'}</p>
                          <p className="text-xs text-brown-400">{formatDateTime(apt.startTime)}</p>
                        </div>
                        <span className="text-sm text-rose-500 font-medium">¥{service?.price || 0}</span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
