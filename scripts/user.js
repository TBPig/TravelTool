// 用户中心页面脚本

// 检查登录状态
const token = localStorage.getItem('token');
if (!token) {
    window.location.href = './login.html';
}

// 加载用户信息
async function loadUserInfo() {
    const loadingState = document.getElementById('loading-state');
    const errorState = document.getElementById('error-state');
    const contentState = document.getElementById('user-info-content');

    try {
        const response = await fetch(`${API_BASE_URL}/auth/me`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const result = await response.json();

        if (result.success) {
            const user = result.data;
            displayUserInfo(user);
            loadingState.style.display = 'none';
            contentState.style.display = 'block';
        } else {
            // token无效，跳转到登录页
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = './login.html';
        }
    } catch (error) {
        console.error('加载用户信息失败:', error);
        loadingState.style.display = 'none';
        errorState.textContent = '加载失败，请刷新页面重试';
        errorState.style.display = 'block';
    }
}

// 显示用户信息
function displayUserInfo(user) {
    const displayName = user.nickname || user.username;
    const initial = displayName.charAt(0).toUpperCase();

    document.getElementById('user-avatar').textContent = initial;
    document.getElementById('user-display-name').textContent = displayName;
    document.getElementById('user-email').textContent = user.email;

    document.getElementById('info-username').textContent = user.username;
    document.getElementById('info-nickname').textContent = user.nickname || '-';
    document.getElementById('info-email').textContent = user.email;
    document.getElementById('info-phone').textContent = user.phone || '-';
    document.getElementById('info-created').textContent = new Date(user.created_at).toLocaleString('zh-CN');

    // 更新导航栏用户显示
    updateNavUser(user);
}

// 更新导航栏
function updateNavUser(user) {
    const userActions = document.getElementById('user-actions');
    const displayName = user.nickname || user.username;
    const initial = displayName.charAt(0).toUpperCase();

    userActions.innerHTML = `
        <div class="user-dropdown">
            <div class="user-info" onclick="toggleDropdown()">
                <div class="user-avatar">${initial}</div>
                <span class="user-name">${displayName}</span>
            </div>
            <div class="dropdown-menu" id="user-dropdown-menu">
                <a href="./user.html">个人中心</a>
                <button onclick="logout()">退出登录</button>
            </div>
        </div>
    `;
}

// 页面加载时获取用户信息
document.addEventListener('DOMContentLoaded', loadUserInfo);
