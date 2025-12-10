import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Attendance } from './components/Attendance';
import { LeaveRequestPanel } from './components/LeaveRequest';
import { ApprovalPanel } from './components/ApprovalPanel';
import { StatsPanel } from './components/StatsPanel';
import { SettingsPanel } from './components/SettingsPanel';
import { GeminiChat } from './components/GeminiChat';
import { EmployeeManagement } from './components/EmployeeManagement';
import { LeaveHistory } from './components/LeaveHistory';
import { WorkHistory } from './components/WorkHistory';
import { MyAttendanceHistory } from './components/MyAttendanceHistory';
import { User, Role } from './types';
import { initDB, getUser, addLog } from './services/db';
import { initializeGemini } from './services/geminiService';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [error, setError] = useState('');

  useEffect(() => {
    initDB();
    // Initialize Gemini with environment key if available
    if (process.env.API_KEY) {
      initializeGemini(process.env.API_KEY);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Specific Superuser Check
    if (username === 'chayapol' && password === '@Thansandee141266') {
       const superUser = getUser('chayapol');
       if(superUser) {
         setCurrentUser(superUser);
         addLog(superUser.id, 'LOGIN', 'Superuser Login');
         return;
       }
    }

    // Normal User Mock Login
    const user = getUser(username);
    if (user) {
      // Check if user has specific password, else default to '1234'
      const validPass = user.password || '1234';
      if (password === validPass) {
        setCurrentUser(user);
        addLog(user.id, 'LOGIN', 'User Login');
        return;
      }
    }
    
    setError('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-orange-50 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-orange-100">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4">
              HR
            </div>
            <h1 className="text-2xl font-bold text-gray-800">HRM SDcon</h1>
            <p className="text-gray-500">ลงชื่อเข้าใช้ระบบ</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อผู้ใช้</label>
              <input 
                type="text" 
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-300 outline-none transition"
                placeholder="ระบุชื่อผู้ใช้"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">รหัสผ่าน</label>
              <input 
                type="password" 
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-300 outline-none transition"
                placeholder="ระบุรหัสผ่าน"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}

            <button 
              type="submit" 
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 rounded-xl font-bold shadow-md hover:shadow-lg transition transform hover:-translate-y-0.5"
            >
              เข้าสู่ระบบ
            </button>
          </form>
          
          <div className="mt-6 text-center text-xs text-gray-400">
             <p>บัญชีทดสอบระบบ:</p>
             <p>User: chayapol / Pass: @Thansandee141266</p>
             <p>User: emp01 / Pass: 1234</p>
             <p>User: mgr01 / Pass: 1234</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Layout 
      user={currentUser} 
      onLogout={() => setCurrentUser(null)}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
    >
      {activeTab === 'dashboard' && <Attendance user={currentUser} />}
      {activeTab === 'my_attendance' && <MyAttendanceHistory user={currentUser} />}
      {activeTab === 'leave' && <LeaveRequestPanel user={currentUser} />}
      {activeTab === 'approvals' && <ApprovalPanel currentUser={currentUser} />}
      {activeTab === 'leave_history' && <LeaveHistory />}
      {activeTab === 'work_history' && <WorkHistory />}
      {activeTab === 'hr_manage' && <EmployeeManagement />}
      {activeTab === 'reports' && <StatsPanel />}
      {activeTab === 'settings' && <SettingsPanel />}
      {activeTab === 'ai_help' && <GeminiChat />}
      
      {/* Fallback for empty or unauthorized tabs */}
      {!['dashboard', 'my_attendance', 'leave', 'approvals', 'leave_history', 'hr_manage', 'reports', 'settings', 'ai_help', 'work_history'].includes(activeTab) && (
        <div className="text-center p-10 text-gray-500">
           ส่วนงาน "{activeTab}" กำลังพัฒนา
        </div>
      )}
    </Layout>
  );
};

export default App;