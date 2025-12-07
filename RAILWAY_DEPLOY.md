# Railway 部署指南

## 准备工作

### 1. 注册 Railway 账号
- 访问 https://railway.app/
- 点击 "Start a New Project" 或 "Login"
- 使用 GitHub 账号登录（推荐）或邮箱注册

### 2. 准备 GitHub 仓库（推荐方式）

#### 方式一：使用 GitHub（推荐）

1. **在 GitHub 上创建新仓库**
   - 访问 https://github.com/new
   - 仓库名称：`lottery-system`（或任意名称）
   - 选择 Public 或 Private
   - 不要初始化 README（因为已有文件）

2. **上传代码到 GitHub**
   ```bash
   # 在项目目录下执行
   cd C:\Users\TT\lottery-system
   
   # 初始化 Git（如果还没有）
   git init
   
   # 添加所有文件
   git add .
   
   # 提交
   git commit -m "Initial commit"
   
   # 添加远程仓库（替换 YOUR_USERNAME 和 YOUR_REPO）
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
   
   # 推送代码
   git branch -M main
   git push -u origin main
   ```

#### 方式二：直接上传（不使用 Git）

Railway 也支持直接上传 ZIP 文件，但使用 GitHub 更方便后续更新。

## 部署步骤

### 方法一：从 GitHub 部署（推荐）

1. **登录 Railway**
   - 访问 https://railway.app/
   - 登录你的账号

2. **创建新项目**
   - 点击 "New Project"
   - 选择 "Deploy from GitHub repo"
   - 授权 Railway 访问你的 GitHub 账号（如果首次使用）
   - 选择你刚创建的 `lottery-system` 仓库

3. **自动部署**
   - Railway 会自动检测到 Node.js 项目
   - 自动运行 `npm install` 安装依赖
   - 自动运行 `npm start` 启动服务器
   - 等待部署完成（通常 1-3 分钟）

4. **获取公网地址**
   - 部署完成后，Railway 会自动生成一个公网地址
   - 格式类似：`https://lottery-system-production.up.railway.app`
   - 点击 "Settings" → "Generate Domain" 可以生成自定义域名

### 方法二：使用 Railway CLI

1. **安装 Railway CLI**
   ```bash
   npm install -g @railway/cli
   ```

2. **登录**
   ```bash
   railway login
   ```

3. **初始化项目**
   ```bash
   cd C:\Users\TT\lottery-system
   railway init
   ```

4. **部署**
   ```bash
   railway up
   ```

5. **获取域名**
   ```bash
   railway domain
   ```

## 配置说明

### 环境变量（可选）

Railway 会自动设置 `PORT` 环境变量，无需手动配置。

如果需要自定义配置，可以在 Railway Dashboard 中：
1. 进入项目
2. 点击 "Variables"
3. 添加环境变量

### 端口配置

项目已自动适配 Railway：
- `server.js` 使用 `process.env.PORT || 3000`
- Railway 会自动设置 `PORT` 环境变量

## 访问网站

部署完成后：

1. **查看部署状态**
   - 在 Railway Dashboard 中查看 "Deployments"
   - 绿色表示部署成功

2. **获取访问地址**
   - 在项目页面点击 "Settings"
   - 找到 "Domains" 部分
   - 复制提供的 URL（格式：`https://xxx.up.railway.app`）

3. **访问网站**
   - 在浏览器中打开提供的 URL
   - 使用管理员账号登录：`admin` / `123123`

## 更新代码

### 使用 GitHub 部署时：

1. **修改代码**
   ```bash
   # 修改文件后
   git add .
   git commit -m "更新说明"
   git push
   ```

2. **自动部署**
   - Railway 会自动检测到 GitHub 的更新
   - 自动重新部署（通常 1-3 分钟）

### 使用 CLI 部署时：

```bash
railway up
```

## 查看日志

1. **在 Railway Dashboard**
   - 进入项目
   - 点击 "Deployments"
   - 选择最新的部署
   - 查看 "Logs"

2. **使用 CLI**
   ```bash
   railway logs
   ```

## 数据持久化

⚠️ **重要提示**：

Railway 的免费套餐中，文件系统是**临时**的。如果服务重启，`data.json` 文件可能会丢失。

### 解决方案：

1. **使用 Railway 的持久化存储**（推荐）
   - 在 Railway Dashboard 中
   - 添加 "Volume" 服务
   - 将数据目录挂载到 Volume

2. **使用外部数据库**（生产环境推荐）
   - MongoDB Atlas（免费）
   - PostgreSQL（Railway 提供）
   - 修改代码使用数据库而不是 JSON 文件

3. **定期备份**
   - 定期下载 `data.json` 文件
   - 或使用 Railway 的备份功能

## 常见问题

### 1. 部署失败
- 检查 `package.json` 是否正确
- 查看部署日志中的错误信息
- 确保所有依赖都已列出

### 2. 无法访问网站
- 检查服务是否正在运行
- 查看日志是否有错误
- 确认域名已正确配置

### 3. 数据丢失
- 使用 Volume 持久化存储
- 或迁移到数据库

### 4. 端口错误
- Railway 会自动设置 PORT，无需手动配置
- 确保代码使用 `process.env.PORT`

## 免费额度

Railway 免费套餐包括：
- $5 免费额度/月
- 足够运行一个小型应用
- 超出后需要付费

## 下一步

部署成功后，你可以：
1. 分享公网地址给用户使用
2. 配置自定义域名（在 Settings → Domains）
3. 设置 HTTPS（Railway 自动提供）
4. 监控使用情况（在 Dashboard 查看）

## 技术支持

- Railway 文档：https://docs.railway.app/
- Railway Discord：https://discord.gg/railway


