import React, { useState, useEffect } from 'react';
import { AttendanceRecord, User } from '../types';
import { getAttendance, getUsers, deleteAttendance } from '../services/db';
import { Search, Filter, Trash2, MapPin, Camera, Clock, Calendar } from 'lucide-react';

export const WorkHistory: React.FC = () => {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setRecords(getAttendance());
    setUsers(getUsers());
  };

  const handleDelete = (id: string) => {
    if (confirm('คุณต้องการลบรายการลงเวลานี้ใช่หรือไม่?')) {
      deleteAttendance(id);
      loadData();
    }
  };

  const getUserName = (userId: string) => {
    const u = users.find(user => user.id === userId);
    return u ? u.fullName : userId;
  };

  const filteredRecords = records.filter(rec => {
    // Search by Name or ID
    const userName = getUserName(rec.userId).toLowerCase();
    const matchesSearch = userName.includes(searchTerm.toLowerCase()) || rec.userId.includes(searchTerm.toLowerCase());
    
    // Date Filter
    const matchesDate = !dateFilter || rec.date === dateFilter;
    
    // Status Filter
    const matchesStatus = statusFilter === 'ALL' || rec.status === statusFilter;

    return matchesSearch && matchesDate && matchesStatus;
  }).sort((a, b) => {
    // Sort by Date DESC, then Time DESC
    if (a.date !== b.date) return new Date(b.date).getTime() - new Date(a.date).getTime();
    return (b.checkInTime || '').localeCompare(a.checkInTime || '');
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h2 className="text-xl font-bold text-gray-800 flex items-center">
          <Clock className="mr-2 text-orange-500" />
          ประวัติการทำงาน/ลงเวลา (Attendance History)
        </h2>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-orange-100 grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Search */}
        <div className="relative md:col-span-2">
           <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
           <input 
             type="text" 
             placeholder="ค้นหาชื่อพนักงาน หรือ ID..."
             className="w-full pl-10 p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-200"
             value={searchTerm}
             onChange={e => setSearchTerm(e.target.value)}
           />
        </div>
        
        {/* Date Filter */}
        <div className="relative">
           <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
           <input 
             type="date"
             className="w-full pl-10 p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-200"
             value={dateFilter}
             onChange={e => setDateFilter(e.target.value)}
           />
        </div>

        {/* Status Filter */}
        <div className="relative">
           <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
           <select 
             className="w-full pl-10 p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-200 appearance-none bg-white"
             value={statusFilter}
             onChange={e => setStatusFilter(e.target.value)}
           >
             <option value="ALL">สถานะทั้งหมด</option>
             <option value="PRESENT">ปกติ (Present)</option>
             <option value="LATE">สาย (Late)</option>
             <option value="ABSENT">ขาด (Absent)</option>
             <option value="LEAVE">ลา (Leave)</option>
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
                 <th className="p-4 font-semibold">วันที่</th>
                 <th className="p-4 font-semibold">เวลาเข้า-ออก</th>
                 <th className="p-4 font-semibold text-center">สถานะ</th>
                 <th className="p-4 font-semibold">หลักฐาน/พิกัด</th>
                 <th className="p-4 font-semibold text-right">จัดการ</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-orange-50">
               {filteredRecords.map(rec => (
                 <tr key={rec.id} className="hover:bg-gray-50 transition">
                   <td className="p-4">
                     <div className="font-bold text-gray-700">{getUserName(rec.userId)}</div>
                   </td>
                   <td className="p-4 text-sm text-gray-600">
                     {new Date(rec.date).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric'})}
                   </td>
                   <td className="p-4 text-sm">
                      <div className="flex flex-col">
                        <span className="text-green-600">เข้า: {rec.checkInTime || '-'}</span>
                        <span className="text-orange-600">ออก: {rec.checkOutTime || '-'}</span>
                      </div>
                   </td>
                   <td className="p-4 text-center">
                      <span className={`inline-block px-2 py-1 rounded text-xs font-bold ${
                        rec.status === 'PRESENT' ? 'bg-green-100 text-green-700' :
                        rec.status === 'LATE' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {rec.status === 'PRESENT' ? 'มาปกติ' : rec.status === 'LATE' ? 'มาสาย' : 'ขาด/ลา'}
                      </span>
                      {rec.isOutOfRange && (
                        <div className="mt-1 text-[10px] text-red-500 border border-red-200 rounded px-1">
                          นอกพื้นที่
                        </div>
                      )}
                   </td>
                   <td className="p-4">
                      <div className="flex items-center space-x-2">
                        {rec.lat && rec.lng && (
                          <a 
                            href={`https://www.google.com/maps/search/?api=1&query=${rec.lat},${rec.lng}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:text-blue-700"
                            title="ดูแผนที่"
                          >
                            <MapPin size={18} />
                          </a>
                        )}
                        {rec.photoUrl && (
                          <a 
                            href={rec.photoUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-orange-500 hover:text-orange-700"
                            title="ดูรูปถ่าย"
                          >
                            <Camera size={18} />
                          </a>
                        )}
                        {rec.reason && (
                           <span className="text-xs text-gray-500 max-w-[100px] truncate" title={rec.reason}>
                             {rec.reason}
                           </span>
                        )}
                      </div>
                   </td>
                   <td className="p-4 text-right">
                      <button 
                        onClick={() => handleDelete(rec.id)}
                        className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition"
                        title="ลบรายการ"
                      >
                        <Trash2 size={18} />
                      </button>
                   </td>
                 </tr>
               ))}
               {filteredRecords.length === 0 && (
                 <tr>
                   <td colSpan={6} className="p-8 text-center text-gray-400">
                     ไม่พบข้อมูลการลงเวลา
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