import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/api-response";

export async function GET() {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser?.id) {
      return errorResponse("未登录", 401);
    }

    const user = await prisma.user.findUnique({
      where: { id: sessionUser.id },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        timezone: true,
        locale: true,
        createdAt: true,
      },
    });

    if (!user) {
      return errorResponse("用户不存在", 404);
    }

    return successResponse(user);
  } catch (error) {
    console.error("Get me error:", error);
    return errorResponse("获取用户信息失败", 500);
  }
}
