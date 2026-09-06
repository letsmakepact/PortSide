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
    const profile = await getProfile(user);
    const services = await listLanServices();

    if (!isSupporter) {
      profile.website = "";
      profile.handle = (user?.name || user?.email?.split("@")[0] || "").toLowerCase().replace(/[^a-z0-9-]/g, "");
      profile.verifiedBadgeText = "Developer";
    } else {
      profile.verifiedBadgeText = "Verified Supporter";
    }

    return NextResponse.json({ profile, services, isSupporter });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    const body = await req.json().catch(() => ({}));
    const updated = await saveProfile(body, user);
    return NextResponse.json({ ok: true, profile: updated });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
