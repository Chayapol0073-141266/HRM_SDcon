import React, { useState, useEffect } from 'react';
import { LeaveRequest, User, LeaveStatus } from '../types';
import { getLeaves, getUsers, deleteLeave } from '../services/db';
import { LEAVE_TYPES } from '../constants';
import { Search, Filter, Trash2, CheckCircle, XCircle, Clock, Calendar } from 'lucide-react';

export const LeaveHistory: React.FC = () => {
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setLeaves(getLeaves());
    setUsers(getUsers());
  };

  const handleDelete = (id: string) => {
    if (confirm('คุณต้องการลบประวัติการลานี้ใช่หรือไม่?')) {
      deleteLeave(id);
      loadData();
    }
  };

  const getUserName = (userId: string) => {
    const u = users.find(user => user.id === userId);
    return u ? u.fullName : userId;
  };

  const filteredLeaves = leaves.filter(leave => {
    // Search
    const userName = getUserName(leave.userId).toLowerCase();
    const reason = leave.reason.toLowerCase();
    const matchesSearch = userName.includes(searchTerm.toLowerCase()) || reason.includes(searchTerm.toLowerCase());
    
    // Type Filter
    const matchesType = typeFilter === 'ALL' || leave.leaveType === typeFilter;
    
    // Status Filter
    const matchesStatus = statusFilter === 'ALL' || leave.status === statusFilter;

    return matchesSearch && matchesType && matchesStatus;
  }).sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()); // Sort desc date

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h2 className="text-xl font-bold text-gray-800 flex items-center">
          <Calendar className="mr-2 text-orange-500" />
          ประวัติการลาทั้งหมด (All Leave Requests)
        </h2>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-orange-100 grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Search */}
        <div className="md:col-span-2 relative">
           <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
           <input 
             type="text" 
             placeholder="ค้นหาชื่อพนักงาน หรือ เหตุผล..."
             className="w-full pl-10 p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-200"
             value={searchTerm}
             onChange={e => setSearchTerm(e.target.value)}
           />
        </div>
        
        {/* Type Filter */}
        <div className="relative">
           <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
           <select 
             className="w-full pl-10 p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-200 appearance-none bg-white"
             value={typeFilter}
             onChange={e => setTypeFilter(e.target.value)}
           >
             <option value="ALL">ทุกประเภทการลา</option>
             {LEAVE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
           </select>
        </div>

        {/* Status Filter */}
        <div className="relative">
           <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
              {statusFilter === 'ALL' && <Filter size={18} className="text-gray-400" />}
              {statusFilter === LeaveStatus.APPROVED && <CheckCircle size={18} className="text-green-500" />}
              {statusFilter === LeaveStatus.PENDING && <Clock size={18} className="text-yellow-500" />}
              {statusFilter === LeaveStatus.REJECTED && <XCircle size={18} className="text-red-500" />}
           </div>
           <select 
             className="w-full pl-10 p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-200 appearance-none bg-white"
             value={statusFilter}
             onChange={e => setStatusFilter(e.target.value)}
           >
             <option value="ALL">สถานะทั้งหมด</option>
             <option value={LeaveStatus.PENDING}>รออนุมัติ (Pending)</option>
             <option value={LeaveStatus.APPROVED}>อนุมัติแล้ว (Approved)</option>
             <option value={LeaveStatus.REJECTED}>ปฏิเสธ (Rejected)</option>
           </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-orange-100 overflow-hidden">
         <div className="overflow-x-auto">
           <table className="w-full text-left">
             <thead className="bg-orange-50 text-orange-800">
               <tr>
                 <th className="p-4 font-semibold">พนักงาน</th>
                 <th className="p-4 font-semibold">ประเภท/เหตุผล</th>
                 <th className="p-4 font-semibold">ช่วงวันที่</th>
                 <th className="p-4 font-semibold text-center">สถานะ</th>
                 <th className="p-4 font-semibold text-right">จัดการ</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-orange-50">
               {filteredLeaves.map(req => (
                 <tr key={req.id} className="hover:bg-gray-50 transition">
                   <td className="p-4">
                     <div className="font-bold text-gray-700">{getUserName(req.userId)}</div>
                     <div className="text-xs text-gray-500">ID: {req.userId}</div>
                   </td>
                   <td className="p-4">
                     <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-600 mb-1">
                       {req.leaveType}
                     </span>
                     <p className="text-sm text-gray-600 italic">"{req.reason}"</p>
                   </td>
                   <td className="p-4 text-sm text-gray-700">
                     <div className="flex items-center space-x-1">
                        <span>{new Date(req.startDate).toLocaleDateString('th-TH')}</span>
                        <span>-</span>
                        <span>{new Date(req.endDate).toLocaleDateString('th-TH')}</span>
                     </div>
                   </td>
                   <td className="p-4 text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        req.status === LeaveStatus.APPROVED ? 'bg-green-100 text-green-800' :
                        req.status === LeaveStatus.REJECTED ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {req.status === LeaveStatus.APPROVED && <CheckCircle size={12} className="mr-1" />}
                        {req.status === LeaveStatus.REJECTED && <XCircle size={12} className="mr-1" />}
                        {req.status === LeaveStatus.PENDING && <Clock size={12} className="mr-1" />}
                        {req.status === 'PENDING' ? 'รออนุมัติ' : req.status === 'APPROVED' ? 'อนุมัติ' : 'ปฏิเสธ'}
                      </span>
                   </td>
                   <td className="p-4 text-right">
                      <button 
                        onClick={() => handleDelete(req.id)}
                        className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition"
                        title="ลบรายการ"
                      >
                        <Trash2 size={18} />
                      </button>
                   </td>
                 </tr>
               ))}
               {filteredLeaves.length === 0 && (
                 <tr>
                   <td colSpan={5} className="p-8 text-center text-gray-400">
                     ไม่พบข้อมูลตามเงื่อนไขที่ค้นหา
                   </td>
                 </tr>
               )}
             </tbody>
           </table>
         </div>
      </div>
    </div>
  );
};