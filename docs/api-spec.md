# API 接口文档

所有接口统一返回 JSON 格式：
```json
{ "success": true, "message": "ok", "data": {} }
```

## Auth

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/auth/register` | 用户注册 |
| POST | `/api/auth/[...nextauth]` | NextAuth 登录/登出 |
| GET | `/api/auth/me` | 获取当前用户信息 |

## Mails

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/mails?folder=inbox&search=&page=1` | 邮件列表 |
| GET | `/api/mails/:id` | 邮件详情 |
| PATCH | `/api/mails/:id` | 更新邮件 (已读/归档/星标) |
| DELETE | `/api/mails/:id` | 软删除邮件 |

## Subscriptions

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/subscriptions?category=all` | 订阅列表 |
| GET | `/api/subscriptions/:id` | 订阅详情 |
| PATCH | `/api/subscriptions/:id` | 更新订阅 (已读) |

## Decisions

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/decisions?status=pending` | 决策列表 |
| POST | `/api/decisions/analyze` | 重新分析 (规则引擎) |
| PATCH | `/api/decisions/:id` | 更新决策状态 |
| POST | `/api/decisions/:id/add-to-task` | 加入待办 (写入TickTick) |

## TickTick Integration

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/integrations/ticktick/status` | 连接状态 |
| POST | `/api/integrations/ticktick/connect` | 发起OAuth |
| GET | `/api/integrations/ticktick/callback` | OAuth回调 |

## Tasks (via TickTick)

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/tasks` | 任务列表 |
| POST | `/api/tasks` | 创建任务 |
| PATCH | `/api/tasks/:id` | 更新任务 |
| DELETE | `/api/tasks/:id` | 删除任务 |

## Settings

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/settings` | 获取设置 |
| PATCH | `/api/settings` | 更新设置 |

## Dock & Bookmarks

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/dock` | Dock栏列表 |
| PATCH | `/api/dock/order` | 更新Dock排序 |
| PATCH | `/api/dock/:id` | 更新Dock项 |
| GET | `/api/bookmarks` | 书签列表 |
| POST | `/api/bookmarks` | 创建书签 |
| PATCH | `/api/bookmarks/:id` | 更新书签 (含固定到Dock) |
| DELETE | `/api/bookmarks/:id` | 删除书签 |
