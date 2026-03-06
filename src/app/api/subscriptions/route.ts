import { NextRequest } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/api-response";

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user?.id) return errorResponse("未登录", 401);

    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category") || "all";

    const where = {
      userId: user.id,
      ...(category !== "all" && { category }),
    };

    const subscriptions = await prisma.subscriptionItem.findMany({
      where,
      orderBy: { publishedAt: "desc" },
    });

    return successResponse(subscriptions);
  } catch (error) {
    console.error("Get subscriptions error:", error);
    return errorResponse("获取订阅列表失败", 500);
  }
}
