// 用户画像存储键名
const USER_PROFILE_KEY = 'travel_user_profile';

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

// 保存用户画像到本地存储
function saveUserProfile() {
    const departure = document.getElementById('departure').value.trim();
    const destination = document.getElementById('destination').value.trim();
    const days = document.getElementById('days').value;

    // 获取游玩强度
    const intensityRadios = document.getElementsByName('intensity');
    let intensity = 'relaxed';
    for (const radio of intensityRadios) {
        if (radio.checked) {
            intensity = radio.value;
            break;
        }
    }

    // 获取兴趣标签
    const interestCheckboxes = document.querySelectorAll('#interest-tags input[type="checkbox"]:checked');
    const interests = Array.from(interestCheckboxes).map(cb => cb.value);

    // 获取同行人类型
    const companionRadios = document.getElementsByName('companion');
    let companion = 'solo';
    for (const radio of companionRadios) {
        if (radio.checked) {
            companion = radio.value;
            break;
        }
    }

    // 构建用户画像对象
    const profile = {
        departure: departure,
        destination: destination,
        days: days,
        intensity: intensity,
        interests: interests,
        companion: companion,
        updatedAt: new Date().toISOString()
    };

    // 保存到本地存储
    localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(profile));

    // 显示成功提示
    showNotification('✅ 旅行画像已保存！', 'success');

    // 更新页面上的画像摘要
    updateProfileSummary(profile);
}

// 从本地存储加载用户画像
function loadUserProfile() {
    const profileJson = localStorage.getItem(USER_PROFILE_KEY);
    if (!profileJson) {
        return null;
    }

    try {
        const profile = JSON.parse(profileJson);
        return profile;
    } catch (error) {
        console.error('解析用户画像失败:', error);
        return null;
    }
}

// 填充表单数据
function fillFormWithProfile(profile) {
    if (!profile) return;

    // 填充基础信息
    if (profile.departure) {
        document.getElementById('departure').value = profile.departure;
    }
    if (profile.destination) {
        document.getElementById('destination').value = profile.destination;
    }
    if (profile.days) {
        document.getElementById('days').value = profile.days;
    }

    // 填充游玩强度
    if (profile.intensity) {
        const intensityRadios = document.getElementsByName('intensity');
        for (const radio of intensityRadios) {
            radio.checked = (radio.value === profile.intensity);
        }
    }

    // 填充兴趣标签
    if (profile.interests && profile.interests.length > 0) {
        const interestCheckboxes = document.querySelectorAll('#interest-tags input[type="checkbox"]');
        interestCheckboxes.forEach(cb => {
            cb.checked = profile.interests.includes(cb.value);
        });
    }

    // 填充同行人类型
    if (profile.companion) {
        const companionRadios = document.getElementsByName('companion');
        for (const radio of companionRadios) {
            radio.checked = (radio.value === profile.companion);
        }
    }
}

// 更新画像摘要显示
function updateProfileSummary(profile) {
    // 移除旧的摘要
    const oldSummary = document.getElementById('profile-summary');
    if (oldSummary) {
        oldSummary.remove();
    }

    if (!profile) return;

    // 创建新的摘要元素
    const summaryDiv = document.createElement('div');
    summaryDiv.id = 'profile-summary';
    summaryDiv.className = 'profile-summary';

    // 构建摘要内容
    const interestsText = profile.interests && profile.interests.length > 0
        ? profile.interests.map(i => getInterestTagText(i)).join('、')
        : '未选择';

    summaryDiv.innerHTML = `
        <div class="summary-content">
            <span class="summary-title">🎯 当前画像:</span>
            <span class="summary-item">${profile.departure || '未设置'} → ${profile.destination || '未设置'}</span>
            <span class="summary-item">${profile.days ? getDaysText(profile.days) : ''}</span>
            <span class="summary-item">${getIntensityText(profile.intensity)}</span>
            <span class="summary-item">${getCompanionText(profile.companion)}</span>
            <span class="summary-item">${interestsText}</span>
            <button class="btn-clear-profile" onclick="clearUserProfile()">清除</button>
        </div>
    `;

    // 插入到表单上方
    const plannerForm = document.querySelector('.planner-form');
    if (plannerForm) {
        plannerForm.insertBefore(summaryDiv, plannerForm.firstChild);
    }
}

// 获取天数文本
function getDaysText(days) {
    const daysMap = {
        '1-3': '1-3天',
        '4-7': '4-7天',
        '8-15': '8-15天',
        '15+': '15天以上'
    };
    return daysMap[days] || days;
}

// 清除用户画像
function clearUserProfile() {
    localStorage.removeItem(USER_PROFILE_KEY);

    // 重置表单
    document.getElementById('departure').value = '';
    document.getElementById('destination').value = '';
    document.getElementById('days').value = '';

    // 重置游玩强度为默认值
    const intensityRadios = document.getElementsByName('intensity');
    intensityRadios[0].checked = true;

    // 重置兴趣标签
    const interestCheckboxes = document.querySelectorAll('#interest-tags input[type="checkbox"]');
    interestCheckboxes.forEach(cb => cb.checked = false);

    // 重置同行人类型为默认值
    const companionRadios = document.getElementsByName('companion');
    companionRadios[0].checked = true;

    // 移除摘要显示
    const summary = document.getElementById('profile-summary');
    if (summary) {
        summary.remove();
    }

    showNotification('✅ 画像已清除', 'info');
}

// 显示通知
function showNotification(message, type = 'info') {
    // 移除旧的通知
    const oldNotification = document.querySelector('.notification-toast');
    if (oldNotification) {
        oldNotification.remove();
    }

    const notification = document.createElement('div');
    notification.className = `notification-toast notification-${type}`;
    notification.textContent = message;

    document.body.appendChild(notification);

    // 动画显示
    setTimeout(() => notification.classList.add('show'), 10);

    // 3秒后自动移除
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
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
    const departure = document.getElementById('departure').value.trim();
    const destination = document.getElementById('destination').value.trim();
    const days = document.getElementById('days').value;

    // 获取游玩强度
    const intensityRadios = document.getElementsByName('intensity');
    let intensity = 'relaxed';
    for (const radio of intensityRadios) {
        if (radio.checked) {
            intensity = radio.value;
            break;
        }
    }

    // 获取兴趣标签
    const interestCheckboxes = document.querySelectorAll('#interest-tags input[type="checkbox"]:checked');
    const interests = Array.from(interestCheckboxes).map(cb => cb.value);

    // 获取同行人类型
    const companionRadios = document.getElementsByName('companion');
    let companion = 'solo';
    for (const radio of companionRadios) {
        if (radio.checked) {
            companion = radio.value;
            break;
        }
    }

    // 验证必填项
    if (!departure || !destination || !days) {
        showNotification('⚠️ 请填写出发城市、目的地和出行天数', 'warning');
        return;
    }

    // 构建搜索参数
    const searchParams = {
        departure: departure,
        destination: destination,
        days: days,
        intensity: intensity,
        interests: interests,
        companion: companion
    };

    // 自动保存用户画像
    const profile = {
        ...searchParams,
        updatedAt: new Date().toISOString()
    };
    localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(profile));
    updateProfileSummary(profile);

    // 构建 URL 参数并跳转到推荐页
    const params = new URLSearchParams();
    params.append('departure', departure);
    params.append('destination', destination);
    params.append('days', days);
    params.append('intensity', intensity);
    params.append('companion', companion);
    if (interests.length > 0) {
        params.append('interests', interests.join(','));
    }

    // 显示加载提示
    showNotification('🎯 正在为您生成路线推荐...', 'info');

    // 完成信息输入步骤
    if (window.SidebarAPI) {
        window.SidebarAPI.completeStep('input');
    }

    // 跳转到推荐页面
    setTimeout(() => {
        window.location.href = `./recommend.html?${params}`;
    }, 500);
}

// 页面加载时检查登录状态
document.addEventListener('DOMContentLoaded', function() {
    loadRoutes();
    checkUserLogin();

    // 加载并应用用户画像
    const profile = loadUserProfile();
    if (profile) {
        fillFormWithProfile(profile);
        updateProfileSummary(profile);
    }
});
