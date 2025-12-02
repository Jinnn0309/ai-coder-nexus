-- ========================================
-- Nexus AI Platform Database Initialization
-- ========================================

-- 创建数据库（如果不存在）
-- CREATE DATABASE nexus_ai_platform;
-- \c nexus_ai_platform;

-- 启用必要的扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- 创建枚举类型
CREATE TYPE user_role AS ENUM ('super_admin', 'admin', 'moderator', 'user', 'guest');
CREATE TYPE user_status AS ENUM ('active', 'inactive', 'suspended', 'deleted');
CREATE TYPE template_stage AS ENUM ('requirements', 'product_planning', 'architecture', 'story_creation', 'development', 'qa');
CREATE TYPE template_status AS ENUM ('draft', 'pending_review', 'approved', 'rejected', 'archived');
CREATE TYPE subscription_status AS ENUM ('active', 'canceled', 'past_due', 'unpaid', 'trialing');

-- ========================================
-- 用户管理模块
-- ========================================

-- 用户表
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(50) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    avatar_url TEXT,
    role user_role DEFAULT 'user',
    status user_status DEFAULT 'active',
    email_verified BOOLEAN DEFAULT FALSE,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 用户偏好设置表
CREATE TABLE user_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    language VARCHAR(10) DEFAULT 'zh',
    theme VARCHAR(20) DEFAULT 'dark',
    notifications JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- 用户订阅表
CREATE TABLE user_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan_id VARCHAR(50) NOT NULL,
    status subscription_status DEFAULT 'active',
    current_period_start TIMESTAMPTZ NOT NULL,
    current_period_end TIMESTAMPTZ NOT NULL,
    usage_limits JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================
-- 内容管理模块
-- ========================================

-- 模板表
CREATE TABLE templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    content TEXT NOT NULL,
    prompt_content TEXT,
    input_format TEXT,
    output_format TEXT,
    stage template_stage NOT NULL,
    tech_stack TEXT[],
    supports TEXT[],
    app_type VARCHAR(50),
    author_id UUID REFERENCES users(id),
    is_system BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE,
    is_public BOOLEAN DEFAULT TRUE,
    status template_status DEFAULT 'approved',
    tags TEXT[],
    metadata JSONB DEFAULT '{}',
    likes_count INTEGER DEFAULT 0,
    usage_count INTEGER DEFAULT 0,
    views_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 提示词表
CREATE TABLE prompts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR(100),
    role VARCHAR(50),
    language VARCHAR(20) DEFAULT 'zh',
    efficiency_score INTEGER CHECK (efficiency_score >= 0 AND efficiency_score <= 100),
    author_id UUID REFERENCES users(id),
    is_system BOOLEAN DEFAULT FALSE,
    is_public BOOLEAN DEFAULT TRUE,
    status template_status DEFAULT 'approved',
    tags TEXT[],
    likes_count INTEGER DEFAULT 0,
    usage_count INTEGER DEFAULT 0,
    views_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 指南表
CREATE TABLE guides (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR(100),
    tool_name VARCHAR(100),
    official_url TEXT,
    read_time INTEGER,
    language VARCHAR(20) DEFAULT 'zh',
    is_learning_path BOOLEAN DEFAULT FALSE,
    estimated_duration INTEGER,
    difficulty VARCHAR(20) DEFAULT 'beginner',
    prerequisites TEXT[],
    learning_objectives TEXT[],
    author_id UUID REFERENCES users(id),
    is_system BOOLEAN DEFAULT FALSE,
    is_public BOOLEAN DEFAULT TRUE,
    status template_status DEFAULT 'approved',
    metadata JSONB DEFAULT '{}',
    likes_count INTEGER DEFAULT 0,
    usage_count INTEGER DEFAULT 0,
    views_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================
-- 用户交互模块
-- ========================================

-- 收藏表
CREATE TABLE bookmarks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    resource_type VARCHAR(20) NOT NULL,
    resource_id UUID NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, resource_type, resource_id)
);

-- 点赞表
CREATE TABLE likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    resource_type VARCHAR(20) NOT NULL,
    resource_id UUID NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, resource_type, resource_id)
);

-- 评论表
CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    resource_type VARCHAR(20) NOT NULL,
    resource_id UUID NOT NULL,
    parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'published',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================
-- AI服务模块
-- ========================================

-- AI对话会话表
CREATE TABLE ai_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255),
    model VARCHAR(50) DEFAULT 'gemini-2.5-flash',
    context JSONB DEFAULT '{}',
    total_tokens INTEGER DEFAULT 0,
    total_cost DECIMAL(10,4) DEFAULT 0.0000,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI对话消息表
CREATE TABLE ai_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES ai_conversations(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL,
    content TEXT NOT NULL,
    tokens INTEGER DEFAULT 0,
    cost DECIMAL(10,4) DEFAULT 0.0000,
    model VARCHAR(50),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 代码生成记录表
CREATE TABLE code_generations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    prompt TEXT NOT NULL,
    context TEXT,
    generated_code TEXT NOT NULL,
    language VARCHAR(50),
    framework VARCHAR(50),
    template_id UUID REFERENCES templates(id),
    tokens_used INTEGER DEFAULT 0,
    cost DECIMAL(10,4) DEFAULT 0.0000,
    model VARCHAR(50) DEFAULT 'gemini-2.5-flash',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 代码分析记录表
CREATE TABLE code_analyses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    code TEXT NOT NULL,
    language VARCHAR(50),
    overall_score INTEGER CHECK (overall_score >= 0 AND overall_score <= 100),
    metrics JSONB DEFAULT '{}',
    summary TEXT,
    tokens_used INTEGER DEFAULT 0,
    cost DECIMAL(10,4) DEFAULT 0.0000,
    model VARCHAR(50) DEFAULT 'gemini-2.5-flash',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================
-- 系统管理模块
-- ========================================

-- 系统配置表
CREATE TABLE system_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key VARCHAR(255) UNIQUE NOT NULL,
    value JSONB NOT NULL,
    description TEXT,
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 使用统计表
CREATE TABLE usage_statistics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    metric_name VARCHAR(100) NOT NULL,
    metric_value BIGINT DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, date, metric_name)
);

-- ========================================
-- 索引创建
-- ========================================

-- 用户相关索引
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_created_at ON users(created_at);

-- 模板相关索引
CREATE INDEX idx_templates_author_id ON templates(author_id);
CREATE INDEX idx_templates_stage ON templates(stage);
CREATE INDEX idx_templates_status ON templates(status);
CREATE INDEX idx_templates_is_public ON templates(is_public);
CREATE INDEX idx_templates_is_featured ON templates(is_featured);
CREATE INDEX idx_templates_created_at ON templates(created_at);
CREATE INDEX idx_templates_likes_count ON templates(likes_count DESC);
CREATE INDEX idx_templates_usage_count ON templates(usage_count DESC);
CREATE INDEX idx_templates_tags ON templates USING GIN(tags);
CREATE INDEX idx_templates_tech_stack ON templates USING GIN(tech_stack);

-- 提示词相关索引
CREATE INDEX idx_prompts_author_id ON prompts(author_id);
CREATE INDEX idx_prompts_category ON prompts(category);
CREATE INDEX idx_prompts_role ON prompts(role);
CREATE INDEX idx_prompts_status ON prompts(status);
CREATE INDEX idx_prompts_is_public ON prompts(is_public);
CREATE INDEX idx_prompts_efficiency_score ON prompts(efficiency_score DESC);
CREATE INDEX idx_prompts_usage_count ON prompts(usage_count DESC);
CREATE INDEX idx_prompts_tags ON prompts USING GIN(tags);

-- 指南相关索引
CREATE INDEX idx_guides_author_id ON guides(author_id);
CREATE INDEX idx_guides_category ON guides(category);
CREATE INDEX idx_guides_tool_name ON guides(tool_name);
CREATE INDEX idx_guides_is_learning_path ON guides(is_learning_path);
CREATE INDEX idx_guides_status ON guides(status);
CREATE INDEX idx_guides_is_public ON guides(is_public);
CREATE INDEX idx_guides_usage_count ON guides(usage_count DESC);

-- 用户交互相关索引
CREATE INDEX idx_bookmarks_user_id ON bookmarks(user_id);
CREATE INDEX idx_bookmarks_resource ON bookmarks(resource_type, resource_id);
CREATE INDEX idx_likes_user_id ON likes(user_id);
CREATE INDEX idx_likes_resource ON likes(resource_type, resource_id);
CREATE INDEX idx_comments_user_id ON comments(user_id);
CREATE INDEX idx_comments_resource ON comments(resource_type, resource_id);
CREATE INDEX idx_comments_parent_id ON comments(parent_id);
CREATE INDEX idx_comments_created_at ON comments(created_at DESC);

-- AI服务相关索引
CREATE INDEX idx_ai_conversations_user_id ON ai_conversations(user_id);
CREATE INDEX idx_ai_conversations_status ON ai_conversations(status);
CREATE INDEX idx_ai_conversations_created_at ON ai_conversations(created_at DESC);
CREATE INDEX idx_ai_messages_conversation_id ON ai_messages(conversation_id);
CREATE INDEX idx_ai_messages_created_at ON ai_messages(conversation_id, created_at);
CREATE INDEX idx_code_generations_user_id ON code_generations(user_id);
CREATE INDEX idx_code_generations_template_id ON code_generations(template_id);
CREATE INDEX idx_code_generations_created_at ON code_generations(created_at DESC);
CREATE INDEX idx_code_analyses_user_id ON code_analyses(user_id);
CREATE INDEX idx_code_analyses_created_at ON code_analyses(created_at DESC);

-- 系统管理相关索引
CREATE INDEX idx_system_configs_key ON system_configs(key);
CREATE INDEX idx_system_configs_is_public ON system_configs(is_public);
CREATE INDEX idx_usage_statistics_user_id ON usage_statistics(user_id);
CREATE INDEX idx_usage_statistics_date ON usage_statistics(date);
CREATE INDEX idx_usage_statistics_metric_name ON usage_statistics(metric_name);

-- ========================================
-- 触发器函数
-- ========================================

-- 更新时间戳函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为所有需要的表创建触发器
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_templates_updated_at BEFORE UPDATE ON templates 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_prompts_updated_at BEFORE UPDATE ON prompts 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_guides_updated_at BEFORE UPDATE ON guides 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON user_preferences 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_subscriptions_updated_at BEFORE UPDATE ON user_subscriptions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_conversations_updated_at BEFORE UPDATE ON ai_conversations 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_system_configs_updated_at BEFORE UPDATE ON system_configs 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 更新点赞数函数
CREATE OR REPLACE FUNCTION update_likes_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        CASE NEW.resource_type
            WHEN 'template' THEN
                UPDATE templates SET likes_count = likes_count + 1 WHERE id = NEW.resource_id;
            WHEN 'prompt' THEN
                UPDATE prompts SET likes_count = likes_count + 1 WHERE id = NEW.resource_id;
            WHEN 'guide' THEN
                UPDATE guides SET likes_count = likes_count + 1 WHERE id = NEW.resource_id;
        END CASE;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        CASE OLD.resource_type
            WHEN 'template' THEN
                UPDATE templates SET likes_count = likes_count - 1 WHERE id = OLD.resource_id;
            WHEN 'prompt' THEN
                UPDATE prompts SET likes_count = likes_count - 1 WHERE id = OLD.resource_id;
            WHEN 'guide' THEN
                UPDATE guides SET likes_count = likes_count - 1 WHERE id = OLD.resource_id;
        END CASE;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_update_likes_count
    AFTER INSERT OR DELETE ON likes
    FOR EACH ROW EXECUTE FUNCTION update_likes_count();

-- 更新使用次数函数
CREATE OR REPLACE FUNCTION increment_usage_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_TABLE_NAME = 'code_generations' THEN
        UPDATE templates SET usage_count = usage_count + 1 WHERE id = NEW.template_id;
    END IF;
    
    -- 更新访问次数
    CASE TG_TABLE_NAME
        WHEN 'templates' THEN
            UPDATE templates SET views_count = views_count + 1 WHERE id = NEW.id;
        WHEN 'prompts' THEN
            UPDATE prompts SET views_count = views_count + 1 WHERE id = NEW.id;
        WHEN 'guides' THEN
            UPDATE guides SET views_count = views_count + 1 WHERE id = NEW.id;
    END CASE;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 注意：这个触发器需要在应用层实现，因为我们不能在同一个触发器中同时INSERT和UPDATE同一个表

-- ========================================
-- 完成提示
-- ========================================

-- 输出初始化完成信息
DO $$
BEGIN
    RAISE NOTICE '=====================================';
    RAISE NOTICE 'Nexus AI Platform Database Initialized';
    RAISE NOTICE '=====================================';
    RAISE NOTICE 'Tables created: 16';
    RAISE NOTICE 'Indexes created: 45+';
    RAISE NOTICE 'Triggers created: 10';
    RAISE NOTICE 'Database is ready for use!';
    RAISE NOTICE '=====================================';
END $$;