import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2, "名称至少2个字符"),
  email: z.string().email("请输入有效的邮箱地址"),
  password: z.string().min(6, "密码至少6个字符"),
});

export const loginSchema = z.object({
  email: z.string().email("请输入有效的邮箱地址"),
  password: z.string().min(1, "请输入密码"),
});

export const mailUpdateSchema = z.object({
  isRead: z.boolean().optional(),
  isArchived: z.boolean().optional(),
  isStarred: z.boolean().optional(),
  isDeleted: z.boolean().optional(),
  folder: z.enum(["inbox", "sent", "draft", "spam", "archived"]).optional(),
});

export const subscriptionUpdateSchema = z.object({
  isRead: z.boolean().optional(),
});

export const decisionUpdateSchema = z.object({
  status: z.enum(["pending", "converted", "dismissed"]).optional(),
  priority: z.enum(["urgent", "important", "normal"]).optional(),
});

export const settingsUpdateSchema = z.object({
  theme: z.enum(["light", "dark", "system"]).optional(),
  locale: z.string().optional(),
  timezone: z.string().optional(),
  emailNotifications: z.boolean().optional(),
  pushNotifications: z.boolean().optional(),
  weeklySummary: z.boolean().optional(),
  securityMode: z.string().optional(),
});

export const bookmarkCreateSchema = z.object({
  title: z.string().min(1, "标题不能为空"),
  url: z.string().url("请输入有效的URL"),
  iconType: z.string().optional(),
  iconValue: z.string().optional(),
  openMode: z.enum(["newTab", "internal", "iframe"]).optional(),
});

export const bookmarkUpdateSchema = z.object({
  title: z.string().min(1).optional(),
  url: z.string().url().optional(),
  iconType: z.string().optional(),
  iconValue: z.string().optional(),
  openMode: z.enum(["newTab", "internal", "iframe"]).optional(),
  isPinnedToDock: z.boolean().optional(),
  sortOrder: z.number().optional(),
});

export const dockOrderSchema = z.object({
  items: z.array(
    z.object({
      id: z.string(),
      sortOrder: z.number(),
      isVisible: z.boolean().optional(),
    })
  ),
});

export const dockItemUpdateSchema = z.object({
  title: z.string().optional(),
  iconType: z.string().optional(),
  iconValue: z.string().optional(),
  isVisible: z.boolean().optional(),
  sortOrder: z.number().optional(),
});

export const taskCreateSchema = z.object({
  title: z.string().min(1, "任务标题不能为空"),
  content: z.string().optional(),
  dueDate: z.string().optional(),
  priority: z.number().min(0).max(5).optional(),
  projectId: z.string().optional(),
});

export const taskUpdateSchema = z.object({
  title: z.string().optional(),
  content: z.string().optional(),
  dueDate: z.string().optional(),
  priority: z.number().min(0).max(5).optional(),
  status: z.number().optional(),
});

export const calendarEventCreateSchema = z.object({
  title: z.string().min(1),
  startDate: z.string(),
  endDate: z.string().optional(),
  isAllDay: z.boolean().optional(),
});
