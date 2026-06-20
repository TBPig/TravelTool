/**
 * 头部导航组件加载器
 */

document.addEventListener('DOMContentLoaded', async () => {
    const container = document.querySelector('#header-container');
    if (!container) return;

    try {
        const response = await fetch('../components/header.html');
        if (!response.ok) throw new Error(`加载失败: ${response.status}`);
        container.innerHTML = await response.text();
        initHeaderUser();
    } catch (error) {
        console.error('加载头部出错:', error);
    }
});

function initHeaderUser() {
    const userActions = document.getElementById('user-actions');
    if (!userActions) return;

    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!token || !user.username) return;

    const initial = (user.nickname || user.username).charAt(0).toUpperCase();
    const displayName = user.nickname || user.username;
    userActions.innerHTML = `
        <div class="user-menu">
            <a href="./user.html" class="user-link">
                <span class="user-avatar">${initial}</span>
                <span class="user-name">${displayName}</span>
            </a>
        </div>
    `;
}
