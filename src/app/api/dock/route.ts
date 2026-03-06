import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/api-response";

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user?.id) return errorResponse("未登录", 401);

    const dockItems = await prisma.dockItem.findMany({
      where: { userId: user.id },
      orderBy: { sortOrder: "asc" },
    });

    return successResponse(dockItems);
  } catch (error) {
    console.error("Get dock error:", error);
    return errorResponse("获取Dock栏失败", 500);
  }
}
