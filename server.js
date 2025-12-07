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
            probabilities: {},
            activities: [], // 抽奖活动列表
            lotteryHistory: [] // 抽奖历史记录
        };
        fs.writeFileSync(DATA_FILE, JSON.stringify(initialData, null, 2));
    } else {
        // 兼容旧数据，添加新字段
        const data = readData();
        if (!data.activities) data.activities = [];
        if (!data.lotteryHistory) data.lotteryHistory = [];
        saveData(data);
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
    const { probabilities, activityId } = req.body;
    
    // 验证概率总和
    const total = Object.values(probabilities).reduce((sum, val) => sum + (parseFloat(val) || 0), 0);
    if (Math.abs(total - 100) > 0.01) {
        return res.json({ success: false, message: `概率总和为 ${total.toFixed(2)}%，应该等于100%` });
    }
    
    const data = readData();
    
    // 如果指定了活动ID，保存到活动下的用户概率设置
    if (activityId) {
        if (!data.probabilities[activityId]) {
            data.probabilities[activityId] = {};
        }
        data.probabilities[activityId][username] = probabilities;
    } else {
        // 兼容旧版本，保存到全局
        data.probabilities[username] = probabilities;
    }
    
    saveData(data);
    
    res.json({ success: true });
});

// ========== 抽奖活动管理 API ==========

// 获取所有抽奖活动
app.get('/api/activities', (req, res) => {
    const data = readData();
    res.json(data.activities || []);
});

// 创建抽奖活动
app.post('/api/activities', (req, res) => {
    const { name, allowedUsers, maxDrawsPerUser } = req.body;
    
    if (!name || !name.trim()) {
        return res.json({ success: false, message: '活动名称不能为空' });
    }
    
    const data = readData();
    
    if (data.activities.find(a => a.name === name.trim())) {
        return res.json({ success: false, message: '活动名称已存在' });
    }
    
    const activity = {
        id: Date.now().toString(),
        name: name.trim(),
        allowedUsers: allowedUsers || [],
        maxDrawsPerUser: parseInt(maxDrawsPerUser) || 1,
        prizes: [], // 初始化空数组
        createdAt: new Date().toISOString()
    };
    
    data.activities.push(activity);
    saveData(data);
    
    res.json({ success: true, activity });
});

// 更新抽奖活动
app.put('/api/activities/:id', (req, res) => {
    const { id } = req.params;
    const { name, allowedUsers, maxDrawsPerUser, prizes } = req.body;
    
    const data = readData();
    const activityIndex = data.activities.findIndex(a => a.id === id);
    
    if (activityIndex === -1) {
        return res.json({ success: false, message: '活动不存在' });
    }
    
    const activity = data.activities[activityIndex];
    
    if (name && name.trim() && name.trim() !== activity.name) {
        // 检查新名称是否已存在
        if (data.activities.find(a => a.name === name.trim() && a.id !== id)) {
            return res.json({ success: false, message: '活动名称已存在' });
        }
        activity.name = name.trim();
    }
    
    if (allowedUsers !== undefined) {
        activity.allowedUsers = allowedUsers;
    }
    
    if (maxDrawsPerUser !== undefined) {
        activity.maxDrawsPerUser = parseInt(maxDrawsPerUser) || 1;
    }
    
    if (prizes !== undefined) {
        activity.prizes = prizes;
    }
    
    // 确保prizes数组存在
    if (!activity.prizes) {
        activity.prizes = [];
    }
    
    data.activities[activityIndex] = activity;
    saveData(data);
    
    res.json({ success: true, activity });
});

// 删除抽奖活动
app.delete('/api/activities/:id', (req, res) => {
    const { id } = req.params;
    const data = readData();
    
    const activityIndex = data.activities.findIndex(a => a.id === id);
    if (activityIndex === -1) {
        return res.json({ success: false, message: '活动不存在' });
    }
    
    data.activities.splice(activityIndex, 1);
    
    // 删除该活动的概率设置
    if (data.probabilities[id]) {
        delete data.probabilities[id];
    }
    
    saveData(data);
    res.json({ success: true });
});

// 获取活动的奖项列表
app.get('/api/activities/:id/prizes', (req, res) => {
    const { id } = req.params;
    const data = readData();
    const activity = data.activities.find(a => a.id === id);
    
    if (!activity) {
        return res.json({ success: false, message: '活动不存在' });
    }
    
    res.json(activity.prizes || []);
});

// 为活动创建奖项（直接在活动中创建，不依赖全局奖项）
app.post('/api/activities/:id/prizes', (req, res) => {
    const { id } = req.params;
    const { name, quantity } = req.body;
    
    if (!name || !quantity || quantity < 1) {
        return res.json({ success: false, message: '请输入有效的奖项名称和数量' });
    }
    
    const data = readData();
    const activity = data.activities.find(a => a.id === id);
    
    if (!activity) {
        return res.json({ success: false, message: '活动不存在' });
    }
    
    if (!activity.prizes) {
        activity.prizes = [];
    }
    
    // 检查该活动下是否已有同名奖项
    if (activity.prizes.find(p => p.name === name.trim())) {
        return res.json({ success: false, message: '该活动下奖项名称已存在' });
    }
    
    const prize = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        name: name.trim(),
        quantity: parseInt(quantity)
    };
    
    activity.prizes.push(prize);
    saveData(data);
    
    res.json({ success: true, prize });
});

// 从活动删除奖项
app.delete('/api/activities/:id/prizes/:prizeId', (req, res) => {
    const { id, prizeId } = req.params;
    const data = readData();
    const activity = data.activities.find(a => a.id === id);
    
    if (!activity) {
        return res.json({ success: false, message: '活动不存在' });
    }
    
    if (!activity.prizes) {
        activity.prizes = [];
    }
    
    const prizeIndex = activity.prizes.findIndex(p => p.id === prizeId);
    if (prizeIndex === -1) {
        return res.json({ success: false, message: '奖项不存在' });
    }
    
    activity.prizes.splice(prizeIndex, 1);
    
    // 删除该活动下所有用户中该奖项的概率设置
    if (data.probabilities[id]) {
        Object.keys(data.probabilities[id]).forEach(username => {
            if (data.probabilities[id][username] && data.probabilities[id][username][prizeId]) {
                delete data.probabilities[id][username][prizeId];
            }
        });
    }
    
    saveData(data);
    res.json({ success: true });
});

// 更新活动中的奖项
app.put('/api/activities/:id/prizes/:prizeId', (req, res) => {
    const { id, prizeId } = req.params;
    const { name, quantity } = req.body;
    
    const data = readData();
    const activity = data.activities.find(a => a.id === id);
    
    if (!activity) {
        return res.json({ success: false, message: '活动不存在' });
    }
    
    if (!activity.prizes) {
        activity.prizes = [];
    }
    
    const prizeIndex = activity.prizes.findIndex(p => p.id === prizeId);
    if (prizeIndex === -1) {
        return res.json({ success: false, message: '奖项不存在' });
    }
    
    const prize = activity.prizes[prizeIndex];
    
    if (name && name.trim() && name.trim() !== prize.name) {
        // 检查新名称是否已存在
        if (activity.prizes.find(p => p.name === name.trim() && p.id !== prizeId)) {
            return res.json({ success: false, message: '奖项名称已存在' });
        }
        prize.name = name.trim();
    }
    
    if (quantity !== undefined) {
        prize.quantity = parseInt(quantity) || 1;
    }
    
    activity.prizes[prizeIndex] = prize;
    saveData(data);
    
    res.json({ success: true, prize });
});

// 获取活动下用户的概率设置
app.get('/api/activities/:id/probabilities/:username', (req, res) => {
    const { id, username } = req.params;
    const data = readData();
    
    if (data.probabilities[id] && data.probabilities[id][username]) {
        res.json(data.probabilities[id][username]);
    } else {
        res.json({});
    }
});

// 保存活动下用户的概率设置
app.post('/api/activities/:id/probabilities/:username', (req, res) => {
    const { id, username } = req.params;
    const { probabilities } = req.body;
    
    // 验证概率总和
    const total = Object.values(probabilities).reduce((sum, val) => sum + (parseFloat(val) || 0), 0);
    if (Math.abs(total - 100) > 0.01) {
        return res.json({ success: false, message: `概率总和为 ${total.toFixed(2)}%，应该等于100%` });
    }
    
    const data = readData();
    
    if (!data.probabilities[id]) {
        data.probabilities[id] = {};
    }
    data.probabilities[id][username] = probabilities;
    
    saveData(data);
    res.json({ success: true });
});

// ========== 抽奖功能 API ==========

// 获取用户可参与的活动
app.get('/api/user/activities', (req, res) => {
    const username = req.query.username;
    if (!username) {
        return res.json({ success: false, message: '请提供用户名' });
    }
    
    const data = readData();
    const activities = data.activities.filter(activity => {
        // 如果没有限制用户，或者用户在允许列表中
        return activity.allowedUsers.length === 0 || activity.allowedUsers.includes(username);
    });
    
    res.json(activities);
});

// 获取用户在某活动的抽奖次数
app.get('/api/user/:username/activity/:activityId/draws', (req, res) => {
    const { username, activityId } = req.params;
    const data = readData();
    
    const history = data.lotteryHistory.filter(h => 
        h.username === username && h.activityId === activityId
    );
    
    res.json({ 
        count: history.length,
        maxDraws: 0 // 将在下面计算
    });
});

// 执行抽奖
app.post('/api/lottery/draw', (req, res) => {
    const { username, activityId } = req.body;
    
    if (!username || !activityId) {
        return res.json({ success: false, message: '参数不完整' });
    }
    
    const data = readData();
    
    // 检查活动是否存在
    const activity = data.activities.find(a => a.id === activityId);
    if (!activity) {
        return res.json({ success: false, message: '活动不存在' });
    }
    
    // 检查用户是否有权限
    if (activity.allowedUsers.length > 0 && !activity.allowedUsers.includes(username)) {
        return res.json({ success: false, message: '您没有权限参与此活动' });
    }
    
    // 检查用户抽奖次数
    const userHistory = data.lotteryHistory.filter(h => 
        h.username === username && h.activityId === activityId
    );
    
    if (userHistory.length >= activity.maxDrawsPerUser) {
        return res.json({ 
            success: false, 
            message: `您已达到最大抽奖次数（${activity.maxDrawsPerUser}次）` 
        });
    }
    
    // 获取该活动下的奖项和概率
    if (!activity.prizes || activity.prizes.length === 0) {
        return res.json({ success: false, message: '该活动没有配置奖项' });
    }
    
    const userProbabilities = data.probabilities[activityId] && 
                             data.probabilities[activityId][username] || {};
    
    // 如果没有设置概率，使用平均概率
    let probabilities = {};
    if (Object.keys(userProbabilities).length === 0) {
        const avgProb = 100 / activity.prizes.length;
        activity.prizes.forEach(prize => {
            probabilities[prize.id] = avgProb;
        });
    } else {
        probabilities = userProbabilities;
    }
    
    // 根据概率随机选择奖项
    const random = Math.random() * 100;
    let cumulative = 0;
    let selectedPrize = null;
    
    for (const prize of activity.prizes) {
        const prob = parseFloat(probabilities[prize.id]) || 0;
        cumulative += prob;
        if (random <= cumulative) {
            selectedPrize = prize;
            break;
        }
    }
    
    // 如果没选中（概率总和不足100），选择第一个
    if (!selectedPrize) {
        selectedPrize = activity.prizes[0];
    }
    
    // 记录抽奖历史
    const historyItem = {
        id: Date.now().toString(),
        username,
        activityId,
        activityName: activity.name,
        prizeId: selectedPrize.id,
        prizeName: selectedPrize.name,
        timestamp: new Date().toISOString()
    };
    
    data.lotteryHistory.push(historyItem);
    saveData(data);
    
    res.json({ 
        success: true, 
        prize: {
            id: selectedPrize.id,
            name: selectedPrize.name
        },
        remainingDraws: activity.maxDrawsPerUser - userHistory.length - 1
    });
});

// 获取用户的抽奖历史
app.get('/api/user/:username/history', (req, res) => {
    const { username } = req.params;
    const data = readData();
    
    const history = data.lotteryHistory
        .filter(h => h.username === username)
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    res.json(history);
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


