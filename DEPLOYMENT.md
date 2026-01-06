# 🚀 GCP部署完整指南

本指南将帮助你一步一步将SecondHand Platform部署到Google Cloud Platform。

## 📋 前提条件

- ✅ 已创建GCE VM实例
- ✅ 已创建GCS存储桶
- ✅ 已下载服务账号密钥文件（service_account_key.json）
- ✅ 本地代码已推送到GitHub

## 🔧 部署步骤

### 步骤1: 连接到VM

在本地电脑上，打开终端/PowerShell：

```bash
# 使用gcloud命令连接
gcloud compute ssh <your-vm-name> --zone=<your-zone>

# 或者在GCP Console中点击SSH按钮
```

### 步骤2: 克隆代码到VM

连接到VM后，执行：

```bash
cd ~
git clone https://github.com/yunbo2614/SecondHandPlatform.git
cd SecondHandPlatform
```

### 步骤3: 安装依赖软件

```bash
cd ~/SecondHandPlatform/deploy
chmod +x setup-vm.sh
./setup-vm.sh
```

这个脚本会安装：
- Go 1.24.0
- Node.js & npm
- PostgreSQL
- Nginx
- Git

**⏱️ 预计耗时：5-10分钟**

安装完成后，重新加载环境变量：
```bash
source ~/.bashrc
```

### 步骤4: 配置数据库

```bash
cd ~/SecondHandPlatform/deploy
chmod +x setup-database.sh
./setup-database.sh
```

**⚠️ 重要：请记住设置的数据库密码，稍后需要用到！**

### 步骤5: 配置后端环境变量

上传service_account_key.json文件到VM（在本地电脑执行）：

```bash
# 方法1: 使用gcloud scp
gcloud compute scp E:\laioffer\zhuanzhuan\backend\backend\service_account_key.json <your-vm-name>:~/SecondHandPlatform/backend/backend/ --zone=<your-zone>

# 方法2: 在VM上手动创建文件并粘贴内容
```

在VM上创建.env文件：

```bash
cd ~/SecondHandPlatform/backend/backend
cp .env.example .env
nano .env
```

修改以下配置：
```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=secondhanduser
DB_PASSWORD=你在步骤4设置的密码
DB_NAME=secondhand

JWT_SECRET=请生成一个随机长字符串
# 可以用这个命令生成: openssl rand -base64 32

GCS_BUCKET=你的GCS存储桶名称
GCS_PROJECT_ID=你的GCP项目ID
GOOGLE_APPLICATION_CREDENTIALS=/home/<你的用户名>/SecondHandPlatform/backend/backend/service_account_key.json

SERVER_PORT=8080
```

按 `Ctrl+X`，然后按 `Y`，最后按 `Enter` 保存。

### 步骤6: 部署后端

```bash
cd ~/SecondHandPlatform/deploy
chmod +x deploy-backend.sh
./deploy-backend.sh
```

检查后端是否运行：
```bash
sudo systemctl status secondhand-backend
# 或查看实时日志
sudo journalctl -u secondhand-backend -f
```

### 步骤7: 部署前端

```bash
cd ~/SecondHandPlatform/deploy
chmod +x deploy-frontend.sh
./deploy-frontend.sh
```

**⏱️ 预计耗时：3-5分钟（取决于npm安装速度）**

### 步骤8: 配置Nginx

```bash
cd ~/SecondHandPlatform/deploy
chmod +x setup-nginx.sh
./setup-nginx.sh
```

这个脚本会：
- 自动获取VM的外部IP
- 配置Nginx反向代理
- 启用网站配置

### 步骤9: 配置防火墙规则

**在GCP Console中：**

1. 进入 **VPC Network** → **Firewall**
2. 点击 **CREATE FIREWALL RULE**
3. 配置如下：
   - **Name**: allow-http
   - **Targets**: All instances in the network
   - **Source IP ranges**: 0.0.0.0/0
   - **Protocols and ports**: tcp:80

**或使用gcloud命令（在本地电脑执行）：**

```bash
gcloud compute firewall-rules create allow-http \
    --allow tcp:80 \
    --source-ranges 0.0.0.0/0 \
    --description "Allow HTTP traffic"
```

### 步骤10: 测试部署

在浏览器中访问：`http://<your-vm-external-ip>`

你应该能看到：
- ✅ 前端页面正常显示
- ✅ 可以注册新用户
- ✅ 可以登录
- ✅ 可以浏览商品
- ✅ 可以上传新商品

## 🔍 故障排查

### 检查后端服务
```bash
# 查看服务状态
sudo systemctl status secondhand-backend

# 查看日志
sudo journalctl -u secondhand-backend -f

# 重启服务
sudo systemctl restart secondhand-backend
```

### 检查Nginx
```bash
# 查看Nginx状态
sudo systemctl status nginx

# 测试配置
sudo nginx -t

# 查看错误日志
sudo tail -f /var/log/nginx/error.log

# 重启Nginx
sudo systemctl reload nginx
```

### 检查数据库连接
```bash
# 连接到PostgreSQL
sudo -u postgres psql

# 在psql中执行
\l                          # 列出所有数据库
\c secondhand              # 连接到secondhand数据库
\dt                        # 列出所有表
SELECT * FROM users;       # 查看用户表
\q                         # 退出
```

### 检查端口
```bash
# 检查8080端口（后端）
sudo netstat -tlnp | grep 8080

# 检查80端口（Nginx）
sudo netstat -tlnp | grep :80
```

## 🔄 更新部署

### 更新后端代码
```bash
cd ~/SecondHandPlatform
git pull
cd backend/backend
go build -o secondhand-server ./cmd/main.go
sudo systemctl restart secondhand-backend
```

### 更新前端代码
```bash
cd ~/SecondHandPlatform
git pull
cd second-hand-front
npm run build
sudo systemctl reload nginx
```

## 🔒 （可选）配置HTTPS

安装Let's Encrypt SSL证书：

```bash
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
sudo systemctl reload nginx
```

**注意：需要先配置域名的DNS记录指向VM的外部IP**

## 📞 常用命令速查

```bash
# 后端相关
sudo systemctl start secondhand-backend     # 启动
sudo systemctl stop secondhand-backend      # 停止
sudo systemctl restart secondhand-backend   # 重启
sudo systemctl status secondhand-backend    # 状态
sudo journalctl -u secondhand-backend -f    # 日志

# Nginx相关
sudo systemctl reload nginx                 # 重载配置
sudo nginx -t                              # 测试配置
sudo tail -f /var/log/nginx/access.log     # 访问日志
sudo tail -f /var/log/nginx/error.log      # 错误日志

# 数据库相关
sudo systemctl status postgresql           # 状态
sudo -u postgres psql                      # 连接数据库
```

## 🎉 部署完成！

恭喜！你的SecondHand Platform已经成功部署到GCP上了！

访问地址: `http://<your-vm-external-ip>`

如有问题，请查看日志或参考故障排查部分。
