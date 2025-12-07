// API基础URL
const API_BASE = '';

// 检查登录状态
function checkUserLogin() {
    const currentUser = sessionStorage.getItem('currentUser');
    const isAdmin = sessionStorage.getItem('isAdmin');
    
    if (isAdmin === 'true' || !currentUser) {
        window.location.href = 'index.html';
        return false;
    }
    return currentUser;
}

// 初始化
const currentUser = checkUserLogin();
if (!currentUser) {
    // 如果未登录，会跳转到登录页
} else {
    initLottery();
}

let currentActivity = null;
let isDrawing = false;

function initLottery() {
    // 显示当前用户
    document.getElementById('currentUser').textContent = `用户：${currentUser}`;
    
    // 退出登录
    document.getElementById('logoutBtn').addEventListener('click', function() {
        sessionStorage.removeItem('isAdmin');
        sessionStorage.removeItem('currentUser');
        window.location.href = 'index.html';
    });
    
    // 加载活动列表
    loadActivities();
    
    // 活动选择变化
    document.getElementById('activitySelect').addEventListener('change', function() {
        const activityId = this.value;
        if (activityId) {
            loadActivity(activityId);
        } else {
            resetLottery();
        }
    });
    
    // 抽奖按钮
    document.getElementById('drawButton').addEventListener('click', function() {
        if (!isDrawing && currentActivity) {
            performDraw();
        }
    });
    
    // 加载抽奖历史
    loadHistory();
}

// 加载活动列表
async function loadActivities() {
    try {
        const response = await fetch(`${API_BASE}/api/user/activities?username=${currentUser}`);
        const activities = await response.json();
        
        const select = document.getElementById('activitySelect');
        select.innerHTML = '<option value="">请选择活动...</option>';
        
        activities.forEach(activity => {
            const option = document.createElement('option');
            option.value = activity.id;
            option.textContent = activity.name;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('加载活动列表失败:', error);
        alert('加载活动列表失败，请刷新页面重试');
    }
}

// 加载活动详情
async function loadActivity(activityId) {
    try {
        const response = await fetch(`${API_BASE}/api/activities`);
        const activities = await response.json();
        currentActivity = activities.find(a => a.id === activityId);
        
        if (!currentActivity) {
            alert('活动不存在');
            return;
        }
        
        // 加载奖项列表
        await loadPrizes(activityId);
        
        // 加载抽奖次数信息
        await loadDrawsInfo(activityId);
        
        // 启用抽奖按钮
        document.getElementById('drawButton').disabled = false;
    } catch (error) {
        console.error('加载活动失败:', error);
        alert('加载活动失败，请重试');
    }
}

// 加载奖项列表
async function loadPrizes(activityId) {
    try {
        const response = await fetch(`${API_BASE}/api/activities/${activityId}/prizes`);
        const prizes = await response.json();
        
        const prizeList = document.getElementById('prizeList');
        prizeList.innerHTML = '';
        
        if (prizes.length === 0) {
            prizeList.innerHTML = '<p style="color: white; font-size: 18px;">该活动暂无奖项</p>';
            return;
        }
        
        prizes.forEach(prize => {
            const prizeItem = document.createElement('div');
            prizeItem.className = 'prize-item';
            prizeItem.id = `prize-${prize.id}`;
            prizeItem.innerHTML = `<h3>${prize.name}</h3>`;
            prizeList.appendChild(prizeItem);
        });
    } catch (error) {
        console.error('加载奖项失败:', error);
    }
}

// 加载抽奖次数信息
async function loadDrawsInfo(activityId) {
    try {
        const response = await fetch(`${API_BASE}/api/user/${currentUser}/activity/${activityId}/draws`);
        const data = await response.json();
        
        const history = await fetch(`${API_BASE}/api/user/${currentUser}/history`).then(r => r.json());
        const activityHistory = history.filter(h => h.activityId === activityId);
        const usedDraws = activityHistory.length;
        const remaining = currentActivity.maxDrawsPerUser - usedDraws;
        
        document.getElementById('remainingDraws').textContent = remaining;
        document.getElementById('maxDraws').textContent = currentActivity.maxDrawsPerUser;
        document.getElementById('drawsInfo').style.display = 'block';
        
        if (remaining <= 0) {
            document.getElementById('drawButton').disabled = true;
            document.getElementById('drawButton').textContent = '抽奖次数已用完';
        }
    } catch (error) {
        console.error('加载抽奖次数失败:', error);
    }
}

// 执行抽奖
async function performDraw() {
    if (!currentActivity) return;
    
    isDrawing = true;
    const drawButton = document.getElementById('drawButton');
    drawButton.disabled = true;
    drawButton.textContent = '抽奖中...';
    
    const resultMessage = document.getElementById('resultMessage');
    resultMessage.classList.remove('show');
    
    // 获取奖项列表
    const prizeItems = document.querySelectorAll('.prize-item');
    if (prizeItems.length === 0) {
        alert('该活动没有奖项');
        isDrawing = false;
        drawButton.disabled = false;
        drawButton.textContent = '开始抽奖';
        return;
    }
    
    // 随机跳动10次
    let currentIndex = 0;
    const jumpCount = 10;
    const jumpInterval = 100; // 每次跳动间隔100ms
    
    // 清除之前的选中状态
    prizeItems.forEach(item => {
        item.classList.remove('active', 'selected');
    });
    
    // 跳动动画
    for (let i = 0; i < jumpCount; i++) {
        await new Promise(resolve => setTimeout(resolve, jumpInterval));
        
        // 移除之前的active
        prizeItems.forEach(item => item.classList.remove('active'));
        
        // 随机选择一个奖项高亮
        currentIndex = Math.floor(Math.random() * prizeItems.length);
        prizeItems[currentIndex].classList.add('active');
    }
    
    // 发送抽奖请求
    try {
        const response = await fetch(`${API_BASE}/api/lottery/draw`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: currentUser,
                activityId: currentActivity.id
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            // 显示中奖结果
            prizeItems.forEach(item => item.classList.remove('active'));
            const selectedItem = document.getElementById(`prize-${result.prize.id}`);
            if (selectedItem) {
                selectedItem.classList.add('selected');
                
                // 滚动到选中项
                selectedItem.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            
            // 显示结果消息
            resultMessage.textContent = `🎉 恭喜您抽中：${result.prize.name}！`;
            resultMessage.classList.add('show');
            
            // 更新抽奖次数
            await loadDrawsInfo(currentActivity.id);
            
            // 刷新历史记录
            loadHistory();
        } else {
            alert(result.message || '抽奖失败，请重试');
            prizeItems.forEach(item => item.classList.remove('active', 'selected'));
        }
    } catch (error) {
        console.error('抽奖失败:', error);
        alert('网络错误，请重试');
        prizeItems.forEach(item => item.classList.remove('active', 'selected'));
    }
    
    isDrawing = false;
    drawButton.textContent = '开始抽奖';
    
    // 检查是否还有剩余次数
    const remaining = parseInt(document.getElementById('remainingDraws').textContent);
    if (remaining > 0) {
        drawButton.disabled = false;
    } else {
        drawButton.disabled = true;
        drawButton.textContent = '抽奖次数已用完';
    }
}

// 加载抽奖历史
async function loadHistory() {
    try {
        const response = await fetch(`${API_BASE}/api/user/${currentUser}/history`);
        const history = await response.json();
        
        const tbody = document.getElementById('historyTableBody');
        tbody.innerHTML = '';
        
        if (history.length === 0) {
            tbody.innerHTML = '<tr><td colspan="3" style="text-align: center; color: #999;">暂无抽奖记录</td></tr>';
            return;
        }
        
        history.forEach(item => {
            const tr = document.createElement('tr');
            const date = new Date(item.timestamp);
            const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
            
            tr.innerHTML = `
                <td>${dateStr}</td>
                <td>${item.activityName}</td>
                <td><strong style="color: #28a745;">${item.prizeName}</strong></td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error('加载历史记录失败:', error);
    }
}

// 重置抽奖界面
function resetLottery() {
    currentActivity = null;
    document.getElementById('prizeList').innerHTML = '<p style="color: white; font-size: 18px;">请先选择抽奖活动</p>';
    document.getElementById('drawButton').disabled = true;
    document.getElementById('drawsInfo').style.display = 'none';
    document.getElementById('resultMessage').classList.remove('show');
}

