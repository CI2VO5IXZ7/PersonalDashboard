import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/api-response";

export async function POST() {
  try {
    const user = await getSessionUser();
    if (!user?.id) return errorResponse("未登录", 401);

    // Rule-based analysis: scan mails and subscriptions to generate decision items
    const recentMails = await prisma.mailItem.findMany({
      where: {
        userId: user.id,
        isDeleted: false,
        folder: "inbox",
        receivedAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      },
      orderBy: { receivedAt: "desc" },
      take: 20,
    });

    const newDecisions = [];

    for (const mail of recentMails) {
      const existingDecision = await prisma.decisionItem.findFirst({
        where: { userId: user.id, sourceType: "mail", sourceId: mail.id },
      });
      if (existingDecision) continue;

      const lowerSubject = mail.subject.toLowerCase();
      const lowerContent = mail.content.toLowerCase();

      let priority: "urgent" | "important" | "normal" = "normal";
      const tags: string[] = [];

      // Priority detection rules
      if (
        lowerSubject.includes("urgent") || lowerSubject.includes("紧急") ||
        lowerSubject.includes("deadline") || lowerSubject.includes("截止") ||
        lowerContent.includes("asap") || lowerContent.includes("尽快")
      ) {
        priority = "urgent";
      } else if (
        lowerSubject.includes("review") || lowerSubject.includes("评审") ||
        lowerSubject.includes("important") || lowerSubject.includes("重要") ||
        lowerSubject.includes("confirm") || lowerSubject.includes("确认") ||
        lowerSubject.includes("investment") || lowerSubject.includes("融资")
      ) {
        priority = "important";
      }

      // Tag detection rules
      if (lowerSubject.includes("design") || lowerSubject.includes("设计")) tags.push("设计");
      if (lowerSubject.includes("api") || lowerSubject.includes("文档")) tags.push("技术");
      if (lowerSubject.includes("meeting") || lowerSubject.includes("会议")) tags.push("会议");
      if (lowerSubject.includes("invest") || lowerSubject.includes("融资")) tags.push("融资");
      if (lowerSubject.includes("review") || lowerSubject.includes("评审")) tags.push("评审");
      if (lowerSubject.includes("roadmap") || lowerSubject.includes("路线")) tags.push("路线图");
      if (lowerSubject.includes("deadline") || lowerSubject.includes("截止")) tags.push("截止日期");
      if (tags.length === 0) tags.push("通用");

      const initials = mail.senderName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

      const summary =
        mail.content.length > 150
          ? mail.content.substring(0, 150) + "..."
          : mail.content;

      newDecisions.push({
        userId: user.id,
        sourceType: "mail" as const,
        sourceId: mail.id,
        title: mail.subject,
        summary,
        priority,
        tags,
        senderInitials: initials,
        receivedAt: mail.receivedAt,
      });
    }

    if (newDecisions.length > 0) {
      await prisma.decisionItem.createMany({ data: newDecisions });
    }

    // Get all current decisions for summary
    const allDecisions = await prisma.decisionItem.findMany({
      where: { userId: user.id, status: "pending" },
    });

    const urgentCount = allDecisions.filter((d) => d.priority === "urgent").length;
    const importantCount = allDecisions.filter((d) => d.priority === "important").length;
    const normalCount = allDecisions.filter((d) => d.priority === "normal").length;

    const analysisSummary = `从你的${recentMails.length}封邮件中，AI 识别出${urgentCount}项紧急事项、${importantCount}项重要事项和${normalCount}项普通事项。`;

    return successResponse({
      summary: analysisSummary,
      newItemsCount: newDecisions.length,
      totalPending: allDecisions.length,
      urgentCount,
      importantCount,
      normalCount,
    });
  } catch (error) {
    console.error("Analyze error:", error);
    return errorResponse("分析失败，请稍后重试", 500);
  }
}
