import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validations";
import { successResponse, errorResponse } from "@/lib/api-response";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse(parsed.error.issues[0].message, 400);
    }

    const { name, email, password } = parsed.data;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return errorResponse("该邮箱已被注册", 409);
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        setting: {
          create: {},
        },
        dockItems: {
          createMany: {
            data: [
              { type: "module", title: "邮件&订阅", iconType: "lucide", iconValue: "mail", targetPath: "/mail", sortOrder: 0 },
              { type: "module", title: "信息决策", iconType: "lucide", iconValue: "brain", targetPath: "/decisions", sortOrder: 1 },
              { type: "module", title: "日历&待办", iconType: "lucide", iconValue: "calendar", targetPath: "/calendar", sortOrder: 2 },
              { type: "module", title: "设置", iconType: "lucide", iconValue: "settings", targetPath: "/settings", sortOrder: 3 },
            ],
          },
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    });

    return successResponse(user, "注册成功", 201);
  } catch (error) {
    console.error("Register error:", error);
    return errorResponse("注册失败，请稍后重试", 500);
  }
}
