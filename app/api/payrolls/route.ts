import { NextRequest, NextResponse } from "next/server";
import { getPayrolls, updatePayrollStatus } from "@/lib/db";

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const tenantId = searchParams.get("tenantId");
    const month = searchParams.get("month") || new Date().toISOString().substring(0, 7); // Default YYYY-MM

    if (!tenantId) {
      return NextResponse.json({ error: "tenantId parameter is required" }, { status: 400 });
    }

    const payrolls = getPayrolls(tenantId, month);
    return NextResponse.json({ payrolls, month });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { payrollId, status } = data; // status is 'approved' or 'paid'

    if (!payrollId || !status) {
      return NextResponse.json({ error: "poyrollId and status parameters are required" }, { status: 400 });
    }

    if (status !== 'approved' && status !== 'paid') {
      return NextResponse.json({ error: "Status must be either 'approved' or 'paid'" }, { status: 400 });
    }

    const success = updatePayrollStatus(payrollId, status);
    if (success) {
      return NextResponse.json({ success: true, message: `Payroll status updated to ${status}` });
    } else {
      return NextResponse.json({ error: "Payroll record not found" }, { status: 404 });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
