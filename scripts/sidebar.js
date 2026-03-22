/**
 * 左侧栏导航组件
 * 管理流程导航和状态
 */

// 流程配置
const FLOW_CONFIG = {
    steps: [
        { id: 'user', name: '个人中心', icon: '👤', path: './user.html', step: 0 },
        { id: 'input', name: '信息输入', icon: '📝', path: './home.html', step: 1 },
        { id: 'route', name: '路线选择', icon: '🗺️', path: './recommend.html', step: 2 },
        { id: 'itinerary', name: '行程选择', icon: '📋', path: './itinerary.html', step: 3 },
        { id: 'trip', name: '行程查看', icon: '✈️', path: './trip.html', step: 4 }
    ]
};

// 流程状态存储键
const FLOW_STATE_KEY = 'travel_flow_state';

/**
 * 获取当前流程状态
 * @returns {Object} 流程状态
 */
function getFlowState() {
    const state = localStorage.getItem(FLOW_STATE_KEY);
    if (state) {
        return JSON.parse(state);
    }
    // 默认状态：只有第一步可用
    return {
        completedSteps: [],
        currentStep: 'user',
        maxAccessibleStep: 1  // 默认允许访问到信息输入
    };
}

/**
 * 保存流程状态
 * @param {Object} state 流程状态
 */
function saveFlowState(state) {
    localStorage.setItem(FLOW_STATE_KEY, JSON.stringify(state));
}

/**
 * 完成某个步骤
 * @param {string} stepId 步骤ID
 */
function completeStep(stepId) {
    const state = getFlowState();
    const stepConfig = FLOW_CONFIG.steps.find(s => s.id === stepId);

    if (!stepConfig) return;

    // 添加到已完成列表
    if (!state.completedSteps.includes(stepId)) {
        state.completedSteps.push(stepId);
    }

    // 更新最大可访问步骤
    const nextStep = FLOW_CONFIG.steps.find(s => s.step === stepConfig.step + 1);
    if (nextStep && stepConfig.step + 1 > state.maxAccessibleStep) {
        state.maxAccessibleStep = stepConfig.step + 1;
    }

    // 更新当前步骤
    state.currentStep = stepId;

    saveFlowState(state);
    updateSidebarUI();
}

/**
 * 检查步骤是否可访问
 * @param {string} stepId 步骤ID
 * @returns {boolean} 是否可访问
 */
function isStepAccessible(stepId) {
    const state = getFlowState();
    const stepConfig = FLOW_CONFIG.steps.find(s => s.id === stepId);

    if (!stepConfig) return false;

    return stepConfig.step <= state.maxAccessibleStep;
}

/**
 * 检查步骤是否已完成
 * @param {string} stepId 步骤ID
 * @returns {boolean} 是否已完成
 */
function isStepCompleted(stepId) {
    const state = getFlowState();
    return state.completedSteps.includes(stepId);
}

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
 * 渲染左侧栏
 */
function renderSidebar() {
    const currentPageId = getCurrentPageId();
    const state = getFlowState();

    // 创建侧边栏HTML
    const sidebarHTML = `
        <aside class="sidebar" id="sidebar">
            <div class="sidebar-toggle" onclick="toggleSidebar()">
                <span class="toggle-icon">◀</span>
                <span class="toggle-text">收起菜单</span>
            </div>
            <nav class="sidebar-nav">
                <div class="nav-section">
                    <div class="section-title">流程导航</div>
                    <ul class="nav-list" id="flow-nav-list">
                        ${FLOW_CONFIG.steps.map(step => {
                            const isAccessible = isStepAccessible(step.id);
                            const isCompleted = isStepCompleted(step.id);
                            const isActive = step.id === currentPageId;

                            let linkClass = 'nav-link';
                            if (isActive) linkClass += ' active';
                            if (!isAccessible) linkClass += ' disabled';

                            return `
                                <li class="nav-item">
                                    <a href="${isAccessible ? step.path : 'javascript:void(0)'}"
                                       class="${linkClass}"
                                       data-step="${step.id}"
                                       ${!isAccessible ? 'title="请先完成上一步"' : ''}>
                                        <span class="nav-icon">${step.icon}</span>
                                        <span class="nav-text">${step.name}</span>
                                    </a>
                                </li>
                            `;
                        }).join('')}
                    </ul>
                </div>
            </nav>
        </aside>
        <div class="sidebar-overlay" id="sidebar-overlay" onclick="closeMobileSidebar()"></div>
    `;

    // 插入到body开头
    const body = document.body;
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = sidebarHTML;

    // 将侧边栏插入到body的第一个子元素位置
    while (tempDiv.firstChild) {
        body.insertBefore(tempDiv.firstChild, body.firstChild);
    }

    // 恢复侧边栏折叠状态
    restoreSidebarState();
}

/**
 * 更新侧边栏UI状态
 */
function updateSidebarUI() {
    const currentPageId = getCurrentPageId();
    const navList = document.getElementById('flow-nav-list');

    if (!navList) return;

    const links = navList.querySelectorAll('.nav-link');
    links.forEach(link => {
        const stepId = link.dataset.step;
        const isAccessible = isStepAccessible(stepId);
        const isCompleted = isStepCompleted(stepId);
        const isActive = stepId === currentPageId;

        // 更新链接样式
        link.className = 'nav-link';
        if (isActive) link.classList.add('active');
        if (!isAccessible) link.classList.add('disabled');

        // 更新链接href
        if (isAccessible) {
            const step = FLOW_CONFIG.steps.find(s => s.id === stepId);
            link.href = step.path;
        } else {
            link.href = 'javascript:void(0)';
            link.title = '请先完成上一步';
        }
    });
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
function initSidebar() {
    // 渲染侧边栏
    renderSidebar();

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
    completeStep,
    getFlowState,
    saveFlowState,
    isStepAccessible,
    isStepCompleted,
    updateSidebarUI,
    FLOW_CONFIG
};
