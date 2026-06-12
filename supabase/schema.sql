-- SecureAttend - PostgreSQL Relational Database Schema
-- Multi-Tenant Employee Attendance & HR/Payroll System

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. INSTITUTIONS / TENANTS TABLE
CREATE TABLE IF NOT EXISTS tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name_kh VARCHAR(255) NOT NULL,
    name_en VARCHAR(255) NOT NULL,
    type VARCHAR(50) DEFAULT 'company' CHECK (type IN ('school', 'company')),
    logo_url TEXT,
    geofence_lat DOUBLE PRECISION NOT NULL DEFAULT 11.5564, -- Default central Phnom Penh
    geofence_lng DOUBLE PRECISION NOT NULL DEFAULT 104.9282,
    geofence_radius_meters DOUBLE PRECISION NOT NULL DEFAULT 100.0, -- Default 100 meters geofence
    telegram_bot_token VARCHAR(255), -- Tenant specific alerts
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. EMPLOYEES / STUDENTS / TEACHERS TABLE
CREATE TABLE IF NOT EXISTS employees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    full_name_kh VARCHAR(255) NOT NULL,
    full_name_en VARCHAR(255) NOT NULL,
    roll_no VARCHAR(100) NOT NULL, -- e.g., EMP-1002, STD-4001
    role VARCHAR(50) DEFAULT 'employee' CHECK (role IN ('admin', 'employee', 'student', 'teacher', 'manager')),
    phone_number VARCHAR(50),
    profile_picture_url TEXT, -- Base64 or cloud URL used as reference image for AI facial matching
    rfid_nfc_uid VARCHAR(100) UNIQUE, -- NFC chip card unique hex UID
    qr_code_token VARCHAR(255), -- Secure QR checker token
    telegram_chat_id VARCHAR(100), -- Connected Telegram channel/personal ID for live notifications
    salary_base CURRENT_DATE, -- Standard daily/monthly base wage in USD
    salary_base_usd NUMERIC(10, 2) DEFAULT 250.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_id, roll_no)
);

-- 3. ATTENDANCE CHECK-INS TABLE
CREATE TABLE IF NOT EXISTS checkins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    check_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    method VARCHAR(50) NOT NULL CHECK (method IN ('gps', 'face', 'qr', 'nfc')),
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    status VARCHAR(50) DEFAULT 'present' CHECK (status IN ('present', 'late', 'excused', 'absent')),
    verification_score NUMERIC(5, 2), -- Confident similarity score from facial matching AI
    photo_captured_url TEXT, -- Selfie base64 captured from front camera for record auditing
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. MONTHLY HR PAYROLL RECORDS
CREATE TABLE IF NOT EXISTS payrolls (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    month VARCHAR(7) NOT NULL, -- Format: YYYY-MM (e.g. 2026-06)
    present_days INT DEFAULT 0,
    late_days INT DEFAULT 0,
    salary_earned_usd NUMERIC(10, 2) DEFAULT 0.00,
    bonus_usd NUMERIC(10, 2) DEFAULT 0.00,
    deductions_usd NUMERIC(10, 2) DEFAULT 0.00,
    payout_usd NUMERIC(10, 2) DEFAULT 0.00,
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'approved', 'paid')),
    processed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(employee_id, month)
);

-- Insert dummy high-quality institutions (Tenants) in Khmer
INSERT INTO tenants (id, name_kh, name_en, type, geofence_lat, geofence_lng, geofence_radius_meters)
VALUES 
  ('a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'សាលាអន្តរជាតិ ស៊ីឃ្យួរ', 'Secure International School', 'school', 11.5564, 104.9282, 120.0),
  ('b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e', 'ក្រុមហ៊ុន បច្ចេកវិទ្យា ភ្នំពេញ', 'Phnom Penh Technology Co., Ltd.', 'company', 11.5621, 104.8885, 100.0)
ON CONFLICT (id) DO NOTHING;

-- Insert premium seed employees (one for School, one for Company)
INSERT INTO employees (id, tenant_id, full_name_kh, full_name_en, roll_no, role, phone_number, profile_picture_url, rfid_nfc_uid, qr_code_token, salary_base_usd, telegram_chat_id)
VALUES 
  ('e1a1a1a1-1111-1111-1111-111111111111', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'សុខ ម៉េងលី', 'Sokh Mengly', 'EMP-1001', 'teacher', '+855 12 345 678', 'https://picsum.photos/seed/mengly/200/200', 'E4D3C2B1', 'SECURE-TEACHER-MENGLY-TOKEN', 450.00, 'mengly_telegram'),
  ('e2a2a2a2-2222-2222-2222-222222222222', 'b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e', 'លី ដារ៉ា', 'Ly Dara', 'EMP-2001', 'employee', '+855 99 777 888', 'https://picsum.photos/seed/dara/200/200', 'D1C2b3A4', 'SECURE-COMPANY-DARA-TOKEN', 650.00, 'dara_telegram')
ON CONFLICT (id) DO NOTHING;
