import React, { useState, useEffect } from 'react';
import { User, LeaveRequest, LeaveStatus } from '../types';
import { getLeaves, saveLeave, addLog } from '../services/db';
import { Check, X } from 'lucide-react';

interface ApprovalPanelProps {
  currentUser: User;
}

export const ApprovalPanel: React.FC<ApprovalPanelProps> = ({ currentUser }) => {
  const [pendingRequests, setPendingRequests] = useState<LeaveRequest[]>([]);

  useEffect(() => {
    loadRequests();
  }, [currentUser]);

  const loadRequests = () => {
    const all = getLeaves();
    // Filter logic:
    // 1. Request status is PENDING
    // 2. currentApproverRole matches one of the currentUser's roles (OR user is SUPERUSER)
    
    const relevant = all.filter(req => {
      if (req.status !== LeaveStatus.PENDING) return false;
      if (currentUser.role.includes(req.currentApproverRole as any) || currentUser.role.includes('SUPERUSER' as any)) {
        return true;
      }
      return false;
    });

    setPendingRequests(relevant);
  };

  const handleDecision = (req: LeaveRequest, approved: boolean) => {
    const updatedReq = { ...req };
    const currentRoleIndex = updatedReq.approvalChain.indexOf(updatedReq.currentApproverRole as any);
    
    // Add approval record
    updatedReq.approvals.push({
      role: updatedReq.currentApproverRole as any,
      approverId: currentUser.id,
      date: new Date().toISOString(),
      status: approved ? 'APPROVED' : 'REJECTED'
    });

    if (!approved) {
      updatedReq.status = LeaveStatus.REJECTED;
      updatedReq.currentApproverRole = 'DONE';
    } else {
      // Move to next step
      if (currentRoleIndex < updatedReq.approvalChain.length - 1) {
        updatedReq.currentApproverRole = updatedReq.approvalChain[currentRoleIndex + 1];
      } else {
        updatedReq.status = LeaveStatus.APPROVED;
        updatedReq.currentApproverRole = 'DONE';
      }
    }

    saveLeave(updatedReq);
    addLog(currentUser.id, approved ? 'APPROVE_LEAVE' : 'REJECT_LEAVE', `Leave ID ${req.id} decision made.`);
    loadRequests(); // Refresh
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-800">รายการรออนุมัติ</h2>
      
      <div className="grid grid-cols-1 gap-4">
        {pendingRequests.length === 0 ? (
           <div className="bg-white p-8 rounded-2xl border border-orange-100 text-center text-gray-500">
             ไม่มีรายการรออนุมัติในขณะนี้
           </div>
        ) : (
          pendingRequests.map(req => (
            <div key={req.id} className="bg-white p-6 rounded-2xl shadow-sm border border-orange-100 flex flex-col md:flex-row justify-between items-start md:items-center">
              <div>
                <div className="flex items-center space-x-2 mb-2">
                   <span className="font-bold text-lg text-gray-800">{req.leaveType}</span>
                   <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">
                     ขอโดย: {req.userId}
                   </span>
                </div>
                <p className="text-gray-600 mb-1">
                  จาก <span className="font-medium text-gray-800">{new Date(req.startDate).toLocaleDateString('th-TH')}</span> ถึง <span className="font-medium text-gray-800">{new Date(req.endDate).toLocaleDateString('th-TH')}</span>
                </p>
                <p className="text-sm text-gray-500 italic">"{req.reason}"</p>
              </div>
              
              <div className="mt-4 md:mt-0 flex space-x-3">
                 <button 
                   onClick={() => handleDecision(req, false)}
                   className="flex items-center px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition"
                 >
                   <X size={18} className="mr-2" /> ไม่อนุมัติ
                 </button>
                 <button 
                   onClick={() => handleDecision(req, true)}
                   className="flex items-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 shadow-sm transition"
                 >
                   <Check size={18} className="mr-2" /> อนุมัติ
                 </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};