# 简易抽奖系统

一个基于 Node.js + Express 的简易抽奖管理系统，支持多用户共享数据。

## 功能特点

1. **管理员登录**
   - 账号：admin
   - 密码：123123

2. **用户管理**
   - 管理员可以创建可参与抽奖的用户账号
   - 可以查看和删除用户

3. **奖项管理**
   - 管理员可以设置奖项名称和奖项数量
   - 可以查看和删除奖项

4. **概率设置**
   - 管理员可以为每个用户设置不同奖项的中奖概率
   - 概率总和必须等于100%

## 快速开始

### 1. 安装依赖
```bash
npm install
```

### 2. 启动服务器
```bash
npm start
```

### 3. 访问网站
在浏览器中打开：http://localhost:3000

## 技术栈

- **后端**：Node.js + Express
- **前端**：原生 HTML/CSS/JavaScript
- **数据存储**：JSON 文件（data.json）

## 部署到公网

详细部署说明请查看 [DEPLOY.md](./DEPLOY.md)

### 快速部署选项：

1. **云服务器**（推荐）
   - 阿里云、腾讯云等
   - 使用 PM2 保持进程运行

2. **免费托管平台**
   - Railway（推荐）
   - Render
   - Heroku

3. **内网穿透**（临时测试）
   - ngrok
   - frp

## 项目结构

```
lottery-system/
├── index.html          # 登录页面
├── admin.html          # 管理后台
├── style.css           # 样式文件
├── script.js           # 登录逻辑
├── admin.js            # 管理后台逻辑
├── server.js           # 后端服务器
├── package.json        # 项目配置
├── data.json           # 数据文件（自动生成）
├── README.md           # 说明文档
└── DEPLOY.md           # 部署指南
```

## API 接口

- `POST /api/login` - 用户登录
- `GET /api/users` - 获取用户列表
- `POST /api/users` - 创建用户
- `DELETE /api/users/:username` - 删除用户
- `GET /api/prizes` - 获取奖项列表
- `POST /api/prizes` - 创建奖项
- `DELETE /api/prizes/:id` - 删除奖项
- `GET /api/probabilities/:username` - 获取用户概率设置
- `POST /api/probabilities/:username` - 保存用户概率设置

## 注意事项

- 数据存储在服务器的 `data.json` 文件中
- 建议定期备份 `data.json` 文件
- 生产环境建议修改管理员密码
- 建议配置 HTTPS 以提高安全性

