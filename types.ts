
export enum Role {
  EMPLOYEE = 'EMPLOYEE',
  ADMIN = 'ADMIN',
  HR = 'HR',
  OM = 'OM', // Operation Manager
  DM = 'DM', // Department Manager
  PM = 'PM', // Plant Manager
  CEO = 'CEO',
  SUPERUSER = 'SUPERUSER',
  FM = 'FM', // Foreman/Manager
  SUP = 'SUP', // Supervisor
}

export enum AttendanceType {
  EXEC_NO_ATTEND = 'EXEC_NO_ATTEND',
  FLEX = 'FLEX',
  FIXED = 'FIXED',
}

export enum LeaveStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export interface User {
  id: string;
  username: string;
  password?: string;
  fullName: string;
  role: Role[];
  departmentCode: string;
  position: string;
  attendanceType: AttendanceType;
  shiftStart?: string; // HH:mm
  shiftEnd?: string; // HH:mm
}

export interface AttendanceRecord {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  checkInTime?: string;
  checkOutTime?: string;
  status: 'PRESENT' | 'LATE' | 'ABSENT' | 'LEAVE';
  lat?: number;
  lng?: number;
  isOutOfRange: boolean;
  photoUrl?: string; // Base64 or URL
  reason?: string;
  locationName?: string;
}

export interface LeaveRequest {
  id: string;
  userId: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: LeaveStatus;
  currentApproverRole: Role | 'DONE'; 
  approvalChain: Role[];
  approvals: { role: Role; approverId: string; date: string; status: 'APPROVED' | 'REJECTED' }[];
  attachmentUrl?: string;
}

export interface DepartmentConfig {
  code: string;
  name: string;
  steps: number;
  approvers: Role[]; // Ordered list of approver roles
}

export interface ShiftConfig {
  id: string;
  name: string;
  startTime: string; // HH:mm
  endTime: string;   // HH:mm
}

export interface OTRates {
  weekday: number;
  weekend: number;
  holiday: number;
}

export interface SystemSettings {
  centerLat: number;
  centerLng: number;
  radiusKm: number;
  lateThresholdMinutes: number;
  shifts: ShiftConfig[];
  otRates: OTRates;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  userId: string;
  action: string;
  details: string;
}

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  content: string;
  date: string;
  author: string;
  imageUrl?: string;
}
