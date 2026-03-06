# 数据库设计

## ER 关系

```
User 1──* MailItem
User 1──* SubscriptionItem
User 1──* DecisionItem
User 1──1 TickTickConnection
User 1──1 UserSetting
User 1──* DockItem
User 1──* Bookmark
```

## 模型说明

### User
用户主表，所有业务数据通过 userId 隔离。

### MailItem
邮件数据，支持 folder 分类（inbox/sent/draft/spam/archived）、已读/星标/归档/软删除。

### SubscriptionItem
订阅内容，按 category 分类（tech/design/news/blog）。

### DecisionItem
决策事项，由规则引擎从邮件/订阅中分析生成。支持 priority（urgent/important/normal）和 status（pending/converted/dismissed）。tags 为 PostgreSQL 数组类型。

### TickTickConnection
滴答清单 OAuth 连接配置，一个用户最多一条记录。存储 accessToken 和 refreshToken。

### UserSetting
用户偏好设置，一对一关系。包括主题、语言、时区、通知偏好等。

### DockItem
底部 Dock 栏项目，支持 module（系统模块）和 bookmark（自定义书签）两种类型。

### Bookmark
用户自定义书签，可固定到 Dock 栏（isPinnedToDock）。

## 索引策略

- `User.email` - 唯一索引，用于登录查询
- `MailItem(userId, folder)` - 邮件分类查询
- `MailItem(userId, isRead)` - 未读邮件统计
- `SubscriptionItem(userId, category)` - 订阅分类查询
- `DecisionItem(userId, status)` - 决策状态查询
- `DecisionItem(userId, priority)` - 优先级排序
- `DockItem(userId, sortOrder)` - Dock 排序
- `Bookmark(userId, isPinnedToDock)` - 已固定书签查询
