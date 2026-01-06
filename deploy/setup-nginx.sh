#!/bin/bash
# Nginx配置脚本

echo "=========================================="
echo "配置Nginx..."
echo "=========================================="

# 获取VM的外部IP
EXTERNAL_IP=$(curl -s http://metadata.google.internal/computeMetadata/v1/instance/network-interfaces/0/access-configs/0/external-ip -H "Metadata-Flavor: Google")

if [ -z "$EXTERNAL_IP" ]; then
    read -p "无法自动获取外部IP，请手动输入VM的外部IP或域名: " EXTERNAL_IP
fi

echo "服务器地址: $EXTERNAL_IP"

# 创建Nginx配置文件
sudo tee /etc/nginx/sites-available/secondhand > /dev/null << EOF
server {
    listen 80;
    server_name $EXTERNAL_IP;

    # 前端静态文件
    location / {
        root $HOME/SecondHandPlatform/second-hand-front/build;
        index index.html;
        try_files \$uri \$uri/ /index.html;
    }

    # 后端API代理
    location /api/ {
        proxy_pass http://localhost:8080/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

# 启用站点配置
sudo ln -sf /etc/nginx/sites-available/secondhand /etc/nginx/sites-enabled/

# 删除默认配置
sudo rm -f /etc/nginx/sites-enabled/default

# 测试Nginx配置
sudo nginx -t

if [ $? -eq 0 ]; then
    # 重启Nginx
    sudo systemctl reload nginx
    echo "=========================================="
    echo "Nginx配置完成！"
    echo "=========================================="
    echo "访问地址: http://$EXTERNAL_IP"
    echo ""
    echo "Nginx状态: $(sudo systemctl is-active nginx)"
else
    echo "Nginx配置测试失败，请检查配置文件！"
    exit 1
fi
