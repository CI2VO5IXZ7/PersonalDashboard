import { NextRequest } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/api-response";

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user?.id) return errorResponse("未登录", 401);

    const { searchParams } = new URL(req.url);
    const folder = searchParams.get("folder") || "inbox";
    const search = searchParams.get("search") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const where = {
      userId: user.id,
      isDeleted: false,
      ...(folder !== "all" && { folder: folder as "inbox" | "sent" | "draft" | "spam" | "archived" }),
      ...(search && {
        OR: [
          { subject: { contains: search, mode: "insensitive" as const } },
          { senderName: { contains: search, mode: "insensitive" as const } },
          { content: { contains: search, mode: "insensitive" as const } },
        ],
      }),
    };

    const [mails, total] = await Promise.all([
      prisma.mailItem.findMany({
        where,
        orderBy: { receivedAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.mailItem.count({ where }),
    ]);

    const unreadCount = await prisma.mailItem.count({
      where: { userId: user.id, folder: "inbox", isRead: false, isDeleted: false },
    });

    return successResponse({ mails, total, unreadCount, page, limit });
  } catch (error) {
    console.error("Get mails error:", error);
    return errorResponse("获取邮件列表失败", 500);
  }
}
