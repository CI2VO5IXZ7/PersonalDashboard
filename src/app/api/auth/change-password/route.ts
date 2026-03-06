import { NextRequest } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/api-response";
import bcrypt from "bcryptjs";
import { z } from "zod";

const schema = z.object({
  currentPassword: z.string().min(1, "请输入当前密码"),
  newPassword: z.string().min(6, "新密码至少6个字符"),
});

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user?.id) return errorResponse("未登录", 401);

    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return errorResponse(parsed.error.issues[0].message, 400);
    }

    const { currentPassword, newPassword } = parsed.data;

    const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
    if (!dbUser) return errorResponse("用户不存在", 404);

    const isValid = await bcrypt.compare(currentPassword, dbUser.passwordHash);
    if (!isValid) return errorResponse("当前密码错误", 400);

    const newHash = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: newHash },
    });

    return successResponse(null, "密码修改成功");
  } catch (error) {
    console.error("Change password error:", error);
    return errorResponse("修改密码失败", 500);
  }
}
