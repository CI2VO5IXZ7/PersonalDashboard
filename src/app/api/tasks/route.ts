import { NextRequest } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/api-response";
import { tickTickService, mapTickTickTaskToDTO } from "@/server/ticktick-service";
import { taskCreateSchema } from "@/lib/validations";

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user?.id) return errorResponse("未登录", 401);

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || "all";

    const connection = await prisma.tickTickConnection.findUnique({
      where: { userId: user.id },
    });

    if (!connection?.accessToken) {
      return successResponse({ tasks: [], connected: false });
    }

    try {
      const projects = await tickTickService.getProjects(connection.accessToken);
      // TickTick Open API doesn't have a "list all tasks" endpoint directly
      // We return projects info for now; actual tasks are fetched per project
      return successResponse({
        tasks: [],
        projects,
        connected: true,
        message: "请通过具体项目获取任务",
        filter: status,
      });
    } catch (err) {
      console.error("TickTick fetch tasks error:", err);
      return successResponse({
        tasks: [],
        connected: true,
        error: "滴答清单 API 请求失败，请稍后重试",
      });
    }
  } catch (error) {
    console.error("Get tasks error:", error);
    return errorResponse("获取任务列表失败", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user?.id) return errorResponse("未登录", 401);

    const body = await req.json();
    const parsed = taskCreateSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse(parsed.error.issues[0].message, 400);
    }

    const connection = await prisma.tickTickConnection.findUnique({
      where: { userId: user.id },
    });

    if (!connection?.accessToken) {
      return errorResponse("滴答清单未连接，请先在设置中连接", 400);
    }

    try {
      const task = await tickTickService.createTask(connection.accessToken, {
        title: parsed.data.title,
        content: parsed.data.content,
        dueDate: parsed.data.dueDate,
        priority: parsed.data.priority,
        projectId: parsed.data.projectId,
      });

      return successResponse(mapTickTickTaskToDTO(task), "任务创建成功", 201);
    } catch (err) {
      console.error("TickTick create task error:", err);
      return errorResponse("创建任务失败，滴答清单 API 异常", 502);
    }
  } catch (error) {
    console.error("Create task error:", error);
    return errorResponse("创建任务失败", 500);
  }
}
