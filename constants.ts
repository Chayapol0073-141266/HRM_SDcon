
import { DepartmentConfig, Role, User, AttendanceType, SystemSettings, NewsItem } from './types';

// Default Location (Bangkok generic for demo)
export const DEFAULT_SETTINGS: SystemSettings = {
  centerLat: 13.7563, 
  centerLng: 100.5018,
  radiusKm: 0.5,
  lateThresholdMinutes: 15,
  shifts: [
    { id: 's1', name: 'กะเช้า (Morning)', startTime: '08:00', endTime: '17:00' },
    { id: 's2', name: 'กะบ่าย (Afternoon)', startTime: '16:00', endTime: '01:00' }
  ],
  otRates: {
    weekday: 1.5,
    weekend: 2.0,
    holiday: 3.0
  }
};

// Department Approval Workflows based on prompt
export const DEPARTMENTS: Record<string, DepartmentConfig> = {
  ACC: { code: 'ACC', name: 'บัญชี', steps: 3, approvers: [Role.OM, Role.DM, Role.CEO] },
  FIN: { code: 'FIN', name: 'การเงิน', steps: 3, approvers: [Role.OM, Role.DM, Role.CEO] },
  HR: { code: 'HR', name: 'บุคคล', steps: 3, approvers: [Role.OM, Role.DM, Role.CEO] },
  SEC: { code: 'SEC', name: 'เลขานุการ', steps: 3, approvers: [Role.OM, Role.DM, Role.CEO] },
  PUR: { code: 'PUR', name: 'จัดซื้อ', steps: 3, approvers: [Role.OM, Role.DM, Role.CEO] },
  OFF: { code: 'OFF', name: 'สำนักงาน', steps: 4, approvers: [Role.SUP, Role.OM, Role.DM, Role.CEO] }, // Assuming SUPSALE mapped to generic SUP for demo simplicity or specific logic
  SALES: { code: 'SALES', name: 'ฝ่ายขาย', steps: 4, approvers: [Role.SUP, Role.OM, Role.DM, Role.CEO] },
  WH: { code: 'WH', name: 'คลังสินค้า', steps: 4, approvers: [Role.SUP, Role.OM, Role.DM, Role.CEO] },
  MNT: { code: 'MNT', name: 'บำรุงรักษา', steps: 4, approvers: [Role.FM, Role.SUP, Role.PM, Role.DM] }, // Adjusted based on prompt pattern
  PROD: { code: 'PROD', name: 'ผลิต', steps: 4, approvers: [Role.FM, Role.SUP, Role.PM, Role.DM] },
  BOIL: { code: 'BOIL', name: 'Boiler', steps: 4, approvers: [Role.FM, Role.SUP, Role.PM, Role.DM] },
  GEN: { code: 'GEN', name: 'แรงงาน', steps: 4, approvers: [Role.FM, Role.SUP, Role.PM, Role.DM] },
};

export const MOCK_USERS: User[] = [
  {
    id: 'u1',
    username: 'chayapol',
    password: '@Thansandee141266',
    fullName: 'คุณชยพล (Superuser)',
    role: [Role.SUPERUSER, Role.CEO, Role.ADMIN],
    departmentCode: 'HR',
    position: 'CEO / ผู้ดูแลระบบ',
    attendanceType: AttendanceType.EXEC_NO_ATTEND,
  },
  {
    id: 'u2',
    username: 'emp01',
    password: '1234',
    fullName: 'สมศักดิ์ ขยันทำงาน',
    role: [Role.EMPLOYEE],
    departmentCode: 'PROD',
    position: 'พนักงานฝ่ายผลิต',
    attendanceType: AttendanceType.FIXED,
    shiftStart: '08:00',
    shiftEnd: '17:00',
  },
  {
    id: 'u3',
    username: 'mgr01',
    password: '1234',
    fullName: 'มานะ หัวหน้างาน',
    role: [Role.EMPLOYEE, Role.DM],
    departmentCode: 'PROD',
    position: 'ผู้จัดการฝ่ายผลิต',
    attendanceType: AttendanceType.FLEX,
  },
  {
    id: 'u4',
    username: 'hr01',
    password: '1234',
    fullName: 'ฮาน่า ฝ่ายบุคคล',
    role: [Role.EMPLOYEE, Role.HR],
    departmentCode: 'HR',
    position: 'เจ้าหน้าที่บุคคล',
    attendanceType: AttendanceType.FIXED,
    shiftStart: '08:30',
    shiftEnd: '17:30',
  }
];

export const LEAVE_TYPES = [
  'ลาป่วย (Sick Leave)',
  'ลากิจ (Personal Leave)',
  'พักร้อน (Vacation)',
  'ลาคลอด (Maternity Leave)',
  'ลาไม่รับค่าจ้าง (Unpaid Leave)'
];

export const MOCK_NEWS: NewsItem[] = [
  {
    id: 'n1',
    title: 'ประกาศวันหยุดประจำปี 2567',
    summary: 'แจ้งกำหนดการวันหยุดประเพณีและวันหยุดนักขัตฤกษ์ประจำปี',
    content: 'บริษัทขอแจ้งกำหนดการวันหยุดประจำปี 2567 ให้พนักงานทุกท่านทราบ โดยมีวันหยุดรวมทั้งสิ้น 15 วัน รวมวันแรงงานและวันสิ้นปี ขอให้พนักงานวางแผนการลาพักร้อนล่วงหน้าเพื่อให้ไม่กระทบต่อการทำงาน',
    date: '2023-12-15',
    author: 'ฝ่ายบุคคล',
    imageUrl: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&q=80&w=300'
  },
  {
    id: 'n2',
    title: 'กิจกรรม Team Building ประจำไตรมาส',
    summary: 'ขอเชิญพนักงานร่วมกิจกรรมสานสัมพันธ์ที่ชะอำ',
    content: 'ขอเชิญพนักงานทุกท่านเข้าร่วมกิจกรรม Team Building ประจำไตรมาสที่ 1 ณ โรงแรมรีเจ้นท์ ชะอำ ในวันที่ 20-21 มกราคม นี้ โดยจะมีกิจกรรม Walk Rally และงานเลี้ยงสังสรรค์ในธีม "Neon Party" รถบัสออกจากหน้าบริษัทเวลา 07.00 น.',
    date: '2024-01-05',
    author: 'ฝ่ายสื่อสารองค์กร'
  },
  {
    id: 'n3',
    title: 'นโยบายการเบิกค่ารักษาพยาบาลใหม่',
    summary: 'อัปเดตวงเงินประกันกลุ่มและขั้นตอนการเบิกจ่าย',
    content: 'ตั้งแต่วันที่ 1 กุมภาพันธ์ เป็นต้นไป บริษัทได้ปรับเพิ่มวงเงินค่ารักษาพยาบาลผู้ป่วยนอก (OPD) เป็น 2,000 บาท/ครั้ง และสามารถใช้บัตรประกันกลุ่มยื่นที่โรงพยาบาลคู่สัญญาได้ทันทีโดยไม่ต้องสำรองจ่าย หากมีข้อสงสัยติดต่อฝ่ายบุคคล',
    date: '2024-01-20',
    author: 'ฝ่ายบุคคล'
  }
];
