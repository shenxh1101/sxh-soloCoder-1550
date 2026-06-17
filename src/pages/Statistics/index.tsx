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
import { BarChart3, TrendingUp, UserCircle, Scissors, CalendarCheck } from 'lucide-react';
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
    return staffList.map(staff => {
      const staffAppts = completedAppointments.filter(a => a.staffId === staff.id);
      const specifiedAppts = appointments.filter(a => a.staffId === staff.id && a.status !== 'cancelled');
      return {
        name: staff.name,
        services: staffAppts.length,
        specified: specifiedAppts.length,
        rate: appointments.length > 0 ? Math.round((specifiedAppts.length / appointments.length) * 100) : 0,
      };
    }).sort((a, b) => b.services - a.services);
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
          <h3 className="font-serif text-lg font-semibold text-brown-700 mb-4">
            美容师业绩排行
          </h3>
          <div className="space-y-3">
            {staffStats.map((staff, idx) => (
              <div key={staff.name} className="flex items-center gap-4">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${
                  idx === 0 ? 'bg-gradient-to-br from-gold-400 to-gold-500 text-white' :
                  idx === 1 ? 'bg-gradient-to-br from-brown-300 to-brown-400 text-white' :
                  idx === 2 ? 'bg-gradient-to-br from-rose-300 to-rose-400 text-white' :
                  'bg-cream-100 text-brown-500'
                }`}>
                  {idx + 1}
                </div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-rose-300 to-gold-300 flex items-center justify-center text-white font-medium">
                  {staff.name[0]}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-brown-700">{staff.name}</span>
                    <span className="text-sm text-rose-500 font-medium">{staff.services} 次服务</span>
                  </div>
                  <div className="w-full bg-cream-200 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full bg-gradient-to-r from-rose-400 to-gold-400 transition-all"
                      style={{ width: `${Math.min(100, (staff.services / (topStaff?.services || 1)) * 100)}%` }}
                    />
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gold-600">{staff.rate}%</p>
                  <p className="text-xs text-brown-400">指定率</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
