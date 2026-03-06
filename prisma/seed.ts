import pg from "pg";
import bcrypt from "bcryptjs";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

async function q(sql: string, params: unknown[] = []) {
  const res = await pool.query(sql, params);
  return res.rows;
}

function cuid() {
  return "c" + Math.random().toString(36).slice(2) + Date.now().toString(36);
}

async function main() {
  // Clean
  await q('DELETE FROM "Bookmark"');
  await q('DELETE FROM "DockItem"');
  await q('DELETE FROM "DecisionItem"');
  await q('DELETE FROM "SubscriptionItem"');
  await q('DELETE FROM "MailItem"');
  await q('DELETE FROM "UserSetting"');
  await q('DELETE FROM "TickTickConnection"');
  await q('DELETE FROM "User"');

  const now = new Date().toISOString();
  const userId = cuid();
  const passwordHash = await bcrypt.hash("demo123", 12);

  // User
  await q(
    `INSERT INTO "User" (id, name, email, "passwordHash", timezone, locale, "createdAt", "updatedAt") VALUES ($1,$2,$3,$4,$5,$6,$7,$7)`,
    [userId, "Demo User", "demo@example.com", passwordHash, "Asia/Shanghai", "zh-CN", now]
  );

  // Settings
  await q(
    `INSERT INTO "UserSetting" (id, "userId", theme, locale, timezone, "emailNotifications", "pushNotifications", "weeklySummary", "securityMode", "createdAt", "updatedAt") VALUES ($1,$2,'dark','zh-CN','Asia/Shanghai',true,true,false,'standard',$3,$3)`,
    [cuid(), userId, now]
  );

  // Dock items
  const docks = [
    ["邮件&订阅", "mail", "/mail", 0],
    ["信息决策", "brain", "/decisions", 1],
    ["日历&待办", "calendar", "/calendar", 2],
    ["设置", "settings", "/settings", 3],
  ];
  for (const [title, icon, path, order] of docks) {
    await q(
      `INSERT INTO "DockItem" (id, "userId", type, title, "iconType", "iconValue", "targetPath", "sortOrder", "isVisible", "createdAt", "updatedAt") VALUES ($1,$2,'module',$3,'lucide',$4,$5,$6,true,$7,$7)`,
      [cuid(), userId, title, icon, path, order, now]
    );
  }

  // Mails
  const mails = [
    ["Q4 Design System Update - Review Needed", "Sarah Chen", "sarah.chen@design.io", "Hi team, I've finished the latest iteration of our design system. The new color tokens are ready for review and I'd love to get your feedback before we push to production. Key changes in this update: - Redesigned the primary color palette to improve accessibility (WCAG AA compliance) - Added 12 new semantic color tokens for better dark mode support - Updated the typography scale with new responsive breakpoints - Introduced motion design tokens for consistent animations. The deadline for feedback is this Friday EOD.", false, true, 2],
    ["API Documentation - Version 3.0 Released", "Marcus Williams", "marcus@api.dev", "The new API documentation is now live! We've completely revamped the developer experience with interactive examples, better search, and multi-language SDK samples. Please review and confirm your team has been notified.", false, false, 3],
    ["Meeting Follow-up: Product Roadmap 2025", "Emma Rodriguez", "emma@product.co", "Thanks everyone for joining today's roadmap session! Here are the key decisions we made and the next steps for each team. Q2 will focus on AI search, Q3 on EU market expansion. Engineering architecture review deadline is Jan 15.", true, false, 24],
    ["Investment Opportunity - Series B Round", "James Park", "james@ventures.com", "Following our call last week, I wanted to share the term sheet for your review. We're excited about the potential. Investment amount $15M, pre-money valuation $60M. Legal team will follow up with complete documents this week.", false, false, 48],
    ["Weekly Team Sync - Agenda", "Lisa Thompson", "lisa@team.co", "Here's the agenda for this week's team sync. Please review and add any items you'd like to discuss. Topics include sprint review, upcoming launches, and resource allocation.", false, false, 48],
    ["Your free trial is ending soon", "Alex Turner", "alex@devtools.pro", "Your 14-day free trial of DevTools Pro ends in 3 days. Usage during trial: 847 API calls, 12GB storage. Use promo code EARLY20 for 20% off first year.", true, false, 72],
  ];
  for (const [subject, name, email, content, isRead, isStarred, hoursAgo] of mails) {
    const recvAt = new Date(Date.now() - (hoursAgo as number) * 3600000).toISOString();
    await q(
      `INSERT INTO "MailItem" (id, "userId", folder, subject, "senderName", "senderEmail", "receiverEmail", content, "isRead", "isStarred", "isArchived", "isDeleted", "receivedAt", "createdAt", "updatedAt") VALUES ($1,$2,'inbox',$3,$4,$5,'demo@example.com',$6,$7,$8,false,false,$9,$10,$10)`,
      [cuid(), userId, subject, name, email, content, isRead, isStarred, recvAt, now]
    );
  }

  // Subscriptions
  const subs = [
    ["Smashing Magazine", "tech", "The Future of React Server Components in Production", "https://smashingmagazine.com", 2],
    ["The Verge", "news", "Apple announces M4 Ultra with 192GB unified memory", "https://theverge.com", 3],
    ["CSS Tricks", "design", "Design Tokens: A practical guide for design systems", "https://css-tricks.com", 5],
    ["Dev.to", "tech", "Building better CLI tools with TypeScript and Ink", "https://dev.to", 6],
    ["UX Planet", "design", "The psychology of good product UX design", "https://uxplanet.org", 8],
    ["TechCrunch", "news", "OpenAI GPT-5 rumored for early 2025 release", "https://techcrunch.com", 10],
    ["Indie Hackers", "blog", "How I built a SaaS to $10k MRR with no-code tools", "https://indiehackers.com", 12],
    ["Tailwind Blog", "tech", "Tailwind CSS v4 Alpha: What you need to know", "https://tailwindcss.com/blog", 24],
    ["Figma Community", "design", "Figma Variables: The complete guide for designers", "https://figma.com", 24],
    ["Hacker News", "news", "EU AI Act: What developers need to know", "https://news.ycombinator.com", 48],
  ];
  for (const [src, cat, title, url, hoursAgo] of subs) {
    const pubAt = new Date(Date.now() - (hoursAgo as number) * 3600000).toISOString();
    await q(
      `INSERT INTO "SubscriptionItem" (id, "userId", "sourceName", category, title, "sourceUrl", "isRead", "publishedAt", "createdAt", "updatedAt") VALUES ($1,$2,$3,$4,$5,$6,false,$7,$8,$8)`,
      [cuid(), userId, src, cat, title, url, pubAt, now]
    );
  }

  // Decisions
  const decisions: [string, string, string, string[], string, number][] = [
    ["Q4 设计系统更新需要评审反馈", "Sarah Chen 已完成最新的设计系统迭代，新的颜色令牌已准备好评审，本周五 EOD 前需要给出反馈，否则将影响下周一的发布计划。", "urgent", ["设计","评审","截止日期"], "SC", 2],
    ["Series B 融资条款需要确认", "James Park 发来了 Series B 条款清单，投资金额 $15M，投前估值 $60M。法律团队将在本周跟进完整文件，需要决定是否继续推进尽职调查阶段。", "urgent", ["融资","法务","决策"], "JP", 48],
    ["API 文档 v3.0 上线需要审批", "Marcus Williams 通知 API 文档 v3.0 已经上线，包含全新交互式代码演练场和多语言 SDK 示例。需要确认团队是否已收到通知并安排接入测试。", "important", ["技术","API"], "MW", 3],
    ["2025 产品路线图关键决策待确认", "Emma Rodriguez 整理了路线图会议结论：Q2 将上线 AI 搜索功能，Q3 进行欧盟市场扩张。需要确认工程架构评审截止时间（1月15日）是否可行。", "important", ["路线图","战略"], "ER", 24],
    ["DevTools Pro 试用到期，是否续费？", "DevTools Pro 14天试用期将在3天后结束。试用期间使用了847次API调用，12GB存储。使用优惠码 EARLY20 可享受首年8折，需决定是否升级付费版本。", "normal", ["工具","订阅"], "AT", 72],
  ];
  for (const [title, summary, priority, tags, initials, hoursAgo] of decisions) {
    const recvAt = new Date(Date.now() - hoursAgo * 3600000).toISOString();
    await q(
      `INSERT INTO "DecisionItem" (id, "userId", "sourceType", title, summary, priority, status, tags, "senderInitials", "receivedAt", "createdAt", "updatedAt") VALUES ($1,$2,'mail',$3,$4,$5,'pending',$6,$7,$8,$9,$9)`,
      [cuid(), userId, title, summary, priority, `{${tags.map(t => `"${t}"`).join(",")}}`, initials, recvAt, now]
    );
  }

  // Bookmarks
  const bookmarks = [
    ["GitHub", "https://github.com", "github", 0],
    ["Figma", "https://figma.com", "figma", 1],
    ["Notion", "https://notion.so", "notebook-pen", 2],
  ];
  for (const [title, url, icon, order] of bookmarks) {
    await q(
      `INSERT INTO "Bookmark" (id, "userId", title, url, "iconType", "iconValue", "openMode", "isPinnedToDock", "sortOrder", "createdAt", "updatedAt") VALUES ($1,$2,$3,$4,'lucide',$5,'newTab',false,$6,$7,$7)`,
      [cuid(), userId, title, url, icon, order, now]
    );
  }

  console.log("Seed data created successfully!");
  console.log("Demo account: demo@example.com / demo123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await pool.end();
  });
