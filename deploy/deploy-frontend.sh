#!/bin/bash
# 前端部署脚本

echo "=========================================="
echo "部署前端应用..."
echo "=========================================="

# 获取VM的外部IP
EXTERNAL_IP=$(curl -s http://metadata.google.internal/computeMetadata/v1/instance/network-interfaces/0/access-configs/0/external-ip -H "Metadata-Flavor: Google")

if [ -z "$EXTERNAL_IP" ]; then
    read -p "无法自动获取外部IP，请手动输入VM的外部IP: " EXTERNAL_IP
fi

echo "VM外部IP: $EXTERNAL_IP"

# 进入前端目录
cd ~/SecondHandPlatform/second-hand-front

# 更新constants.js中的API URL
echo "更新API配置..."
cat > src/constants.js << EOF
// API配置
export const BASE_URL = '/api';

// Token存储key
export const TOKEN_KEY = 'token';

// 是否使用Mock数据
export const USE_MOCK = false;
EOF

# 安装依赖
echo "安装npm依赖..."
npm install

# 构建生产版本
echo "构建生产版本..."
npm run build

if [ $? -ne 0 ]; then
    echo "构建失败！"
    exit 1
fi

echo "=========================================="
echo "前端构建完成！"
echo "=========================================="
echo "构建输出目录: $HOME/SecondHandPlatform/second-hand-front/build"
echo ""
echo "下一步: 配置Nginx"
