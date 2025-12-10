import { User, AttendanceRecord, LeaveRequest, SystemSettings, LogEntry, Role } from '../types';
import { DEFAULT_SETTINGS, MOCK_USERS } from '../constants';

const KEYS = {
  USERS: 'hrm_users',
  ATTENDANCE: 'hrm_attendance',
  LEAVES: 'hrm_leaves',
  SETTINGS: 'hrm_settings',
  LOGS: 'hrm_logs',
};

// Initialize DB with defaults if empty
export const initDB = () => {
  if (!localStorage.getItem(KEYS.USERS)) {
    localStorage.setItem(KEYS.USERS, JSON.stringify(MOCK_USERS));
  }
  if (!localStorage.getItem(KEYS.SETTINGS)) {
    localStorage.setItem(KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
  }
  if (!localStorage.getItem(KEYS.ATTENDANCE)) {
    localStorage.setItem(KEYS.ATTENDANCE, JSON.stringify([]));
  }
  if (!localStorage.getItem(KEYS.LEAVES)) {
    localStorage.setItem(KEYS.LEAVES, JSON.stringify([]));
  }
  if (!localStorage.getItem(KEYS.LOGS)) {
    localStorage.setItem(KEYS.LOGS, JSON.stringify([]));
  }
};

export const getSettings = (): SystemSettings => {
  const stored = JSON.parse(localStorage.getItem(KEYS.SETTINGS) || 'null');
  // Merge stored with default to ensure new fields (like shifts/otRates) exist if they were missing in old data
  return stored ? { ...DEFAULT_SETTINGS, ...stored } : DEFAULT_SETTINGS;
};

export const saveSettings = (settings: SystemSettings) => {
  localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
};

export const getUsers = (): User[] => {
  return JSON.parse(localStorage.getItem(KEYS.USERS) || '[]');
};

export const getUser = (username: string): User | undefined => {
  const users = getUsers();
  return users.find(u => u.username === username);
};

export const saveUser = (user: User) => {
  const users = getUsers();
  const index = users.findIndex(u => u.id === user.id);
  if (index >= 0) {
    users[index] = user;
  } else {
    users.push(user);
  }
  localStorage.setItem(KEYS.USERS, JSON.stringify(users));
};

export const deleteUser = (userId: string) => {
  let users = getUsers();
  users = users.filter(u => u.id !== userId);
  localStorage.setItem(KEYS.USERS, JSON.stringify(users));
};

export const getAttendance = (): AttendanceRecord[] => {
  return JSON.parse(localStorage.getItem(KEYS.ATTENDANCE) || '[]');
};

export const addAttendance = (record: AttendanceRecord) => {
  const list = getAttendance();
  // Check if update or new
  const index = list.findIndex(r => r.id === record.id);
  if(index >= 0) {
    list[index] = record;
  } else {
    list.push(record);
  }
  localStorage.setItem(KEYS.ATTENDANCE, JSON.stringify(list));
};

export const deleteAttendance = (id: string) => {
  let list = getAttendance();
  list = list.filter(r => r.id !== id);
  localStorage.setItem(KEYS.ATTENDANCE, JSON.stringify(list));
};

export const getLeaves = (): LeaveRequest[] => {
  return JSON.parse(localStorage.getItem(KEYS.LEAVES) || '[]');
};

export const saveLeave = (leave: LeaveRequest) => {
  const list = getLeaves();
  const index = list.findIndex(l => l.id === leave.id);
  if (index >= 0) {
    list[index] = leave;
  } else {
    list.push(leave);
  }
  localStorage.setItem(KEYS.LEAVES, JSON.stringify(list));
};

export const deleteLeave = (leaveId: string) => {
  let list = getLeaves();
  list = list.filter(l => l.id !== leaveId);
  localStorage.setItem(KEYS.LEAVES, JSON.stringify(list));
};

export const addLog = (userId: string, action: string, details: string) => {
  const logs: LogEntry[] = JSON.parse(localStorage.getItem(KEYS.LOGS) || '[]');
  const newLog: LogEntry = {
    id: Date.now().toString(),
    timestamp: new Date().toISOString(),
    userId,
    action,
    details
  };
  logs.unshift(newLog); // Newest first
  localStorage.setItem(KEYS.LOGS, JSON.stringify(logs));
};

export const getLogs = (): LogEntry[] => {
  return JSON.parse(localStorage.getItem(KEYS.LOGS) || '[]');
};

// Utils
export const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};