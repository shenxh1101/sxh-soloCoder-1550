import { useMemo } from 'react';
import { useAppointmentStore } from '../../store/appointmentStore';
import { useCustomerStore } from '../../store/customerStore';
import { useInventoryStore } from '../../store/inventoryStore';
import { useServiceStore } from '../../store/serviceStore';
import { useStaffStore } from '../../store/staffStore';
import { PageHeader, Card } from '../../components/Layout/PageHeader';
import { StatusTag } from '../../components/StatusTag';
import { 
  CalendarCheck, 
  Clock, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  Cake, 
  Package,
  ChevronRight,
  UserCircle,
  Scissors
} from 'lucide-react';
import { formatTime, formatDateCn, getDaysUntilBirthday, isBirthdaySoon, isTodayFn } from '../../utils/date';
import { useNavigate } from 'react-router-dom';

export function Dashboard() {
  const navigate = useNavigate();
  const appointments = useAppointmentStore(s => s.appointments);
  const customers = useCustomerStore(s => s.customers);
  const products = useInventoryStore(s => s.products);
  const services = useServiceStore(s => s.services);
  const staffList = useStaffStore(s => s.staffList);

  const todayAppointments = useMemo(() => 
    appointments
      .filter(a => isTodayFn(a.startTime))
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()),
    [appointments]
  );

  const birthdayCustomers = useMemo(() => 
    customers.filter(c => isBirthdaySoon(c.birthday, 7)),
    [customers]
  );

  const lowStockProducts = useMemo(() => 
    products.filter(p => p.stock <= p.warningThreshold),
    [products]
  );
  
  const pendingCount = todayAppointments.filter(a => a.status === 'pending').length;
  const inServiceCount = todayAppointments.filter(a => a.status === 'in_service').length;
  const completedCount = todayAppointments.filter(a => a.status === 'completed').length;
  const checkedInCount = todayAppointments.filter(a => a.status === 'checked_in').length;
  
  const todayRevenue = todayAppointments
    .filter(a => a.status === 'completed')
    .reduce((sum, a) => {
      const service = services.find(s => s.id === a.serviceId);
      return sum + (service?.price || 0);
    }, 0);

  const stats = [
    { label: '今日预约', value: todayAppointments.length, icon: CalendarCheck, gradient: 'from-rose-400 to-rose-500' },
    { label: '待签到', value: pendingCount, icon: Clock, gradient: 'from-gold-400 to-gold-500' },
    { label: '服务中', value: inServiceCount + checkedInCount, icon: Sparkles, gradient: 'from-emerald-400 to-emerald-500' },
    { label: '已完成', value: completedCount, icon: CheckCircle2, gradient: 'from-brown-400 to-brown-500' },
  ];

  return (
    <div>
      <PageHeader 
        title={formatDateCn(new Date())}
        description={`欢迎回来，今天共有 ${todayAppointments.length} 个预约，预计营收 ¥${todayRevenue}`}
      />
      
      <div className="grid grid-cols-4 gap-6 mb-8">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className={`overflow-hidden opacity-0 animate-fade-in-up stagger-${idx + 1}`}>
              <div className="p-6 relative">
                <div className={`absolute -right-8 -top-8 w-32 h-32 rounded-full bg-gradient-to-br ${stat.gradient} opacity-10`} />
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-soft`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
                <p className="text-4xl font-bold text-brown-700 mb-1 font-serif">{stat.value}</p>
                <p className="text-sm text-brown-400">{stat.label}</p>
              </div>
            </Card>
          );
        })}
      </div>
      
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2">
          <Card className="overflow-hidden opacity-0 animate-fade-in-up stagger-2">
            <div className="p-6 border-b border-rose-50 flex items-center justify-between">
              <h3 className="font-serif text-lg font-semibold text-brown-700">今日预约时间线</h3>
              <button 
                onClick={() => navigate('/appointments')}
                className="text-sm text-rose-500 hover:text-rose-600 flex items-center gap-1"
              >
                查看全部 <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6">
              {todayAppointments.length === 0 ? (
                <div className="py-12 text-center text-brown-400">
                  <CalendarCheck className="w-12 h-12 mx-auto mb-4 opacity-30" />
                  <p>今日暂无预约</p>
                </div>
              ) : (
                <div className="relative">
                  <div className="absolute left-6 top-2 bottom-2 w-0.5 bg-gradient-to-b from-rose-200 via-rose-300 to-rose-200" />
                  <div className="space-y-6">
                    {todayAppointments.map((apt, idx) => {
                      const customer = customers.find(c => c.id === apt.customerId);
                      const service = services.find(s => s.id === apt.serviceId);
                      const staff = staffList.find(s => s.id === apt.staffId);
                      
                      return (
                        <div key={apt.id} className="relative pl-16 opacity-0 animate-fade-in-up" style={{ animationDelay: `${0.1 + idx * 0.05}s`, animationFillMode: 'forwards' }}>
                          <div className="absolute left-4 w-5 h-5 rounded-full bg-white border-2 border-rose-400 shadow-soft flex items-center justify-center">
                            <div className="w-2 h-2 rounded-full bg-rose-400" />
                          </div>
                          <div className="bg-cream-100 rounded-xl p-4 hover:bg-cream-200/80 transition-colors cursor-pointer" onClick={() => navigate('/appointments')}>
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-3">
                                <span className="text-lg font-semibold text-rose-600 font-serif">{formatTime(apt.startTime)}</span>
                                <StatusTag status={apt.status} />
                              </div>
                              <span className="text-sm text-brown-400">{formatTime(apt.endTime)}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                  <UserCircle className="w-4 h-4 text-brown-400" />
                                  <span className="text-brown-700">{customer?.name || '未知客户'}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Scissors className="w-4 h-4 text-brown-400" />
                                  <span className="text-brown-600">{service?.name || '未知项目'}</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-brown-400">
                                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-rose-300 to-gold-300 flex items-center justify-center text-white text-xs">
                                  {staff?.name?.[0] || '?'}
                                </div>
                                <span>{staff?.name || '未分配'}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
        
        <div className="space-y-6">
          <Card className="overflow-hidden opacity-0 animate-fade-in-up stagger-3">
            <div className="p-6 border-b border-rose-50 flex items-center gap-2">
              <Cake className="w-5 h-5 text-gold-500" />
              <h3 className="font-serif text-lg font-semibold text-brown-700">即将生日</h3>
              <span className="ml-auto px-2 py-0.5 rounded-full text-xs bg-gold-50 text-gold-600">
                {birthdayCustomers.length}人
              </span>
            </div>
            <div className="p-2">
              {birthdayCustomers.length === 0 ? (
                <div className="py-8 text-center text-brown-400 text-sm">
                  近7天暂无生日客户
                </div>
              ) : (
                <div className="divide-y divide-rose-50">
                  {birthdayCustomers.slice(0, 5).map(customer => (
                    <div key={customer.id} className="p-4 hover:bg-cream-50 rounded-lg transition-colors cursor-pointer flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold-300 to-rose-300 flex items-center justify-center text-white font-medium">
                          {customer.name[0]}
                        </div>
                        <div>
                          <p className="font-medium text-brown-700">{customer.name}</p>
                          <p className="text-xs text-brown-400">{customer.phone}</p>
                        </div>
                      </div>
                      <span className="text-xs text-gold-600 bg-gold-50 px-2 py-1 rounded-full animate-breathe">
                        {getDaysUntilBirthday(customer.birthday)}天后
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
          
          <Card className="overflow-hidden opacity-0 animate-fade-in-up stagger-4">
            <div className="p-6 border-b border-rose-50 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-500" />
              <h3 className="font-serif text-lg font-semibold text-brown-700">库存预警</h3>
              <span className="ml-auto px-2 py-0.5 rounded-full text-xs bg-rose-50 text-rose-600">
                {lowStockProducts.length}件
              </span>
            </div>
            <div className="p-2">
              {lowStockProducts.length === 0 ? (
                <div className="py-8 text-center text-brown-400 text-sm">
                  库存充足
                </div>
              ) : (
                <div className="divide-y divide-rose-50">
                  {lowStockProducts.slice(0, 5).map(product => (
                    <div key={product.id} className="p-4 hover:bg-cream-50 rounded-lg transition-colors cursor-pointer" onClick={() => navigate('/inventory')}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Package className="w-4 h-4 text-rose-400" />
                          <span className="font-medium text-brown-700">{product.name}</span>
                        </div>
                        <span className="text-sm text-rose-600 font-medium animate-breathe">
                          {product.stock} {product.unit}
                        </span>
                      </div>
                      <div className="w-full bg-cream-200 rounded-full h-1.5">
                        <div 
                          className="h-1.5 rounded-full bg-gradient-to-r from-rose-400 to-rose-500"
                          style={{ width: `${Math.min(100, (product.stock / (product.warningThreshold * 2)) * 100)}%` }}
                        />
                      </div>
                      <p className="text-xs text-brown-400 mt-1">预警值：{product.warningThreshold} {product.unit}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
