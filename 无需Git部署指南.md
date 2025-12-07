# 无需 Git 的 Railway 部署方法

## 方法一：使用 Railway CLI（推荐）

### 1. 安装 Railway CLI

```powershell
# 使用 npm 安装（需要先安装 Node.js）
npm install -g @railway/cli
```

### 2. 登录 Railway

```powershell
railway login
```
这会打开浏览器，使用 GitHub 账号登录。

### 3. 初始化并部署

```powershell
# 进入项目目录
cd C:\Users\TT\lottery-system

# 初始化 Railway 项目
railway init

# 部署项目
railway up
```

### 4. 获取访问地址

```powershell
railway domain
```

## 方法二：使用 GitHub Desktop（图形界面）

### 1. 安装 GitHub Desktop

- 下载：https://desktop.github.com/
- 安装并登录你的 GitHub 账号

### 2. 创建仓库

1. 打开 GitHub Desktop
2. 点击 "File" → "New Repository"
3. 名称：`lottery-system`
4. Local Path：选择 `C:\Users\TT\lottery-system`
5. 点击 "Create Repository"

### 3. 提交并推送

1. 在 GitHub Desktop 中，所有文件会显示为 "Changes"
2. 在左下角输入提交信息：`Initial commit`
3. 点击 "Commit to main"
4. 点击 "Publish repository" 推送到 GitHub

### 4. 在 Railway 中部署

1. 访问 https://railway.app/
2. 点击 "New Project"
3. 选择 "Deploy from GitHub repo"
4. 选择刚创建的仓库

## 方法三：安装 Git 命令行工具

### 1. 下载 Git

- 访问：https://git-scm.com/download/win
- 下载并安装（使用默认选项即可）

### 2. 安装后重新打开终端

安装完成后，关闭并重新打开 PowerShell 或 Cursor。

### 3. 使用 Git 命令

```powershell
cd C:\Users\TT\lottery-system
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/你的用户名/仓库名.git
git push -u origin main
```

## 方法四：直接上传 ZIP 文件（最简单但功能有限）

### 1. 压缩项目文件

1. 在 `C:\Users\TT\lottery-system` 目录
2. 选择所有文件（除了 `node_modules` 和 `data.json`）
3. 右键 → "发送到" → "压缩(zipped)文件夹"
4. 命名为 `lottery-system.zip`

### 2. 在 Railway 中上传

1. 访问 https://railway.app/
2. 点击 "New Project"
3. 选择 "Empty Project"
4. 在项目设置中上传 ZIP 文件
5. Railway 会自动解压并部署

⚠️ **注意**：这种方法每次更新都需要重新上传 ZIP 文件，不如 Git 方便。

## 推荐方案

**最佳选择**：安装 Git 或使用 GitHub Desktop

- Git 命令行：适合熟悉命令行的用户
- GitHub Desktop：图形界面，更简单易用
- Railway CLI：不需要 GitHub，直接部署

## 快速检查

运行以下命令检查是否已安装：

```powershell
# 检查 Git
git --version

# 检查 Node.js（Railway CLI 需要）
node --version

# 检查 npm
npm --version
```


