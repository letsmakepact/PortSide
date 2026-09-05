import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { ne, desc } from "drizzle-orm";
import { DEMO_EMAIL } from "@/lib/seed";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const list = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        tier: users.tier,
      })
      .from(users)
      .where(ne(users.email, DEMO_EMAIL))
      .orderBy(desc(users.id))
      .limit(1);

    if (list.length > 0) {
      const user = list[0];
      return NextResponse.json({
        detected: true,
        user: {
          email: user.email,
          name: user.name,
          tier: user.tier,
        },
      });
    }

    return NextResponse.json({ detected: false });
  } catch (error) {
    return NextResponse.json({ detected: false, error: String(error) });
  }
}
