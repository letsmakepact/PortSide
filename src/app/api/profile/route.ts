import { NextResponse } from "next/server";
import { getProfile, saveProfile } from "@/lib/profile";
import { getCurrentUser } from "@/lib/auth";
import { listLanServices } from "@/lib/queries";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const profile = await getProfile();
    const services = await listLanServices();
    return NextResponse.json({ profile, services });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    // Allow local dashboard updates or authenticated users
    const body = await req.json().catch(() => ({}));
    const updated = await saveProfile(body);
    return NextResponse.json({ ok: true, profile: updated });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
