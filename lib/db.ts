import fs from 'fs';
import path from 'path';

// Define Data Types following the SQL schema
export interface Tenant {
  id: string;
  name_kh: string;
  name_en: string;
  type: 'school' | 'company';
  logo_url: string;
  geofence_lat: number;
  geofence_lng: number;
  geofence_radius_meters: number;
  telegram_bot_token?: string;
  created_at: string;
}

export interface Employee {
  id: string;
  tenant_id: string;
  full_name_kh: string;
  full_name_en: string;
  roll_no: string;
  role: 'admin' | 'employee' | 'student' | 'teacher' | 'manager';
  phone_number: string;
  profile_picture_url: string;
  rfid_nfc_uid: string;
  qr_code_token: string;
  telegram_chat_id: string;
  salary_base_usd: number;
  created_at: string;
}

export interface CheckIn {
  id: string;
  tenant_id: string;
  employee_id: string;
  check_time: string;
  method: 'gps' | 'face' | 'qr' | 'nfc';
  latitude: number;
  longitude: number;
  status: 'present' | 'late' | 'excused' | 'absent';
  verification_score: number;
  photo_captured_url?: string;
  created_at: string;
}

export interface Payroll {
  id: string;
  tenant_id: string;
  employee_id: string;
  month: string; // YYYY-MM
  present_days: number;
  late_days: number;
  salary_earned_usd: number;
  bonus_usd: number;
  deductions_usd: number;
  payout_usd: number;
  status: 'draft' | 'approved' | 'paid';
  processed_at?: string;
  created_at: string;
}

interface DBStorage {
  tenants: Tenant[];
  employees: Employee[];
  checkins: CheckIn[];
  payrolls: Payroll[];
}

const DB_FILE_PATH = path.join('/tmp', 'secureattend_db.json');

// Default Seed Data matching the schema.sql in Khmer and English
const defaultDB: DBStorage = {
  tenants: [
    {
      id: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
      name_kh: 'សាលាអន្តរជាតិ ស៊ីឃ្យួរ',
      name_en: 'Secure International School',
      type: 'school',
      logo_url: 'https://picsum.photos/seed/secureschool/100/100',
      geofence_lat: 11.5564,
      geofence_lng: 104.9282,
      geofence_radius_meters: 150.0,
      telegram_bot_token: '89101112:AAE-SecureAttendBotDemo',
      created_at: '2026-06-11T00:00:00Z',
    },
    {
      id: 'b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e',
      name_kh: 'ក្រុមហ៊ុន បច្ចេកវិទ្យា ភ្នំពេញ',
      name_en: 'Phnom Penh Technology Co., Ltd.',
      type: 'company',
      logo_url: 'https://picsum.photos/seed/pptech/100/100',
      geofence_lat: 11.5621,
      geofence_lng: 104.8885,
      geofence_radius_meters: 100.0,
      telegram_bot_token: '12345678:AAF-SecureAttendBotDemo',
      created_at: '2026-06-11T00:00:00Z',
    },
    {
      id: 'c3d4e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f',
      name_kh: 'មន្ទីរពេទ្យ រីយ៉ាល់ ភ្នំពេញ',
      name_en: 'Royal Phnom Penh Hospital Corp',
      type: 'company',
      logo_url: 'https://picsum.photos/seed/royalhosp/100/100',
      geofence_lat: 11.5684,
      geofence_lng: 104.8722,
      geofence_radius_meters: 200.0,
      telegram_bot_token: '11223344:AAH-RoyalDemoBot',
      created_at: '2026-06-11T00:00:00Z',
    }
  ],
  employees: [
    {
      id: 'e1a1a1a1-1111-1111-1111-111111111111',
      tenant_id: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
      full_name_kh: 'សុខ ម៉េងលី',
      full_name_en: 'Sokh Mengly',
      roll_no: 'EMP-1001',
      role: 'teacher',
      phone_number: '+855 12 345 678',
      profile_picture_url: 'https://picsum.photos/seed/mengly/200/200',
      rfid_nfc_uid: 'E4D3C2B1',
      qr_code_token: 'SECURE-TEACHER-MENGLY-TOKEN',
      telegram_chat_id: 'mengly_telegram_chat',
      salary_base_usd: 450.00,
      created_at: '2026-06-11T00:00:00Z'
    },
    {
      id: 'e2a2a2a2-2222-2222-2222-222222222222',
      tenant_id: 'b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e',
      full_name_kh: 'លី ដារ៉ា',
      full_name_en: 'Ly Dara',
      roll_no: 'EMP-2001',
      role: 'employee',
      phone_number: '+855 99 777 888',
      profile_picture_url: 'https://picsum.photos/seed/dara/200/200',
      rfid_nfc_uid: 'D1C2b3A4',
      qr_code_token: 'SECURE-COMPANY-DARA-TOKEN',
      telegram_chat_id: 'dara_telegram_chat',
      salary_base_usd: 650.00,
      created_at: '2026-06-11T00:00:00Z'
    },
    {
      id: 'e3a3a3a3-3333-3333-3333-333333333333',
      tenant_id: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
      full_name_kh: 'ចាន់ ធារី',
      full_name_en: 'Chan Theary',
      roll_no: 'STD-1002',
      role: 'student',
      phone_number: '+855 88 555 111',
      profile_picture_url: 'https://picsum.photos/seed/theary/200/200',
      rfid_nfc_uid: 'A1B2C3D4',
      qr_code_token: 'SECURE-STUDENT-THEARY-TOKEN',
      telegram_chat_id: 'theary_telegram_chat',
      salary_base_usd: 150.00, // Part-time assistant base
      created_at: '2026-06-11T00:00:00Z'
    },
    {
      id: 'e4a4a4a4-4444-4444-4444-444444444444',
      tenant_id: 'b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e',
      full_name_kh: 'សួន វាសនា',
      full_name_en: 'Suon Veasna',
      roll_no: 'EMP-2002',
      role: 'manager',
      phone_number: '+855 11 222 333',
      profile_picture_url: 'https://picsum.photos/seed/veasna/200/200',
      rfid_nfc_uid: 'F4E3D2C1',
      qr_code_token: 'SECURE-COMPANY-VEASNA-TOKEN',
      telegram_chat_id: 'veasna_telegram_chat',
      salary_base_usd: 950.00,
      created_at: '2026-06-11T00:00:00Z'
    }
  ],
  checkins: [
    {
      id: 'chk-1001',
      tenant_id: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
      employee_id: 'e1a1a1a1-1111-1111-1111-111111111111',
      check_time: '2026-06-11T08:05:00Z',
      method: 'gps',
      latitude: 11.5563,
      longitude: 104.9281,
      status: 'present',
      verification_score: 100.0,
      created_at: '2026-06-11T08:05:00Z'
    },
    {
      id: 'chk-1002',
      tenant_id: 'b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e',
      employee_id: 'e2a2a2a2-2222-2222-2222-222222222222',
      check_time: '2026-06-11T08:45:00Z',
      method: 'face',
      latitude: 11.5621,
      longitude: 104.8885,
      status: 'late',
      verification_score: 95.5,
      photo_captured_url: 'https://picsum.photos/seed/dara/200/200',
      created_at: '2026-06-11T08:45:00Z'
    }
  ],
  payrolls: []
};

// Helper to check and load/save DB safely
export function getDB(): DBStorage {
  try {
    if (!fs.existsSync(DB_FILE_PATH)) {
      saveDB(defaultDB);
      return defaultDB;
    }
    const data = fs.readFileSync(DB_FILE_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading file-database:', error);
    return defaultDB;
  }
}

export function saveDB(db: DBStorage) {
  try {
    const dir = path.dirname(DB_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(db, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error writing file-database:', error);
  }
}

// Relational DB Logic helpers
export function getTenants(): Tenant[] {
  return getDB().tenants;
}

export function saveTenant(tenant: Tenant): Tenant {
  const db = getDB();
  const index = db.tenants.findIndex(t => t.id === tenant.id);
  if (index >= 0) {
    db.tenants[index] = tenant;
  } else {
    db.tenants.push(tenant);
  }
  saveDB(db);
  return tenant;
}

export function getEmployees(tenantId?: string): Employee[] {
  const db = getDB();
  if (tenantId) {
    return db.employees.filter(e => e.tenant_id === tenantId);
  }
  return db.employees;
}

export function saveEmployee(employee: Employee): Employee {
  const db = getDB();
  const index = db.employees.findIndex(e => e.id === employee.id);
  if (index >= 0) {
    db.employees[index] = employee;
  } else {
    db.employees.push(employee);
  }
  saveDB(db);
  return employee;
}

export function deleteEmployee(id: string): boolean {
  const db = getDB();
  const initialLength = db.employees.length;
  db.employees = db.employees.filter(e => e.id !== id);
  if (db.employees.length !== initialLength) {
    db.checkins = db.checkins.filter(c => c.employee_id !== id);
    db.payrolls = db.payrolls.filter(p => p.employee_id !== id);
    saveDB(db);
    return true;
  }
  return false;
}

export function getCheckins(tenantId?: string): CheckIn[] {
  const db = getDB();
  let list = db.checkins;
  if (tenantId) {
    list = list.filter(c => c.tenant_id === tenantId);
  }
  // Sort descending by time
  return list.sort((a, b) => new Date(b.check_time).getTime() - new Date(a.check_time).getTime());
}

export function addCheckIn(checkIn: Omit<CheckIn, 'id' | 'created_at'>): CheckIn {
  const db = getDB();
  const newInst: CheckIn = {
    ...checkIn,
    id: `chk-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    created_at: new Date().toISOString()
  };
  db.checkins.push(newInst);
  saveDB(db);

  // Recalculate payroll for this month dynamically
  const checkDate = new Date(newInst.check_time);
  const monthStr = `${checkDate.getFullYear()}-${String(checkDate.getMonth() + 1).padStart(2, '0')}`;
  recalculatePayroll(newInst.tenant_id, newInst.employee_id, monthStr);

  return newInst;
}

// Advanced HR payroll engine
export function recalculatePayroll(tenantId: string, employeeId: string, month: string): Payroll {
  const db = getDB();
  const employee = db.employees.find(e => e.id === employeeId);
  if (!employee) {
    throw new Error('Employee not found');
  }

  // Count check-ins in the specified month
  const monthCheckins = db.checkins.filter(c => {
    if (c.employee_id !== employeeId || c.tenant_id !== tenantId) return false;
    const checkDate = new Date(c.check_time);
    const mStr = `${checkDate.getFullYear()}-${String(checkDate.getMonth() + 1).padStart(2, '0')}`;
    return mStr === month;
  });

  const presentDays = monthCheckins.length;
  const lateDays = monthCheckins.filter(c => c.status === 'late').length;

  // Compute Salary logic
  // e.g., Base salary is the monthly wage (e.g., $450). Each present day yields (Base / 22 working days).
  // Each late day deducts $5.00
  const activeWorkingDays = 22;
  const baseSalary = employee.salary_base_usd || 250.00;
  
  // Basic earned salary proportional to present days
  let salaryEarned = parseFloat(((baseSalary / activeWorkingDays) * Math.min(presentDays, activeWorkingDays)).toFixed(2));
  if (presentDays > activeWorkingDays) {
    salaryEarned = baseSalary; // Cap or keep base
  }

  const bonus = presentDays === activeWorkingDays && lateDays === 0 ? 30.00 : 0.00; // Perfect attendance bonus
  const deductions = lateDays * 5.00; // $5 penalty per late
  const payout = parseFloat(Math.max(0, salaryEarned + bonus - deductions).toFixed(2));

  const payrollIndex = db.payrolls.findIndex(p => p.employee_id === employeeId && p.month === month);
  
  let payroll: Payroll;
  if (payrollIndex >= 0) {
    payroll = {
      ...db.payrolls[payrollIndex],
      present_days: presentDays,
      late_days: lateDays,
      salary_earned_usd: salaryEarned,
      bonus_usd: bonus,
      deductions_usd: deductions,
      payout_usd: payout,
    };
    db.payrolls[payrollIndex] = payroll;
  } else {
    payroll = {
      id: `pay-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      tenant_id: tenantId,
      employee_id: employeeId,
      month: month,
      present_days: presentDays,
      late_days: lateDays,
      salary_earned_usd: salaryEarned,
      bonus_usd: bonus,
      deductions_usd: deductions,
      payout_usd: payout,
      status: 'draft',
      created_at: new Date().toISOString()
    };
    db.payrolls.push(payroll);
  }

  saveDB(db);
  return payroll;
}

export function getPayrolls(tenantId: string, month: string): (Payroll & { employee: Employee })[] {
  const db = getDB();
  
  // Seed initial payrolls if database is empty or we have employees with checks
  db.employees.forEach(emp => {
    if (emp.tenant_id === tenantId) {
      const payrollExists = db.payrolls.some(p => p.employee_id === emp.id && p.month === month);
      if (!payrollExists) {
        recalculatePayroll(tenantId, emp.id, month);
      }
    }
  });

  // Reload current state
  const reloadedDb = getDB();
  return reloadedDb.payrolls
    .filter(p => p.tenant_id === tenantId && p.month === month)
    .map(p => {
      const emp = reloadedDb.employees.find(e => e.id === p.employee_id)!;
      return {
        ...p,
        employee: emp
      };
    });
}

export function updatePayrollStatus(payrollId: string, status: 'approved' | 'paid'): boolean {
  const db = getDB();
  const index = db.payrolls.findIndex(p => p.id === payrollId);
  if (index >= 0) {
    db.payrolls[index].status = status;
    db.payrolls[index].processed_at = new Date().toISOString();
    saveDB(db);
    return true;
  }
  return false;
}
