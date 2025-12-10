import React, { useMemo, useState, useEffect } from 'react';
import { getAttendance, getLeaves, getUsers } from '../services/db';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';
import { AttendanceRecord, LeaveRequest, User } from '../types';

export const StatsPanel: React.FC = () => {
  const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([]);
  const [leaveData, setLeaveData] = useState<LeaveRequest[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    const loadData = async () => {
        const att = await getAttendance();
        const leaves = await getLeaves();
        const us = await getUsers();
        setAttendanceData(att);
        setLeaveData(leaves);
        setUsers(us);
    };
    loadData();
  }, []);

  // Aggregate Attendance Status
  const statusCounts = useMemo(() => {
    const counts = { Present: 0, Late: 0, Absent: 0, Leave: 0 };
    attendanceData.forEach(r => {
      if (r.status === 'PRESENT') counts.Present++;
      if (r.status === 'LATE') counts.Late++;
      if (r.status === 'ABSENT') counts.Absent++;
      if (r.status === 'LEAVE') counts.Leave++;
    });
    // Add leave requests that are approved
    const approvedLeaves = leaveData.filter(l => l.status === 'APPROVED').length;
    counts.Leave += approvedLeaves;

    return [
      { name: 'มาทำงาน', value: counts.Present, color: '#22c55e' },
      { name: 'สาย', value: counts.Late, color: '#eab308' },
      { name: 'ลา', value: counts.Leave, color: '#3b82f6' },
      { name: 'ขาด', value: counts.Absent, color: '#ef4444' },
    ];
  }, [attendanceData, leaveData]);

  // Aggregate by Department
  const deptData = useMemo(() => {
    const depts: Record<string, any> = {};
    users.forEach(u => {
        if(!depts[u.departmentCode]) depts[u.departmentCode] = { name: u.departmentCode, count: 0 };
        depts[u.departmentCode].count++;
    });
    return Object.values(depts);
  }, [users]);

  return (
    <div className="space-y-6">
       <h2 className="text-xl font-bold text-gray-800">ภาพรวมสถิติ HR</h2>
       
       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 h-80">
            <h3 className="text-lg font-semibold mb-4 text-gray-700">สัดส่วนการมาทำงาน</h3>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusCounts}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusCounts.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 h-80">
             <h3 className="text-lg font-semibold mb-4 text-gray-700">จำนวนพนักงานตามแผนก</h3>
             <ResponsiveContainer width="100%" height="100%">
               <BarChart data={deptData}>
                 <CartesianGrid strokeDasharray="3 3" vertical={false} />
                 <XAxis dataKey="name" />
                 <YAxis />
                 <Tooltip cursor={{fill: '#f3f4f6'}} />
                 <Bar dataKey="count" fill="#ea580c" radius={[4, 4, 0, 0]} />
               </BarChart>
             </ResponsiveContainer>
          </div>
       </div>

       {/* Simple Text Summary */}
       <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-orange-600 text-white p-4 rounded-xl shadow-sm">
             <p className="text-sm opacity-80">พนักงานทั้งหมด</p>
             <p className="text-2xl font-bold">{users.length}</p>
          </div>
          <div className="bg-white border border-gray-200 p-4 rounded-xl shadow-sm">
             <p className="text-sm text-gray-500">เช็คอินวันนี้</p>
             <p className="text-2xl font-bold text-orange-600">{attendanceData.length}</p>
          </div>
          <div className="bg-white border border-gray-200 p-4 rounded-xl shadow-sm">
             <p className="text-sm text-gray-500">ใบลาค้างอนุมัติ</p>
             <p className="text-2xl font-bold text-orange-600">
               {leaveData.filter(l => l.status === 'PENDING').length}
             </p>
          </div>
          <div className="bg-white border border-gray-200 p-4 rounded-xl shadow-sm">
             <p className="text-sm text-gray-500">มาสาย</p>
             <p className="text-2xl font-bold text-red-500">
               {statusCounts.find(s => s.name === 'สาย')?.value || 0}
             </p>
          </div>
       </div>
    </div>
  );
};