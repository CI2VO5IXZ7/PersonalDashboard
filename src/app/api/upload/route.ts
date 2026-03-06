import { NextRequest } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { successResponse, errorResponse } from "@/lib/api-response";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user?.id) return errorResponse("未登录", 401);

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) return errorResponse("请选择文件", 400);

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      return errorResponse("仅支持 JPG/PNG/WebP/GIF 格式", 400);
    }

    if (file.size > 10 * 1024 * 1024) {
      return errorResponse("文件大小不能超过 10MB", 400);
    }

    const ext = file.name.split(".").pop() || "jpg";
    const filename = `${user.id}_${Date.now()}.${ext}`;
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });

    const bytes = await file.arrayBuffer();
    await writeFile(path.join(uploadDir, filename), Buffer.from(bytes));

    const url = `/uploads/${filename}`;
    return successResponse({ url }, "上传成功");
  } catch (error) {
    console.error("Upload error:", error);
    return errorResponse("上传失败", 500);
  }
}
