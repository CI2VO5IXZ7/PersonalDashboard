import { NextRequest } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { successResponse, errorResponse } from "@/lib/api-response";
import { tickTickService } from "@/server/ticktick-service";

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user?.id) return errorResponse("未登录", 401);

    const clientId = process.env.TICKTICK_CLIENT_ID;
    const redirectUri = process.env.TICKTICK_REDIRECT_URI || `${process.env.NEXTAUTH_URL}/api/integrations/ticktick/callback`;

    if (!clientId) {
      return errorResponse("TickTick Client ID 未配置", 500);
    }

    const state = Buffer.from(JSON.stringify({ userId: user.id })).toString("base64");
    const authUrl = tickTickService.getAuthUrl(clientId, redirectUri, state);

    return successResponse({ authUrl });
  } catch (error) {
    console.error("TickTick connect error:", error);
    return errorResponse("连接滴答清单失败", 500);
  }
}
