import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { tickTickService } from "@/server/ticktick-service";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");
    const state = searchParams.get("state");

    if (!code || !state) {
      return NextResponse.redirect(new URL("/settings?error=missing_params", req.url));
    }

    const { userId } = JSON.parse(Buffer.from(state, "base64").toString());

    const clientId = process.env.TICKTICK_CLIENT_ID!;
    const clientSecret = process.env.TICKTICK_CLIENT_SECRET!;
    const redirectUri = process.env.TICKTICK_REDIRECT_URI || `${process.env.NEXTAUTH_URL}/api/integrations/ticktick/callback`;

    const tokenData = await tickTickService.exchangeToken(
      code,
      clientId,
      clientSecret,
      redirectUri
    );

    await prisma.tickTickConnection.upsert({
      where: { userId },
      update: {
        accessToken: tokenData.access_token,
        status: "active",
        lastSyncAt: new Date(),
      },
      create: {
        userId,
        accessToken: tokenData.access_token,
        status: "active",
        lastSyncAt: new Date(),
      },
    });

    return NextResponse.redirect(new URL("/settings?ticktick=connected", req.url));
  } catch (error) {
    console.error("TickTick callback error:", error);
    return NextResponse.redirect(new URL("/settings?error=ticktick_auth_failed", req.url));
  }
}
