import React, { useState, useEffect, useMemo } from 'react';
import { User, AttendanceRecord } from '../types';
import { getAttendance } from '../services/db';
import { Calendar, Clock, MapPin } from 'lucide-react';

interface MyAttendanceHistoryProps {
  user: User;
}

export const MyAttendanceHistory: React.FC<MyAttendanceHistoryProps> = ({ user }) => {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [filterType, setFilterType] = useState<'day' | 'month' | 'year'>('month');
  
  // Default values
  const now = new Date();
  const [selectedDate, setSelectedDate] = useState(now.toISOString().split('T')[0]);
  const [selectedMonth, setSelectedMonth] = useState(now.toISOString().substring(0, 7)); // YYYY-MM
  const [selectedYear, setSelectedYear] = useState(now.getFullYear().toString());

  useEffect(() => {
    // Load specific user records
    const all = getAttendance();
    const myRecords = all.filter(r => r.userId === user.id);
    setRecords(myRecords);
  }, [user.id]);

  const filteredRecords = useMemo(() => {
    return records.filter(r => {
      if (filterType === 'day') {
        return r.date === selectedDate;
      } else if (filterType === 'month') {
        return r.date.startsWith(selectedMonth);
      } else if (filterType === 'year') {
        return r.date.startsWith(selectedYear);
      }
      return true;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [records, filterType, selectedDate, selectedMonth, selectedYear]);

  // Stats for the view
  const stats = useMemo(() => {
    return {
      present: filteredRecords.filter(r => r.status === 'PRESENT').length,
      late: filteredRecords.filter(r => r.status === 'LATE').length,
      absent: filteredRecords.filter(r => r.status === 'ABSENT').length,
      leave: filteredRecords.filter(r => r.status === 'LEAVE').length,
    };
  }, [filteredRecords]);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-800 flex items-center">
        <Clock className="mr-2 text-orange-500" />
        ประวัติการลงเวลาของฉัน (My Attendance)
      </h2>

      {/* Filter Controls */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-orange-100 flex flex-col md:flex-row gap-4 items-center">
         <div className="flex bg-orange-50 rounded-lg p-1">
            <button 
              onClick={() => setFilterType('day')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${filterType === 'day' ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              รายวัน
            </button>
            <button 
              onClick={() => setFilterType('month')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${filterType === 'month' ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              รายเดือน
            </button>
            <button 
              onClick={() => setFilterType('year')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${filterType === 'year' ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              รายปี
            </button>
         </div>

         <div className="flex-1 w-full md:w-auto">
            {filterType === 'day' && (
              <input 
                type="date" 
                value={selectedDate}
                onChange={e => setSelectedDate(e.target.value)}
                className="w-full md:w-auto p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-200"
              />
            )}
            {filterType === 'month' && (
              <input 
                type="month" 
                value={selectedMonth}
                onChange={e => setSelectedMonth(e.target.value)}
                className="w-full md:w-auto p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-200"
              />
            )}
            {filterType === 'year' && (
               <select 
                 value={selectedYear} 
                 onChange={e => setSelectedYear(e.target.value)}
                 className="w-full md:w-auto p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-200 bg-white"
               >
                 {[0,1,2,3,4].map(i => {
                   const y = now.getFullYear() - i;
                   return <option key={y} value={y}>{y}</option>
                 })}
               </select>
            )}
         </div>
         
         {/* Summary for selection */}
         <div className="flex gap-3 text-xs md:text-sm">
            <div className="px-3 py-1 bg-green-50 text-green-700 rounded-lg border border-green-100">
               ปกติ: <span className="font-bold">{stats.present}</span>
            </div>
            <div className="px-3 py-1 bg-yellow-50 text-yellow-700 rounded-lg border border-yellow-100">
               สาย: <span className="font-bold">{stats.late}</span>
            </div>
            <div className="px-3 py-1 bg-red-50 text-red-700 rounded-lg border border-red-100">
               ขาด/ลา: <span className="font-bold">{stats.absent + stats.leave}</span>
            </div>
         </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-orange-100 overflow-hidden">
        {filteredRecords.length === 0 ? (
          <div className="p-10 text-center text-gray-400">
            <Calendar size={48} className="mx-auto mb-3 opacity-20" />
            <p>ไม่พบข้อมูลการลงเวลาในช่วงนี้</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
             <table className="w-full text-left">
               <thead className="bg-orange-50 text-orange-800">
                 <tr>
                   <th className="p-4 font-semibold">วันที่</th>
                   <th className="p-4 font-semibold">เวลาเข้า-ออก</th>
                   <th className="p-4 font-semibold text-center">สถานะ</th>
                   <th className="p-4 font-semibold">หมายเหตุ</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-orange-50">
                 {filteredRecords.map(rec => (
                   <tr key={rec.id} className="hover:bg-gray-50 transition">
                      <td className="p-4">
                         <div className="font-medium text-gray-800">
                            {new Date(rec.date).toLocaleDateString('th-TH', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                         </div>
                      </td>
                      <td className="p-4 text-sm">
                         <div className="flex flex-col space-y-1">
                            <span className="flex items-center text-green-600">
                               <span className="w-8 text-xs text-gray-400">IN</span> 
                               {rec.checkInTime || '-'}
                            </span>
                            <span className="flex items-center text-orange-600">
                               <span className="w-8 text-xs text-gray-400">OUT</span>
                               {rec.checkOutTime || '-'}
                            </span>
                         </div>
                      </td>
                      <td className="p-4 text-center">
                         <span className={`inline-block px-2 py-1 rounded text-xs font-bold ${
                           rec.status === 'PRESENT' ? 'bg-green-100 text-green-700' :
                           rec.status === 'LATE' ? 'bg-yellow-100 text-yellow-700' :
                           'bg-red-100 text-red-700'
                         }`}>
                           {rec.status}
                         </span>
                         {rec.isOutOfRange && (
                           <div className="mt-1 flex items-center justify-center text-[10px] text-red-500">
                              <MapPin size={10} className="mr-1"/> นอกพื้นที่
                           </div>
                         )}
                      </td>
                      <td className="p-4 text-sm text-gray-500">
                         {rec.reason || '-'}
                      </td>
                   </tr>
                 ))}
               </tbody>
             </table>
          </div>
        )}
      </div>
    </div>
  );
};