import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  CalendarCheck, 
  Users, 
  Scissors, 
  UserCircle, 
  Package, 
  BarChart3,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { to: '/dashboard', label: '工作台', icon: LayoutDashboard },
  { to: '/appointments', label: '预约管理', icon: CalendarCheck },
  { to: '/customers', label: '客户管理', icon: Users },
  { to: '/services', label: '服务项目', icon: Scissors },
  { to: '/staff', label: '美容师', icon: UserCircle },
  { to: '/inventory', label: '库存管理', icon: Package },
  { to: '/statistics', label: '数据统计', icon: BarChart3 },
];

export function Sidebar() {
  const location = useLocation();
  
  return (
    <aside className="w-64 bg-gradient-to-b from-rose-50 to-cream-100 h-screen fixed left-0 top-0 flex flex-col border-r border-rose-100">
      <div className="p-6 border-b border-rose-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-400 to-gold-400 flex items-center justify-center shadow-soft">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-serif font-bold text-lg text-brown-700">悦美美容院</h1>
            <p className="text-xs text-brown-400">智能管理系统</p>
          </div>
        </div>
      </div>
      
      <nav className="flex-1 p-4 overflow-y-auto">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.to || 
              (item.to !== '/dashboard' && location.pathname.startsWith(item.to));
            
            return (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200',
                    isActive 
                      ? 'bg-white text-rose-600 shadow-soft font-medium' 
                      : 'text-brown-500 hover:bg-white/60 hover:text-brown-700'
                  )}
                >
                  <Icon className={cn('w-5 h-5', isActive && 'text-rose-500')} />
                  <span>{item.label}</span>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>
      
      <div className="p-4 border-t border-rose-100">
        <div className="bg-white/70 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-rose-300 to-gold-300 flex items-center justify-center">
              <UserCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="font-medium text-brown-700 text-sm">管理员</p>
              <p className="text-xs text-brown-400">老板</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
