import React, { useState, useEffect } from 'react';
import { getSettings, saveSettings } from '../services/db';
import { Save, Clock, MapPin, Calculator, Plus, Trash2, Calendar } from 'lucide-react';
import { SystemSettings, ShiftConfig } from '../types';
import { DEFAULT_SETTINGS } from '../constants';

export const SettingsPanel: React.FC = () => {
  const [settings, setSettings] = useState<SystemSettings>(DEFAULT_SETTINGS);
  const [activeTab, setActiveTab] = useState<'general' | 'ot'>('general');

  useEffect(() => {
    const loadData = async () => {
        const s = await getSettings();
        setSettings(s);
    }
    loadData();
  }, []);

  // OT Calculator State
  const [calcShiftId, setCalcShiftId] = useState('');
  const [calcCheckOut, setCalcCheckOut] = useState('');
  const [calcType, setCalcType] = useState<'weekday' | 'weekend' | 'holiday'>('weekday');
  const [calcResult, setCalcResult] = useState<{ hours: number, multiplier: number, totalUnit: number } | null>(null);

  // New Shift State
  const [newShift, setNewShift] = useState<Partial<ShiftConfig>>({ name: '', startTime: '', endTime: '' });

  const handleSave = async () => {
    await saveSettings(settings);
    alert("บันทึกการตั้งค่าเรียบร้อยแล้ว!");
  };

  const handleAddShift = () => {
    if (newShift.name && newShift.startTime && newShift.endTime) {
      const shift: ShiftConfig = {
        id: Date.now().toString(),
        name: newShift.name,
        startTime: newShift.startTime,
        endTime: newShift.endTime,
      };
      setSettings({ ...settings, shifts: [...settings.shifts, shift] });
      setNewShift({ name: '', startTime: '', endTime: '' });
    }
  };

  const handleRemoveShift = (id: string) => {
    setSettings({ ...settings, shifts: settings.shifts.filter(s => s.id !== id) });
  };

  const calculateOT = () => {
    const shift = settings.shifts.find(s => s.id === calcShiftId);
    if (!shift || !calcCheckOut) return;

    const [endH, endM] = shift.endTime.split(':').map(Number);
    const [outH, outM] = calcCheckOut.split(':').map(Number);

    const shiftEndMin = endH * 60 + endM;
    const actualOutMin = outH * 60 + outM;

    // Simple logic: OT is time worked after shift ends
    let diffMinutes = actualOutMin - shiftEndMin;
    
    // Correction for crossing midnight (e.g. shift ends 17:00, out 01:00 next day? Not handled here for simplicity demo)
    if (diffMinutes < 0) diffMinutes = 0; // No OT if left early

    const otHours = diffMinutes / 60;
    const multiplier = settings.otRates[calcType];
    
    setCalcResult({
      hours: parseFloat(otHours.toFixed(2)),
      multiplier,
      totalUnit: parseFloat((otHours * multiplier).toFixed(2))
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-orange-100 overflow-hidden">
      <div className="flex border-b border-orange-100">
        <button
          onClick={() => setActiveTab('general')}
          className={`flex-1 py-4 font-medium text-sm flex items-center justify-center space-x-2 ${
            activeTab === 'general' ? 'bg-orange-50 text-orange-600 border-b-2 border-orange-500' : 'text-gray-500 hover:bg-gray-50'
          }`}
        >
          <MapPin size={18} />
          <span>ตั้งค่าทั่วไป (Location)</span>
        </button>
        <button
          onClick={() => setActiveTab('ot')}
          className={`flex-1 py-4 font-medium text-sm flex items-center justify-center space-x-2 ${
            activeTab === 'ot' ? 'bg-orange-50 text-orange-600 border-b-2 border-orange-500' : 'text-gray-500 hover:bg-gray-50'
          }`}
        >
          <Clock size={18} />
          <span>การทำงานและโอที (Shifts & OT)</span>
        </button>
      </div>

      <div className="p-6">
        {activeTab === 'general' ? (
          <div className="space-y-4 max-w-2xl">
            <h3 className="text-lg font-bold text-gray-800 mb-2">ตั้งค่าพิกัดการลงเวลา</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">พิกัดละติจูด (Latitude)</label>
              <input
                type="number"
                step="0.0001"
                className="w-full p-2 border border-gray-300 rounded-lg"
                value={settings.centerLat}
                onChange={(e) => setSettings({ ...settings, centerLat: parseFloat(e.target.value) })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">พิกัดลองจิจูด (Longitude)</label>
              <input
                type="number"
                step="0.0001"
                className="w-full p-2 border border-gray-300 rounded-lg"
                value={settings.centerLng}
                onChange={(e) => setSettings({ ...settings, centerLng: parseFloat(e.target.value) })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">รัศมีเช็คอิน (กม.)</label>
              <input
                type="number"
                step="0.1"
                className="w-full p-2 border border-gray-300 rounded-lg"
                value={settings.radiusKm}
                onChange={(e) => setSettings({ ...settings, radiusKm: parseFloat(e.target.value) })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">เกณฑ์สาย (นาที)</label>
              <input
                type="number"
                className="w-full p-2 border border-gray-300 rounded-lg"
                value={settings.lateThresholdMinutes}
                onChange={(e) => setSettings({ ...settings, lateThresholdMinutes: parseInt(e.target.value) })}
              />
              <p className="text-xs text-gray-500 mt-1">ระยะเวลาผ่อนผันหลังเวลางาน ก่อนที่จะนับว่า "มาสาย"</p>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* OT Rates */}
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                 <Calendar className="mr-2 text-orange-500" size={20}/> 
                 อัตราคูณค่าล่วงเวลา (OT Rate Multipliers)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 <div className="bg-orange-50 p-4 rounded-xl">
                    <label className="block text-sm font-medium text-gray-700 mb-1">วันธรรมดา (Weekday)</label>
                    <div className="flex items-center">
                       <span className="text-gray-500 mr-2">x</span>
                       <input 
                         type="number" step="0.5" 
                         className="flex-1 p-2 border border-gray-300 rounded-lg"
                         value={settings.otRates.weekday}
                         onChange={(e) => setSettings({...settings, otRates: {...settings.otRates, weekday: parseFloat(e.target.value)}})}
                       />
                    </div>
                 </div>
                 <div className="bg-red-50 p-4 rounded-xl">
                    <label className="block text-sm font-medium text-gray-700 mb-1">วันหยุดเสาร์-อาทิตย์ (Weekend)</label>
                    <div className="flex items-center">
                       <span className="text-gray-500 mr-2">x</span>
                       <input 
                         type="number" step="0.5" 
                         className="flex-1 p-2 border border-gray-300 rounded-lg"
                         value={settings.otRates.weekend}
                         onChange={(e) => setSettings({...settings, otRates: {...settings.otRates, weekend: parseFloat(e.target.value)}})}
                       />
                    </div>
                 </div>
                 <div className="bg-purple-50 p-4 rounded-xl">
                    <label className="block text-sm font-medium text-gray-700 mb-1">วันหยุดนักขัตฤกษ์ (Holiday)</label>
                    <div className="flex items-center">
                       <span className="text-gray-500 mr-2">x</span>
                       <input 
                         type="number" step="0.5" 
                         className="flex-1 p-2 border border-gray-300 rounded-lg"
                         value={settings.otRates.holiday}
                         onChange={(e) => setSettings({...settings, otRates: {...settings.otRates, holiday: parseFloat(e.target.value)}})}
                       />
                    </div>
                 </div>
              </div>
            </div>

            {/* Shift Config */}
            <div>
               <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                 <Clock className="mr-2 text-orange-500" size={20}/> 
                 จัดการกะการทำงาน (Shift Management)
               </h3>
               
               {/* Add Shift */}
               <div className="flex flex-col md:flex-row gap-2 mb-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <input 
                    placeholder="ชื่อกะ (เช่น กะเช้า)" 
                    className="flex-1 p-2 border rounded-lg"
                    value={newShift.name}
                    onChange={e => setNewShift({...newShift, name: e.target.value})}
                  />
                  <div className="flex items-center space-x-2">
                    <span className="text-sm">เริ่ม:</span>
                    <input 
                      type="time" 
                      className="p-2 border rounded-lg"
                      value={newShift.startTime}
                      onChange={e => setNewShift({...newShift, startTime: e.target.value})}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm">ถึง:</span>
                    <input 
                      type="time" 
                      className="p-2 border rounded-lg"
                      value={newShift.endTime}
                      onChange={e => setNewShift({...newShift, endTime: e.target.value})}
                    />
                  </div>
                  <button onClick={handleAddShift} className="bg-green-500 text-white p-2 rounded-lg hover:bg-green-600">
                     <Plus size={20} />
                  </button>
               </div>

               {/* Shift List */}
               <div className="space-y-2">
                  {settings.shifts.map(shift => (
                    <div key={shift.id} className="flex justify-between items-center p-3 bg-white border border-gray-200 rounded-lg shadow-sm">
                       <div>
                          <span className="font-bold text-gray-700">{shift.name}</span>
                          <span className="mx-2 text-gray-400">|</span>
                          <span className="text-sm text-gray-600">{shift.startTime} - {shift.endTime}</span>
                       </div>
                       <button onClick={() => handleRemoveShift(shift.id)} className="text-red-500 hover:text-red-700">
                          <Trash2 size={18} />
                       </button>
                    </div>
                  ))}
               </div>
            </div>

            {/* OT Calculator Playground */}
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                 <Calculator className="mr-2 text-orange-500" size={20}/> 
                 ทดลองคำนวณโอที (OT Calculator Preview)
              </h3>
              <div className="bg-gradient-to-br from-orange-50 to-white p-6 rounded-2xl border border-orange-200">
                 <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div>
                       <label className="block text-xs font-medium text-gray-500 mb-1">เลือกกะงาน</label>
                       <select 
                         className="w-full p-2 border border-orange-200 rounded-lg"
                         value={calcShiftId}
                         onChange={e => setCalcShiftId(e.target.value)}
                       >
                         <option value="">-- เลือกกะ --</option>
                         {settings.shifts.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                       </select>
                    </div>
                    <div>
                       <label className="block text-xs font-medium text-gray-500 mb-1">เวลาเลิกงานจริง</label>
                       <input 
                         type="time" 
                         className="w-full p-2 border border-orange-200 rounded-lg"
                         value={calcCheckOut}
                         onChange={e => setCalcCheckOut(e.target.value)}
                       />
                    </div>
                    <div>
                       <label className="block text-xs font-medium text-gray-500 mb-1">ประเภทวัน</label>
                       <select 
                         className="w-full p-2 border border-orange-200 rounded-lg"
                         value={calcType}
                         onChange={e => setCalcType(e.target.value as any)}
                       >
                         <option value="weekday">วันธรรมดา</option>
                         <option value="weekend">วันหยุด (เสาร์-อาทิตย์)</option>
                         <option value="holiday">นักขัตฤกษ์</option>
                       </select>
                    </div>
                    <div className="flex items-end">
                       <button 
                         onClick={calculateOT}
                         disabled={!calcShiftId || !calcCheckOut}
                         className="w-full bg-orange-600 text-white py-2 rounded-lg hover:bg-orange-700 disabled:bg-gray-300"
                       >
                         คำนวณ
                       </button>
                    </div>
                 </div>

                 {calcResult && (
                    <div className="mt-4 p-4 bg-white rounded-xl shadow-sm border border-orange-100 grid grid-cols-3 gap-4 text-center">
                       <div>
                          <p className="text-xs text-gray-500">จำนวนชั่วโมง OT</p>
                          <p className="text-xl font-bold text-gray-800">{calcResult.hours} ชม.</p>
                       </div>
                       <div>
                          <p className="text-xs text-gray-500">อัตราคูณ</p>
                          <p className="text-xl font-bold text-orange-500">x{calcResult.multiplier}</p>
                       </div>
                       <div>
                          <p className="text-xs text-gray-500">หน่วยค่าตอบแทน</p>
                          <p className="text-xl font-bold text-green-600">{calcResult.totalUnit}</p>
                       </div>
                    </div>
                 )}
              </div>
            </div>
          </div>
        )}

        <div className="pt-6 mt-6 border-t border-orange-100">
          <button
            onClick={handleSave}
            className="flex items-center justify-center w-full bg-orange-600 text-white py-3 rounded-xl font-bold shadow-md hover:bg-orange-700 transition"
          >
            <Save size={18} className="mr-2" /> บันทึกการตั้งค่าทั้งหมด
          </button>
        </div>
      </div>
    </div>
  );
};