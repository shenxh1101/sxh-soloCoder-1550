import { useMemo } from 'react';
import { useAppointmentStore } from '../../store/appointmentStore';
import { useServiceStore } from '../../store/serviceStore';
import { useStaffStore } from '../../store/staffStore';
import { useCustomerStore } from '../../store/customerStore';
import { PageHeader, Card } from '../../components/Layout/PageHeader';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend
} from 'recharts';
import { BarChart3, TrendingUp, UserCircle, Scissors, CalendarCheck, UserCheck, Users, Sparkles } from 'lucide-react';
import { format, parseISO, startOfMonth, endOfMonth, eachMonthOfInterval, subMonths, isWithinInterval } from 'date-fns';

const COLORS = ['#E8B4B8', '#D4A574', '#C46B72', '#A97449', '#D98C91', '#DEBF86'];

export function Statistics() {
  const appointments = useAppointmentStore(s => s.appointments);
  const services = useServiceStore(s => s.services);
  const staffList = useStaffStore(s => s.staffList);
  const customers = useCustomerStore(s => s.customers);

  const completedAppointments = appointments.filter(a => a.status === 'completed');

  const serviceStats = useMemo(() => {
    const stats: Record<string, { name: string; count: number; revenue: number }> = {};
    for (const apt of completedAppointments) {
      const service = services.find(s => s.id === apt.serviceId);
      if (!service) continue;
      if (!stats[service.id]) {
        stats[service.id] = { name: service.name, count: 0, revenue: 0 };
      }
      stats[service.id].count++;
      stats[service.id].revenue += service.price;
    }
    return Object.values(stats).sort((a, b) => b.count - a.count);
  }, [completedAppointments, services]);

  const staffStats = useMemo(() => {
    const allNonCancelled = appointments.filter(a => a.status !== 'cancelled');
    
    return staffList.map(staff => {
      const staffCompleted = completedAppointments.filter(a => a.staffId === staff.id);
      const staffAll = allNonCancelled.filter(a => a.staffId === staff.id);
      const specifiedAll = staffAll.filter(a => a.assignmentType === 'specified');
      const specifiedCompleted = staffCompleted.filter(a => a.assignmentType === 'specified');
      return {
        name: staff.name,
        services: staffCompleted.length,
        specified: specifiedAll.length,
        specifiedCompleted: specifiedCompleted.length,
        rate: staffAll.length > 0 ? Math.round((specifiedAll.length / staffAll.length) * 100) : 0,
      };
    }).sort((a, b) => {
      if (b.specified !== a.specified) return b.specified - a.specified;
      return b.services - a.services;
    });
  }, [completedAppointments, appointments, staffList]);

  const monthlyRevenue = useMemo(() => {
    const now = new Date();
    const months = eachMonthOfInterval({
      start: subMonths(startOfMonth(now), 5),
      end: endOfMonth(now),
    });
    
    return months.map(month => {
      const monthStart = startOfMonth(month);
      const monthEnd = endOfMonth(month);
      const monthAppts = completedAppointments.filter(a => 
        isWithinInterval(parseISO(a.startTime), { start: monthStart, end: monthEnd })
      );
      const revenue = monthAppts.reduce((sum, a) => {
        const service = services.find(s => s.id === a.serviceId);
        return sum + (service?.price || 0);
      }, 0);
      return {
        month: format(month, 'M月'),
        revenue,
        count: monthAppts.length,
      };
    });
  }, [completedAppointments, services]);

  const totalRevenue = completedAppointments.reduce((sum, a) => {
    const service = services.find(s => s.id === a.serviceId);
    return sum + (service?.price || 0);
  }, 0);

  const topStaff = staffStats[0];
  const topService = serviceStats[0];
  const topSpecifiedMax = Math.max(...staffStats.map(s => s.specified), 1);

  const customerContribution = useMemo(() => {
    const stats: Record<string, { name: string; count: number; revenue: number; phone: string }> = {};
    for (const apt of completedAppointments) {
      const customer = customers.find(c => c.id === apt.customerId);
      if (!customer) continue;
      const service = services.find(s => s.id === apt.serviceId);
      const revenue = apt.actualPrice !== undefined ? apt.actualPrice : service?.price || 0;
      if (!stats[customer.id]) {
        stats[customer.id] = { name: customer.name, count: 0, revenue: 0, phone: customer.phone };
      }
      stats[customer.id].count++;
      stats[customer.id].revenue += revenue;
    }
    return Object.values(stats).sort((a, b) => b.revenue - a.revenue);
  }, [completedAppointments, customers, services]);

  const topCustomerRevenue = customerContribution[0]?.revenue || 1;

  const serviceRevenueStats = useMemo(() => {
    const stats: Record<string, { name: string; count: number; revenue: number }> = {};
    for (const apt of completedAppointments) {
      const service = services.find(s => s.id === apt.serviceId);
      if (!service) continue;
      const revenue = apt.actualPrice !== undefined ? apt.actualPrice : service.price;
      if (!stats[service.id]) {
        stats[service.id] = { name: service.name, count: 0, revenue: 0 };
      }
      stats[service.id].count++;
      stats[service.id].revenue += revenue;
    }
    return Object.values(stats).sort((a, b) => b.revenue - a.revenue);
  }, [completedAppointments, services]);

  const topServiceRevenue = serviceRevenueStats[0]?.revenue || 1;

  return (
    <div>
      <PageHeader 
        title="数据统计"
        description="查看经营数据和业务分析"
      />

      <div className="grid grid-cols-4 gap-6 mb-8">
        <Card className="opacity-0 animate-fade-in-up stagger-1">
          <div className="p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-400 to-rose-500 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
            </div>
            <p className="text-sm text-brown-400 mb-1">累计营收</p>
            <p className="text-3xl font-bold font-serif text-brown-700">¥{totalRevenue.toLocaleString()}</p>
          </div>
        </Card>
        <Card className="opacity-0 animate-fade-in-up stagger-2">
          <div className="p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold-400 to-gold-500 flex items-center justify-center">
                <CalendarCheck className="w-5 h-5 text-white" />
              </div>
            </div>
            <p className="text-sm text-brown-400 mb-1">完成服务</p>
            <p className="text-3xl font-bold font-serif text-brown-700">{completedAppointments.length}</p>
          </div>
        </Card>
        <Card className="opacity-0 animate-fade-in-up stagger-3">
          <div className="p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-500 flex items-center justify-center">
                <UserCircle className="w-5 h-5 text-white" />
              </div>
            </div>
            <p className="text-sm text-brown-400 mb-1">会员总数</p>
            <p className="text-3xl font-bold font-serif text-brown-700">{customers.length}</p>
          </div>
        </Card>
        <Card className="opacity-0 animate-fade-in-up stagger-4">
          <div className="p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brown-400 to-brown-500 flex items-center justify-center">
                <Scissors className="w-5 h-5 text-white" />
              </div>
            </div>
            <p className="text-sm text-brown-400 mb-1">服务项目</p>
            <p className="text-3xl font-bold font-serif text-brown-700">{services.length}</p>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        <Card className="p-6 opacity-0 animate-fade-in-up stagger-2">
          <h3 className="font-serif text-lg font-semibold text-brown-700 mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-rose-500" />
            月度营收趋势
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyRevenue}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#E8B4B8" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#E8B4B8" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F5EAEA" />
                <XAxis dataKey="month" stroke="#9C888B" fontSize={12} />
                <YAxis stroke="#9C888B" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #F5D5D7', 
                    borderRadius: '12px',
                    boxShadow: '0 4px 20px rgba(61, 44, 46, 0.06)'
                  }}
                  formatter={(value: number) => [`¥${value.toLocaleString()}`, '营收']}
                />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#E8B4B8" 
                  strokeWidth={3}
                  dot={{ fill: '#D4A574', strokeWidth: 2, r: 5 }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6 opacity-0 animate-fade-in-up stagger-3">
          <h3 className="font-serif text-lg font-semibold text-brown-700 mb-4 flex items-center gap-2">
            <Scissors className="w-5 h-5 text-rose-500" />
            项目受欢迎度
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={serviceStats} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#F5EAEA" />
                <XAxis type="number" stroke="#9C888B" fontSize={12} />
                <YAxis dataKey="name" type="category" stroke="#9C888B" fontSize={12} width={100} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #F5D5D7', 
                    borderRadius: '12px' 
                  }}
                  cursor={{ fill: '#FDF6F6' }}
                />
                <Bar 
                  dataKey="count" 
                  radius={[0, 8, 8, 0]}
                  fill="url(#barGradient)"
                >
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#E8B4B8"/>
                      <stop offset="100%" stopColor="#D4A574"/>
                    </linearGradient>
                  </defs>
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <Card className="p-6 col-span-1 opacity-0 animate-fade-in-up stagger-4">
          <h3 className="font-serif text-lg font-semibold text-brown-700 mb-4">
            项目营收占比
          </h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={serviceStats.filter(s => s.revenue > 0)}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="revenue"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {serviceStats.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => [`¥${value.toLocaleString()}`, '营收']}
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #F5D5D7', 
                    borderRadius: '12px' 
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6 col-span-2 opacity-0 animate-fade-in-up stagger-5">
          <h3 className="font-serif text-lg font-semibold text-brown-700 mb-4 flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-gold-500" />
            美容师客户指定排行
            <span className="ml-auto text-xs text-brown-400 font-normal flex items-center gap-1">
              按客户主动指定次数排序
            </span>
          </h3>
          <div className="space-y-3.5">
            {staffStats.map((staff, idx) => (
              <div key={staff.name} className="flex items-center gap-4">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm flex-shrink-0 ${
                  idx === 0 ? 'bg-gradient-to-br from-gold-400 to-gold-500 text-white shadow-soft' :
                  idx === 1 ? 'bg-gradient-to-br from-brown-300 to-brown-400 text-white' :
                  idx === 2 ? 'bg-gradient-to-br from-rose-300 to-rose-400 text-white' :
                  'bg-cream-100 text-brown-500'
                }`}>
                  {idx + 1}
                </div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-rose-300 to-gold-300 flex items-center justify-center text-white font-medium flex-shrink-0">
                  {staff.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1.5 gap-2 flex-wrap">
                    <span className="font-medium text-brown-700">{staff.name}</span>
                    <div className="flex items-center gap-3 text-xs flex-shrink-0">
                      <span className="text-brown-400">服务 <span className="font-medium text-brown-600">{staff.services}</span> 次</span>
                      <span className="text-gold-600 font-semibold flex items-center gap-0.5 bg-gold-50 px-2 py-0.5 rounded-full">
                        <UserCheck className="w-3 h-3" />
                        指定 {staff.specified} 次
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-cream-200 rounded-full h-2.5">
                    <div 
                      className="h-2.5 rounded-full bg-gradient-to-r from-gold-400 via-rose-400 to-rose-500 transition-all"
                      style={{ width: `${Math.min(100, (staff.specified / topSpecifiedMax) * 100)}%` }}
                    />
                  </div>
                </div>
                <div className="text-right flex-shrink-0 min-w-[60px]">
                  <p className="text-sm font-bold text-gold-600">{staff.rate}%</p>
                  <p className="text-xs text-brown-400">指定率</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-6 mt-6">
        <Card className="p-6 opacity-0 animate-fade-in-up stagger-1">
          <h3 className="font-serif text-lg font-semibold text-brown-700 mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-rose-500" />
            客户消费贡献排行
            <span className="ml-auto text-xs text-brown-400 font-normal">
              按实际消费金额排序
            </span>
          </h3>
          <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
            {customerContribution.length === 0 ? (
              <p className="text-center py-8 text-brown-400 text-sm">暂无消费数据</p>
            ) : (
              customerContribution.slice(0, 10).map((cust, idx) => (
                <div key={cust.name} className="flex items-center gap-3">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-sm flex-shrink-0 ${
                    idx === 0 ? 'bg-gradient-to-br from-gold-400 to-gold-500 text-white shadow-soft' :
                    idx === 1 ? 'bg-gradient-to-br from-brown-300 to-brown-400 text-white' :
                    idx === 2 ? 'bg-gradient-to-br from-rose-300 to-rose-400 text-white' :
                    'bg-cream-100 text-brown-500'
                  }`}>
                    {idx + 1}
                  </div>
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-rose-300 to-gold-300 flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
                    {cust.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1 gap-2">
                      <span className="font-medium text-brown-700 text-sm">{cust.name}</span>
                      <span className="text-xs text-brown-400">{cust.count} 次</span>
                    </div>
                    <div className="w-full bg-cream-200 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full bg-gradient-to-r from-rose-400 to-rose-500 transition-all"
                        style={{ width: `${Math.min(100, (cust.revenue / topCustomerRevenue) * 100)}%` }}
                      />
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 min-w-[70px]">
                    <p className="text-sm font-bold text-rose-600">¥{cust.revenue.toLocaleString()}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card className="p-6 opacity-0 animate-fade-in-up stagger-2">
          <h3 className="font-serif text-lg font-semibold text-brown-700 mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-gold-500" />
            项目营收贡献排行
            <span className="ml-auto text-xs text-brown-400 font-normal">
              按实际营收金额排序
            </span>
          </h3>
          <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
            {serviceRevenueStats.length === 0 ? (
              <p className="text-center py-8 text-brown-400 text-sm">暂无营收数据</p>
            ) : (
              serviceRevenueStats.map((svc, idx) => (
                <div key={svc.name} className="flex items-center gap-3">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-sm flex-shrink-0 ${
                    idx === 0 ? 'bg-gradient-to-br from-gold-400 to-gold-500 text-white shadow-soft' :
                    idx === 1 ? 'bg-gradient-to-br from-brown-300 to-brown-400 text-white' :
                    idx === 2 ? 'bg-gradient-to-br from-rose-300 to-rose-400 text-white' :
                    'bg-cream-100 text-brown-500'
                  }`}>
                    {idx + 1}
                  </div>
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gold-300 to-rose-300 flex items-center justify-center text-white flex-shrink-0">
                    <Scissors className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1 gap-2">
                      <span className="font-medium text-brown-700 text-sm">{svc.name}</span>
                      <span className="text-xs text-brown-400">{svc.count} 次</span>
                    </div>
                    <div className="w-full bg-cream-200 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full bg-gradient-to-r from-gold-400 to-gold-500 transition-all"
                        style={{ width: `${Math.min(100, (svc.revenue / topServiceRevenue) * 100)}%` }}
                      />
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 min-w-[70px]">
                    <p className="text-sm font-bold text-gold-600">¥{svc.revenue.toLocaleString()}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
