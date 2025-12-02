#!/bin/bash

# 数据库重置脚本
# 使用方法: ./reset.sh

set -e

echo "警告: 此操作将完全重置数据库，删除所有数据！"
echo "数据库将被清空并重新初始化。"
echo

# 确认重置操作
read -p "您确定要重置数据库吗？这将删除所有数据！(y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "数据库重置已取消。"
    exit 0
fi

# 二次确认
read -p "请再次确认 - 您确定要删除所有数据吗？(y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "数据库重置已取消。"
    exit 0
fi

echo "开始重置数据库..."

if command -v docker-compose &> /dev/null && [ -f "./docker-compose.yml" ]; then
    echo "使用Docker Compose重置数据库..."
    
    # 停止PostgreSQL容器
    echo "停止PostgreSQL容器..."
    docker-compose stop postgres
    
    # 删除数据卷
    echo "删除数据卷..."
    docker volume rm nexus-ai-postgres_data 2>/dev/null || true
    
    # 重新启动容器
    echo "重新启动容器..."
    docker-compose up -d postgres
    
    # 等待容器启动
    echo "等待数据库启动..."
    sleep 30
    
    # 检查容器状态
    if docker-compose ps postgres | grep -q "Up"; then
        echo "数据库容器启动成功！"
    else
        echo "错误: 数据库容器启动失败！"
        docker-compose logs postgres
        exit 1
    fi
    
    # 等待数据库就绪
    echo "等待数据库就绪..."
    for i in {1..30}; do
        if docker-compose exec -T postgres pg_isready -U nexus_app -d nexus_ai_platform &>/dev/null; then
            echo "数据库已就绪！"
            break
        fi
        echo "等待数据库启动... ($i/30)"
        sleep 2
    done
    
else
    echo "使用本地PostgreSQL重置数据库..."
    
    # 删除数据库
    echo "删除现有数据库..."
    dropdb nexus_ai_platform 2>/dev/null || true
    
    # 创建新数据库
    echo "创建新数据库..."
    createdb nexus_ai_platform
    
    # 执行初始化脚本
    echo "执行初始化脚本..."
    psql -d nexus_ai_platform -f init.sql
    
    # 执行种子数据脚本
    echo "导入种子数据..."
    psql -d nexus_ai_platform -f seed.sql
fi

echo "数据库重置完成！"

# 显示演示账号信息
echo
echo "====================================="
echo "演示账号信息:"
echo "邮箱: demo@nexus-ai.com"
echo "密码: demo123"
echo
echo "管理员账号:"
echo "邮箱: admin@nexus-ai.com"
echo "密码: admin123"
echo "====================================="