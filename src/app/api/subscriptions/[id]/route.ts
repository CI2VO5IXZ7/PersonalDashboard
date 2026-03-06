import { NextRequest } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { subscriptionUpdateSchema } from "@/lib/validations";
import { successResponse, errorResponse } from "@/lib/api-response";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser();
    if (!user?.id) return errorResponse("未登录", 401);

    const { id } = await params;
    const item = await prisma.subscriptionItem.findFirst({
      where: { id, userId: user.id },
    });

    if (!item) return errorResponse("订阅内容不存在", 404);
    return successResponse(item);
  } catch (error) {
    console.error("Get subscription error:", error);
    return errorResponse("获取订阅详情失败", 500);
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser();
    if (!user?.id) return errorResponse("未登录", 401);

    const { id } = await params;
    const body = await req.json();
    const parsed = subscriptionUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse(parsed.error.issues[0].message, 400);
    }

    const existing = await prisma.subscriptionItem.findFirst({
      where: { id, userId: user.id },
    });
    if (!existing) return errorResponse("订阅内容不存在", 404);

    const item = await prisma.subscriptionItem.update({
      where: { id },
      data: parsed.data,
    });

    return successResponse(item);
  } catch (error) {
    console.error("Update subscription error:", error);
    return errorResponse("更新订阅内容失败", 500);
  }
}
