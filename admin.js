// API基础URL
const API_BASE = '';

// 检查登录状态
function checkAdminLogin() {
    const isAdmin = sessionStorage.getItem('isAdmin');
    if (isAdmin !== 'true') {
        window.location.href = 'index.html';
        return false;
    }
    return true;
}

// 初始化
if (!checkAdminLogin()) {
    // 如果未登录，会跳转到登录页
} else {
    initAdmin();
}

function initAdmin() {
    // 退出登录
    document.getElementById('logoutBtn').addEventListener('click', function() {
        sessionStorage.removeItem('isAdmin');
        sessionStorage.removeItem('currentUser');
        window.location.href = 'index.html';
    });
    
    // 加载数据
    loadUsers();
    loadPrizes();
    loadUserSelect();
    
    // 创建用户
    document.getElementById('createUserBtn').addEventListener('click', async function() {
        const username = document.getElementById('newUsername').value.trim();
        const password = document.getElementById('newPassword').value.trim();
        
        if (!username || !password) {
            alert('请输入用户名和密码！');
            return;
        }
        
        try {
            const response = await fetch(`${API_BASE}/api/users`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });
            
            const result = await response.json();
            
            if (result.success) {
                document.getElementById('newUsername').value = '';
                document.getElementById('newPassword').value = '';
                loadUsers();
                loadUserSelect();
                alert('用户创建成功！');
            } else {
                alert(result.message || '创建失败');
            }
        } catch (error) {
            alert('网络错误，请重试');
        }
    });
    
    // 创建奖项
    document.getElementById('createPrizeBtn').addEventListener('click', async function() {
        const prizeName = document.getElementById('prizeName').value.trim();
        const prizeQuantity = parseInt(document.getElementById('prizeQuantity').value);
        
        if (!prizeName || !prizeQuantity || prizeQuantity < 1) {
            alert('请输入有效的奖项名称和数量！');
            return;
        }
        
        try {
            const response = await fetch(`${API_BASE}/api/prizes`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name: prizeName, quantity: prizeQuantity })
            });
            
            const result = await response.json();
            
            if (result.success) {
                document.getElementById('prizeName').value = '';
                document.getElementById('prizeQuantity').value = '';
                loadPrizes();
                loadProbabilitySettings();
                alert('奖项创建成功！');
            } else {
                alert(result.message || '创建失败');
            }
        } catch (error) {
            alert('网络错误，请重试');
        }
    });
    
    // 用户选择变化时加载概率设置
    document.getElementById('selectUser').addEventListener('change', function() {
        loadProbabilitySettings();
    });
}

// 加载用户列表
async function loadUsers() {
    try {
        const response = await fetch(`${API_BASE}/api/users`);
        const users = await response.json();
        const tbody = document.getElementById('usersTableBody');
        
        tbody.innerHTML = '';
        
        if (users.length === 0) {
            tbody.innerHTML = '<tr><td colspan="2" style="text-align: center; color: #999;">暂无用户</td></tr>';
            return;
        }
        
        users.forEach((user, index) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${user.username}</td>
                <td>
                    <button class="btn btn-danger" onclick="deleteUser('${user.username}')">删除</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error('加载用户失败:', error);
    }
}

// 删除用户
async function deleteUser(username) {
    if (!confirm('确定要删除这个用户吗？')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/api/users/${username}`, {
            method: 'DELETE'
        });
        
        const result = await response.json();
        
        if (result.success) {
            loadUsers();
            loadUserSelect();
            loadProbabilitySettings();
            alert('删除成功');
        } else {
            alert(result.message || '删除失败');
        }
    } catch (error) {
        alert('网络错误，请重试');
    }
}

// 加载奖项列表
async function loadPrizes() {
    try {
        const response = await fetch(`${API_BASE}/api/prizes`);
        const prizes = await response.json();
        const tbody = document.getElementById('prizesTableBody');
        
        tbody.innerHTML = '';
        
        if (prizes.length === 0) {
            tbody.innerHTML = '<tr><td colspan="3" style="text-align: center; color: #999;">暂无奖项</td></tr>';
            return;
        }
        
        prizes.forEach((prize) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${prize.name}</td>
                <td>${prize.quantity}</td>
                <td>
                    <button class="btn btn-danger" onclick="deletePrize('${prize.id}')">删除</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error('加载奖项失败:', error);
    }
}

// 删除奖项
async function deletePrize(id) {
    if (!confirm('确定要删除这个奖项吗？')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/api/prizes/${id}`, {
            method: 'DELETE'
        });
        
        const result = await response.json();
        
        if (result.success) {
            loadPrizes();
            loadProbabilitySettings();
            alert('删除成功');
        } else {
            alert(result.message || '删除失败');
        }
    } catch (error) {
        alert('网络错误，请重试');
    }
}

// 加载用户选择下拉框
async function loadUserSelect() {
    try {
        const response = await fetch(`${API_BASE}/api/users`);
        const users = await response.json();
        const select = document.getElementById('selectUser');
        
        select.innerHTML = '<option value="">请选择用户</option>';
        
        users.forEach(user => {
            const option = document.createElement('option');
            option.value = user.username;
            option.textContent = user.username;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('加载用户列表失败:', error);
    }
}

// 加载概率设置
async function loadProbabilitySettings() {
    const selectedUser = document.getElementById('selectUser').value;
    const settingsDiv = document.getElementById('probabilitySettings');
    
    if (!selectedUser) {
        settingsDiv.innerHTML = '<p>请先选择用户</p>';
        return;
    }
    
    try {
        const [prizesResponse, probResponse] = await Promise.all([
            fetch(`${API_BASE}/api/prizes`),
            fetch(`${API_BASE}/api/probabilities/${selectedUser}`)
        ]);
        
        const prizes = await prizesResponse.json();
        const userProbabilities = await probResponse.json();
        
        if (prizes.length === 0) {
            settingsDiv.innerHTML = '<p>请先创建奖项</p>';
            return;
        }
        
        let html = '<h3>设置中奖概率（百分比，总和应为100%）</h3>';
        
        prizes.forEach(prize => {
            const currentProb = userProbabilities[prize.id] || 0;
            html += `
                <div class="probability-item">
                    <label>${prize.name}:</label>
                    <input type="number" 
                           min="0" 
                           max="100" 
                           step="0.01" 
                           value="${currentProb}" 
                           data-prize-id="${prize.id}"
                           onchange="updateProbability('${selectedUser}', '${prize.id}', this.value)">
                    <span>%</span>
                </div>
            `;
        });
        
        html += '<button class="btn btn-primary" onclick="saveProbabilities(\'' + selectedUser + '\')" style="margin-top: 15px;">保存概率设置</button>';
        
        settingsDiv.innerHTML = html;
    } catch (error) {
        console.error('加载概率设置失败:', error);
        settingsDiv.innerHTML = '<p>加载失败，请重试</p>';
    }
}

// 更新概率（临时存储，不保存到服务器）
let tempProbabilities = {};

function updateProbability(username, prizeId, value) {
    if (!tempProbabilities[username]) {
        tempProbabilities[username] = {};
    }
    tempProbabilities[username][prizeId] = parseFloat(value) || 0;
}

// 保存概率设置
async function saveProbabilities(username) {
    // 获取当前显示的概率值
    const inputs = document.querySelectorAll(`#probabilitySettings input[data-prize-id]`);
    const probabilities = {};
    
    inputs.forEach(input => {
        const prizeId = input.getAttribute('data-prize-id');
        probabilities[prizeId] = parseFloat(input.value) || 0;
    });
    
    // 计算总和
    const total = Object.values(probabilities).reduce((sum, val) => sum + val, 0);
    
    if (Math.abs(total - 100) > 0.01) {
        alert(`概率总和为 ${total.toFixed(2)}%，应该等于100%！`);
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/api/probabilities/${username}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ probabilities })
        });
        
        const result = await response.json();
        
        if (result.success) {
            alert('概率设置保存成功！');
        } else {
            alert(result.message || '保存失败');
        }
    } catch (error) {
        alert('网络错误，请重试');
    }
}
