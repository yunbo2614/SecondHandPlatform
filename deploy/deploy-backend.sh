#!/bin/bash
# 后端部署脚本

echo "=========================================="
echo "部署后端应用..."
echo "=========================================="

# 进入后端目录
cd ~/SecondHandPlatform/backend/backend

# 检查.env文件
if [ ! -f .env ]; then
    echo "错误: 未找到.env文件，请先创建.env文件！"
    echo "可以复制.env.example并修改配置"
    exit 1
fi

# 下载依赖
echo "下载Go依赖..."
go mod download

# 编译应用
echo "编译应用..."
go build -o secondhand-server ./cmd/main.go

if [ $? -ne 0 ]; then
    echo "编译失败！"
    exit 1
fi

echo "编译成功！"

# 创建systemd服务文件
echo "创建systemd服务..."
sudo tee /etc/systemd/system/secondhand-backend.service > /dev/null << EOF
[Unit]
Description=SecondHand Platform Backend
After=network.target postgresql.service

[Service]
Type=simple
User=$USER
WorkingDirectory=$HOME/SecondHandPlatform/backend/backend
ExecStart=$HOME/SecondHandPlatform/backend/backend/secondhand-server
Restart=on-failure
RestartSec=5s
EnvironmentFile=$HOME/SecondHandPlatform/backend/backend/.env

[Install]
WantedBy=multi-user.target
EOF

# 重新加载systemd并启动服务
sudo systemctl daemon-reload
sudo systemctl enable secondhand-backend
sudo systemctl start secondhand-backend

echo "=========================================="
echo "后端部署完成！"
echo "=========================================="
echo "服务状态: $(sudo systemctl is-active secondhand-backend)"
echo ""
echo "查看日志: sudo journalctl -u secondhand-backend -f"
echo "重启服务: sudo systemctl restart secondhand-backend"
echo "停止服务: sudo systemctl stop secondhand-backend"
