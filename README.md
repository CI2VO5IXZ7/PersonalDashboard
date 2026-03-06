# Personal Dashboard

网页版个人管理看板 / Personal OS — 聚合邮件、订阅、决策分析、待办日程和自定义书签的统一看板。

## 功能列表

### MVP 已实现
- **用户系统** — 注册/登录/退出/会话管理/数据隔离
- **邮件&订阅** — 邮件分类/搜索/详情/已读/归档/删除 + 订阅内容列表(科技/设计/新闻/博客)
- **信息决策中心** — AI 规则引擎分析摘要/待决策事项/优先级(紧急/重要/普通)/加入待办/重新分析
- **日历&待办** — 月历视图/即将到来/任务清单/筛选(全部/待完成/已完成)/TickTick API 接入
- **设置** — 账户信息/通知偏好/外观主题(深色/浅色/系统)/隐私安全/语言地区/TickTick 连接
- **底部 Dock 栏** — 系统模块图标/自定义图标/排序/显隐控制
- **自定义书签** — 新增/编辑/删除/固定到 Dock/URL 校验

### Phase 2 规划
- 真实邮箱接入 (Gmail/Outlook/IMAP)
- RSS/Newsletter 自动同步
- 接入大模型 (OpenAI/Claude) 智能分析
- 推送提醒 + 多日历视图
- 拖拽排序 + 自定义图标上传
- 双向增量同步 + 安全增强

## 技术栈

| 类别 | 技术 |
|------|------|
| 前端 | Next.js 15 (App Router) + TypeScript + Tailwind CSS 4 |
| 后端 | Next.js Route Handlers (RESTful) |
| 数据库 | PostgreSQL 16 + Prisma ORM v7 |
| 鉴权 | NextAuth.js (Auth.js v5) + JWT |
| 校验 | Zod |
| 图标 | Lucide React |
| 第三方 | TickTick OAuth 2.0 API |
| 部署 | Docker + Docker Compose |

## 本地开发

```bash
# 1. 安装依赖
npm install

# 2. 复制环境变量
cp .env.example .env

# 3. 启动 PostgreSQL (Docker)
docker compose up -d db

# 4. 生成 Prisma Client
npx prisma generate

# 5. 运行数据库迁移
npx prisma migrate dev

# 6. 填充示例数据
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/personal_dashboard?schema=public" npx tsx prisma/seed.ts

# 7. 启动开发服务器
npm run dev
```

访问 http://localhost:3000 — 演示账号: `demo@example.com` / `demo123`

## Docker 部署

```bash
# 一键启动 (应用 + 数据库)
docker compose up -d --build

# 首次运行迁移
docker compose exec app npx prisma migrate deploy

# 查看日志
docker compose logs -f app

# 停止
docker compose down
```

详细部署说明见 [docs/deployment.md](docs/deployment.md)

## 环境变量

| 变量 | 说明 | 必填 |
|------|------|------|
| `DATABASE_URL` | PostgreSQL 连接字符串 | 是 |
| `NEXTAUTH_URL` | 应用地址 | 是 |
| `NEXTAUTH_SECRET` | JWT 签名密钥 | 是 |
| `AUTH_SECRET` | Auth.js 密钥 | 是 |
| `TICKTICK_CLIENT_ID` | 滴答清单 OAuth Client ID | 否 |
| `TICKTICK_CLIENT_SECRET` | 滴答清单 OAuth Secret | 否 |

## 数据库初始化

```bash
# 运行迁移
npx prisma migrate dev

# 填充种子数据
npx tsx prisma/seed.ts

# 查看数据库
npx prisma studio
```

## TickTick 接入

1. 在 [TickTick Developer](https://developer.ticktick.com/) 创建 OAuth 应用
2. 获取 Client ID / Secret，填入 `.env`
3. 在设置页点击"连接滴答清单"完成授权

详细说明见 [docs/ticktick-integration.md](docs/ticktick-integration.md)

## 开发命令

```bash
npm run dev      # 启动开发服务器
npm run build    # 生产构建
npm run start    # 生产启动
npm run lint     # ESLint 检查
```

## Git 分支规范

| 分支 | 用途 |
|------|------|
| `main` | 生产分支 |
| `develop` | 开发主分支 |
| `feature/*` | 功能开发 |
| `fix/*` | 问题修复 |
| `chore/*` | 工程维护 |

Commit 遵循 [Conventional Commits](https://www.conventionalcommits.org/): `feat:` / `fix:` / `refactor:` / `chore:` / `docs:`

## 项目文档

- [系统架构](docs/architecture.md)
- [API 文档](docs/api-spec.md)
- [数据库设计](docs/database-design.md)
- [部署指南](docs/deployment.md)
- [TickTick 接入](docs/ticktick-integration.md)

## License

MIT
