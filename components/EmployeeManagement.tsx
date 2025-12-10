import React, { useState, useEffect } from 'react';
import { User, Role, AttendanceType } from '../types';
import { getUsers, saveUser, deleteUser } from '../services/db';
import { DEPARTMENTS } from '../constants';
import { Plus, Edit2, Trash2, X, Save, User as UserIcon, Search, AlertTriangle } from 'lucide-react';

export const EmployeeManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<User>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    const data = await getUsers();
    setUsers(data);
  };

  const handleCreate = () => {
    setFormData({
      id: Date.now().toString(),
      username: '',
      fullName: '',
      role: [Role.EMPLOYEE],
      departmentCode: 'OFF',
      position: '',
      attendanceType: AttendanceType.FIXED,
      shiftStart: '08:00',
      shiftEnd: '17:00'
    });
    setFormError(null);
    setIsFormOpen(true);
  };

  const handleEdit = (user: User) => {
    setFormData({ ...user });
    setFormError(null);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    setUserToDelete(id);
  };

  const confirmDelete = async () => {
    if (userToDelete) {
      await deleteUser(userToDelete);
      loadUsers();
      setUserToDelete(null);
    }
  };

  const cancelDelete = () => {
    setUserToDelete(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Validate Duplicate Username
    if (!formData.id) return; // Should allow create

    const existingUser = users.find(u => u.username === formData.username && u.id !== formData.id);
    if (existingUser) {
      setFormError('Username นี้มีอยู่ในระบบแล้ว กรุณาใช้ชื่ออื่น');
      return;
    }

    if (formData.username && formData.fullName) {
      await saveUser(formData as User);
      setIsFormOpen(false);
      loadUsers();
    } else {
      setFormError('กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน');
    }
  };

  const toggleRole = (role: Role) => {
    const currentRoles = formData.role || [];
    if (currentRoles.includes(role)) {
      setFormData({ ...formData, role: currentRoles.filter(r => r !== role) });
    } else {
      setFormData({ ...formData, role: [...currentRoles, role] });
    }
  };

  const filteredUsers = users.filter(u => 
    u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.position.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h2 className="text-xl font-bold text-gray-800 flex items-center">
          <UserIcon className="mr-2 text-orange-600" />
          จัดการข้อมูลพนักงาน (Employee Management)
        </h2>
        <button 
          onClick={handleCreate}
          className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 flex items-center shadow-sm transition"
        >
          <Plus size={18} className="mr-2"/> เพิ่มพนักงานใหม่
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 animate-fade-in" onClick={cancelDelete}>
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 text-center transform transition-all scale-100" onClick={e => e.stopPropagation()}>
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500">
              <AlertTriangle size={24} />
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">ยืนยันการลบข้อมูล</h3>
            <p className="text-gray-500 text-sm mb-6">
              คุณต้องการลบพนักงานคนนี้ใช่หรือไม่? <br/>
              การกระทำนี้ไม่สามารถย้อนกลับได้
            </p>
            <div className="flex space-x-3 justify-center">
              <button 
                onClick={cancelDelete}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
              >
                ยกเลิก
              </button>
              <button 
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 shadow-md font-medium"
              >
                ลบข้อมูล
              </button>
            </div>
          </div>
        </div>
      )}

      {isFormOpen ? (
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 animate-slide-down">
          <div className="flex justify-between items-center mb-6 pb-2 border-b border-gray-200">
            <h3 className="text-lg font-bold text-gray-700">
              {formData.id && users.some(u => u.id === formData.id) ? 'แก้ไขข้อมูลพนักงาน' : 'เพิ่มพนักงานใหม่'}
            </h3>
            <button onClick={() => setIsFormOpen(false)} className="text-gray-400 hover:text-gray-600">
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {formError && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg flex items-center">
                <AlertTriangle size={20} className="mr-2" />
                {formError}
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <h4 className="font-semibold text-orange-600 border-b border-gray-100 pb-1">ข้อมูลทั่วไป</h4>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อผู้ใช้ (Username/Login)</label>
                  <input 
                    type="text" required
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                    value={formData.username || ''}
                    onChange={e => {
                      setFormData({...formData, username: e.target.value});
                      if(formError) setFormError(null);
                    }}
                  />
                </div>
                <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">รหัสผ่าน (Password)</label>
                   <input 
                     type="text" 
                     placeholder="ค่าเริ่มต้น: 1234"
                     className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                     value={formData.password || ''}
                     onChange={e => setFormData({...formData, password: e.target.value})}
                   />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อ-นามสกุล (Full Name)</label>
                  <input 
                    type="text" required
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                    value={formData.fullName || ''}
                    onChange={e => setFormData({...formData, fullName: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ตำแหน่ง (Position)</label>
                  <input 
                    type="text" required
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                    value={formData.position || ''}
                    onChange={e => setFormData({...formData, position: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">แผนก (Department)</label>
                  <select 
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                    value={formData.departmentCode || ''}
                    onChange={e => setFormData({...formData, departmentCode: e.target.value})}
                  >
                    {Object.values(DEPARTMENTS).map(dept => (
                      <option key={dept.code} value={dept.code}>{dept.code} - {dept.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Work Config */}
              <div className="space-y-4">
                 <h4 className="font-semibold text-orange-600 border-b border-gray-100 pb-1">การทำงานและการลงเวลา</h4>
                 <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">รูปแบบการลงเวลา</label>
                  <select 
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                    value={formData.attendanceType || AttendanceType.FIXED}
                    onChange={e => setFormData({...formData, attendanceType: e.target.value as AttendanceType})}
                  >
                    <option value={AttendanceType.FIXED}>FIXED - ลงเวลาตามกะปกติ</option>
                    <option value={AttendanceType.FLEX}>FLEX - ลงเวลาแบบยืดหยุ่น</option>
                    <option value={AttendanceType.EXEC_NO_ATTEND}>EXEC - ผู้บริหาร (ไม่ต้องลงเวลา)</option>
                  </select>
                </div>
                
                {formData.attendanceType === AttendanceType.FIXED && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">เวลาเข้างาน</label>
                      <input 
                        type="time"
                        className="w-full p-2 border border-gray-300 rounded-lg"
                        value={formData.shiftStart || ''}
                        onChange={e => setFormData({...formData, shiftStart: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">เวลาออกงาน</label>
                      <input 
                        type="time"
                        className="w-full p-2 border border-gray-300 rounded-lg"
                        value={formData.shiftEnd || ''}
                        onChange={e => setFormData({...formData, shiftEnd: e.target.value})}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Roles */}
            <div>
              <h4 className="font-semibold text-orange-600 border-b border-gray-100 pb-2 mb-3">สิทธิ์การใช้งาน (Roles)</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {Object.values(Role).map(role => (
                  <label key={role} className="flex items-center space-x-2 p-2 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input 
                      type="checkbox"
                      className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500"
                      checked={formData.role?.includes(role) || false}
                      onChange={() => toggleRole(role)}
                    />
                    <span className="text-sm text-gray-700">{role}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
               <button 
                 type="button" 
                 onClick={() => setIsFormOpen(false)}
                 className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
               >
                 ยกเลิก
               </button>
               <button 
                 type="submit" 
                 className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 shadow-md font-medium flex items-center"
               >
                 <Save size={18} className="mr-2"/> บันทึกข้อมูล
               </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Search Bar */}
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="ค้นหาชื่อ, username, หรือตำแหน่ง..."
                className="w-full pl-10 p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-100 text-gray-700">
                <tr>
                  <th className="p-4 font-semibold">ชื่อ-นามสกุล</th>
                  <th className="p-4 font-semibold">แผนก/ตำแหน่ง</th>
                  <th className="p-4 font-semibold">สิทธิ์ (Roles)</th>
                  <th className="p-4 font-semibold">รูปแบบงาน</th>
                  <th className="p-4 font-semibold text-right">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredUsers.map(user => (
                  <tr key={user.id} className="hover:bg-gray-50 transition">
                    <td className="p-4">
                      <div className="font-medium text-gray-800">{user.fullName}</div>
                      <div className="text-xs text-gray-500">@{user.username}</div>
                    </td>
                    <td className="p-4">
                      <span className="inline-block bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs font-bold mb-1">
                        {user.departmentCode}
                      </span>
                      <div className="text-sm text-gray-600">{user.position}</div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-1">
                        {user.role.slice(0, 3).map(r => (
                          <span key={r} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full border border-gray-200">
                            {r}
                          </span>
                        ))}
                        {user.role.length > 3 && (
                          <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">+{user.role.length - 3}</span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-sm text-gray-600">
                      {user.attendanceType === AttendanceType.FIXED ? (
                        <span className="text-green-600 font-medium">เข้า {user.shiftStart} - ออก {user.shiftEnd}</span>
                      ) : (
                        <span className="text-orange-600 font-medium">{user.attendanceType}</span>
                      )}
                    </td>
                    <td className="p-4 text-right space-x-2">
                       <button 
                         onClick={() => handleEdit(user)}
                         className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                         title="แก้ไข"
                       >
                         <Edit2 size={18} />
                       </button>
                       <button 
                         onClick={() => handleDeleteClick(user.id)}
                         className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                         title="ลบ"
                       >
                         <Trash2 size={18} />
                       </button>
                    </td>
                  </tr>
                ))}
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-gray-400">
                      ไม่พบข้อมูลพนักงาน
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};