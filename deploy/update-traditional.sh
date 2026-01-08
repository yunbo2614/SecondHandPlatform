#!/bin/bash
# 传统方式更新部署脚本（不使用Docker）

echo "=========================================="
echo "更新应用到GCP服务器（传统部署）"
echo "=========================================="

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 进入项目目录
cd ~/SecondHandPlatform || { echo -e "${RED}错误: 项目目录不存在${NC}"; exit 1; }

echo -e "${YELLOW}1. 拉取最新代码...${NC}"
git pull origin main
if [ $? -ne 0 ]; then
    echo -e "${RED}错误: 代码拉取失败${NC}"
    exit 1
fi
echo -e "${GREEN}✓ 代码更新成功${NC}"

echo ""
echo -e "${YELLOW}2. 更新后端...${NC}"

# 停止后端服务
echo "停止后端服务..."
sudo systemctl stop secondhand-backend

# 进入后端目录
cd ~/SecondHandPlatform/backend/backend

# 下载依赖
echo "更新Go依赖..."
go mod download

# 编译新版本
echo "编译新版本..."
go build -o secondhand-server ./cmd/main.go

if [ $? -ne 0 ]; then
    echo -e "${RED}错误: 编译失败！${NC}"
    echo "尝试回滚..."
    sudo systemctl start secondhand-backend
    exit 1
fi
echo -e "${GREEN}✓ 后端编译成功${NC}"

# 重启后端服务
echo "启动后端服务..."
sudo systemctl start secondhand-backend

# 检查服务状态
sleep 3
if sudo systemctl is-active --quiet secondhand-backend; then
    echo -e "${GREEN}✓ 后端服务运行正常${NC}"
else
    echo -e "${RED}错误: 后端服务启动失败${NC}"
    sudo journalctl -u secondhand-backend -n 50
    exit 1
fi

echo ""
echo -e "${YELLOW}3. 更新前端...${NC}"

# 进入前端目录
cd ~/SecondHandPlatform/second-hand-front

# 安装/更新依赖
echo "更新npm依赖..."
npm install

# 构建新版本
echo "构建前端..."
npm run build

if [ $? -ne 0 ]; then
    echo -e "${RED}错误: 前端构建失败${NC}"
    exit 1
fi
echo -e "${GREEN}✓ 前端构建成功${NC}"

# 重启Nginx
echo "重启Nginx..."
sudo systemctl restart nginx

if sudo systemctl is-active --quiet nginx; then
    echo -e "${GREEN}✓ Nginx运行正常${NC}"
else
    echo -e "${RED}错误: Nginx启动失败${NC}"
    exit 1
fi

echo ""
echo "=========================================="
echo -e "${GREEN}✓ 更新部署完成！${NC}"
echo "=========================================="
echo ""
echo "服务状态："
echo "  后端: $(sudo systemctl is-active secondhand-backend)"
echo "  Nginx: $(sudo systemctl is-active nginx)"
echo ""
echo "有用的命令："
echo "  查看后端日志: sudo journalctl -u secondhand-backend -f"
echo "  查看Nginx日志: sudo tail -f /var/log/nginx/error.log"
echo "  重启后端: sudo systemctl restart secondhand-backend"
echo "  重启Nginx: sudo systemctl restart nginx"
echo ""
