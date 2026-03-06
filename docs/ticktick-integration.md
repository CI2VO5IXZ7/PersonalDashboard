# 滴答清单 (TickTick) 接入文档

## 接入方式

采用 OAuth 2.0 官方接入，通过 TickTick Open API 读写任务和日程数据。

## 前置准备

1. 访问 [TickTick Developer](https://developer.ticktick.com/) 注册开发者账号
2. 创建 OAuth 应用，获取 Client ID 和 Client Secret
3. 设置回调地址为 `http://localhost:3000/api/integrations/ticktick/callback`
4. 在 `.env` 中配置：
   ```
   TICKTICK_CLIENT_ID=your_client_id
   TICKTICK_CLIENT_SECRET=your_client_secret
   TICKTICK_REDIRECT_URI=http://localhost:3000/api/integrations/ticktick/callback
   ```

## 授权流程

1. 用户在设置页点击"连接滴答清单"
2. 后端生成 OAuth 授权链接 → 重定向到 TickTick 授权页
3. 用户授权后 TickTick 回调到 `/api/integrations/ticktick/callback`
4. 后端用 code 换取 access_token，存储到 `TickTickConnection` 表
5. 后续所有 API 调用使用该 access_token

## 服务层封装

所有 TickTick API 调用封装在 `src/server/ticktick-service.ts`：

- `getProjects()` - 获取项目列表
- `createTask()` - 创建任务
- `updateTask()` - 更新任务
- `completeTask()` - 完成任务
- `deleteTask()` - 删除任务
- `getAuthUrl()` - 生成授权链接
- `exchangeToken()` - 交换 access_token

## DTO 映射

本地不直接使用 TickTick 返回的原始数据，而是通过 DTO 映射层转换：

- `TaskDTO` - 统一任务数据结构
- `CalendarEventDTO` - 统一日历事件数据结构

映射函数：
- `mapTickTickTaskToDTO()` - TickTick 任务 → 本地 TaskDTO
- `mapTickTickTaskToCalendarEvent()` - TickTick 任务 → 日历事件

## 错误处理

- API 请求失败统一抛出 Error，由上层 Route Handler 捕获
- 返回 502 状态码表示第三方 API 异常
- token 过期时提示用户重新授权

## Phase 2 扩展计划

- 双向增量同步
- 后台定时同步 (cron job)
- 冲突检测与处理
- 多日历源支持
