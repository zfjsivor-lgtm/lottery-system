# Railway 快速部署指南（5分钟上手）

## 最简单的方法

### 第一步：上传到 GitHub

1. 访问 https://github.com/new 创建新仓库
2. 在项目目录执行：

```bash
cd C:\Users\TT\lottery-system
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/你的用户名/仓库名.git
git push -u origin main
```

### 第二步：部署到 Railway

1. 访问 https://railway.app/ 并登录（使用 GitHub 账号）
2. 点击 "New Project"
3. 选择 "Deploy from GitHub repo"
4. 选择你的仓库
5. 等待自动部署完成（1-3分钟）
6. 点击生成的域名访问网站

## 完成！

现在你的网站已经可以在公网访问了！

**管理员账号**：`admin` / `123123`

---

详细说明请查看 `RAILWAY_DEPLOY.md`


