#!/bin/bash
# 快速部署脚本 - 一键完成所有部署步骤

echo "========================================"
echo "  SecondHand Platform 一键部署脚本"
echo "========================================"
echo ""

# 检查是否在VM上
if [ ! -d "$HOME/SecondHandPlatform" ]; then
    echo "错误: 未找到项目目录，请先克隆代码："
    echo "git clone https://github.com/yunbo2614/SecondHandPlatform.git"
    exit 1
fi

cd ~/SecondHandPlatform/deploy

echo "步骤 1/5: 设置VM环境..."
read -p "是否需要安装依赖软件？(y/n) " install_deps
if [ "$install_deps" = "y" ]; then
    ./setup-vm.sh
    source ~/.bashrc
fi

echo ""
echo "步骤 2/5: 配置数据库..."
read -p "是否需要配置PostgreSQL？(y/n) " setup_db
if [ "$setup_db" = "y" ]; then
    ./setup-database.sh
fi

echo ""
echo "步骤 3/5: 检查后端配置..."
if [ ! -f ~/SecondHandPlatform/backend/backend/.env ]; then
    echo "⚠️  未找到.env文件！"
    echo "请执行以下步骤："
    echo "1. cd ~/SecondHandPlatform/backend/backend"
    echo "2. cp .env.example .env"
    echo "3. nano .env  # 编辑配置文件"
    echo ""
    read -p "配置完成后按Enter继续..."
fi

echo ""
echo "步骤 4/5: 部署后端..."
./deploy-backend.sh

echo ""
echo "步骤 5/5: 部署前端..."
./deploy-frontend.sh

echo ""
echo "步骤 6/6: 配置Nginx..."
./setup-nginx.sh

echo ""
echo "========================================"
echo "  🎉 部署完成！"
echo "========================================"
echo ""
echo "下一步："
echo "1. 在GCP Console配置防火墙规则（允许tcp:80）"
echo "2. 访问 http://$(curl -s http://metadata.google.internal/computeMetadata/v1/instance/network-interfaces/0/access-configs/0/external-ip -H 'Metadata-Flavor: Google')"
echo ""
echo "常用命令："
echo "- 查看后端日志: sudo journalctl -u secondhand-backend -f"
echo "- 重启后端: sudo systemctl restart secondhand-backend"
echo "- 查看Nginx日志: sudo tail -f /var/log/nginx/error.log"
