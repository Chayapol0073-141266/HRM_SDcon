import React, { useState, useEffect } from 'react';
import { User, LeaveRequest, LeaveStatus, Role } from '../types';
import { LEAVE_TYPES, DEPARTMENTS } from '../constants';
import { saveLeave, getLeaves, addLog } from '../services/db';
import { PlusCircle, Clock, CheckCircle, XCircle, FileText, Calendar, ChevronRight } from 'lucide-react';

interface LeaveRequestProps {
  user: User;
}

export const LeaveRequestPanel: React.FC<LeaveRequestProps> = ({ user }) => {
  const [showForm, setShowForm] = useState(false);
  const [history, setHistory] = useState<LeaveRequest[]>([]);
  const [formData, setFormData] = useState({
    type: LEAVE_TYPES[0],
    startDate: '',
    endDate: '',
    reason: ''
  });

  useEffect(() => {
    loadHistory();
  }, [user.id, showForm]);

  const loadHistory = async () => {
    const allLeaves = await getLeaves();
    const myLeaves = allLeaves.filter(l => l.userId === user.id).sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
    setHistory(myLeaves);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.startDate || !formData.endDate) return;

    const deptConfig = DEPARTMENTS[user.departmentCode];
    if (!deptConfig) {
      alert("Error: ไม่พบข้อมูลแผนก");
      return;
    }

    // Determine initial approvers based on dept config
    const approvalChain = deptConfig.approvers;
    
    const newLeave: LeaveRequest = {
      id: Date.now().toString(),
      userId: user.id,
      leaveType: formData.type,
      startDate: formData.startDate,
      endDate: formData.endDate,
      reason: formData.reason,
      status: LeaveStatus.PENDING,
      currentApproverRole: approvalChain[0],
      approvalChain: approvalChain,
      approvals: [],
    };

    await saveLeave(newLeave);
    await addLog(user.id, 'LEAVE_REQUEST', `Requested ${formData.type} from ${formData.startDate}`);
    setShowForm(false);
    setFormData({ type: LEAVE_TYPES[0], startDate: '', endDate: '', reason: '' });
    loadHistory();
    alert("ส่งคำขอลาเรียบร้อยแล้ว!");
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-800 flex items-center">
            <FileText className="mr-2 text-orange-500"/> ประวัติการลาของฉัน
          </h2>
          <p className="text-sm text-gray-500">ติดตามสถานะการอนุมัติและประวัติการลาย้อนหลัง</p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-5 py-2.5 rounded-xl hover:shadow-lg flex items-center transition-all transform hover:-translate-y-0.5 font-medium"
        >
          {showForm ? 'ยกเลิก' : <><PlusCircle size={20} className="mr-2"/> ยื่นใบลาใหม่</>}
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-orange-100 animate-slide-down">
          <h3 className="text-lg font-bold text-gray-800 mb-4 border-b border-orange-50 pb-2">แบบฟอร์มขอลาหยุด</h3>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ประเภทการลา</label>
                <select 
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-300 outline-none transition"
                  value={formData.type}
                  onChange={e => setFormData({...formData, type: e.target.value})}
                >
                  {LEAVE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ตั้งแต่วันที่</label>
                    <input 
                      type="date" 
                      required
                      className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-300 outline-none transition"
                      value={formData.startDate}
                      onChange={e => setFormData({...formData, startDate: e.target.value})}
                    />
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ถึงวันที่</label>
                    <input 
                      type="date" 
                      required
                      className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-300 outline-none transition"
                      value={formData.endDate}
                      onChange={e => setFormData({...formData, endDate: e.target.value})}
                    />
                 </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">เหตุผลการลา</label>
              <textarea 
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-300 outline-none transition"
                rows={3}
                placeholder="ระบุรายละเอียด..."
                required
                value={formData.reason}
                onChange={e => setFormData({...formData, reason: e.target.value})}
              />
            </div>
            <div className="flex justify-end pt-2">
              <button type="submit" className="bg-orange-500 text-white px-8 py-2.5 rounded-xl font-bold hover:bg-orange-600 shadow-md transition">
                ยืนยันการลา
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-orange-100 overflow-hidden">
         {history.length === 0 ? (
           <div className="p-10 text-center flex flex-col items-center text-gray-400">
             <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mb-3">
               <FileText size={32} className="text-orange-200" />
             </div>
             <p>ยังไม่มีประวัติการลา</p>
           </div>
         ) : (
           <div className="overflow-x-auto">
             <table className="w-full text-left">
               <thead className="bg-orange-50 text-orange-800 border-b border-orange-100">
                 <tr>
                   <th className="p-4 font-semibold w-1/4">ประเภท/เหตุผล</th>
                   <th className="p-4 font-semibold w-1/4">ช่วงเวลา</th>
                   <th className="p-4 font-semibold w-1/6">สถานะ</th>
                   <th className="p-4 font-semibold">ขั้นตอนการอนุมัติ (Approval Chain)</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-orange-50">
                 {history.map(req => (
                   <tr key={req.id} className="hover:bg-orange-50/30 transition">
                     <td className="p-4 align-top">
                       <span className="font-bold text-gray-800 block mb-1">{req.leaveType}</span>
                       <p className="text-sm text-gray-500 line-clamp-2">"{req.reason}"</p>
                     </td>
                     <td className="p-4 align-top">
                       <div className="flex items-center text-sm text-gray-700 bg-gray-50 px-3 py-1.5 rounded-lg w-fit">
                         <Calendar size={14} className="mr-2 text-orange-400"/>
                         {new Date(req.startDate).toLocaleDateString('th-TH')} - {new Date(req.endDate).toLocaleDateString('th-TH')}
                       </div>
                     </td>
                     <td className="p-4 align-top">
                       <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${
                         req.status === LeaveStatus.APPROVED ? 'bg-green-50 text-green-700 border-green-200' :
                         req.status === LeaveStatus.REJECTED ? 'bg-red-50 text-red-700 border-red-200' :
                         'bg-yellow-50 text-yellow-700 border-yellow-200'
                       }`}>
                         {req.status === LeaveStatus.APPROVED && <CheckCircle size={12} className="mr-1" />}
                         {req.status === LeaveStatus.REJECTED && <XCircle size={12} className="mr-1" />}
                         {req.status === LeaveStatus.PENDING && <Clock size={12} className="mr-1" />}
                         {req.status === 'PENDING' ? 'รออนุมัติ' : req.status === 'APPROVED' ? 'อนุมัติแล้ว' : 'ไม่อนุมัติ'}
                       </span>
                     </td>
                     <td className="p-4 align-middle">
                       {/* Stepper Progress Indicator */}
                       <div className="flex items-center">
                         {req.approvalChain.map((role, idx) => {
                           const approval = req.approvals[idx];
                           const stepStatus = approval ? approval.status : (req.currentApproverRole === role && req.status === LeaveStatus.PENDING ? 'PENDING' : 'WAITING');
                           
                           let circleClass = "bg-gray-100 border-gray-300 text-gray-400";
                           let icon = <span className="text-[10px] font-bold">{role}</span>;
                           
                           if (stepStatus === 'APPROVED') {
                             circleClass = "bg-green-100 border-green-500 text-green-600";
                             icon = <CheckCircle size={14} />;
                           } else if (stepStatus === 'REJECTED') {
                             circleClass = "bg-red-100 border-red-500 text-red-600";
                             icon = <XCircle size={14} />;
                           } else if (stepStatus === 'PENDING') {
                             circleClass = "bg-orange-100 border-orange-500 text-orange-600 animate-pulse";
                             icon = <Clock size={14} />;
                           }

                           // Line color based on PREVIOUS step status
                           let lineClass = "bg-gray-200";
                           if (idx > 0) {
                             const prevApproval = req.approvals[idx-1];
                             if (prevApproval && prevApproval.status === 'APPROVED') {
                               lineClass = "bg-green-400";
                             }
                           }

                           return (
                             <div key={idx} className="flex items-center relative group">
                               {idx > 0 && (
                                 <div className={`w-6 h-0.5 mx-1 ${lineClass}`}></div>
                               )}
                               
                               <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${circleClass}`}>
                                 {stepStatus === 'WAITING' || stepStatus === 'PENDING' ? <span className="text-[10px] font-bold">{role}</span> : icon}
                               </div>

                               {/* Tooltip */}
                               <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                                 <div className="bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap shadow-lg">
                                   <p className="font-bold">{role}</p>
                                   <p>{stepStatus === 'PENDING' ? 'กำลังดำเนินการ' : stepStatus === 'WAITING' ? 'รอคิว' : stepStatus}</p>
                                   {approval && <p className="text-gray-400 text-[10px]">{new Date(approval.date).toLocaleDateString('th-TH')}</p>}
                                 </div>
                                 <div className="w-2 h-2 bg-gray-800 transform rotate-45 absolute left-1/2 -translate-x-1/2 -bottom-1"></div>
                               </div>
                             </div>
                           );
                         })}
                       </div>
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