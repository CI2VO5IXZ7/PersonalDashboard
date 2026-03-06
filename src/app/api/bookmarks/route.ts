import { NextRequest } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { bookmarkCreateSchema } from "@/lib/validations";
import { successResponse, errorResponse } from "@/lib/api-response";

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user?.id) return errorResponse("未登录", 401);

    const bookmarks = await prisma.bookmark.findMany({
      where: { userId: user.id },
      orderBy: { sortOrder: "asc" },
    });

    return successResponse(bookmarks);
  } catch (error) {
    console.error("Get bookmarks error:", error);
    return errorResponse("获取书签列表失败", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user?.id) return errorResponse("未登录", 401);

    const body = await req.json();
    const parsed = bookmarkCreateSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse(parsed.error.issues[0].message, 400);
    }

    const maxOrder = await prisma.bookmark.findFirst({
      where: { userId: user.id },
      orderBy: { sortOrder: "desc" },
      select: { sortOrder: true },
    });

    const bookmark = await prisma.bookmark.create({
      data: {
        userId: user.id,
        ...parsed.data,
        sortOrder: (maxOrder?.sortOrder ?? -1) + 1,
      },
    });

    return successResponse(bookmark, "书签创建成功", 201);
  } catch (error) {
    console.error("Create bookmark error:", error);
    return errorResponse("创建书签失败", 500);
  }
}
