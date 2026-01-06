#!/bin/bash
# VM初始化脚本 - 在GCE VM上运行此脚本

echo "=========================================="
echo "开始配置VM环境..."
echo "=========================================="

# 1. 更新系统
echo "步骤 1/6: 更新系统..."
sudo apt-get update
sudo apt-get upgrade -y

# 2. 安装Go 1.24.0
echo "步骤 2/6: 安装Go..."
cd ~
wget https://go.dev/dl/go1.24.0.linux-amd64.tar.gz
sudo rm -rf /usr/local/go
sudo tar -C /usr/local -xzf go1.24.0.linux-amd64.tar.gz
echo 'export PATH=$PATH:/usr/local/go/bin' >> ~/.bashrc
echo 'export GOPATH=$HOME/go' >> ~/.bashrc
source ~/.bashrc
go version

# 3. 安装Node.js和npm
echo "步骤 3/6: 安装Node.js..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
node --version
npm --version

# 4. 安装PostgreSQL
echo "步骤 4/6: 安装PostgreSQL..."
sudo apt-get install -y postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql

# 5. 安装Nginx
echo "步骤 5/6: 安装Nginx..."
sudo apt-get install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# 6. 安装Git
echo "步骤 6/6: 安装Git..."
sudo apt-get install -y git

echo "=========================================="
echo "VM环境配置完成！"
echo "=========================================="
echo "Go版本: $(go version)"
echo "Node版本: $(node --version)"
echo "npm版本: $(npm --version)"
echo "PostgreSQL状态: $(sudo systemctl is-active postgresql)"
echo "Nginx状态: $(sudo systemctl is-active nginx)"
