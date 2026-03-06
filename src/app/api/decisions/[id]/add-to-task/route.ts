import { NextRequest } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/api-response";
import { tickTickService } from "@/server/ticktick-service";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser();
    if (!user?.id) return errorResponse("未登录", 401);

    const { id } = await params;
    const decision = await prisma.decisionItem.findFirst({
      where: { id, userId: user.id },
    });
    if (!decision) return errorResponse("决策事项不存在", 404);

    // Try to create task in TickTick
    let tickTickTask = null;
    const connection = await prisma.tickTickConnection.findUnique({
      where: { userId: user.id },
    });

    if (connection?.accessToken) {
      try {
        tickTickTask = await tickTickService.createTask(connection.accessToken, {
          title: decision.title,
          content: decision.summary || "",
          priority: decision.priority === "urgent" ? 5 : decision.priority === "important" ? 3 : 1,
        });
      } catch (err) {
        console.error("TickTick create task error:", err);
        // Continue even if TickTick fails
      }
    }

    // Update decision status to converted
    await prisma.decisionItem.update({
      where: { id },
      data: { status: "converted" },
    });

    return successResponse({
      converted: true,
      tickTickTask,
      message: tickTickTask
        ? "已加入待办并同步到滴答清单"
        : "已加入待办（滴答清单未连接）",
    });
  } catch (error) {
    console.error("Add to task error:", error);
    return errorResponse("加入待办失败", 500);
  }
}
