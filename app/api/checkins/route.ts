import { NextRequest, NextResponse } from "next/server";
import { getCheckins, addCheckIn, getEmployees, getTenants, CheckIn } from "@/lib/db";

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const tenantId = searchParams.get("tenantId") || undefined;
    const checkins = getCheckins(tenantId);
    return NextResponse.json({ checkins });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { tenant_id, employee_id, method, latitude, longitude, status, verification_score, photo_captured_url } = data;

    if (!tenant_id || !employee_id || !method) {
      return NextResponse.json({ error: "Required fields: tenant_id, employee_id, method" }, { status: 400 });
    }

    // Verify employee and tenant
    const tenants = getTenants();
    const tenant = tenants.find(t => t.id === tenant_id);
    const employees = getEmployees(tenant_id);
    const employee = employees.find(e => e.id === employee_id);

    if (!tenant || !employee) {
      return NextResponse.json({ error: "Institution or Employee record not found" }, { status: 400 });
    }

    // Construct checkin log
    const checkInRecord: Omit<CheckIn, 'id' | 'created_at'> = {
      tenant_id,
      employee_id,
      check_time: new Date().toISOString(),
      method,
      latitude: latitude ? parseFloat(latitude) : tenant.geofence_lat,
      longitude: longitude ? parseFloat(longitude) : tenant.geofence_lng,
      status: status || 'present',
      verification_score: verification_score ? parseFloat(verification_score) : 100.0,
      photo_captured_url: photo_captured_url || undefined
    };

    const savedCheckIn = addCheckIn(checkInRecord);

    // TELEGRAM Telegram Bot notification integrations!
    // If the tenant has a custom token, we send a real Telegram request.
    const botToken = tenant.telegram_bot_token || process.env.TELEGRAM_BOT_TOKEN;
    const chatId = employee.telegram_chat_id || process.env.TELEGRAM_CHAT_ID;

    let telegramSent = false;
    let telegramError = "";
    
    // We construct a gorgeous, rich Telegram status alert message
    const methodStatusLabel = {
      gps: '📍 GPS Geofence (ទីតាំងផែនទី)',
      face: '🤖 AI Facial Match (ស្កេនផ្ទៃមុខ)',
      qr: '📱 QR Digital ID (ស្កេនកូដ QR)',
      nfc: '💳 RFID / NFC Smart Card (កាតឆ្លាតវៃ)'
    }[method as 'gps' | 'face' | 'qr' | 'nfc'] || method;

    const statusEmoji = status === 'present' ? '✅ ទៀងទាត់ (On Time)' : '⚠️ យឺតយ៉ាវ (Late)';
    const textMsg = `🔔 *សេចក្តីជូនដំណឹងវត្តមាន - SecureAttend*
---------------------------------------
👤 *ឈ្មោះបុគ្គលិក:* ${employee.full_name_kh} (${employee.full_name_en})
🆔 *អត្តលេខ:* ${employee.roll_no}
🏢 *ស្ថាប័ន:* ${tenant.name_kh}
🛠️ *វិធីសាស្ត្រ:* ${methodStatusLabel}
⏱️ *ម៉ោងកត់ត្រា:* ${new Date(savedCheckIn.check_time).toLocaleTimeString('kh-KH', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
📍 *ស្ថានភាព:* ${statusEmoji}
🧬 *AI Match Score:* ${savedCheckIn.verification_score}%

_ប្រព័ន្ធរៀបចំដោយ SecureAttend_ 🇰🇭`;

    if (botToken && chatId && !botToken.includes('Demo') && !chatId.includes('_chat')) {
      try {
        const teleUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
        const res = await fetch(teleUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text: textMsg,
            parse_mode: 'Markdown'
          })
        });
        telegramSent = res.ok;
        if (!res.ok) {
          const errRes = await res.json();
          telegramError = JSON.stringify(errRes);
        }
      } catch (err: any) {
        console.error("Failed to send real Telegram API message:", err);
        telegramError = err.message;
      }
    }

    return NextResponse.json({
      success: true,
      checkIn: savedCheckIn,
      telegramNotification: {
        dispatched: true,
        method: botToken && chatId ? 'real_api' : 'simulated',
        success: telegramSent || !botToken,
        message: textMsg,
        error: telegramError
      }
    });
  } catch (error: any) {
    console.error("Error creating check-in record:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
