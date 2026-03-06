# 本机 Docker 部署指南

## 前提条件

- Docker Engine 20.10+
- Docker Compose v2+
- 至少 2GB 可用内存

## 首次启动

```bash
# 1. 克隆项目
git clone <repo-url>
cd personal-dashboard

# 2. 复制环境变量
cp .env.example .env
# 编辑 .env 文件，修改 NEXTAUTH_SECRET 和 AUTH_SECRET

# 3. 启动所有服务
docker compose up -d

# 4. 运行数据库迁移（首次）
docker compose exec app npx prisma migrate deploy

# 5. 填充示例数据（可选）
docker compose exec app npx tsx prisma/seed.ts

# 6. 访问应用
open http://localhost:3000
```

## 常用命令

```bash
# 停止服务
docker compose down

# 重新构建并启动
docker compose up -d --build

# 查看日志
docker compose logs -f app
docker compose logs -f db

# 仅查看最近100行
docker compose logs --tail=100 app

# 重启应用
docker compose restart app

# 进入应用容器
docker compose exec app sh

# 进入数据库
docker compose exec db psql -U postgres personal_dashboard
```

## 数据持久化

PostgreSQL 数据存储在 Docker Volume `pgdata` 中。

```bash
# 查看卷
docker volume ls | grep pgdata

# 备份数据库
docker compose exec db pg_dump -U postgres personal_dashboard > backup.sql

# 恢复数据库
cat backup.sql | docker compose exec -T db psql -U postgres personal_dashboard
```

## 升级发布

```bash
# 1. 拉取最新代码
git pull origin main

# 2. 重新构建
docker compose up -d --build

# 3. 运行新的迁移（如有）
docker compose exec app npx prisma migrate deploy
```

## 环境变量说明

| 变量 | 说明 | 必填 |
|------|------|------|
| `DATABASE_URL` | PostgreSQL 连接字符串 | 是 |
| `NEXTAUTH_URL` | 应用访问地址 | 是 |
| `NEXTAUTH_SECRET` | JWT 签名密钥 | 是 |
| `AUTH_SECRET` | Auth.js 密钥 | 是 |
| `TICKTICK_CLIENT_ID` | 滴答清单 OAuth Client ID | 否 |
| `TICKTICK_CLIENT_SECRET` | 滴答清单 OAuth Client Secret | 否 |
| `TICKTICK_REDIRECT_URI` | 滴答清单 OAuth 回调地址 | 否 |
