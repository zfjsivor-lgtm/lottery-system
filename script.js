// API基础URL
const API_BASE = '';

// 登录处理
document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorMessage = document.getElementById('errorMessage');
    
    try {
        const response = await fetch(`${API_BASE}/api/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });
        
        const result = await response.json();
        
        if (result.success) {
            sessionStorage.setItem('isAdmin', result.isAdmin ? 'true' : 'false');
            sessionStorage.setItem('currentUser', username);
            
            if (result.isAdmin) {
                window.location.href = 'admin.html';
            } else {
                errorMessage.textContent = '用户登录成功！抽奖功能待开发';
                errorMessage.classList.add('show');
            }
        } else {
            errorMessage.textContent = result.message || '用户名或密码错误！';
            errorMessage.classList.add('show');
        }
    } catch (error) {
        errorMessage.textContent = '网络错误，请检查服务器是否运行';
        errorMessage.classList.add('show');
    }
});

