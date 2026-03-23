/**
 * 公共组件加载器
 * 用于动态加载头部导航和页脚等公共组件
 */

// 组件加载配置
const COMPONENT_CONFIG = {
    header: {
        url: '../components/header.html',
        selector: '#header-container'
    },
    footer: {
        url: '../components/footer.html',
        selector: '#footer-container'
    }
};

/**
 * 加载指定组件
 * @param {string} componentName - 组件名称 (header 或 footer)
 * @returns {Promise<void>}
 */
async function loadComponent(componentName) {
    const config = COMPONENT_CONFIG[componentName];
    if (!config) {
        console.error(`未知的组件: ${componentName}`);
        return;
    }

    const container = document.querySelector(config.selector);
    if (!container) {
        // 如果容器不存在，静默返回（页面可能不需要此组件）
        return;
    }

    try {
        const response = await fetch(config.url);
        if (!response.ok) {
            throw new Error(`加载 ${componentName} 失败: ${response.status}`);
        }
        const html = await response.text();
        container.innerHTML = html;

        // 组件加载完成后，触发初始化
        if (componentName === 'header') {
            initHeader();
        }
    } catch (error) {
        console.error(`加载组件 ${componentName} 出错:`, error);
    }
}

/**
 * 初始化头部导航
 * 根据登录状态更新用户操作区域
 */
function initHeader() {
    const userActions = document.getElementById('user-actions');
    if (!userActions) return;

    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    if (token && user.username) {
        // 已登录状态
        userActions.innerHTML = `
            <div class="user-menu">
                <a href="./user.html" class="user-link">
                    <span class="user-avatar">${user.nickname?.charAt(0)?.toUpperCase() || user.username.charAt(0).toUpperCase()}</span>
                    <span class="user-name">${user.nickname || user.username}</span>
                </a>
            </div>
        `;
    }
    // 未登录状态保持默认的登录/注册按钮
}

// 页面加载完成后自动加载组件
document.addEventListener('DOMContentLoaded', () => Promise.all([
    loadComponent('header'),
    loadComponent('footer')
]));
