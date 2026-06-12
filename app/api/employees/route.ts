import { NextRequest, NextResponse } from "next/server";
import { getEmployees, saveEmployee, deleteEmployee, Employee } from "@/lib/db";

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const tenantId = searchParams.get("tenantId") || undefined;
    const employees = getEmployees(tenantId);
    return NextResponse.json({ employees });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    if (!data.tenant_id || !data.full_name_kh || !data.full_name_en || !data.roll_no) {
      return NextResponse.json({ error: "Required fields are missing: tenant_id, full_name_kh, full_name_en, roll_no" }, { status: 400 });
    }

    const newEmp: Employee = {
      id: data.id || `emp-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      tenant_id: data.tenant_id,
      full_name_kh: data.full_name_kh,
      full_name_en: data.full_name_en,
      roll_no: data.roll_no,
      role: data.role || 'employee',
      phone_number: data.phone_number || '',
      profile_picture_url: data.profile_picture_url || `https://picsum.photos/seed/${data.roll_no}/200/200`,
      rfid_nfc_uid: data.rfid_nfc_uid || `NFC-${Math.random().toString(16).substr(2, 8).toUpperCase()}`,
      qr_code_token: data.qr_code_token || `SECURE-TOKEN-${data.roll_no}-${Math.floor(Math.random() * 1000)}`,
      telegram_chat_id: data.telegram_chat_id || '',
      salary_base_usd: parseFloat(data.salary_base_usd) || 280.00,
      created_at: new Date().toISOString()
    };

    saveEmployee(newEmp);
    return NextResponse.json({ success: true, employee: newEmp });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Employee parameter 'id' is required" }, { status: 400 });
    }

    const success = deleteEmployee(id);
    if (success) {
      return NextResponse.json({ success: true, message: "Employee removed successfully" });
    } else {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
