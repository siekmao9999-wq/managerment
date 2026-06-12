import { NextRequest, NextResponse } from "next/server";
import { getTenants, saveTenant, Tenant } from "@/lib/db";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const tenants = getTenants();
    return NextResponse.json({ tenants });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    if (!data.name_kh || !data.name_en) {
      return NextResponse.json({ error: "Khmer and English names are mandatory" }, { status: 400 });
    }

    const newTenant: Tenant = {
      id: data.id || `ten-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name_kh: data.name_kh,
      name_en: data.name_en,
      type: data.type || 'company',
      logo_url: data.logo_url || `https://picsum.photos/seed/${data.name_en.replace(/\s+/g, '')}/100/100`,
      geofence_lat: parseFloat(data.geofence_lat) || 11.5564,
      geofence_lng: parseFloat(data.geofence_lng) || 104.9282,
      geofence_radius_meters: parseFloat(data.geofence_radius_meters) || 150.0,
      telegram_bot_token: data.telegram_bot_token || '',
      created_at: new Date().toISOString()
    };

    saveTenant(newTenant);
    return NextResponse.json({ success: true, tenant: newTenant });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
