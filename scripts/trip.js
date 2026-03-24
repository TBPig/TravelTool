// 行中助手页逻辑

// 当前行程状态
let tripState = {
    itinerary: null,
    attractions: [],
    params: null,
    startTime: null,
    currentDay: 1,
    currentAttractionIndex: 0,
    attractionStatus: 'pending', // pending, arrived, visiting, completed
    visitStartTime: null,
    timerInterval: null,
    visitTimerInterval: null
};

// 页面加载时初始化
document.addEventListener('DOMContentLoaded', function() {
    checkUserLogin();
    loadTripData();
});

// 加载行程数据
function loadTripData() {
    const tripJson = localStorage.getItem('travel_current_trip');
    
    if (!tripJson) {
        showEmptyState();
        return;
    }
    
    try {
        const tripData = JSON.parse(tripJson);
        tripState.itinerary = tripData.itinerary;
        tripState.attractions = tripData.attractions;
        tripState.params = tripData.params;
        tripState.startTime = new Date(tripData.startTime);
        tripState.currentAttractionIndex = tripData.currentAttractionIndex || 0;
        
        // 初始化页面
        initializeTrip();
        
    } catch (error) {
        console.error('加载行程数据失败:', error);
        showEmptyState();
    }
}

// 初始化行程
function initializeTrip() {
    // 启动计时器
    startTripTimer();

    // 加载天气信息（模拟）
    loadWeather();

    // 渲染当前景点
    renderCurrentAttraction();

    // 渲染今日行程
    renderTodayTimeline();

    // 更新进度
    updateProgress();

    // 设置导航信息
    updateNavigation();

    // 发送欢迎消息
    setTimeout(() => {
        sendSystemMessage(`欢迎开始您的旅程！第一个景点是「${getCurrentAttraction()?.name}」，准备好了吗？`);
    }, 1000);
}

// 启动行程计时器
function startTripTimer() {
    updateTripTimer();
    tripState.timerInterval = setInterval(updateTripTimer, 1000);
}

// 更新行程计时器
function updateTripTimer() {
    const now = new Date();
    const elapsed = now - tripState.startTime;
    
    const hours = Math.floor(elapsed / (1000 * 60 * 60));
    const minutes = Math.floor((elapsed % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((elapsed % (1000 * 60)) / 1000);
    
    const timerEl = document.getElementById('trip-timer');
    if (timerEl) {
        timerEl.textContent = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }
}

// 加载天气信息（模拟）
function loadWeather() {
    const weatherWidget = document.getElementById('weather-widget');
    if (!weatherWidget) return;
    
    // 模拟天气数据
    const weathers = [
        { icon: '☀️', temp: '28°C', desc: '晴天' },
        { icon: '⛅', temp: '25°C', desc: '多云' },
        { icon: '🌤️', temp: '26°C', desc: '晴间多云' }
    ];
    
    const weather = weathers[Math.floor(Math.random() * weathers.length)];
    weatherWidget.innerHTML = `
        <span class="weather-icon">${weather.icon}</span>
        <span class="weather-temp">${weather.temp}</span>
        <span class="weather-desc">${weather.desc}</span>
    `;
}

// 获取当前景点
function getCurrentAttraction() {
    return tripState.attractions[tripState.currentAttractionIndex];
}

// 渲染当前景点
function renderCurrentAttraction() {
    const attraction = getCurrentAttraction();
    if (!attraction) {
        showNoMoreAttractions();
        return;
    }
    
    document.getElementById('current-image').src = attraction.image_url || `https://picsum.photos/400/200?random=${attraction.id}`;
    document.getElementById('current-name').textContent = attraction.name;
    document.getElementById('current-desc').textContent = attraction.description || '暂无描述';
    document.getElementById('current-duration').textContent = `${attraction.recommended_duration || 120}分钟`;
    document.getElementById('current-price').textContent = attraction.price === 0 ? '免费' : `¥${attraction.price}`;
    document.getElementById('current-rating').textContent = `${attraction.rating || 4.0}分`;
    document.getElementById('current-number').textContent = tripState.currentAttractionIndex + 1;
    
    updateAttractionStatus(tripState.attractionStatus);
}

// 更新景点状态
function updateAttractionStatus(status) {
    tripState.attractionStatus = status;
    
    const statusBadge = document.getElementById('attraction-status');
    const btnArrived = document.getElementById('btn-arrived');
    const btnStart = document.getElementById('btn-start');
    const btnFinish = document.getElementById('btn-finish');
    const btnNext = document.getElementById('btn-next');
    const visitTimer = document.getElementById('visit-timer');
    
    // 隐藏所有按钮
    btnArrived.style.display = 'none';
    btnStart.style.display = 'none';
    btnFinish.style.display = 'none';
    btnNext.style.display = 'none';
    visitTimer.style.display = 'none';
    
    switch (status) {
        case 'pending':
            statusBadge.textContent = '未开始';
            statusBadge.className = 'status-badge';
            btnArrived.style.display = 'flex';
            break;
        case 'arrived':
            statusBadge.textContent = '已到达';
            statusBadge.className = 'status-badge arrived';
            btnStart.style.display = 'flex';
            break;
        case 'visiting':
            statusBadge.textContent = '游览中';
            statusBadge.className = 'status-badge visiting';
            btnFinish.style.display = 'flex';
            visitTimer.style.display = 'block';
            startVisitTimer();
            break;
        case 'completed':
            statusBadge.textContent = '已完成';
            statusBadge.className = 'status-badge completed';
            if (tripState.currentAttractionIndex < tripState.attractions.length - 1) {
                btnNext.style.display = 'flex';
            } else {
                showTripCompleted();
            }
            break;
    }
}

// 标记已到达
function markArrived() {
    updateAttractionStatus('arrived');
    updateNavigation();
    
    const attraction = getCurrentAttraction();
    sendSystemMessage(`您已到达「${attraction.name}」，准备好开始游览了吗？`);
    
    // 更新时间轴状态
    updateTimelineItemStatus(tripState.currentAttractionIndex, 'current');
}

// 开始游览
function startVisiting() {
    tripState.visitStartTime = new Date();
    updateAttractionStatus('visiting');
    
    const attraction = getCurrentAttraction();
    sendSystemMessage(`开始游览「${attraction.name}」，建议游玩时间 ${attraction.recommended_duration || 120} 分钟。祝您玩得开心！`);
    
    // 检查是否接近闭园时间
    checkClosingTime(attraction);
}

// 启动游览计时器
function startVisitTimer() {
    if (tripState.visitTimerInterval) {
        clearInterval(tripState.visitTimerInterval);
    }
    
    tripState.visitTimerInterval = setInterval(() => {
        const now = new Date();
        const elapsed = now - tripState.visitStartTime;
        
        const minutes = Math.floor(elapsed / (1000 * 60));
        const seconds = Math.floor((elapsed % (1000 * 60)) / 1000);
        
        const timerDisplay = document.getElementById('visit-timer-display');
        if (timerDisplay) {
            timerDisplay.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        }
    }, 1000);
}

// 结束游览
function finishVisiting() {
    if (tripState.visitTimerInterval) {
        clearInterval(tripState.visitTimerInterval);
    }
    
    updateAttractionStatus('completed');
    
    const attraction = getCurrentAttraction();
    const visitDuration = Math.floor((new Date() - tripState.visitStartTime) / (1000 * 60));
    
    sendSystemMessage(`您已完成「${attraction.name}」的游览，共游览 ${visitDuration} 分钟。`);
    
    // 更新时间轴状态
    updateTimelineItemStatus(tripState.currentAttractionIndex, 'done');
    
    // 更新进度
    updateProgress();
    
    // 保存状态
    saveTripState();
}

// 前往下一景点
function goToNext() {
    tripState.currentAttractionIndex++;
    tripState.attractionStatus = 'pending';
    
    renderCurrentAttraction();
    renderTodayTimeline();
    updateNavigation();
    saveTripState();
    
    const nextAttraction = getCurrentAttraction();
    if (nextAttraction) {
        sendSystemMessage(`下一站：「${nextAttraction.name}」，请根据导航前往。`);
    }
}

// 更新导航信息
function updateNavigation() {
    const attraction = getCurrentAttraction();
    if (!attraction) return;
    
    document.getElementById('nav-destination').textContent = attraction.name;
    
    // 模拟距离和时间
    const distance = (Math.random() * 5 + 0.5).toFixed(1);
    const duration = Math.floor(Math.random() * 20 + 5);
    
    document.getElementById('nav-distance').textContent = `${distance} 公里`;
    document.getElementById('nav-duration').textContent = `${duration} 分钟`;
}

// 更新进度
function updateProgress() {
    const completed = tripState.attractionStatus === 'completed' ? tripState.currentAttractionIndex + 1 : tripState.currentAttractionIndex;
    const total = tripState.attractions.length;
    const percentage = (completed / total) * 100;
    
    document.getElementById('progress-text').textContent = `${completed}/${total}`;
    document.getElementById('progress-fill').style.width = `${percentage}%`;
}

// 渲染今日行程时间轴
function renderTodayTimeline() {
    const container = document.getElementById('today-timeline');
    if (!container || !tripState.itinerary) return;
    
    const day = tripState.itinerary.days[tripState.currentDay - 1];
    if (!day) return;
    
    document.getElementById('current-day-label').textContent = `第 ${day.day} 天`;
    
    let html = '';
    let attractionIndex = 0;
    
    day.attractions.forEach((item, idx) => {
        if (item.type === 'attraction') {
            const globalIndex = tripState.attractions.findIndex(a => a.id === item.data.id);
            const status = globalIndex < tripState.currentAttractionIndex ? 'done' :
                          globalIndex === tripState.currentAttractionIndex ? 'current' : 'pending';
            
            html += `
                <div class="timeline-item-h ${status === 'current' ? 'active' : ''} ${status === 'done' ? 'completed' : ''}"
                     onclick="jumpToAttraction(${globalIndex})">
                    <div class="item-time">${item.time}</div>
                    <div class="item-name">${item.data.name}</div>
                    <span class="item-status ${status}">${getStatusText(status)}</span>
                </div>
            `;
            attractionIndex++;
        }
    });
    
    container.innerHTML = html;
}

// 获取状态文本
function getStatusText(status) {
    const map = {
        'pending': '待游览',
        'current': '进行中',
        'done': '已完成'
    };
    return map[status] || status;
}

// 更新时间轴项目状态
function updateTimelineItemStatus(index, status) {
    const items = document.querySelectorAll('.timeline-item-h');
    items.forEach((item, idx) => {
        item.classList.remove('active', 'completed');
        if (idx === index) {
            item.classList.add('active');
            const statusEl = item.querySelector('.item-status');
            if (statusEl) statusEl.className = `item-status ${status}`;
        } else if (idx < index) {
            item.classList.add('completed');
            const statusEl = item.querySelector('.item-status');
            if (statusEl) statusEl.className = 'item-status done';
        }
    });
}

// 跳转到指定景点
function jumpToAttraction(index) {
    if (index < tripState.currentAttractionIndex) {
        sendSystemMessage('无法返回已完成的景点。');
        return;
    }
    
    if (index > tripState.currentAttractionIndex) {
        sendSystemMessage('请按顺序游览景点，或使用"调整行程"功能重新规划。');
        return;
    }
}

// 切换日期
function changeDay(delta) {
    const newDay = tripState.currentDay + delta;
    if (newDay < 1 || newDay > tripState.itinerary.days.length) return;
    
    tripState.currentDay = newDay;
    renderTodayTimeline();
}

// 发送消息
function sendMessage() {
    const input = document.getElementById('chat-input');
    const message = input.value.trim();
    
    if (!message) return;
    
    addMessage(message, 'user');
    input.value = '';
    
    // 模拟 AI 回复
    setTimeout(() => {
        processUserMessage(message);
    }, 500);
}

// 发送快捷消息
function sendQuickMessage(message) {
    addMessage(message, 'user');
    setTimeout(() => {
        processUserMessage(message);
    }, 500);
}

// 处理用户消息
function processUserMessage(message) {
    const attraction = getCurrentAttraction();
    
    // 简单的关键词匹配
    if (message.includes('美食') || message.includes('吃')) {
        sendSystemMessage(`在「${attraction?.name || '当前位置'}」附近，我推荐以下美食：
        
🍜 老街小吃 - 距离约 500 米，当地特色小吃
🍲 特色餐厅 - 距离约 800 米，人均消费约 60 元
☕ 咖啡馆 - 距离约 300 米，适合休息

需要导航到其中某一家吗？`);
    } else if (message.includes('注意') || message.includes('事项')) {
        sendSystemMessage(`游览「${attraction?.name || '当前景点'}」的注意事项：

⚠️ 开放时间：${attraction?.open_time || '09:00-18:00'}
🎫 门票价格：${attraction?.price === 0 ? '免费' : '¥' + attraction?.price}
⏱️ 建议游玩时间：${attraction?.recommended_duration || 120} 分钟

💡 温馨提示：
- 请注意保管个人财物
- 遵守景区规定，文明游览
- 建议提前了解景点历史文化`);
    } else if (message.includes('调整') || message.includes('行程')) {
        openAdjustModal();
    } else {
        sendSystemMessage(`我理解您的问题。作为您的旅行助手，我可以：

1. 🍜 推荐附近美食
2. ⚠️ 提供景点注意事项
3. 🔄 协助调整行程
4. ❓ 回答旅行相关问题

请告诉我您需要什么帮助？`);
    }
}

// 添加消息
function addMessage(content, type) {
    const container = document.getElementById('chat-messages');
    
    const messageEl = document.createElement('div');
    messageEl.className = `message ${type}`;
    messageEl.innerHTML = `
        <div class="message-avatar">${type === 'user' ? '👤' : '🤖'}</div>
        <div class="message-content"><p>${content.replace(/\n/g, '</p><p>')}</p></div>
    `;
    
    container.appendChild(messageEl);
    container.scrollTop = container.scrollHeight;
}

// 发送系统消息
function sendSystemMessage(content) {
    addMessage(content, 'system');
}

// 清空聊天
function clearChat() {
    const container = document.getElementById('chat-messages');
    container.innerHTML = `
        <div class="message system">
            <div class="message-avatar">🤖</div>
            <div class="message-content">
                <p>聊天记录已清空。有什么我可以帮您的吗？</p>
            </div>
        </div>
    `;
}

// 处理回车键
function handleKeyPress(event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
}

// 打开调整行程模态框
function openAdjustModal() {
    document.getElementById('adjust-modal').style.display = 'flex';
}

// 关闭调整行程模态框
function closeAdjustModal() {
    document.getElementById('adjust-modal').style.display = 'none';
}

// 跳过当前景点
function skipCurrentAttraction() {
    const attraction = getCurrentAttraction();
    sendSystemMessage(`已跳过「${attraction.name}」。正在为您规划前往下一个景点的路线...`);
    closeAdjustModal();
    
    tripState.currentAttractionIndex++;
    tripState.attractionStatus = 'pending';
    
    renderCurrentAttraction();
    renderTodayTimeline();
    updateNavigation();
    saveTripState();
}

// 延长游览时间
function extendTime(minutes) {
    const attraction = getCurrentAttraction();
    sendSystemMessage(`已为「${attraction.name}」延长 ${minutes} 分钟游览时间。后续行程将相应调整。`);
    closeAdjustModal();
}

// 重新规划路线
function replanRoute() {
    sendSystemMessage('正在根据您的当前位置重新规划剩余行程路线，请稍候...');
    closeAdjustModal();
    
    setTimeout(() => {
        sendSystemMessage('路线已重新规划完成！后续景点顺序已优化，请按新路线继续游览。');
    }, 2000);
}

// 检查闭园时间
function checkClosingTime(attraction) {
    const now = new Date();
    const currentHour = now.getHours();
    
    // 假设大部分景点 18:00 关闭
    if (currentHour >= 16) {
        sendSystemMessage(`⚠️ 提醒：当前时间较晚，请注意「${attraction.name}」的开放时间（${attraction.open_time || '09:00-18:00'}），合理安排游览时间。`);
    }
}

// 定位当前位置
function locateCurrentPosition() {
    sendSystemMessage('正在获取您的当前位置...');
    
    setTimeout(() => {
        sendSystemMessage('已获取您的位置。您当前位于景区内，距离下一个景点约 500 米。');
    }, 1000);
}

// 切换地图图层
function toggleMapLayer() {
    showNotification('已切换地图显示模式', 'info');
}

// 显示行程完成
function showTripCompleted() {
    sendSystemMessage(`🎉 恭喜！您已完成本次行程的所有景点！

📊 行程总结：
- 总景点数：${tripState.attractions.length} 个
- 总游玩时长：约 ${Math.floor((new Date() - tripState.startTime) / (1000 * 60 * 60))} 小时

感谢使用旅游路线助手，期待下次与您同行！`);
    
    document.querySelector('.action-area').innerHTML = `
        <button class="action-btn btn-start" onclick="endTrip()" style="display: flex;">
            <span class="btn-icon">🏁</span>
            <span class="btn-text">结束行程</span>
        </button>
    `;
}

// 显示没有更多景点
function showNoMoreAttractions() {
    document.getElementById('current-content').innerHTML = `
        <div class="empty-trip">
            <div class="empty-icon">🎉</div>
            <h3 class="empty-title">行程已结束</h3>
            <p class="empty-desc">您已完成所有景点的游览！</p>
        </div>
    `;
}

// 显示空状态
function showEmptyState() {
    document.querySelector('.trip-page').innerHTML = `
        <div class="container">
            <div class="empty-state">
                <div class="empty-icon">🗺️</div>
                <h2 class="empty-title">暂无进行中的行程</h2>
                <p class="empty-desc">请先生成行程并点击"开始行程"进入行中模式</p>
                <button class="empty-btn" onclick="goToItinerary()">查看我的行程</button>
            </div>
        </div>
    `;
}

// 跳转到行程详情页
function goToItinerary() {
    window.location.href = './itinerary.html';
}

// 结束行程
function endTrip() {
    if (confirm('确定要结束本次行程吗？')) {
        // 清除计时器
        if (tripState.timerInterval) clearInterval(tripState.timerInterval);
        if (tripState.visitTimerInterval) clearInterval(tripState.visitTimerInterval);
        
        // 清除存储
        localStorage.removeItem('travel_current_trip');
        
        showNotification('行程已结束，感谢使用！', 'success');
        
        setTimeout(() => {
            window.location.href = './itinerary.html';
        }, 1500);
    }
}

// 保存行程状态
function saveTripState() {
    const tripData = {
        itinerary: tripState.itinerary,
        attractions: tripState.attractions,
        params: tripState.params,
        startTime: tripState.startTime.toISOString(),
        currentAttractionIndex: tripState.currentAttractionIndex
    };
    localStorage.setItem('travel_current_trip', JSON.stringify(tripData));
}

// 显示通知
function showNotification(message, type = 'info') {
    const oldNotification = document.querySelector('.notification-toast');
    if (oldNotification) oldNotification.remove();
    
    const notification = document.createElement('div');
    notification.className = `notification-toast notification-${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    setTimeout(() => notification.classList.add('show'), 10);
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// 点击模态框外部关闭
document.addEventListener('click', function(e) {
    const modal = document.getElementById('adjust-modal');
    if (e.target === modal) {
        closeAdjustModal();
    }
});
