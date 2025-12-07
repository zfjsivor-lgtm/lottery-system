const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(express.json());
app.use(express.static(__dirname));

// 数据文件路径
const DATA_FILE = path.join(__dirname, 'data.json');

// 初始化数据文件
function initDataFile() {
    if (!fs.existsSync(DATA_FILE)) {
        const initialData = {
            users: [],
            prizes: [],
            probabilities: {}
        };
        fs.writeFileSync(DATA_FILE, JSON.stringify(initialData, null, 2));
    }
}

// 读取数据
function readData() {
    try {
        const data = fs.readFileSync(DATA_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return { users: [], prizes: [], probabilities: {} };
    }
}

// 保存数据
function saveData(data) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// 初始化
initDataFile();

// 登录接口
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    
    // 管理员账号
    if (username === 'admin' && password === '123123') {
        return res.json({ success: true, isAdmin: true });
    }
    
    // 普通用户
    const data = readData();
    const user = data.users.find(u => u.username === username && u.password === password);
    
    if (user) {
        res.json({ success: true, isAdmin: false });
    } else {
        res.json({ success: false, message: '用户名或密码错误' });
    }
});

// 获取所有用户
app.get('/api/users', (req, res) => {
    const data = readData();
    // 不返回密码
    const users = data.users.map(u => ({ username: u.username }));
    res.json(users);
});

// 创建用户
app.post('/api/users', (req, res) => {
    const { username, password } = req.body;
    
    if (!username || !password) {
        return res.json({ success: false, message: '用户名和密码不能为空' });
    }
    
    const data = readData();
    
    if (data.users.find(u => u.username === username)) {
        return res.json({ success: false, message: '用户名已存在' });
    }
    
    data.users.push({ username, password });
    saveData(data);
    
    res.json({ success: true });
});

// 删除用户
app.delete('/api/users/:username', (req, res) => {
    const { username } = req.params;
    const data = readData();
    
    data.users = data.users.filter(u => u.username !== username);
    
    // 删除该用户的概率设置
    if (data.probabilities[username]) {
        delete data.probabilities[username];
    }
    
    saveData(data);
    res.json({ success: true });
});

// 获取所有奖项
app.get('/api/prizes', (req, res) => {
    const data = readData();
    res.json(data.prizes);
});

// 创建奖项
app.post('/api/prizes', (req, res) => {
    const { name, quantity } = req.body;
    
    if (!name || !quantity || quantity < 1) {
        return res.json({ success: false, message: '请输入有效的奖项名称和数量' });
    }
    
    const data = readData();
    
    if (data.prizes.find(p => p.name === name)) {
        return res.json({ success: false, message: '奖项名称已存在' });
    }
    
    const prize = {
        id: Date.now().toString(),
        name,
        quantity: parseInt(quantity)
    };
    
    data.prizes.push(prize);
    saveData(data);
    
    res.json({ success: true, prize });
});

// 删除奖项
app.delete('/api/prizes/:id', (req, res) => {
    const { id } = req.params;
    const data = readData();
    
    const prizeIndex = data.prizes.findIndex(p => p.id === id);
    if (prizeIndex === -1) {
        return res.json({ success: false, message: '奖项不存在' });
    }
    
    data.prizes.splice(prizeIndex, 1);
    
    // 删除所有用户中该奖项的概率设置
    Object.keys(data.probabilities).forEach(username => {
        if (data.probabilities[username][id]) {
            delete data.probabilities[username][id];
        }
    });
    
    saveData(data);
    res.json({ success: true });
});

// 获取用户的概率设置
app.get('/api/probabilities/:username', (req, res) => {
    const { username } = req.params;
    const data = readData();
    res.json(data.probabilities[username] || {});
});

// 保存用户的概率设置
app.post('/api/probabilities/:username', (req, res) => {
    const { username } = req.params;
    const { probabilities } = req.body;
    
    // 验证概率总和
    const total = Object.values(probabilities).reduce((sum, val) => sum + (parseFloat(val) || 0), 0);
    if (Math.abs(total - 100) > 0.01) {
        return res.json({ success: false, message: `概率总和为 ${total.toFixed(2)}%，应该等于100%` });
    }
    
    const data = readData();
    data.probabilities[username] = probabilities;
    saveData(data);
    
    res.json({ success: true });
});

// 启动服务器
app.listen(PORT, () => {
    console.log(`========================================`);
    console.log(`服务器运行在 http://localhost:${PORT}`);
    console.log(`请在浏览器中打开 http://localhost:${PORT}`);
    console.log(`========================================`);
}).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`错误: 端口 ${PORT} 已被占用，请关闭占用该端口的程序或使用其他端口`);
    } else {
        console.error(`服务器启动失败:`, err);
    }
    process.exit(1);
});


