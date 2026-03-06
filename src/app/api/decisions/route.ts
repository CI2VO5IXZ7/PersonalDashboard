import { NextRequest } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/api-response";

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user?.id) return errorResponse("未登录", 401);

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || "all";

    const where = {
      userId: user.id,
      ...(status !== "all" && { status: status as "pending" | "converted" | "dismissed" }),
    };

    const decisions = await prisma.decisionItem.findMany({
      where,
      orderBy: [{ priority: "asc" }, { createdAt: "desc" }],
    });

    return successResponse(decisions);
  } catch (error) {
    console.error("Get decisions error:", error);
    return errorResponse("获取决策列表失败", 500);
  }
}
