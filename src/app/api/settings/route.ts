import { NextRequest } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { settingsUpdateSchema } from "@/lib/validations";
import { successResponse, errorResponse } from "@/lib/api-response";

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user?.id) return errorResponse("未登录", 401);

    let setting = await prisma.userSetting.findUnique({
      where: { userId: user.id },
    });

    if (!setting) {
      setting = await prisma.userSetting.create({
        data: { userId: user.id },
      });
    }

    return successResponse(setting);
  } catch (error) {
    console.error("Get settings error:", error);
    return errorResponse("获取设置失败", 500);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user?.id) return errorResponse("未登录", 401);

    const body = await req.json();
    const parsed = settingsUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse(parsed.error.issues[0].message, 400);
    }

    const setting = await prisma.userSetting.upsert({
      where: { userId: user.id },
      update: parsed.data,
      create: { userId: user.id, ...parsed.data },
    });

    return successResponse(setting);
  } catch (error) {
    console.error("Update settings error:", error);
    return errorResponse("更新设置失败", 500);
  }
}
