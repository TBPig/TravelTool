// 行程详情页逻辑

// 当前行程数据
let currentItinerary = {
    attractions: [],
    params: null,
    itineraryData: null,
    currentDay: 1
};

// 页面加载时初始化
document.addEventListener('DOMContentLoaded', function() {
    checkUserLogin();
    loadItineraryData();
});

// 加载行程数据
function loadItineraryData() {
    const attractionsJson = localStorage.getItem('travel_selected_attractions');
    const paramsJson = localStorage.getItem('travel_route_params');
    
    if (!attractionsJson || !paramsJson) {
        showEmptyState();
        return;
    }
    
    try {
        currentItinerary.attractions = JSON.parse(attractionsJson);
        currentItinerary.params = JSON.parse(paramsJson);
        
        // 生成完整行程数据
        currentItinerary.itineraryData = generateItineraryData();
        
        // 渲染页面
        renderTripHeader();
        renderStats();
        renderMap();
        renderDayTabs();
        renderTimeline();
        
    } catch (error) {
        console.error('加载行程数据失败:', error);
        showEmptyState();
    }
}

// 生成完整行程数据
function generateItineraryData() {
    const { attractions, params } = currentItinerary;
    const daysRange = params?.days || '1-3';
    
    let totalDays = 3;
    if (daysRange === '1-3') totalDays = 2;
    else if (daysRange === '4-7') totalDays = 5;
    else if (daysRange === '8-15') totalDays = 7;
    else if (daysRange === '15+') totalDays = 10;
    
    const attractionsPerDay = Math.ceil(attractions.length / totalDays);
    const days = [];
    
    for (let day = 1; day <= totalDays && (day - 1) * attractionsPerDay < attractions.length; day++) {
        const dayAttractions = attractions.slice((day - 1) * attractionsPerDay, day * attractionsPerDay);
        const daySchedule = generateDaySchedule(dayAttractions, day);
        
        days.push({
            day: day,
            date: getDayDate(day),
            attractions: daySchedule
        });
    }
    
    return {
        totalDays: days.length,
        days: days
    };
}

// 生成每日行程安排（包含交通）
function generateDaySchedule(dayAttractions, dayIndex) {
    const schedule = [];
    const timeSlots = [
        { start: '09:00', end: '10:30' },
        { start: '11:00', end: '12:30' },
        { start: '14:00', end: '15:30' },
        { start: '16:00', end: '17:30' },
        { start: '19:00', end: '20:30' }
    ];
    
    dayAttractions.forEach((attraction, index) => {
        const slot = timeSlots[index % timeSlots.length];
        const duration = attraction.recommended_duration || 120;
        
        // 添加景点
        schedule.push({
            type: 'attraction',
            time: slot.start,
            endTime: slot.end,
            data: attraction,
            duration: duration
        });
        
        // 如果不是最后一个景点，添加交通信息
        if (index < dayAttractions.length - 1) {
            const transportTime = estimateTransportTime(attraction, dayAttractions[index + 1]);
            schedule.push({
                type: 'transport',
                time: slot.end,
                duration: transportTime,
                from: attraction.name,
                to: dayAttractions[index + 1].name,
                method: getTransportMethod(transportTime)
            });
        }
    });
    
    return schedule;
}

// 估算交通时间（分钟）
function estimateTransportTime(from, to) {
    // 模拟计算，实际应该使用地图 API
    const baseTime = 15;
    const randomFactor = Math.floor(Math.random() * 20);
    return baseTime + randomFactor;
}

// 获取交通方式
function getTransportMethod(minutes) {
    if (minutes <= 10) return { icon: '🚶', name: '步行', color: '#52c41a' };
    if (minutes <= 20) return { icon: '🚌', name: '公交', color: '#1890ff' };
    if (minutes <= 30) return { icon: '🚇', name: '地铁', color: '#722ed1' };
    return { icon: '🚕', name: '打车', color: '#faad14' };
}

// 获取日期字符串
function getDayDate(dayOffset) {
    const date = new Date();
    date.setDate(date.getDate() + dayOffset);
    return `${date.getMonth() + 1}月${date.getDate()}日`;
}

// 渲染行程头部
function renderTripHeader() {
    const { params } = currentItinerary;
    if (!params) return;
    
    const titleEl = document.getElementById('trip-title');
    const metaEl = document.getElementById('trip-meta');
    
    titleEl.textContent = `🎯 ${params.destination || '目的地'}之旅`;
    
    const interestsText = params.interests && params.interests.length > 0
        ? params.interests.map(i => getInterestTagText(i)).join('、')
        : '综合体验';
    
    metaEl.innerHTML = `
        <span>📍 ${params.destination || '未设置'}</span>
        <span>📅 ${getDaysText(params.days)}</span>
        <span>👥 ${getCompanionText(params.companion)}</span>
        <span>🏷️ ${interestsText}</span>
    `;
}

// 渲染统计卡片
function renderStats() {
    const { attractions, itineraryData, params } = currentItinerary;
    
    // 天数
    document.getElementById('stat-days').textContent = `${itineraryData.totalDays}天`;
    
    // 景点数量
    document.getElementById('stat-attractions').textContent = `${attractions.length}个`;
    
    // 总游玩时长
    const totalDuration = attractions.reduce((sum, a) => sum + (a.recommended_duration || 120), 0);
    const hours = Math.floor(totalDuration / 60);
    const mins = totalDuration % 60;
    document.getElementById('stat-duration').textContent = `${hours}小时${mins > 0 ? mins + '分钟' : ''}`;
    
    // 预估费用
    const totalCost = attractions.reduce((sum, a) => sum + (a.price || 0), 0);
    document.getElementById('stat-cost').textContent = `¥${totalCost}`;
}

// 渲染地图
function renderMap() {
    const container = document.getElementById('map-markers');
    if (!container) return;
    
    const { attractions } = currentItinerary;
    
    // 模拟地图标记点位置
    let html = '';
    attractions.forEach((attr, index) => {
        // 随机位置（实际应该使用真实经纬度）
        const left = 15 + (index % 5) * 18 + Math.random() * 5;
        const top = 20 + Math.floor(index / 5) * 25 + Math.random() * 5;
        
        html += `
            <div class="map-marker" style="left: ${left}%; top: ${top}%;" onclick="viewAttractionDetail(${attr.id})">
                <div class="marker-pin">
                    <span class="marker-number">${index + 1}</span>
                </div>
                <div class="marker-label">${attr.name}</div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// 渲染日期标签
function renderDayTabs() {
    const container = document.getElementById('day-tabs');
    if (!container) return;
    
    const { days } = currentItinerary.itineraryData;
    
    container.innerHTML = days.map((day, index) => `
        <div class="day-tab ${index === 0 ? 'active' : ''}" onclick="switchDay(${day.day})">
            <div>第${day.day}天</div>
            <span class="tab-date">${day.date}</span>
        </div>
    `).join('');
}

// 渲染时间轴
function renderTimeline() {
    const container = document.getElementById('timeline-content');
    if (!container) return;
    
    const { days } = currentItinerary.itineraryData;
    
    container.innerHTML = days.map(day => `
        <div class="day-timeline ${day.day === 1 ? 'active' : ''}" data-day="${day.day}">
            ${day.attractions.map((item, index) => renderTimelineItem(item, index)).join('')}
        </div>
    `).join('');
}

// 渲染时间轴项目
function renderTimelineItem(item, index) {
    if (item.type === 'attraction') {
        const attr = item.data;
        return `
            <div class="timeline-item">
                <div class="timeline-time">
                    <div class="time-start">${item.time}</div>
                    <div class="time-end">${item.endTime}</div>
                </div>
                <div class="timeline-line">
                    <div class="timeline-dot"></div>
                </div>
                <div class="timeline-card" onclick="viewAttractionDetail(${attr.id})">
                    <div class="card-header">
                        <h3 class="card-title">${attr.name}</h3>
                        <span class="card-type">${getTypeText(attr.type)}</span>
                    </div>
                    <div class="card-image">
                        <img src="${attr.image_url || 'https://picsum.photos/400/200?random=' + attr.id}" alt="${attr.name}" />
                    </div>
                    <p class="card-desc">${attr.description || '暂无描述'}</p>
                    <div class="card-info">
                        <span class="info-item">⏱️ 建议游玩 ${item.duration} 分钟</span>
                        <span class="info-item">💰 ${attr.price === 0 ? '免费' : '¥' + attr.price}</span>
                        <span class="info-item">⭐ ${attr.rating || 4.0}分</span>
                    </div>
                    <div class="card-tags">
                        ${(attr.tags || []).slice(0, 3).map(tag => `<span class="tag">${tag}</span>`).join('')}
                    </div>
                </div>
            </div>
        `;
    } else {
        const transport = item.method;
        return `
            <div class="timeline-item transport">
                <div class="timeline-time">
                    <div class="time-start">${item.time}</div>
                </div>
                <div class="timeline-line">
                    <div class="timeline-dot"></div>
                </div>
                <div class="timeline-card transport-card">
                    <div class="transport-info">
                        <span class="transport-icon">${transport.icon}</span>
                        <div class="transport-detail">
                            <div class="transport-time">${transport.name} · 约 ${item.duration} 分钟</div>
                            <div style="font-size: 12px; color: #999; margin-top: 4px;">
                                ${item.from} → ${item.to}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
}

// 切换日期
function switchDay(day) {
    currentItinerary.currentDay = day;
    
    // 更新标签状态
    document.querySelectorAll('.day-tab').forEach(tab => {
        tab.classList.remove('active');
        if (tab.textContent.includes(`第${day}天`)) {
            tab.classList.add('active');
        }
    });
    
    // 更新时间轴显示
    document.querySelectorAll('.day-timeline').forEach(timeline => {
        timeline.classList.remove('active');
        if (parseInt(timeline.dataset.day) === day) {
            timeline.classList.add('active');
        }
    });
}

// 查看景点详情
function viewAttractionDetail(attractionId) {
    const attraction = currentItinerary.attractions.find(a => a.id === attractionId);
    if (!attraction) return;
    
    const modal = document.getElementById('attraction-modal');
    const body = document.getElementById('modal-body');
    
    body.innerHTML = `
        <img class="modal-image" src="${attraction.image_url || 'https://picsum.photos/600/300?random=' + attraction.id}" alt="${attraction.name}" />
        <div class="modal-info-section">
            <h2 class="modal-title">${attraction.name}</h2>
            <p class="modal-desc">${attraction.description || '暂无描述'}</p>
            <div class="modal-details">
                <div class="detail-row">
                    <span class="detail-label">📍 地址</span>
                    <span class="detail-value">${attraction.address || attraction.city || '暂无'}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">⏰ 开放时间</span>
                    <span class="detail-value">${attraction.open_time || '09:00-18:00'}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">⏱️ 建议游玩</span>
                    <span class="detail-value">${attraction.recommended_duration || 120} 分钟</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">💰 门票价格</span>
                    <span class="detail-value">${attraction.price === 0 ? '免费' : '¥' + attraction.price}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">⭐ 评分</span>
                    <span class="detail-value">${attraction.rating || 4.0} / 5.0</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">🎯 匹配度</span>
                    <span class="detail-value">${attraction.matchScore || 80}%</span>
                </div>
            </div>
        </div>
    `;
    
    modal.style.display = 'flex';
}

// 关闭模态框
function closeModal() {
    document.getElementById('attraction-modal').style.display = 'none';
}

// 显示空状态
function showEmptyState() {
    document.querySelector('.itinerary-page').innerHTML = `
        <div class="container">
            <div class="empty-state">
                <div class="empty-icon">🗺️</div>
                <h2 class="empty-title">暂无行程</h2>
                <p class="empty-desc">您还没有生成任何行程，快去创建您的专属旅行计划吧！</p>
                <button class="empty-btn" onclick="goBackToRecommend()">去创建行程</button>
            </div>
        </div>
    `;
}

// 返回推荐页
function goBackToRecommend() {
    window.location.href = './recommend.html';
}

// 开始行程
function startTrip() {
    // 保存当前行程到行中模式
    localStorage.setItem('travel_current_trip', JSON.stringify({
        itinerary: currentItinerary.itineraryData,
        attractions: currentItinerary.attractions,
        params: currentItinerary.params,
        startTime: new Date().toISOString(),
        currentAttractionIndex: 0
    }));

    // 完成行程选择步骤
    if (window.SidebarAPI) {
        window.SidebarAPI.completeStep('itinerary');
    }

    showNotification('🚀 正在进入行中助手...', 'success');

    setTimeout(() => {
        window.location.href = './trip.html';
    }, 1000);
}

// 获取兴趣标签文本
function getInterestTagText(interest) {
    const map = {
        'nature': '自然风光',
        'culture': '人文历史',
        'food': '美食探索',
        'relax': '休闲度假',
        'adventure': '户外探险',
        'shopping': '购物娱乐',
        'photo': '摄影打卡',
        'nightlife': '夜生活'
    };
    return map[interest] || interest;
}

// 获取天数文本
function getDaysText(days) {
    const map = {
        '1-3': '1-3天',
        '4-7': '4-7天',
        '8-15': '8-15天',
        '15+': '15天以上'
    };
    return map[days] || days;
}

// 获取同行人文本
function getCompanionText(companion) {
    const map = {
        'family': '家庭亲子',
        'couple': '情侣出游',
        'friends': '朋友结伴',
        'solo': '独自旅行',
        'elderly': '带父母'
    };
    return map[companion] || companion;
}

// 获取类型文本
function getTypeText(type) {
    const map = {
        'nature': '🌲 自然',
        'culture': '🏛️ 文化',
        'food': '🍜 美食',
        'relax': '🏖️ 休闲',
        'adventure': '🧗 探险',
        'shopping': '🛍️ 购物',
        'scenic': '📸 拍照',
        'entertainment': '🎢 娱乐',
        'nightlife': '🌃 夜生活'
    };
    return map[type] || type;
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
    const modal = document.getElementById('attraction-modal');
    if (e.target === modal) {
        closeModal();
    }
});
