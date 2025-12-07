# 安装 Git 并连接 GitHub

## 第一步：安装 Git

### 下载 Git for Windows

1. 访问：https://git-scm.com/download/win
2. 点击下载（会自动下载最新版本）
3. 运行安装程序
4. **安装选项建议**：
   - 使用默认选项即可
   - 确保勾选 "Git from the command line and also from 3rd-party software"
   - 其他选项保持默认

### 验证安装

安装完成后，**关闭并重新打开 Cursor**，然后运行：

```powershell
git --version
```

如果显示版本号（如 `git version 2.xx.x`），说明安装成功。

## 第二步：配置 Git（首次使用）

```powershell
# 设置用户名（替换为你的名字）
git config --global user.name "你的名字"

# 设置邮箱（使用你的 GitHub 邮箱）
git config --global user.email "your.email@example.com"
```

## 第三步：在 GitHub 创建仓库

1. 访问 https://github.com/new
2. 登录你的 GitHub 账号（如果没有，先注册）
3. 填写信息：
   - Repository name: `lottery-system`
   - Description: `简易抽奖系统`
   - 选择 Public 或 Private
   - **不要**勾选 "Initialize this repository with a README"
4. 点击 "Create repository"

## 第四步：上传代码

在 Cursor 的终端中执行（替换 YOUR_USERNAME 为你的 GitHub 用户名）：

```powershell
# 进入项目目录
cd C:\Users\TT\lottery-system

# 初始化 Git 仓库
git init

# 添加所有文件
git add .

# 提交
git commit -m "Initial commit: 抽奖系统"

# 重命名分支为 main
git branch -M main

# 添加远程仓库（替换 YOUR_USERNAME）
git remote add origin https://github.com/YOUR_USERNAME/lottery-system.git

# 推送到 GitHub
git push -u origin main
```

**注意**：首次推送会要求输入 GitHub 用户名和密码（或 Personal Access Token）

## 如果遇到认证问题

GitHub 不再支持密码认证，需要使用 Personal Access Token：

1. 访问：https://github.com/settings/tokens
2. 点击 "Generate new token" → "Generate new token (classic)"
3. 设置名称：`railway-deploy`
4. 勾选 `repo` 权限
5. 点击 "Generate token"
6. **复制生成的 token**（只显示一次！）
7. 推送时，密码处输入这个 token

## 第五步：在 Railway 部署

1. 访问 https://railway.app/
2. 使用 GitHub 账号登录
3. 点击 "New Project"
4. 选择 "Deploy from GitHub repo"
5. 选择 `lottery-system` 仓库
6. 等待自动部署完成

## 完成！

现在你的代码已经在 GitHub 上，并且自动部署到 Railway 了！

每次更新代码后，只需：
```powershell
git add .
git commit -m "更新说明"
git push
```

Railway 会自动重新部署。


