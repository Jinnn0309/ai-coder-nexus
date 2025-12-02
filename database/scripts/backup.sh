#!/bin/bash

# 数据库备份脚本
# 使用方法: ./backup.sh [database_name] [user] [host] [port]

set -e

# 默认参数
DB_NAME=${1:-nexus_ai_platform}
DB_USER=${2:-nexus_app}
DB_HOST=${3:-localhost}
DB_PORT=${4:-5432}
BACKUP_DIR="./backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/nexus_ai_backup_${TIMESTAMP}.sql"

# 创建备份目录
mkdir -p $BACKUP_DIR

echo "开始备份数据库..."
echo "数据库: $DB_NAME"
echo "用户: $DB_USER"
echo "主机: $DB_HOST"
echo "端口: $DB_PORT"
echo "备份文件: $BACKUP_FILE"

# 执行备份
if command -v docker-compose &> /dev/null && [ -f "./docker-compose.yml" ]; then
    # 使用docker-compose
    echo "使用Docker Compose进行备份..."
    docker-compose exec -T postgres pg_dump -U $DB_USER -d $DB_NAME > $BACKUP_FILE
else
    # 使用本地PostgreSQL
    echo "使用本地PostgreSQL进行备份..."
    PGPASSWORD=$DB_PASSWORD pg_dump -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME > $BACKUP_FILE
fi

# 压缩备份文件
echo "压缩备份文件..."
gzip $BACKUP_FILE
BACKUP_FILE="${BACKUP_FILE}.gz"

# 验证备份文件
if [ -f "$BACKUP_FILE" ] && [ -s "$BACKUP_FILE" ]; then
    FILE_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
    echo "备份成功！"
    echo "备份文件: $BACKUP_FILE"
    echo "文件大小: $FILE_SIZE"
    
    # 清理7天前的备份文件
    echo "清理旧备份文件..."
    find $BACKUP_DIR -name "nexus_ai_backup_*.sql.gz" -mtime +7 -delete
    echo "清理完成。"
else
    echo "备份失败！"
    exit 1
fi

echo "备份脚本执行完毕。"