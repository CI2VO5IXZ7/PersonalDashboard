import { NextRequest } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { dockOrderSchema } from "@/lib/validations";
import { successResponse, errorResponse } from "@/lib/api-response";

export async function PATCH(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user?.id) return errorResponse("未登录", 401);

    const body = await req.json();
    const parsed = dockOrderSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse(parsed.error.issues[0].message, 400);
    }

    const updates = parsed.data.items.map((item) =>
      prisma.dockItem.updateMany({
        where: { id: item.id, userId: user.id },
        data: {
          sortOrder: item.sortOrder,
          ...(item.isVisible !== undefined && { isVisible: item.isVisible }),
        },
      })
    );

    await prisma.$transaction(updates);

    const dockItems = await prisma.dockItem.findMany({
      where: { userId: user.id },
      orderBy: { sortOrder: "asc" },
    });

    return successResponse(dockItems);
  } catch (error) {
    console.error("Update dock order error:", error);
    return errorResponse("更新Dock排序失败", 500);
  }
}
