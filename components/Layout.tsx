import React, { useState } from 'react';
import { User, Role } from '../types';
import { Logo } from './Logo';
import { 
  LogOut, 
  Menu, 
  X, 
  Clock, 
  FileText, 
  Users, 
  BarChart, 
  Settings, 
  ShieldCheck,
  MessageSquare,
  History,
  Briefcase
} from 'lucide-react';

interface LayoutProps {
  user: User;
  onLogout: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ user, onLogout, activeTab, setActiveTab, children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Determine accessible menus based on roles
  const hasRole = (roles: Role[]) => user.role.some(r => roles.includes(r) || user.role.includes(Role.SUPERUSER));

  const menuItems = [
    { id: 'dashboard', label: 'แดชบอร์ด', icon: <Clock size={20} />, roles: [Role.EMPLOYEE, Role.SUPERUSER] },
    { id: 'leave', label: 'ยื่นใบลา', icon: <FileText size={20} />, roles: [Role.EMPLOYEE, Role.SUPERUSER] },
    { id: 'approvals', label: 'รายการอนุมัติ', icon: <ShieldCheck size={20} />, roles: [Role.OM, Role.DM, Role.PM, Role.CEO, Role.SUP, Role.FM, Role.SUPERUSER] },
    { id: 'leave_history', label: 'ประวัติการลา (HR)', icon: <History size={20} />, roles: [Role.HR, Role.ADMIN, Role.SUPERUSER] },
    { id: 'work_history', label: 'ประวัติการทำงาน (HR)', icon: <Briefcase size={20} />, roles: [Role.HR, Role.ADMIN, Role.SUPERUSER] },
    { id: 'hr_manage', label: 'จัดการพนักงาน', icon: <Users size={20} />, roles: [Role.HR, Role.ADMIN, Role.SUPERUSER] },
    { id: 'reports', label: 'รายงาน', icon: <BarChart size={20} />, roles: [Role.HR, Role.ADMIN, Role.CEO, Role.SUPERUSER] },
    { id: 'settings', label: 'ตั้งค่าระบบ', icon: <Settings size={20} />, roles: [Role.ADMIN, Role.HR, Role.SUPERUSER] },
    { id: 'ai_help', label: 'ผู้ช่วย AI HR', icon: <MessageSquare size={20} />, roles: [Role.EMPLOYEE, Role.SUPERUSER] },
  ];

  const filteredMenu = menuItems.filter(item => 
    item.roles.some(r => user.role.includes(r))
  );

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row">
      {/* Sidebar (Desktop) */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200 h-screen sticky top-0 shadow-sm z-20">
        <div className="p-6 flex items-center justify-center border-b border-gray-200">
           {/* Logo Component */}
           <Logo className="w-16 h-12 mr-2" />
           <h1 className="text-2xl font-bold text-orange-600 tracking-tight mt-1">SDcon</h1>
        </div>
        
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <p className="text-sm text-gray-500">ยินดีต้อนรับ,</p>
          <p className="font-semibold text-gray-800 truncate">{user.fullName}</p>
          <p className="text-xs text-orange-600 font-medium">{user.position}</p>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {filteredMenu.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                activeTab === item.id 
                  ? 'bg-orange-600 text-white shadow-md' 
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              {item.icon}
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <button 
            onClick={onLogout}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
          >
            <LogOut size={18} />
            <span>ออกจากระบบ</span>
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden bg-white border-b border-gray-200 p-4 flex justify-between items-center sticky top-0 z-30 shadow-sm">
        <div className="flex items-center">
           {/* Logo Component */}
           <Logo className="w-12 h-10 mr-2" />
           <span className="font-bold text-orange-600 text-lg">SDcon</span>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-gray-600">
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-20 bg-gray-800 bg-opacity-50" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="bg-white w-3/4 h-full shadow-xl p-4 flex flex-col" onClick={e => e.stopPropagation()}>
             <div className="mb-6 pb-4 border-b border-gray-200">
                <p className="text-lg font-bold text-gray-800">{user.fullName}</p>
                <p className="text-sm text-orange-600">{user.position}</p>
             </div>
             <nav className="flex-1 space-y-2">
              {filteredMenu.map(item => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg ${
                    activeTab === item.id 
                      ? 'bg-orange-600 text-white' 
                      : 'text-gray-600'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>
            <button 
              onClick={onLogout}
              className="mt-4 w-full flex items-center space-x-2 px-4 py-3 text-red-600 bg-red-50 rounded-lg"
            >
              <LogOut size={18} />
              <span>ออกจากระบบ</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto h-[calc(100vh-64px)] md:h-screen">
        <div className="max-w-6xl mx-auto space-y-6">
          {children}
        </div>
      </main>
    </div>
  );
};