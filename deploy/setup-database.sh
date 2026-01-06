#!/bin/bash
# 数据库初始化脚本

echo "=========================================="
echo "配置PostgreSQL数据库..."
echo "=========================================="

# 提示用户输入密码
read -p "请输入数据库密码（或按Enter使用默认密码'SecurePass123!'）: " DB_PASSWORD
DB_PASSWORD=${DB_PASSWORD:-SecurePass123!}

# 创建数据库和用户
sudo -u postgres psql << EOF
CREATE DATABASE secondhand;
CREATE USER secondhanduser WITH PASSWORD '$DB_PASSWORD';
GRANT ALL PRIVILEGES ON DATABASE secondhand TO secondhanduser;
\c secondhand
GRANT ALL ON SCHEMA public TO secondhanduser;
\q
EOF

echo "数据库配置完成！"
echo "数据库名: secondhand"
echo "用户名: secondhanduser"
echo "密码: $DB_PASSWORD"
echo ""
echo "请记住这个密码，稍后配置.env文件时需要使用！"
