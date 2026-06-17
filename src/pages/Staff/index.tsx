import { useState } from 'react';
import { useStaffStore } from '../../store/staffStore';
import { useAppointmentStore } from '../../store/appointmentStore';
import { PageHeader, Card } from '../../components/Layout/PageHeader';
import { Button } from '../../components/Button';
import { Modal } from '../../components/Modal';
import { UserCircle, CalendarCheck, Scissors, Plus } from 'lucide-react';
import { formatDate, isSameDayFn } from '../../utils/date';

export function Staff() {
  const { staffList, addStaff, updateStaff } = useStaffStore();
  const appointments = useAppointmentStore(s => s.appointments);
  const [showNewModal, setShowNewModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newSpecialties, setNewSpecialties] = useState('');
  const [editingStaff, setEditingStaff] = useState<string | null>(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleStaffId, setScheduleStaffId] = useState<string | null>(null);

  const today = formatDate(new Date());

  const todayAppointmentsForStaff = (staffId: string) => 
    appointments.filter(a => a.staffId === staffId && isSameDayFn(a.startTime, today) && a.status !== 'cancelled').length;

  const completedCount = (staffId: string) =>
    appointments.filter(a => a.staffId === staffId && a.status === 'completed').length;

  const handleAddStaff = () => {
    if (!newName.trim()) return;
    const specialtiesList = newSpecialties.split(/[,，]/).map(s => s.trim()).filter(Boolean);
    if (editingStaff) {
      updateStaff(editingStaff, { name: newName.trim(), specialties: specialtiesList });
    } else {
      addStaff({ name: newName.trim(), avatar: '', specialties: specialtiesList, active: true });
    }
    setShowNewModal(false);
    resetForm();
  };

  const resetForm = () => {
    setNewName('');
    setNewSpecialties('');
    setEditingStaff(null);
  };

  const openEdit = (staff: typeof staffList[0]) => {
    setEditingStaff(staff.id);
    setNewName(staff.name);
    setNewSpecialties(staff.specialties.join('，'));
    setShowNewModal(true);
  };

  const toggleActive = (id: string, current: boolean) => {
    updateStaff(id, { active: !current });
  };

  return (
    <div>
      <PageHeader 
        title="美容师管理"
        description="管理美容师信息和工作排班"
        actions={
          <Button onClick={() => setShowNewModal(true)} icon={<Plus className="w-4 h-4" />}>
            添加美容师
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {staffList.map((staff, idx) => (
          <Card 
            key={staff.id} 
            className={`opacity-0 animate-fade-in-up ${!staff.active && 'opacity-60'}`}
            style={{ animationDelay: `${idx * 0.05}s`, animationFillMode: 'forwards' }}
          >
            <div className="p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-rose-300 to-gold-300 flex items-center justify-center text-white font-medium text-2xl shadow-soft">
                    {staff.name[0]}
                  </div>
                  <div>
                    <h3 className="font-serif font-semibold text-lg text-brown-700">{staff.name}</h3>
                    <div className="flex items-center gap-1 mt-1">
                      <UserCircle className="w-3.5 h-3.5 text-brown-400" />
                      <span className={`text-sm ${staff.active ? 'text-emerald-500' : 'text-brown-400'}`}>
                        {staff.active ? '在职' : '休假'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5 mb-4">
                {staff.specialties.map((spec, i) => (
                  <span key={i} className="text-xs px-2.5 py-1 rounded-full bg-rose-50 text-rose-600 border border-rose-100">
                    {spec}
                  </span>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="p-3 bg-cream-50 rounded-lg text-center">
                  <CalendarCheck className="w-5 h-5 text-rose-400 mx-auto mb-1" />
                  <p className="text-xl font-bold text-rose-500">{todayAppointmentsForStaff(staff.id)}</p>
                  <p className="text-xs text-brown-400">今日预约</p>
                </div>
                <div className="p-3 bg-cream-50 rounded-lg text-center">
                  <Scissors className="w-5 h-5 text-gold-400 mx-auto mb-1" />
                  <p className="text-xl font-bold text-gold-500">{completedCount(staff.id)}</p>
                  <p className="text-xs text-brown-400">累计服务</p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant="secondary" 
                  className="flex-1"
                  onClick={() => openEdit(staff)}
                >
                  编辑
                </Button>
                <Button 
                  size="sm" 
                  variant={staff.active ? 'ghost' : 'primary'}
                  className="flex-1"
                  onClick={() => toggleActive(staff.id, staff.active)}
                >
                  {staff.active ? '标记休假' : '恢复在职'}
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Modal
        open={showNewModal}
        onClose={() => { setShowNewModal(false); resetForm(); }}
        title={editingStaff ? '编辑美容师' : '添加美容师'}
        footer={
          <>
            <Button variant="secondary" onClick={() => { setShowNewModal(false); resetForm(); }}>取消</Button>
            <Button onClick={handleAddStaff} disabled={!newName.trim()}>确认</Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-brown-600 mb-2">姓名 *</label>
            <input
              type="text"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              placeholder="请输入美容师姓名"
              className="w-full px-4 py-2.5 rounded-xl border border-rose-100 bg-cream-50 focus:outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100 transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-brown-600 mb-2">擅长项目</label>
            <input
              type="text"
              value={newSpecialties}
              onChange={e => setNewSpecialties(e.target.value)}
              placeholder="多个项目用逗号分隔，如：面部护理，抗衰护理"
              className="w-full px-4 py-2.5 rounded-xl border border-rose-100 bg-cream-50 focus:outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100 transition-all"
            />
            <p className="text-xs text-brown-400 mt-1">用中文或英文逗号分隔多个擅长项目</p>
          </div>
        </div>
      </Modal>
    </div>
  );
}
