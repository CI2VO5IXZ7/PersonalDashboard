import { NextRequest } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { dockItemUpdateSchema } from "@/lib/validations";
import { successResponse, errorResponse } from "@/lib/api-response";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser();
    if (!user?.id) return errorResponse("未登录", 401);

    const { id } = await params;
    const body = await req.json();
    const parsed = dockItemUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse(parsed.error.issues[0].message, 400);
    }

    const existing = await prisma.dockItem.findFirst({
      where: { id, userId: user.id },
    });
    if (!existing) return errorResponse("Dock项不存在", 404);

    const item = await prisma.dockItem.update({
      where: { id },
      data: parsed.data,
    });

    return successResponse(item);
  } catch (error) {
    console.error("Update dock item error:", error);
    return errorResponse("更新Dock项失败", 500);
  }
}
