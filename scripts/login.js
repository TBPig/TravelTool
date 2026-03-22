// 检查是否已登录
checkAlreadyLoggedIn();

document.getElementById('login-form').addEventListener('submit', async function(e) {
    e.preventDefault();

    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    const submitBtn = document.getElementById('submit-btn');
    const errorMsg = document.getElementById('error-message');
    const successMsg = document.getElementById('success-message');

    // 重置消息
    errorMsg.classList.remove('show');
    successMsg.classList.remove('show');

    // 简单验证
    if (!username || !password) {
        errorMsg.textContent = '请填写用户名和密码';
        errorMsg.classList.add('show');
        return;
    }

    // 禁用按钮
    submitBtn.disabled = true;
    submitBtn.textContent = '登录中...';

    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        const result = await response.json();

        if (result.success) {
            // 保存登录信息
            localStorage.setItem('token', result.data.token);
            localStorage.setItem('user', JSON.stringify(result.data.user));

            successMsg.textContent = '登录成功，正在跳转...';
            successMsg.classList.add('show');

            // 跳转到首页
            setTimeout(() => {
                window.location.href = './home.html';
            }, 1000);
        } else {
            errorMsg.textContent = result.message || '登录失败';
            errorMsg.classList.add('show');
        }
    } catch (error) {
        console.error('登录失败:', error);
        errorMsg.textContent = '网络错误，请稍后重试';
        errorMsg.classList.add('show');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = '登录';
    }
});
