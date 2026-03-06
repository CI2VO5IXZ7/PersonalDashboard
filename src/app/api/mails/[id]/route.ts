import { NextRequest } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { mailUpdateSchema } from "@/lib/validations";
import { successResponse, errorResponse } from "@/lib/api-response";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser();
    if (!user?.id) return errorResponse("未登录", 401);

    const { id } = await params;
    const mail = await prisma.mailItem.findFirst({
      where: { id, userId: user.id },
    });

    if (!mail) return errorResponse("邮件不存在", 404);

    return successResponse(mail);
  } catch (error) {
    console.error("Get mail error:", error);
    return errorResponse("获取邮件详情失败", 500);
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
    const parsed = mailUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse(parsed.error.issues[0].message, 400);
    }

    const existing = await prisma.mailItem.findFirst({
      where: { id, userId: user.id },
    });
    if (!existing) return errorResponse("邮件不存在", 404);

    const mail = await prisma.mailItem.update({
      where: { id },
      data: parsed.data,
    });

    return successResponse(mail);
  } catch (error) {
    console.error("Update mail error:", error);
    return errorResponse("更新邮件失败", 500);
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
    const existing = await prisma.mailItem.findFirst({
      where: { id, userId: user.id },
    });
    if (!existing) return errorResponse("邮件不存在", 404);

    await prisma.mailItem.update({
      where: { id },
      data: { isDeleted: true },
    });

    return successResponse(null, "邮件已删除");
  } catch (error) {
    console.error("Delete mail error:", error);
    return errorResponse("删除邮件失败", 500);
  }
}
