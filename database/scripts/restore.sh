#!/bin/bash

# 数据库恢复脚本
# 使用方法: ./restore.sh backup_file [database_name] [user] [host] [port]

set -e

if [ -z "$1" ]; then
    echo "错误: 请指定备份文件"
    echo "使用方法: ./restore.sh backup_file.sql.gz [database_name] [user] [host] [port]"
    exit 1
fi

BACKUP_FILE=$1
DB_NAME=${2:-nexus_ai_platform}
DB_USER=${3:-nexus_app}
DB_HOST=${4:-localhost}
DB_PORT=${5:-5432}

# 检查备份文件是否存在
if [ ! -f "$BACKUP_FILE" ]; then
    echo "错误: 备份文件不存在: $BACKUP_FILE"
    exit 1
fi

echo "开始恢复数据库..."
echo "备份文件: $BACKUP_FILE"
echo "数据库: $DB_NAME"
echo "用户: $DB_USER"
echo "主机: $DB_HOST"
echo "端口: $DB_PORT"

# 解压备份文件（如果是压缩的）
TEMP_FILE="$BACKUP_FILE"
if [[ $BACKUP_FILE == *.gz ]]; then
    TEMP_FILE=$(mktemp)
    echo "解压备份文件..."
    gunzip -c "$BACKUP_FILE" > "$TEMP_FILE"
fi

# 确认恢复操作
read -p "警告: 此操作将清空现有数据库并恢复备份。是否继续？(y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "恢复操作已取消。"
    [ "$TEMP_FILE" != "$BACKUP_FILE" ] && rm -f "$TEMP_FILE"
    exit 0
fi

# 执行恢复
if command -v docker-compose &> /dev/null && [ -f "./docker-compose.yml" ]; then
    # 使用docker-compose
    echo "使用Docker Compose进行恢复..."
    
    # 停止应用连接
    echo "清空现有数据库..."
    docker-compose exec -T postgres psql -U $DB_USER -d $DB_NAME -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
    
    # 恢复数据
    echo "恢复数据..."
    docker-compose exec -T postgres psql -U $DB_USER -d $DB_NAME < "$TEMP_FILE"
else
    # 使用本地PostgreSQL
    echo "使用本地PostgreSQL进行恢复..."
    
    # 清空现有数据库
    echo "清空现有数据库..."
    PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
    
    # 恢复数据
    echo "恢复数据..."
    PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME < "$TEMP_FILE"
fi

# 清理临时文件
[ "$TEMP_FILE" != "$BACKUP_FILE" ] && rm -f "$TEMP_FILE"

echo "数据库恢复完成！"

# 验证恢复结果
echo "验证恢复结果..."
if command -v docker-compose &> /dev/null && [ -f "./docker-compose.yml" ]; then
    TABLE_COUNT=$(docker-compose exec -T postgres psql -U $DB_USER -d $DB_NAME -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" | tr -d ' ')
else
    TABLE_COUNT=$(PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" | tr -d ' ')
fi

echo "恢复的表数量: $TABLE_COUNT"

if [ "$TABLE_COUNT" -gt "0" ]; then
    echo "数据库恢复成功！"
else
    echo "警告: 数据库恢复可能存在问题，请检查。"
fi

echo "恢复脚本执行完毕。"