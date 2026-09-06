import { NextResponse } from "next/server";
import { getProfile, saveProfile } from "@/lib/profile";
import { getCurrentUser } from "@/lib/auth";
import { isServerSupporter } from "@/lib/server-checks";
import { listLanServices } from "@/lib/queries";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getCurrentUser();
    const isSupporter = await isServerSupporter(user);
    const profile = await getProfile();
    const services = await listLanServices();

    if (!isSupporter) {
      profile.website = "";
      profile.handle = (user?.name || user?.email?.split("@")[0] || "").toLowerCase().replace(/[^a-z0-9-]/g, "");
      if (profile.verifiedBadgeText === "PortSide Verified Supporter") {
        profile.verifiedBadgeText = "PortSide Developer";
      }
    }

    return NextResponse.json({ profile, services, isSupporter });
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
