# 系统架构

## 技术栈

- **前端**: Next.js 15 (App Router) + TypeScript + Tailwind CSS 4 + Lucide Icons
- **后端**: Next.js Route Handlers (RESTful API)
- **数据库**: PostgreSQL 16 + Prisma ORM v7
- **鉴权**: NextAuth.js (Auth.js v5) - Credentials Provider + JWT
- **数据校验**: Zod
- **第三方集成**: TickTick OAuth 2.0 API
- **部署**: Docker + Docker Compose

## 系统架构图

```
┌─────────────────────────────────────────┐
│              Browser (Client)            │
│  ┌──────┬──────┬──────┬──────┬───────┐  │
│  │ Mail │Decide│ Cal  │ Set  │ Dock  │  │
│  └──┬───┴──┬───┴──┬───┴──┬───┴───┬───┘  │
└─────┼──────┼──────┼──────┼───────┼──────┘
      │      │      │      │       │
┌─────▼──────▼──────▼──────▼───────▼──────┐
│         Next.js App Router               │
│  ┌─────────────────────────────────────┐ │
│  │     Route Handlers (/api/*)         │ │
│  │  Auth│Mails│Subs│Decide│Task│Set│Dock│ │
│  └──┬──────────────────────────────┬───┘ │
│     │                              │     │
│  ┌──▼──────────┐  ┌───────────────▼───┐ │
│  │ Prisma ORM  │  │ TickTick Service  │ │
│  └──┬──────────┘  └───────────────┬───┘ │
└─────┼─────────────────────────────┼─────┘
      │                             │
┌─────▼──────┐            ┌────────▼──────┐
│ PostgreSQL │            │ TickTick API  │
│   (Docker) │            │  (External)   │
└────────────┘            └───────────────┘
```

## 目录结构

```
personal-dashboard/
├── .github/              # GitHub 工程规范
├── docs/                 # 项目文档
├── prisma/               # Prisma schema + migrations + seed
├── public/               # 静态资源
├── src/
│   ├── app/              # Next.js App Router 页面和 API
│   │   ├── (dashboard)/  # 认证后的主页面 (mail/decisions/calendar/settings)
│   │   ├── api/          # RESTful API 路由
│   │   └── login/        # 登录页
│   ├── components/       # 共享组件 (DockBar, Providers)
│   ├── features/         # 功能模块 (预留)
│   ├── generated/        # Prisma 生成的客户端
│   ├── hooks/            # 自定义 React Hooks
│   ├── lib/              # 核心库 (auth, prisma, validations, api-response)
│   ├── server/           # 服务层 (ticktick-service)
│   └── types/            # TypeScript 类型定义
├── Dockerfile            # 多阶段构建
├── docker-compose.yml    # 容器编排 (app + db)
└── .env.example          # 环境变量模板
```
