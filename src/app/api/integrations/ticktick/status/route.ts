import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/api-response";

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user?.id) return errorResponse("未登录", 401);

    const connection = await prisma.tickTickConnection.findUnique({
      where: { userId: user.id },
      select: {
        id: true,
        accountName: true,
        status: true,
        lastSyncAt: true,
      },
    });

    return successResponse({
      connected: !!connection,
      connection,
    });
  } catch (error) {
    console.error("TickTick status error:", error);
    return errorResponse("获取滴答清单状态失败", 500);
  }
}
