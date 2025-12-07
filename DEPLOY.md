# 部署指南

## 本地运行

1. 安装 Node.js（如果还没有安装）
   - 访问 https://nodejs.org/ 下载并安装

2. 安装依赖
   ```bash
   cd C:\Users\TT\lottery-system
   npm install
   ```

3. 启动服务器
   ```bash
   npm start
   ```

4. 在浏览器中访问
   - http://localhost:3000

## 部署到公网

### 方案一：使用云服务器（推荐）

#### 1. 购买云服务器
- 阿里云、腾讯云、华为云等
- 推荐配置：1核2G内存，1M带宽（约50-100元/月）

#### 2. 在服务器上部署

**Windows 服务器：**
```powershell
# 1. 安装 Node.js
# 下载并安装 Node.js

# 2. 上传项目文件到服务器

# 3. 安装依赖
npm install

# 4. 启动服务器（使用 PM2 保持运行）
npm install -g pm2
pm2 start server.js --name lottery-system
pm2 save
pm2 startup
```

**Linux 服务器：**
```bash
# 1. 安装 Node.js
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# 2. 上传项目文件（使用 scp 或 FTP）
scp -r lottery-system user@your-server-ip:/home/user/

# 3. 安装依赖
cd /home/user/lottery-system
npm install

# 4. 安装 PM2（进程管理器）
sudo npm install -g pm2

# 5. 启动服务器
pm2 start server.js --name lottery-system
pm2 save
pm2 startup
```

#### 3. 配置防火墙
- 开放 3000 端口（或你设置的端口）
- 在云服务器控制台配置安全组规则

#### 4. 访问网站
- 通过服务器公网IP访问：http://your-server-ip:3000

### 方案二：使用免费托管平台

#### 1. Railway（推荐，免费额度）
- 访问 https://railway.app/
- 注册账号并连接 GitHub
- 创建新项目，选择从 GitHub 导入
- 设置启动命令：`npm start`
- 自动部署并获取公网地址

#### 2. Render
- 访问 https://render.com/
- 注册账号
- 创建 Web Service
- 连接 GitHub 仓库或直接部署
- 设置启动命令：`npm start`

#### 3. Heroku（需要信用卡验证）
- 访问 https://www.heroku.com/
- 安装 Heroku CLI
- 登录并创建应用
- 部署代码

### 方案三：使用内网穿透（临时测试）

#### 使用 ngrok
```bash
# 1. 下载 ngrok：https://ngrok.com/
# 2. 注册并获取 token
# 3. 配置 token
ngrok config add-authtoken YOUR_TOKEN

# 4. 启动本地服务器
npm start

# 5. 在另一个终端启动 ngrok
ngrok http 3000

# 6. 使用 ngrok 提供的公网地址访问
```

#### 使用 frp
- 需要一台有公网IP的服务器
- 配置 frp 客户端和服务器
- 将本地 3000 端口映射到公网

## 使用域名（可选）

1. 购买域名（如：阿里云、腾讯云）
2. 配置 DNS 解析，将域名指向服务器IP
3. 使用 Nginx 反向代理（可选，更专业）

### Nginx 配置示例
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 注意事项

1. **数据备份**：定期备份 `data.json` 文件
2. **安全性**：
   - 修改管理员密码（在 server.js 中）
   - 考虑添加 HTTPS（使用 Let's Encrypt 免费证书）
   - 限制访问频率（防止暴力破解）
3. **性能优化**：
   - 使用 PM2 保持进程运行
   - 配置自动重启
   - 监控服务器资源使用

## 快速部署脚本（Linux）

创建 `deploy.sh`：
```bash
#!/bin/bash
echo "开始部署..."

# 安装 Node.js（如果没有）
if ! command -v node &> /dev/null; then
    echo "安装 Node.js..."
    curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
    sudo yum install -y nodejs
fi

# 安装依赖
npm install

# 安装 PM2
sudo npm install -g pm2

# 停止旧进程
pm2 stop lottery-system 2>/dev/null || true
pm2 delete lottery-system 2>/dev/null || true

# 启动新进程
pm2 start server.js --name lottery-system
pm2 save

echo "部署完成！"
echo "查看状态: pm2 status"
echo "查看日志: pm2 logs lottery-system"
```

运行：`chmod +x deploy.sh && ./deploy.sh`


