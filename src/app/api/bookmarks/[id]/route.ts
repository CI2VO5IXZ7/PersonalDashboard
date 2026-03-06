import { NextRequest } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { bookmarkUpdateSchema } from "@/lib/validations";
import { successResponse, errorResponse } from "@/lib/api-response";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser();
    if (!user?.id) return errorResponse("未登录", 401);

    const { id } = await params;
    const bookmark = await prisma.bookmark.findFirst({
      where: { id, userId: user.id },
    });

    if (!bookmark) return errorResponse("书签不存在", 404);
    return successResponse(bookmark);
  } catch (error) {
    console.error("Get bookmark error:", error);
    return errorResponse("获取书签失败", 500);
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
    const parsed = bookmarkUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse(parsed.error.issues[0].message, 400);
    }

    const existing = await prisma.bookmark.findFirst({
      where: { id, userId: user.id },
    });
    if (!existing) return errorResponse("书签不存在", 404);

    const bookmark = await prisma.bookmark.update({
      where: { id },
      data: parsed.data,
    });

    // If pinning to dock, create a dock item
    if (parsed.data.isPinnedToDock === true && !existing.isPinnedToDock) {
      const maxOrder = await prisma.dockItem.findFirst({
        where: { userId: user.id },
        orderBy: { sortOrder: "desc" },
        select: { sortOrder: true },
      });

      await prisma.dockItem.create({
        data: {
          userId: user.id,
          type: "bookmark",
          title: bookmark.title,
          iconType: bookmark.iconType,
          iconValue: bookmark.iconValue,
          targetUrl: bookmark.url,
          openMode: bookmark.openMode,
          sortOrder: (maxOrder?.sortOrder ?? -1) + 1,
        },
      });
    }

    // If unpinning from dock, remove the dock item
    if (parsed.data.isPinnedToDock === false && existing.isPinnedToDock) {
      await prisma.dockItem.deleteMany({
        where: {
          userId: user.id,
          type: "bookmark",
          targetUrl: existing.url,
        },
      });
    }

    return successResponse(bookmark);
  } catch (error) {
    console.error("Update bookmark error:", error);
    return errorResponse("更新书签失败", 500);
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
    const existing = await prisma.bookmark.findFirst({
      where: { id, userId: user.id },
    });
    if (!existing) return errorResponse("书签不存在", 404);

    // Remove dock item if pinned
    if (existing.isPinnedToDock) {
      await prisma.dockItem.deleteMany({
        where: {
          userId: user.id,
          type: "bookmark",
          targetUrl: existing.url,
        },
      });
    }

    await prisma.bookmark.delete({ where: { id } });

    return successResponse(null, "书签已删除");
  } catch (error) {
    console.error("Delete bookmark error:", error);
    return errorResponse("删除书签失败", 500);
  }
}
