import { NextRequest } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/api-response";
import { tickTickService } from "@/server/ticktick-service";
import { taskUpdateSchema } from "@/lib/validations";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser();
    if (!user?.id) return errorResponse("未登录", 401);

    const { id } = await params;
    const body = await req.json();
    const parsed = taskUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse(parsed.error.issues[0].message, 400);
    }

    const connection = await prisma.tickTickConnection.findUnique({
      where: { userId: user.id },
    });
    if (!connection?.accessToken) {
      return errorResponse("滴答清单未连接", 400);
    }

    try {
      const task = await tickTickService.updateTask(
        connection.accessToken,
        id,
        parsed.data
      );
      return successResponse(task);
    } catch (err) {
      console.error("TickTick update task error:", err);
      return errorResponse("更新任务失败，滴答清单 API 异常", 502);
    }
  } catch (error) {
    console.error("Update task error:", error);
    return errorResponse("更新任务失败", 500);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser();
    if (!user?.id) return errorResponse("未登录", 401);

    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId") || "";

    const connection = await prisma.tickTickConnection.findUnique({
      where: { userId: user.id },
    });
    if (!connection?.accessToken) {
      return errorResponse("滴答清单未连接", 400);
    }

    try {
      await tickTickService.deleteTask(connection.accessToken, projectId, id);
      return successResponse(null, "任务已删除");
    } catch (err) {
      console.error("TickTick delete task error:", err);
      return errorResponse("删除任务失败，滴答清单 API 异常", 502);
    }
  } catch (error) {
    console.error("Delete task error:", error);
    return errorResponse("删除任务失败", 500);
  }
}
