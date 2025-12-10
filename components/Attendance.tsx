import React, { useState, useEffect, useRef } from 'react';
import { User, AttendanceType, SystemSettings, AttendanceRecord, NewsItem } from '../types';
import { calculateDistance, getSettings, addAttendance, addLog, getAttendance, getNews } from '../services/db';
import { MapPin, Camera, CheckCircle, AlertTriangle, RefreshCw, Bell } from 'lucide-react';
import { DEFAULT_SETTINGS } from '../constants';
import { NewsCard } from './NewsCard';

interface AttendanceProps {
  user: User;
}

export const Attendance: React.FC<AttendanceProps> = ({ user }) => {
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [settings, setSettings] = useState<SystemSettings>(DEFAULT_SETTINGS);
  const [reason, setReason] = useState('');
  const [photo, setPhoto] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [todayRecord, setTodayRecord] = useState<AttendanceRecord | null>(null);
  const [newsList, setNewsList] = useState<NewsItem[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const loadData = async () => {
        const s = await getSettings();
        setSettings(s);
        
        const today = new Date().toISOString().split('T')[0];
        const records = await getAttendance();
        const found = records.find(r => r.userId === user.id && r.date === today);
        setTodayRecord(found || null);

        const news = await getNews();
        setNewsList(news);
    };
    loadData();
    getCurrentLocation();
  }, [user.id]);

  const getCurrentLocation = () => {
    setLoading(true);
    setError(null);
    if (!navigator.geolocation) {
      setError('เบราว์เซอร์ของคุณไม่รองรับการระบุตำแหน่ง (Geolocation)');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLocation({ lat: latitude, lng: longitude });
        setLoading(false);
      },
      (err) => {
        setError('ไม่สามารถระบุตำแหน่งได้ กรุณาเปิดสิทธิ์การเข้าถึงตำแหน่ง');
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Calculate distance whenever location or settings change
  useEffect(() => {
     if (location && settings) {
        const dist = calculateDistance(
            location.lat, 
            location.lng, 
            settings.centerLat, 
            settings.centerLng
        );
        setDistance(dist);
     }
  }, [location, settings]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAction = async (type: 'CHECK_IN' | 'CHECK_OUT') => {
    if (!location || distance === null) {
      alert("กรุณาระบุตำแหน่งก่อนดำเนินการ");
      return;
    }

    const isOutOfRange = distance > settings.radiusKm;
    
    if (isOutOfRange && !photo && !reason) {
      alert("คุณอยู่นอกพื้นที่! กรุณาถ่ายรูปและระบุเหตุผลประกอบ");
      return;
    }

    const now = new Date();
    const timeString = now.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
    const today = now.toISOString().split('T')[0];

    // Determine status
    let status: AttendanceRecord['status'] = 'PRESENT';
    
    // Simple LATE logic for FIXED type on Check In
    if (type === 'CHECK_IN' && user.attendanceType === AttendanceType.FIXED && user.shiftStart) {
       const [shiftH, shiftM] = user.shiftStart.split(':').map(Number);
       const shiftDate = new Date();
       shiftDate.setHours(shiftH, shiftM + settings.lateThresholdMinutes, 0); // Grace period
       if (now > shiftDate) {
         status = 'LATE';
       }
    }

    const newRecord: AttendanceRecord = todayRecord ? { ...todayRecord } : {
      id: Date.now().toString(),
      userId: user.id,
      date: today,
      status,
      isOutOfRange,
      reason: isOutOfRange ? reason : undefined,
      photoUrl: isOutOfRange ? photo || undefined : undefined,
      lat: location.lat,
      lng: location.lng,
    };

    if (type === 'CHECK_IN') {
      newRecord.checkInTime = timeString;
      await addLog(user.id, 'CHECK_IN', `Checked in at ${timeString}`);
    } else {
      newRecord.checkOutTime = timeString;
      await addLog(user.id, 'CHECK_OUT', `Checked out at ${timeString}`);
    }

    await addAttendance(newRecord);
    setTodayRecord(newRecord);
    alert(`${type === 'CHECK_IN' ? 'ลงเวลาเข้างาน' : 'ลงเวลาออกงาน'} เรียบร้อยแล้ว!`);
    
    // Reset inputs
    setReason('');
    setPhoto(null);
  };

  const isExec = user.attendanceType === AttendanceType.EXEC_NO_ATTEND;

  return (
    <div className="space-y-8">
      {/* Attendance Section */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
          <MapPin className="mr-2 text-orange-600" /> 
          การลงเวลาทำงาน: {new Date().toLocaleDateString('th-TH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Location Info */}
          <div className="bg-gray-50 p-4 rounded-xl space-y-3 border border-gray-100">
             <div className="flex justify-between items-start">
               <div>
                 <p className="text-sm text-gray-500">พิกัดปัจจุบัน</p>
                 <p className="text-lg font-semibold text-gray-800">
                    {location ? `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}` : 'ไม่พบตำแหน่ง'}
                 </p>
               </div>
               <button 
                onClick={getCurrentLocation} 
                disabled={loading}
                className="p-2 bg-white text-orange-600 rounded-full shadow hover:bg-gray-100 transition"
               >
                 <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
               </button>
             </div>
             
             {distance !== null && (
               <div className={`p-3 rounded-lg border flex items-center ${distance <= settings.radiusKm ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
                 {distance <= settings.radiusKm ? <CheckCircle className="mr-2" size={20}/> : <AlertTriangle className="mr-2" size={20}/>}
                 <span className="font-medium">
                   {distance <= settings.radiusKm 
                     ? 'คุณอยู่ในพื้นที่บริษัท' 
                     : `อยู่นอกพื้นที่ ${(distance - settings.radiusKm).toFixed(2)} กม.`}
                 </span>
               </div>
             )}

             {error && <p className="text-red-500 text-sm">{error}</p>}
          </div>

          {/* Controls */}
          <div className="space-y-4">
             {distance !== null && distance > settings.radiusKm && (
               <div className="animate-fade-in space-y-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
                 <p className="text-sm font-semibold text-gray-700">ยืนยันการลงเวลา (นอกพื้นที่)</p>
                 <input 
                   type="text" 
                   placeholder="ระบุเหตุผล (เช่น พบลูกค้า, WFH)" 
                   value={reason}
                   onChange={(e) => setReason(e.target.value)}
                   className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                 />
                 <div className="flex items-center space-x-2">
                   <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 flex items-center justify-center p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 text-sm"
                   >
                     <Camera size={16} className="mr-2"/> 
                     {photo ? 'ถ่ายใหม่' : 'ถ่ายรูปประกอบ'}
                   </button>
                   <input 
                    ref={fileInputRef}
                    type="file" 
                    accept="image/*" 
                    capture="environment"
                    className="hidden"
                    onChange={handlePhotoUpload}
                   />
                 </div>
                 {photo && <div className="h-20 w-20 rounded overflow-hidden bg-gray-200"><img src={photo} alt="Proof" className="w-full h-full object-cover"/></div>}
               </div>
             )}

             <div className="grid grid-cols-2 gap-4">
                <button
                  disabled={!!todayRecord?.checkInTime || !location}
                  onClick={() => handleAction('CHECK_IN')}
                  className={`py-3 rounded-xl font-bold shadow-sm transition-all ${
                    todayRecord?.checkInTime 
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                    : 'bg-orange-600 text-white hover:bg-orange-700 shadow-md'
                  }`}
                >
                  {isExec ? 'บันทึกงาน' : 'เช็คอิน'}
                </button>
                
                <button
                  disabled={!todayRecord?.checkInTime || !!todayRecord?.checkOutTime || !location}
                  onClick={() => handleAction('CHECK_OUT')}
                  className={`py-3 rounded-xl font-bold shadow-sm transition-all ${
                    !todayRecord?.checkInTime || todayRecord?.checkOutTime
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                    : 'bg-white border-2 border-orange-600 text-orange-600 hover:bg-orange-50'
                  }`}
                >
                   {isExec ? 'จบงาน' : 'เช็คเอาท์'}
                </button>
             </div>

             {todayRecord && (
               <div className="text-center text-sm text-gray-600 bg-gray-50 p-2 rounded-lg border border-gray-100">
                 {todayRecord.checkInTime && <span>เข้า: {todayRecord.checkInTime}</span>}
                 {todayRecord.checkInTime && todayRecord.checkOutTime && <span className="mx-2">|</span>}
                 {todayRecord.checkOutTime && <span>ออก: {todayRecord.checkOutTime}</span>}
               </div>
             )}
          </div>
        </div>
      </div>

      {/* News Section */}
      <div>
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
          <Bell className="mr-2 text-orange-600" />
          ข่าวประชาสัมพันธ์ (News & Update)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {newsList.map(news => (
            <NewsCard key={news.id} news={news} />
          ))}
          {newsList.length === 0 && (
              <p className="text-gray-500 col-span-3 text-center">ยังไม่มีข่าวประชาสัมพันธ์</p>
          )}
        </div>
      </div>
    </div>
  );
};