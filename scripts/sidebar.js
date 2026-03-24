/**
 * 左侧栏导航组件
 * 管理流程导航和状态
 */

// 流程配置
const FLOW_CONFIG = {
    steps: [
        { id: 'user', path: './user.html' },
        { id: 'input', path: './home.html' },
        { id: 'route', path: './recommend.html' },
        { id: 'itinerary', path: './itinerary.html' },
        { id: 'trip', path: './trip.html' }
    ]
};

/**
 * 获取当前页面ID
 * @returns {string} 当前页面ID
 */
function getCurrentPageId() {
    const path = window.location.pathname;
    const pageName = path.split('/').pop() || 'home.html';

    const step = FLOW_CONFIG.steps.find(s => s.path.includes(pageName));
    return step ? step.id : 'user';
}

/**
 * 加载侧边栏组件
 * @returns {Promise<void>}
 */
async function loadSidebar() {
    try {
        const response = await fetch('../components/sidebar.html');
        if (!response.ok) {
            throw new Error(`加载 sidebar 失败: ${response.status}`);
        }
        const html = await response.text();

        // 插入到body开头
        const body = document.body;
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;

        // 将侧边栏插入到body的第一个子元素位置
        while (tempDiv.firstChild) {
            body.insertBefore(tempDiv.firstChild, body.firstChild);
        }

        // 设置当前页面激活状态
        setActiveNavItem();

        // 恢复侧边栏折叠状态
        restoreSidebarState();
    } catch (error) {
        console.error('加载侧边栏出错:', error);
    }
}

/**
 * 设置当前导航项的激活状态
 */
function setActiveNavItem() {
    const currentPageId = getCurrentPageId();
    const navList = document.getElementById('flow-nav-list');
    if (!navList) return;

    const links = navList.querySelectorAll('.nav-link');
    links.forEach(link => {
        const stepId = link.dataset.step;
        if (stepId === currentPageId) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

/**
 * 更新侧边栏UI状态
 */
function updateSidebarUI() {
    setActiveNavItem();
}

/**
 * 切换侧边栏折叠状态
 */
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.querySelector('.main-content, .user-container');

    if (sidebar) {
        sidebar.classList.toggle('collapsed');
        const isCollapsed = sidebar.classList.contains('collapsed');

        if (mainContent) {
            mainContent.classList.toggle('sidebar-collapsed', isCollapsed);
        }

        // 保存状态
        localStorage.setItem('sidebar_collapsed', isCollapsed ? '1' : '0');
    }
}

/**
 * 恢复侧边栏状态
 */
function restoreSidebarState() {
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.querySelector('.main-content, .user-container');
    const isCollapsed = localStorage.getItem('sidebar_collapsed') === '1';

    if (sidebar && isCollapsed) {
        sidebar.classList.add('collapsed');
        if (mainContent) {
            mainContent.classList.add('sidebar-collapsed');
        }
    }
}

/**
 * 打开移动端侧边栏
 */
function openMobileSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');

    if (sidebar) sidebar.classList.add('open');
    if (overlay) overlay.classList.add('show');
}

/**
 * 关闭移动端侧边栏
 */
function closeMobileSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');

    if (sidebar) sidebar.classList.remove('open');
    if (overlay) overlay.classList.remove('show');
}

/**
 * 添加移动端菜单按钮到头部
 */
function addMobileMenuButton() {
    const headerContainer = document.querySelector('.header-container');
    if (!headerContainer) return;

    // 检查是否已存在
    if (headerContainer.querySelector('.mobile-menu-btn')) return;

    const menuBtn = document.createElement('button');
    menuBtn.className = 'mobile-menu-btn';
    menuBtn.innerHTML = '☰';
    menuBtn.onclick = openMobileSidebar;
    menuBtn.setAttribute('aria-label', '打开菜单');

    // 插入到logo前面
    const logo = headerContainer.querySelector('.logo');
    if (logo) {
        headerContainer.insertBefore(menuBtn, logo);
    } else {
        headerContainer.insertBefore(menuBtn, headerContainer.firstChild);
    }
}

/**
 * 初始化侧边栏
 */
async function initSidebar() {
    // 加载侧边栏组件
    await loadSidebar();

    // 添加移动端菜单按钮
    addMobileMenuButton();

    // 为主内容区添加样式类
    const mainContent = document.querySelector('.main-content, .user-container');
    if (mainContent) {
        mainContent.classList.add('with-sidebar');
    }

    // 监听窗口大小变化
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) {
            closeMobileSidebar();
        }
    });
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', initSidebar);

// 导出API供其他模块使用
window.SidebarAPI = {
    updateSidebarUI,
    FLOW_CONFIG
};
