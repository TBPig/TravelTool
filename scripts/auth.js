// 用户认证相关公共函数

// 检查用户登录状态并更新导航栏
async function checkUserLogin() {
    const token = localStorage.getItem('token');
    const userActions = document.getElementById('user-actions');

    if (!token) {
        // 未登录状态
        userActions.innerHTML = `
            <a href="./login.html" class="btn-login">登录</a>
            <a href="./register.html" class="btn-register">注册</a>
        `;
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/auth/me`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const result = await response.json();

        if (result.success) {
            const user = result.data;
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
        } else {
            // token无效，清除登录状态
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            userActions.innerHTML = `
                <a href="./login.html" class="btn-login">登录</a>
                <a href="./register.html" class="btn-register">注册</a>
            `;
        }
    } catch (error) {
        console.error('检查登录状态失败:', error);
        userActions.innerHTML = `
            <a href="./login.html" class="btn-login">登录</a>
            <a href="./register.html" class="btn-register">注册</a>
        `;
    }
}

// 切换下拉菜单
function toggleDropdown() {
    const menu = document.getElementById('user-dropdown-menu');
    if (menu) {
        menu.classList.toggle('show');
    }
}

// 点击页面其他地方关闭下拉菜单
document.addEventListener('click', function(event) {
    const dropdown = document.querySelector('.user-dropdown');
    const menu = document.getElementById('user-dropdown-menu');
    if (dropdown && menu && !dropdown.contains(event.target)) {
        menu.classList.remove('show');
    }
});

// 退出登录
async function logout() {
    const token = localStorage.getItem('token');
    if (token) {
        try {
            await fetch(`${API_BASE_URL}/auth/logout`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
        } catch (error) {
            console.error('登出请求失败:', error);
        }
    }
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.reload();
}

// 检查是否已登录（用于登录/注册页面）
function checkAlreadyLoggedIn() {
    const token = localStorage.getItem('token');
    if (token) {
        window.location.href = './home.html';
    }
}
