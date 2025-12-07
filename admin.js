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
    loadUserSelect();
    loadActivities();
    loadActivitySelect();
    loadActivitySelectForProb();
    
    // 活动选择变化
    document.getElementById('selectActivity').addEventListener('change', function() {
        const activityId = this.value;
        if (activityId) {
            loadActivityPrizes(activityId);
        } else {
            document.getElementById('activityPrizesContent').innerHTML = '<p>请先选择活动</p>';
        }
    });
    
    // 活动概率选择变化
    document.getElementById('selectActivityForProb').addEventListener('change', function() {
        loadProbabilitySettings();
    });
    
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
    
    
    // 用户选择变化时加载概率设置
    document.getElementById('selectUser').addEventListener('change', function() {
        loadProbabilitySettings();
    });
    
    // 创建活动
    document.getElementById('createActivityBtn').addEventListener('click', async function() {
        const name = document.getElementById('activityName').value.trim();
        const maxDraws = parseInt(document.getElementById('activityMaxDraws').value) || 1;
        const selectedUsers = Array.from(document.getElementById('activityUsers').selectedOptions).map(opt => opt.value);
        
        if (!name) {
            alert('请输入活动名称！');
            return;
        }
        
        try {
            const response = await fetch(`${API_BASE}/api/activities`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name,
                    maxDrawsPerUser: maxDraws,
                    allowedUsers: selectedUsers
                })
            });
            
            const result = await response.json();
            
            if (result.success) {
                document.getElementById('activityName').value = '';
                document.getElementById('activityMaxDraws').value = '1';
                document.getElementById('activityUsers').selectedIndex = -1;
                loadActivities();
                loadActivitySelect();
                loadActivitySelectForProb();
                alert('活动创建成功！');
            } else {
                alert(result.message || '创建失败');
            }
        } catch (error) {
            alert('网络错误，请重试');
        }
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


// 加载用户选择下拉框
async function loadUserSelect() {
    try {
        const response = await fetch(`${API_BASE}/api/users`);
        const users = await response.json();
        const select = document.getElementById('selectUser');
        const activityUsersSelect = document.getElementById('activityUsers');
        
        select.innerHTML = '<option value="">请选择用户</option>';
        activityUsersSelect.innerHTML = '';
        
        users.forEach(user => {
            const option = document.createElement('option');
            option.value = user.username;
            option.textContent = user.username;
            select.appendChild(option);
            
            const activityOption = option.cloneNode(true);
            activityUsersSelect.appendChild(activityOption);
        });
    } catch (error) {
        console.error('加载用户列表失败:', error);
    }
}

// 加载活动列表
async function loadActivities() {
    try {
        const response = await fetch(`${API_BASE}/api/activities`);
        const activities = await response.json();
        const tbody = document.getElementById('activitiesTableBody');
        
        tbody.innerHTML = '';
        
        if (activities.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; color: #999;">暂无活动</td></tr>';
            return;
        }
        
        activities.forEach(activity => {
            const tr = document.createElement('tr');
            const allowedUsersText = activity.allowedUsers.length === 0 
                ? '所有用户' 
                : activity.allowedUsers.join(', ');
            
            tr.innerHTML = `
                <td>${activity.name}</td>
                <td>${activity.maxDrawsPerUser}</td>
                <td>${allowedUsersText}</td>
                <td>
                    <button class="btn btn-danger" onclick="deleteActivity('${activity.id}')">删除</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error('加载活动列表失败:', error);
    }
}

// 删除活动
async function deleteActivity(id) {
    if (!confirm('确定要删除这个活动吗？删除后该活动的所有数据将无法恢复！')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/api/activities/${id}`, {
            method: 'DELETE'
        });
        
        const result = await response.json();
        
        if (result.success) {
            loadActivities();
            loadActivitySelect();
            loadActivitySelectForProb();
            document.getElementById('selectActivity').value = '';
            document.getElementById('activityPrizesContent').innerHTML = '<p>请先选择活动</p>';
            alert('删除成功');
        } else {
            alert(result.message || '删除失败');
        }
    } catch (error) {
        alert('网络错误，请重试');
    }
}

// 加载活动选择下拉框（用于奖项配置）
async function loadActivitySelect() {
    try {
        const response = await fetch(`${API_BASE}/api/activities`);
        const activities = await response.json();
        const select = document.getElementById('selectActivity');
        
        select.innerHTML = '<option value="">请选择活动</option>';
        
        activities.forEach(activity => {
            const option = document.createElement('option');
            option.value = activity.id;
            option.textContent = activity.name;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('加载活动列表失败:', error);
    }
}

// 加载活动选择下拉框（用于概率设置）
async function loadActivitySelectForProb() {
    try {
        const response = await fetch(`${API_BASE}/api/activities`);
        const activities = await response.json();
        const select = document.getElementById('selectActivityForProb');
        
        select.innerHTML = '<option value="">请选择活动</option>';
        
        activities.forEach(activity => {
            const option = document.createElement('option');
            option.value = activity.id;
            option.textContent = activity.name;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('加载活动列表失败:', error);
    }
}

// 加载活动奖项
async function loadActivityPrizes(activityId) {
    try {
        const [activitiesResponse, activityPrizesResponse] = await Promise.all([
            fetch(`${API_BASE}/api/activities`),
            fetch(`${API_BASE}/api/activities/${activityId}/prizes`)
        ]);
        
        const activities = await activitiesResponse.json();
        const activityPrizes = await activityPrizesResponse.json();
        const activity = activities.find(a => a.id === activityId);
        
        if (!activity) {
            return;
        }
        
        const contentDiv = document.getElementById('activityPrizesContent');
        
        let html = `
            <div style="margin-bottom: 20px;">
                <h3>活动：${activity.name}</h3>
                <p>最大抽奖次数：${activity.maxDrawsPerUser}</p>
            </div>
            <div style="margin-bottom: 20px; padding: 20px; background: #f8f9fa; border-radius: 5px;">
                <h4>添加新奖项</h4>
                <div class="form-group" style="margin-bottom: 10px;">
                    <label for="newPrizeName">奖项名称</label>
                    <input type="text" id="newPrizeName" placeholder="例如：一等奖" style="width: 300px;">
                </div>
                <div class="form-group" style="margin-bottom: 10px;">
                    <label for="newPrizeQuantity">奖项数量</label>
                    <input type="number" id="newPrizeQuantity" placeholder="数量" min="1" value="1" style="width: 300px;">
                </div>
                <button class="btn btn-primary" onclick="createPrizeForActivity('${activityId}')" style="width: auto;">创建奖项</button>
            </div>
            <div>
                <h4>活动中的奖项</h4>
                <table style="width: 100%; margin-top: 15px;">
                    <thead>
                        <tr>
                            <th>奖项名称</th>
                            <th>数量</th>
                            <th>操作</th>
                        </tr>
                    </thead>
                    <tbody id="activityPrizesTableBody">
        `;
        
        if (activityPrizes.length === 0) {
            html += '<tr><td colspan="3" style="text-align: center; color: #999;">暂无奖项，请添加奖项</td></tr>';
        } else {
            activityPrizes.forEach(prize => {
                html += `
                    <tr>
                        <td>${prize.name}</td>
                        <td>${prize.quantity}</td>
                        <td>
                            <button class="btn btn-danger" onclick="removePrizeFromActivity('${activityId}', '${prize.id}')" style="width: auto;">删除</button>
                        </td>
                    </tr>
                `;
            });
        }
        
        html += `
                    </tbody>
                </table>
            </div>
        `;
        
        contentDiv.innerHTML = html;
    } catch (error) {
        console.error('加载活动奖项失败:', error);
        document.getElementById('activityPrizesContent').innerHTML = '<p>加载失败，请重试</p>';
    }
}

// 为活动创建奖项
async function createPrizeForActivity(activityId) {
    const name = document.getElementById('newPrizeName').value.trim();
    const quantity = parseInt(document.getElementById('newPrizeQuantity').value) || 1;
    
    if (!name) {
        alert('请输入奖项名称！');
        return;
    }
    
    if (quantity < 1) {
        alert('奖项数量必须大于0！');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/api/activities/${activityId}/prizes`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, quantity })
        });
        
        const result = await response.json();
        
        if (result.success) {
            document.getElementById('newPrizeName').value = '';
            document.getElementById('newPrizeQuantity').value = '1';
            loadActivityPrizes(activityId);
            loadProbabilitySettings();
            alert('奖项创建成功！');
        } else {
            alert(result.message || '创建失败');
        }
    } catch (error) {
        alert('网络错误，请重试');
    }
}

// 从活动移除奖项
async function removePrizeFromActivity(activityId, prizeId) {
    if (!confirm('确定要从活动中移除这个奖项吗？')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/api/activities/${activityId}/prizes/${prizeId}`, {
            method: 'DELETE'
        });
        
        const result = await response.json();
        
        if (result.success) {
            loadActivityPrizes(activityId);
            loadProbabilitySettings();
            alert('移除成功');
        } else {
            alert(result.message || '移除失败');
        }
    } catch (error) {
        alert('网络错误，请重试');
    }
}

// 加载概率设置
async function loadProbabilitySettings() {
    const selectedActivity = document.getElementById('selectActivityForProb').value;
    const selectedUser = document.getElementById('selectUser').value;
    const settingsDiv = document.getElementById('probabilitySettings');
    
    if (!selectedActivity || !selectedUser) {
        settingsDiv.innerHTML = '<p>请先选择活动和用户</p>';
        return;
    }
    
    try {
        const [activityResponse, activityPrizesResponse, probResponse] = await Promise.all([
            fetch(`${API_BASE}/api/activities`),
            fetch(`${API_BASE}/api/activities/${selectedActivity}/prizes`),
            fetch(`${API_BASE}/api/activities/${selectedActivity}/probabilities/${selectedUser}`)
        ]);
        
        const activities = await activityResponse.json();
        const activity = activities.find(a => a.id === selectedActivity);
        
        // 检查活动是否存在
        if (!activity) {
            settingsDiv.innerHTML = '<p>活动不存在</p>';
            return;
        }
        
        // 检查返回的奖项数据
        let prizes;
        try {
            prizes = await activityPrizesResponse.json();
            // 如果返回的是错误对象
            if (prizes.success === false) {
                settingsDiv.innerHTML = `<p>${prizes.message || '加载奖项失败'}</p>`;
                return;
            }
            // 确保是数组
            if (!Array.isArray(prizes)) {
                prizes = [];
            }
        } catch (e) {
            console.error('解析奖项数据失败:', e);
            prizes = [];
        }
        
        const userProbabilities = await probResponse.json();
        
        if (prizes.length === 0) {
            settingsDiv.innerHTML = '<p>该活动没有配置奖项，请先在"活动奖项管理"中添加奖项</p>';
            return;
        }
        
        let html = `<h3>活动：${activity.name} - 用户：${selectedUser}</h3>`;
        html += '<p style="color: #666; margin-bottom: 15px;">设置中奖概率（百分比，总和应为100%）</p>';
        
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
                           onchange="updateProbability('${selectedActivity}', '${selectedUser}', '${prize.id}', this.value)">
                    <span>%</span>
                </div>
            `;
        });
        
        html += `<button class="btn btn-primary" onclick="saveProbabilities('${selectedActivity}', '${selectedUser}')" style="margin-top: 15px;">保存概率设置</button>`;
        
        settingsDiv.innerHTML = html;
    } catch (error) {
        console.error('加载概率设置失败:', error);
        settingsDiv.innerHTML = '<p>加载失败，请重试</p>';
    }
}

// 更新概率（临时存储，不保存到服务器）
let tempProbabilities = {};

function updateProbability(activityId, username, prizeId, value) {
    const key = `${activityId}_${username}`;
    if (!tempProbabilities[key]) {
        tempProbabilities[key] = {};
    }
    tempProbabilities[key][prizeId] = parseFloat(value) || 0;
}

// 保存概率设置
async function saveProbabilities(activityId, username) {
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
        const response = await fetch(`${API_BASE}/api/activities/${activityId}/probabilities/${username}`, {
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
