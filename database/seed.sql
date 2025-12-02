-- ========================================
-- Nexus AI Platform Database Seed Data
-- ========================================

-- 插入系统用户
INSERT INTO users (id, email, username, password_hash, role, status, email_verified) VALUES
('00000000-0000-0000-0000-000000000001', 'system@nexus-ai.com', 'system', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj3QJflHQrxG', 'super_admin', 'active', TRUE),
('00000000-0000-0000-0000-000000000002', 'admin@nexus-ai.com', 'admin', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj3QJflHQrxG', 'admin', 'active', TRUE),
('00000000-0000-0000-0000-000000000003', 'demo@nexus-ai.com', 'demo', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj3QJflHQrxG', 'user', 'active', TRUE);

-- 插入用户偏好设置
INSERT INTO user_preferences (user_id, language, theme) VALUES
('00000000-0000-0000-0000-000000000001', 'zh', 'dark'),
('00000000-0000-0000-0000-000000000002', 'en', 'dark'),
('00000000-0000-0000-0000-000000000003', 'zh', 'light');

-- 插入系统配置
INSERT INTO system_configs (key, value, description, is_public) VALUES
('app.version', '"1.0.0"', '应用程序版本', TRUE),
('app.name', '"Nexus AI Platform"', '应用名称', TRUE),
('ai.default_model', '"gemini-2.5-flash"', '默认AI模型', TRUE),
('ai.models', '["gemini-2.5-flash", "gemini-1.5-pro"]', '支持的AI模型', TRUE),
('user.free_plan_limits', '{"ai_requests": 100, "templates": 5, "storage": 104857600}', '免费用户限制', FALSE),
('pricing.plans', '[
  {
    "id": "free",
    "name": "免费版",
    "price": 0,
    "features": {
      "ai_requests": 100,
      "templates": 5,
      "storage": 104857600,
      "advanced_features": false
    }
  },
  {
    "id": "pro",
    "name": "专业版",
    "price": 29,
    "features": {
      "ai_requests": 5000,
      "templates": 100,
      "storage": 10737418240,
      "advanced_features": true
    }
  }
]', '定价方案', TRUE);

-- 插入系统模板数据（基于constants.ts中的数据）
INSERT INTO templates (id, title, description, content, prompt_content, input_format, output_format, stage, tech_stack, supports, app_type, is_system, is_public, status, tags, likes_count, usage_count) VALUES
-- 需求分析类模板
('req-1', 'PRD Generator', 'Converts a rough idea into a structured PRD.', 
'# Product Requirements Document\n\n## 1. Overview\n\n## 2. Goals', 
'Act as a Senior Product Manager and convert provided idea into a comprehensive Product Requirements Document.', 
'Feature idea description', 'Markdown PRD', 'requirements', 
array['General', 'Product'], 
array['User Stories', 'Acceptance Criteria'], 
'web_crud', TRUE, TRUE, 'approved', 
array['PRD', '产品需求', '产品管理'], 342, 1205),

('cn-req-1', 'PRD生成器', '将初步想法转化为带用户故事和验收标准的结构化产品需求文档。', 
'# [产品名称] 产品需求文档 (PRD)\n\n| 版本 | 日期 | 作者 | 变更描述 |\n|---|---|---|---|\n| v1.0 | 2023-10-27 | System | 初始版本 |\n\n## 1. 项目背景\n**目标：** 本项目旨在解决...', 
'作为高级产品经理，请根据以下想法撰写PRD：[想法描述]', 
'请提供：1. **产品名称** 2. **核心目标** 3. **目标用户** 4. **关键功能列表**', 'Markdown格式的PRD文档', 'requirements', 
array['General'], 
array['用户故事', '验收标准', '非功能需求'], 
'web_crud', TRUE, TRUE, 'approved', 
array['PRD', '需求分析', '中文'], 150, 800),

-- 系统设计类模板
('cn-arch-1', '微服务架构设计', '为复杂系统设计微服务拆分方案', 
'graph TD;\n  A[Client] --> B[Gateway];\n  B --> C[Auth Service];\n  B --> D[User Service];', 
'设计微服务架构，基于系统功能列表进行服务拆分，定义服务间的通信模式。', 
'系统功能列表', 'Mermaid类图/架构图描述', 'architecture', 
array['Backend'], 
array['服务拆分', '通信模式'], 
'microservice', TRUE, TRUE, 'approved', 
array['微服务', '架构设计', '系统设计'], 89, 450),

-- 开发类模板
('cn-dev-1', 'React+Tailwind组件生成', '生成现代化的React功能组件，包含Props定义和样式。', 
'export default function Button() {\n  return <button className=\"px-4 py-2 bg-blue-500 text-white\">Click</button>\n}', 
'使用React和Tailwind CSS编写组件，确保TypeScript类型安全和响应式设计。', 
'组件名称及功能描述', 'TSX代码', 'development', 
array['Frontend'], 
array['TSX', 'Hooks', 'Responsive'], 
'web_crud', TRUE, TRUE, 'approved', 
array['React', 'TypeScript', 'Tailwind', '组件'], 256, 1500),

('dev-1', 'React Component', 'Generates a functional React component.', 
'const Component = () => {\n  return <div>Hello</div>;\n}', 
'Write a React component with TypeScript and modern hooks.', 
'Specs', 'Code', 'development', 
array['Frontend'], 
array['TSX', 'Tailwind'], 
'web_crud', TRUE, TRUE, 'approved', 
array['React', 'Component'], 340, 2200),

-- QA类模板
('cn-qa-1', 'Jest单元测试生成', '为提供的代码生成全面的单元测试用例', 
'describe("Button", () => {\n  it("renders correctly", () => {\n    render(<Button />);\n  });\n});', 
'为以下代码编写Jest测试，包含边界条件、错误处理和覆盖率要求。', 
'源代码', '测试代码', 'qa', 
array['Testing'], 
array['Unit Test', 'Coverage'], 
'web_crud', TRUE, TRUE, 'approved', 
array['Jest', '测试', '单元测试'], 78, 320);

-- 插入系统提示词数据
INSERT INTO prompts (id, title, content, category, scenario, role, language, efficiency_score, is_system, is_public, status, tags, likes_count, usage_count) VALUES
('react-perf-1', 'React Performance Expert', 
'Analyze following React component for performance bottlenecks. Suggest useMemo, useCallback, or structural changes to minimize re-renders. \n\nComponent Code:\n[PASTE CODE HERE]', 
'Optimization', 'Optimizing a slow React component with many re-renders.', 'Frontend Dev', 'en', 92, TRUE, TRUE, 'approved', 
array['react', 'performance', 'hooks'], 45, 890),

('cn-1', 'React性能优化专家', 
'分析以下React组件的性能瓶颈。建议使用useMemo、useCallback或结构更改以最小化重渲染。\n\n组件代码：\n[在此粘贴代码]', 
'Optimization', '优化重渲染过多的React组件', 'Frontend Dev', 'zh', 92, TRUE, TRUE, 'approved', 
array['react', 'performance', 'hooks'], 32, 450);

-- 插入系统指南数据
INSERT INTO guides (id, title, content, category, tool_name, official_url, read_time, language, is_learning_path, estimated_duration, difficulty, prerequisites, learning_objectives, is_system, is_public, status, tags, usage_count) VALUES
('en-1', 'Getting Started with Cursor', 
'# Getting Started with Cursor\n\nCursor is an AI-first code editor built on VS Code.\n\n## Installation\n1. Go to [cursor.sh](https://cursor.sh)\n2. Download for your OS.\n3. Import VS Code extensions.\n\n## Key Features\n- **Cmd+K**: Edit code with AI.\n- **Cmd+L**: Chat with your codebase.', 
'AI Tools', 'Cursor', 'https://cursor.sh', 10, 'en', FALSE, NULL, 'beginner', 
array['Basic coding knowledge'], 
array['Learn Cursor features', 'Install and setup', 'Use AI coding features'], 
TRUE, TRUE, 'approved', 
array['Cursor', 'AI编辑器', '入门'], 320),

('cn-2', 'Cursor快速入门指南', 
'# Getting Started with Cursor\n\nCursor是一个AI优先的代码编辑器，基于VS Code构建。\n\n## 安装步骤\n1. 访问 [cursor.sh](https://cursor.sh)\n2. 下载对应操作系统的版本。\n3. 导入VS Code扩展。\n\n## 核心功能\n- **Cmd+K**: 使用AI编辑代码。\n- **Cmd+L**: 与代码库聊天。', 
'AI工具', 'Cursor', 'https://cursor.sh', 10, 'zh', FALSE, NULL, 'beginner', 
array['基础编程知识'], 
array['学习Cursor功能', '安装和设置', '使用AI编程功能'], 
TRUE, TRUE, 'approved', 
array['Cursor', 'AI编辑器', '入门'], 180);

-- 为演示用户插入订阅数据
INSERT INTO user_subscriptions (user_id, plan_id, status, current_period_start, current_period_end, usage_limits) VALUES
('00000000-0000-0000-0000-000000000003', 'free', 'active', NOW(), NOW() + interval '1 month', 
'{"ai_requests": 100, "templates": 5, "storage": 104857600}');

-- 插入一些演示数据
INSERT INTO bookmarks (user_id, resource_type, resource_id) VALUES
('00000000-0000-0000-0000-000000000003', 'template', 'req-1'),
('00000000-0000-0000-0000-000000000003', 'template', 'cn-dev-1'),
('00000000-0000-0000-0000-000000000003', 'prompt', 'react-perf-1');

INSERT INTO likes (user_id, resource_type, resource_id) VALUES
('00000000-0000-0000-0000-000000000003', 'template', 'cn-dev-1'),
('00000000-0000-0000-0000-000000000003', 'prompt', 'cn-1'),
('00000000-0000-0000-0000-000000000003', 'guide', 'cn-2');

-- 插入一些评论
INSERT INTO comments (user_id, resource_type, resource_id, content) VALUES
('00000000-0000-0000-0000-000000000003', 'template', 'cn-dev-1', '这个React组件生成模板非常实用！生成的代码质量很高，符合最佳实践。'),
('00000000-0000-0000-0000-000000000003', 'prompt', 'react-perf-1', '性能优化建议很专业，帮助我解决了组件重渲染的问题。');

-- 插入使用统计
INSERT INTO usage_statistics (user_id, date, metric_name, metric_value) VALUES
('00000000-0000-0000-0000-000000000003', CURRENT_DATE - interval '1 day', 'ai_requests', 15),
('00000000-0000-0000-0000-000000000003', CURRENT_DATE - interval '1 day', 'templates_viewed', 8),
('00000000-0000-0000-0000-000000000003', CURRENT_DATE - interval '1 day', 'tokens_used', 2500),
('00000000-0000-0000-0000-000000000003', CURRENT_DATE, 'ai_requests', 23),
('00000000-0000-0000-0000-000000000003', CURRENT_DATE, 'templates_viewed', 12),
('00000000-0000-0000-0000-000000000003', CURRENT_DATE, 'tokens_used', 3800);

-- 插入AI对话示例
INSERT INTO ai_conversations (id, user_id, title, model, context, total_tokens) VALUES
('conv-001', '00000000-0000-0000-0000-000000000003', 'React组件优化建议', 'gemini-2.5-flash', '{"language": "typescript", "framework": "react"}', 350);

INSERT INTO ai_messages (conversation_id, role, content, tokens, model) VALUES
('conv-001', 'user', '我的React组件在状态更新时重渲染太频繁，有什么优化建议吗？', 45, 'gemini-2.5-flash'),
('conv-001', 'assistant', '针对重渲染问题，我建议使用以下优化策略：1. 使用useMemo缓存计算结果 2. 使用useCallback缓存函数引用 3. 合理拆分组件 4. 使用React.memo进行浅比较...', 305, 'gemini-2.5-flash');

-- 插入代码生成示例
INSERT INTO code_generations (user_id, prompt, context, generated_code, language, framework, template_id, tokens_used, model) VALUES
('00000000-0000-0000-0000-000000000003', 
'创建一个带有搜索功能的用户选择器组件', 
'这是一个用户管理系统，使用TypeScript和Tailwind CSS', 
'import React, { useState, useMemo } from "react";\n\ninterface User {\n  id: string;\n  name: string;\n  email: string;\n}\n\ninterface UserSelectorProps {\n  users: User[];\n  onSelectionChange: (selectedUsers: User[]) => void;\n}\n\nexport default function UserSelector({ users, onSelectionChange }: UserSelectorProps) {\n  const [searchTerm, setSearchTerm] = useState("");\n  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);\n\n  const filteredUsers = useMemo(() => {\n    return users.filter(user => \n      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||\n      user.email.toLowerCase().includes(searchTerm.toLowerCase())\n    );\n  }, [users, searchTerm]);\n\n  // ... rest of component\n}', 
'typescript', 'react', 'cn-dev-1', 280, 'gemini-2.5-flash');

-- 插入代码分析示例
INSERT INTO code_analyses (user_id, code, language, overall_score, metrics, summary, tokens_used, model) VALUES
('00000000-0000-0000-0000-000000000003',
'import React, { useState } from "react";\n\nfunction Component({ data }) {\n  const [processed, setProcessed] = useState([]);\n  \n  useEffect(() => {\n    setProcessed(data.map(item => item.value * 2));\n  }, [data]);\n  \n  return <div>{processed.join(", ")}</div>;\n}',
'typescript', 75,
'{"readability": 80, "performance": 65, "maintainability": 85}',
'代码结构清晰，但存在性能优化空间。建议使用useMemo缓存计算结果，避免不必要的重新计算。',
150, 'gemini-2.5-flash');

-- ========================================
-- 输出种子数据完成信息
-- ========================================

DO $$
BEGIN
    RAISE NOTICE '=====================================';
    RAISE NOTICE 'Seed Data Inserted Successfully';
    RAISE NOTICE '=====================================';
    RAISE NOTICE 'Users created: 3 (system, admin, demo)';
    RAISE NOTICE 'Templates created: 6';
    RAISE NOTICE 'Prompts created: 2';
    RAISE NOTICE 'Guides created: 2';
    RAISE NOTICE 'Bookmarks created: 3';
    RAISE NOTICE 'Likes created: 3';
    RAISE NOTICE 'Comments created: 2';
    RAISE NOTICE 'Usage statistics created: 6';
    RAISE NOTICE 'AI conversations created: 1';
    RAISE NOTICE 'Code generations created: 1';
    RAISE NOTICE 'Code analyses created: 1';
    RAISE NOTICE '=====================================';
    RAISE NOTICE 'Demo user credentials:';
    RAISE NOTICE 'Email: demo@nexus-ai.com';
    RAISE NOTICE 'Password: demo123';
    RAISE NOTICE '=====================================';
END $$;