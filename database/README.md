# 数据库快速开始指南

## 📋 概述

本文件夹包含Nexus AI平台的完整数据库设计和种子数据，可以快速搭建开发和测试环境。

## 🗂️ 文件结构

```
database/
├── init.sql          # 数据库表结构和初始化脚本
├── seed.sql           # 种子数据（演示数据）
├── README.md          # 本文档
├── docker-compose.yml # Docker容器编排配置
└── scripts/          # 管理脚本
    ├── backup.sh      # 数据库备份脚本
    ├── restore.sh     # 数据库恢复脚本
    └── reset.sh      # 数据库重置脚本
```

## 🚀 快速启动

### 方式一：Docker Compose（推荐）

```bash
# 1. 启动数据库服务
docker-compose up -d postgres

# 2. 等待服务启动（约30秒）
docker-compose logs -f postgres

# 3. 连接数据库验证
docker-compose exec postgres psql -U nexus_app -d nexus_ai_platform -c "SELECT COUNT(*) FROM users;"

# 4. 查看种子数据
docker-compose exec postgres psql -U nexus_app -d nexus_ai_platform -c "\dt"
```

### 方式二：本地PostgreSQL

```bash
# 1. 创建数据库
createdb nexus_ai_platform

# 2. 执行初始化脚本
psql -d nexus_ai_platform -f init.sql

# 3. 执行种子数据脚本
psql -d nexus_ai_platform -f seed.sql

# 4. 验证安装
psql -d nexus_ai_platform -c "SELECT email, username, role FROM users;"
```

### 方式三：Node.js脚本（需要依赖）

```bash
# 1. 安装依赖
npm install pg

# 2. 运行初始化脚本
node scripts/init-db.js

# 3. 导入种子数据
node scripts/seed-db.js
```

## 📊 数据库概览

### 核心表结构

| 模块 | 表名 | 用途 | 记录数 |
|------|------|------|--------|
| 用户管理 | users | 用户基础信息 | 3 |
|  | user_preferences | 用户偏好设置 | 3 |
|  | user_subscriptions | 用户订阅信息 | 1 |
| 内容管理 | templates | 流程模板 | 6 |
|  | prompts | 提示词 | 2 |
|  | guides | 指南文档 | 2 |
| 用户交互 | bookmarks | 收藏记录 | 3 |
|  | likes | 点赞记录 | 3 |
|  | comments | 评论记录 | 2 |
| AI服务 | ai_conversations | AI对话会话 | 1 |
|  | ai_messages | AI对话消息 | 2 |
|  | code_generations | 代码生成记录 | 1 |
|  | code_analyses | 代码分析记录 | 1 |
| 系统管理 | system_configs | 系统配置 | 3 |
|  | usage_statistics | 使用统计 | 6 |

### 演示账号

| 邮箱 | 用户名 | 密码 | 角色 | 说明 |
|------|--------|------|------|------|
| demo@nexus-ai.com | demo | demo123 | user | 普通用户账号 |
| admin@nexus-ai.com | admin | admin123 | admin | 管理员账号 |
| system@nexus-ai.com | system | system123 | super_admin | 系统账号 |

## 🔧 配置说明

### 环境变量

```bash
# 数据库连接配置
DB_HOST=localhost
DB_PORT=5432
DB_NAME=nexus_ai_platform
DB_USER=nexus_app
DB_PASSWORD=your_secure_password_here

# Redis连接配置
REDIS_HOST=localhost
REDIS_PORT=6379

# AI服务配置
GEMINI_API_KEY=your_gemini_api_key_here
```

### 连接池配置

```javascript
const pool = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  max: 20,              // 最大连接数
  min: 5,               // 最小连接数
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
}
```

## 🛠️ 常用查询

### 用户相关查询

```sql
-- 查看所有用户
SELECT id, email, username, role, created_at FROM users;

-- 查看用户订阅信息
SELECT u.email, s.plan_id, s.status, s.current_period_end
FROM users u
LEFT JOIN user_subscriptions s ON u.id = s.user_id;

-- 查看用户使用统计
SELECT u.email, 
       SUM(CASE WHEN us.metric_name = 'ai_requests' THEN us.metric_value ELSE 0 END) as total_requests,
       SUM(CASE WHEN us.metric_name = 'tokens_used' THEN us.metric_value ELSE 0 END) as total_tokens
FROM users u
LEFT JOIN usage_statistics us ON u.id = us.user_id
WHERE us.date >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY u.id, u.email;
```

### 内容相关查询

```sql
-- 查看热门模板
SELECT title, stage, likes_count, usage_count, views_count
FROM templates 
WHERE is_public = TRUE AND status = 'approved'
ORDER BY likes_count DESC
LIMIT 10;

-- 查看用户创建的内容
SELECT t.title, t.stage, t.created_at
FROM templates t
WHERE t.author_id = '00000000-0000-0000-0000-000000000003'
UNION ALL
SELECT p.title, p.category, p.created_at
FROM prompts p
WHERE p.author_id = '00000000-0000-0000-0000-000000000003';
```

### AI服务查询

```sql
-- 查看AI对话统计
SELECT 
    COUNT(*) as total_conversations,
    AVG(total_tokens) as avg_tokens_per_conversation,
    SUM(total_tokens) as total_tokens
FROM ai_conversations
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days';

-- 查看代码生成统计
SELECT 
    language,
    COUNT(*) as generation_count,
    AVG(tokens_used) as avg_tokens,
    AVG(cost) as avg_cost
FROM code_generations
WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY language
ORDER BY generation_count DESC;
```

## 🔄 维护操作

### 数据备份

```bash
# 创建备份
docker-compose exec postgres pg_dump -U nexus_app nexus_ai_platform > backup_$(date +%Y%m%d_%H%M%S).sql

# 使用备份脚本
chmod +x scripts/backup.sh
./scripts/backup.sh
```

### 数据恢复

```bash
# 从备份恢复
docker-compose exec -T postgres psql -U nexus_app nexus_ai_platform < backup_20240115_120000.sql

# 使用恢复脚本
chmod +x scripts/restore.sh
./scripts/restore.sh backup_20240115_120000.sql
```

### 重置数据库

```bash
# 完全重置（删除所有数据）
chmod +x scripts/reset.sh
./scripts/reset.sh

# 手动重置
docker-compose down
docker volume rm nexus-ai-postgres_data
docker-compose up -d postgres
sleep 30
psql -h localhost -U nexus_app -d nexus_ai_platform -f init.sql
psql -h localhost -U nexus_app -d nexus_ai_platform -f seed.sql
```

## 📊 性能监控

### 查看数据库性能

```sql
-- 查看慢查询
SELECT 
    query,
    calls,
    total_time,
    mean_time,
    rows
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;

-- 查看表大小
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- 查看索引使用情况
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan,
    idx_tup_read,
    idx_tup_fetch
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;
```

### 性能优化建议

1. **定期分析表统计信息**
   ```sql
   ANALYZE;
   ```

2. **重建索引**
   ```sql
   REINDEX DATABASE nexus_ai_platform;
   ```

3. **清理无用数据**
   ```sql
   DELETE FROM audit_logs WHERE created_at < NOW() - INTERVAL '30 days';
   ```

## 🔒 安全配置

### 用户权限

```sql
-- 创建只读用户
CREATE USER readonly_user WITH PASSWORD 'readonly_password';
GRANT CONNECT ON DATABASE nexus_ai_platform TO readonly_user;
GRANT USAGE ON SCHEMA public TO readonly_user;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO readonly_user;

-- 创建应用用户
CREATE USER app_user WITH PASSWORD 'app_password';
GRANT CONNECT ON DATABASE nexus_ai_platform TO app_user;
GRANT USAGE ON SCHEMA public TO app_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app_user;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO app_user;
```

### 数据加密

```sql
-- 启用行级安全
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;

-- 创建安全策略
CREATE POLICY user_preferences_policy ON user_preferences
    FOR ALL TO app_user
    USING (user_id = current_setting('app.current_user_id')::UUID);
```

## 🚨 故障排除

### 常见问题

1. **连接被拒绝**
   ```bash
   # 检查PostgreSQL服务状态
   docker-compose ps postgres
   
   # 查看日志
   docker-compose logs postgres
   ```

2. **权限错误**
   ```sql
   -- 重新授权
   GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO nexus_app;
   GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO nexus_app;
   ```

3. **种子数据重复**
   ```sql
   -- 清空表但保留结构
   TRUNCATE TABLE users RESTART IDENTITY CASCADE;
   ```

### 调试模式

```bash
# 启用详细日志
docker-compose exec postgres psql -U nexus_app -d nexus_ai_platform -c "SET log_min_duration_statement = 0;"

# 监控连接
docker-compose exec postgres psql -U nexus_app -d nexus_ai_platform -c "SELECT * FROM pg_stat_activity;"
```

## 📚 扩展开发

### 添加新表

1. 在`init.sql`中添加表结构
2. 创建相应的索引和触发器
3. 在`seed.sql`中添加测试数据
4. 更新本README文档

### 数据迁移

```bash
# 创建迁移文件
cp migrations/template.sql migrations/001_add_new_table.sql

# 执行迁移
docker-compose exec postgres psql -U nexus_app -d nexus_ai_platform -f migrations/001_add_new_table.sql

# 记录迁移
INSERT INTO system_configs (key, value) VALUES ('db.migrations', '["001_add_new_table"]');
```

---

## 📞 支持

如果在数据库设置过程中遇到问题，请：

1. 查看[文档](../docs/11-数据库设计实现.md)了解详细设计
2. 检查[Docker日志](docker-compose logs postgres)
3. 参考常见问题解决方案
4. 联系技术团队

---

*最后更新: 2024年1月15日*  
*版本: 1.0.0*