// 获取路线列表
async function loadRoutes() {
    try {
        const response = await fetch(`${API_BASE_URL}/routes`);
        const result = await response.json();

        if (result.success) {
            renderRoutes(result.data);
        } else {
            showError('加载路线数据失败');
        }
    } catch (error) {
        console.error('获取路线失败:', error);
        showError('无法连接到服务器，请确保后端服务已启动 (npm start)');
    }
}

// 渲染路线卡片
function renderRoutes(routes) {
    const container = document.getElementById('routes-container');

    if (routes.length === 0) {
        container.innerHTML = '<div class="no-data">暂无路线数据</div>';
        return;
    }

    container.innerHTML = routes.map(route => `
        <div class="route-card">
            <img src="${route.image_url || 'https://picsum.photos/400/250?random=' + route.id}" alt="${route.title}" />
            <div class="card-content">
                <h3>${route.title}</h3>
                <p class="route-tags">
                    ${renderTags(route.preference)}
                </p>
                <p class="route-desc">${route.description}</p>
                <div class="route-info">
                    <span>⏱️ ${route.days}天</span>
                    <span>💰 预算: ${route.budget_level}</span>
                </div>
                <button class="btn-explore" onclick="viewRouteDetail(${route.id})">查看详情</button>
            </div>
        </div>
    `).join('');
}

// 渲染标签
function renderTags(preference) {
    if (!preference) return '';
    return preference.split(',').map(p =>
        `<span class="tag">${TAG_MAP[p] || p}</span>`
    ).join('');
}

// 显示错误信息
function showError(message) {
    const container = document.getElementById('routes-container');
    container.innerHTML = `<div class="error-message" style="color: red; padding: 20px; text-align: center;">${message}</div>`;
}

// 查看路线详情
async function viewRouteDetail(routeId) {
    try {
        const response = await fetch(`${API_BASE_URL}/routes/${routeId}`);
        const result = await response.json();

        if (result.success) {
            alert(`路线详情：

${result.data.title}
${result.data.description}

出发地：${result.data.departure_city}
目的地：${result.data.destination_city}
天数：${result.data.days}天`);
        }
    } catch (error) {
        console.error('获取路线详情失败:', error);
        alert('获取路线详情失败');
    }
}

// 生成路线建议
async function generateRoute() {
    const departure = document.getElementById('departure').value;
    const destination = document.getElementById('destination').value;
    const days = document.getElementById('days').value;
    const preference = document.getElementById('preference').value;

    if (!departure || !destination || !days || !preference) {
        alert('请填写完整信息');
        return;
    }

    // 根据条件筛选路线
    try {
        const params = new URLSearchParams();
        if (departure) params.append('departure', departure);
        if (destination) params.append('destination', destination);
        if (preference) params.append('preference', preference);

        const response = await fetch(`${API_BASE_URL}/routes?${params}`);
        const result = await response.json();

        if (result.success && result.data.length > 0) {
            renderRoutes(result.data);
            alert(`为您找到 ${result.data.length} 条符合条件的路线！`);
        } else {
            alert('未找到符合条件的路线，为您显示所有推荐路线');
            loadRoutes();
        }
    } catch (error) {
        console.error('搜索路线失败:', error);
        alert(`正在为您规划从 ${departure} 到 ${destination} 的 ${days}天${getPreferenceText(preference)}路线...`);
    }
}

// 页面加载时检查登录状态
document.addEventListener('DOMContentLoaded', function() {
    loadRoutes();
    checkUserLogin();
});
