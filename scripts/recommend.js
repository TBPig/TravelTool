// 推荐页面逻辑

// 当前推荐数据
let currentRecommendations = {
    searchParams: null,
    attractions: [],
    selectedAttractions: []
};

// 页面加载时初始化
document.addEventListener('DOMContentLoaded', function() {
    checkUserLogin();
    loadSearchParams();
    loadRecommendations();
});

// 从 URL 和 localStorage 加载搜索参数
function loadSearchParams() {
    const urlParams = new URLSearchParams(window.location.search);
    const profileJson = localStorage.getItem('travel_user_profile');
    
    let searchParams = {};
    
    // 优先从 URL 获取参数
    if (urlParams.has('departure')) {
        searchParams = {
            departure: urlParams.get('departure'),
            destination: urlParams.get('destination'),
            days: urlParams.get('days'),
            intensity: urlParams.get('intensity'),
            interests: urlParams.get('interests') ? urlParams.get('interests').split(',') : [],
            companion: urlParams.get('companion')
        };
    } else if (profileJson) {
        // 从 localStorage 获取
        searchParams = JSON.parse(profileJson);
    }
    
    currentRecommendations.searchParams = searchParams;
    renderSearchSummary(searchParams);
}

// 渲染搜索条件摘要
function renderSearchSummary(params) {
    const container = document.getElementById('search-summary');
    if (!params || !container) return;
    
    const interestsText = params.interests && params.interests.length > 0
        ? params.interests.map(i => getInterestTagText(i)).join('、')
        : '未选择';
    
    container.innerHTML = `
        <span class="summary-tag primary">${params.departure || '未设置'} → ${params.destination || '未设置'}</span>
        <span class="summary-tag">${params.days ? getDaysText(params.days) : ''}</span>
        <span class="summary-tag">${getIntensityText(params.intensity)}</span>
        <span class="summary-tag">${getCompanionText(params.companion)}</span>
        <span class="summary-tag">${interestsText}</span>
    `;
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

// 加载推荐数据
async function loadRecommendations() {
    let params = currentRecommendations.searchParams;
    
    // 如果没有参数，使用测试数据进行演示
    if (!params || !params.destination) {
        params = {
            departure: '北京',
            destination: '杭州',
            days: '4-7',
            intensity: 'moderate',
            interests: ['nature', 'culture', 'food'],
            companion: 'couple'
        };
        currentRecommendations.searchParams = params;
        renderSearchSummary(params);
        console.log('使用测试数据进行演示');
    }
    
    try {
        // 构建查询参数
        const queryParams = new URLSearchParams();
        if (params.destination) queryParams.append('city', params.destination);
        
        // 根据兴趣标签筛选景点类型
        if (params.interests && params.interests.length > 0) {
            const typeMap = {
                'nature': 'nature',
                'culture': 'culture',
                'food': 'food',
                'relax': 'relax',
                'adventure': 'adventure',
                'shopping': 'shopping',
                'photo': 'scenic',
                'nightlife': 'entertainment'
            };
            // 使用第一个兴趣作为类型筛选
            const type = typeMap[params.interests[0]];
            if (type) queryParams.append('type', type);
        }
        
        // 调用 API 获取景点
        const response = await fetch(`${API_BASE_URL}/attractions?${queryParams}`);
        const result = await response.json();
        
        if (result.success) {
            // 计算匹配度并排序
            const attractionsWithScore = calculateMatchScore(result.data, params);
            currentRecommendations.attractions = attractionsWithScore;
            currentRecommendations.selectedAttractions = attractionsWithScore.slice(0, 8); // 默认选择前8个
            
            renderAttractions(attractionsWithScore);
            renderRoutePreview();
        } else {
            // 使用模拟数据
            useMockData(params);
        }
    } catch (error) {
        console.error('获取推荐失败:', error);
        useMockData(params);
    }
}

// 计算景点匹配度
function calculateMatchScore(attractions, params) {
    return attractions.map(attraction => {
        let score = 50; // 基础分
        let reasons = [];
        
        // 根据兴趣标签匹配
        if (params.interests && params.interests.length > 0) {
            const interestTypes = {
                'nature': ['nature', 'scenic', 'park'],
                'culture': ['culture', 'history', 'museum'],
                'food': ['food', 'restaurant', 'market'],
                'relax': ['relax', 'spa', 'resort'],
                'adventure': ['adventure', 'outdoor', 'sports'],
                'shopping': ['shopping', 'mall', 'market'],
                'photo': ['scenic', 'landmark', 'nature'],
                'nightlife': ['nightlife', 'bar', 'entertainment']
            };
            
            params.interests.forEach(interest => {
                const types = interestTypes[interest] || [];
                if (types.some(type => attraction.type === type || 
                    (attraction.tags && attraction.tags.includes(type)))) {
                    score += 15;
                    reasons.push(`符合${getInterestTagText(interest)}偏好`);
                }
            });
        }
        
        // 根据游玩强度调整
        if (params.intensity) {
            const duration = attraction.recommended_duration || 120;
            if (params.intensity === 'relaxed' && duration <= 90) {
                score += 10;
                reasons.push('适合休闲游览');
            } else if (params.intensity === 'intensive' && duration >= 180) {
                score += 10;
                reasons.push('内容充实丰富');
            }
        }
        
        // 根据同行人调整
        if (params.companion) {
            const companionScores = {
                'family': attraction.suitable_for_family ? 10 : 0,
                'elderly': attraction.suitable_for_elderly ? 10 : 0,
                'couple': attraction.suitable_for_couple ? 10 : 0,
                'solo': 5,
                'friends': 5
            };
            score += companionScores[params.companion] || 0;
            if (companionScores[params.companion] > 0) {
                reasons.push(`适合${getCompanionText(params.companion)}`);
            }
        }
        
        // 根据评分调整
        if (attraction.rating) {
            score += (attraction.rating - 3) * 5;
        }
        
        // 限制分数范围
        score = Math.min(100, Math.max(0, score));
        
        return {
            ...attraction,
            matchScore: Math.round(score),
            matchReasons: reasons.slice(0, 3) // 最多显示3个理由
        };
    }).sort((a, b) => b.matchScore - a.matchScore);
}

// 使用模拟数据
function useMockData(params) {
    const mockAttractions = generateMockAttractions(params);
    const attractionsWithScore = calculateMatchScore(mockAttractions, params);
    currentRecommendations.attractions = attractionsWithScore;
    currentRecommendations.selectedAttractions = attractionsWithScore.slice(0, 8);
    
    renderAttractions(attractionsWithScore);
    renderRoutePreview();
}

// 生成模拟景点数据
function generateMockAttractions(params) {
    const destination = params.destination || '杭州';
    
    // 根据不同城市提供不同的景点数据
    const cityAttractions = {
        '杭州': [
            { name: '西湖风景区', type: 'nature', rating: 4.9, duration: 240, price: 0, desc: '世界文化遗产，中国十大风景名胜之一，以"一山、二塔、三岛、三堤、五湖"为基本格局' },
            { name: '灵隐寺', type: 'culture', rating: 4.7, duration: 150, price: 75, desc: '中国佛教著名寺院，始建于东晋，已有1700多年历史，是杭州最早的名刹' },
            { name: '河坊街', type: 'food', rating: 4.5, duration: 120, price: 0, desc: '杭州历史文化街区，集特色小吃、古玩字画、老字号店铺于一体' },
            { name: '西溪湿地', type: 'nature', rating: 4.6, duration: 180, price: 80, desc: '国家5A级景区，罕见的城中次生湿地，被誉为"杭州之肾"' },
            { name: '宋城景区', type: 'entertainment', rating: 4.6, duration: 240, price: 320, desc: '大型宋代主题公园，《宋城千古情》演出精彩绝伦' },
            { name: '雷峰塔', type: 'culture', rating: 4.5, duration: 90, price: 40, desc: '西湖十景之一，白娘子传说的发源地，登塔可俯瞰西湖全景' },
            { name: '断桥残雪', type: 'scenic', rating: 4.7, duration: 60, price: 0, desc: '西湖十景之一，白娘子与许仙相遇之地，冬日雪景尤为迷人' },
            { name: '龙井村', type: 'nature', rating: 4.6, duration: 120, price: 0, desc: '中国名茶龙井茶的产地，茶园风光秀丽，可品茶赏景' },
            { name: '杭州宋城千古情', type: 'entertainment', rating: 4.8, duration: 180, price: 320, desc: '世界三大名秀之一，演绎杭州千年历史文化' },
            { name: '千岛湖', type: 'nature', rating: 4.8, duration: 360, price: 150, desc: '天下第一秀水，湖中有大小岛屿1078座，风景如画' },
            { name: '清河坊步行街', type: 'shopping', rating: 4.4, duration: 90, price: 0, desc: '杭州最著名的商业街，历史悠久，特色店铺林立' },
            { name: '九溪烟树', type: 'nature', rating: 4.6, duration: 150, price: 0, desc: '西湖新十景之一，溪流潺潺，林木葱郁，避暑胜地' }
        ],
        '北京': [
            { name: '故宫博物院', type: 'culture', rating: 4.9, duration: 240, price: 60, desc: '世界最大的古代宫殿建筑群，明清两代皇宫，珍藏文物百万件' },
            { name: '长城(八达岭)', type: 'culture', rating: 4.8, duration: 300, price: 40, desc: '世界七大奇迹之一，中华民族的象征，气势磅礴' },
            { name: '颐和园', type: 'nature', rating: 4.7, duration: 180, price: 30, desc: '中国现存规模最大、保存最完整的皇家园林' },
            { name: '天坛公园', type: 'culture', rating: 4.6, duration: 120, price: 15, desc: '明清两代皇帝祭天的场所，祈年殿为北京标志性建筑' },
            { name: '南锣鼓巷', type: 'food', rating: 4.4, duration: 90, price: 0, desc: '北京最古老的街区之一，特色小店和美食云集' },
            { name: '圆明园', type: 'culture', rating: 4.5, duration: 150, price: 25, desc: '清代皇家园林，被誉为"万园之园"' },
            { name: '什刹海', type: 'nightlife', rating: 4.5, duration: 120, price: 0, desc: '北京内城唯一具有开阔水面的开放景区，酒吧街闻名' },
            { name: '798艺术区', type: 'culture', rating: 4.6, duration: 150, price: 0, desc: '当代艺术圣地，画廊、艺术工作室云集' },
            { name: '王府井步行街', type: 'shopping', rating: 4.4, duration: 120, price: 0, desc: '北京最著名的商业街，百年老店与时尚品牌并存' },
            { name: '鸟巢(国家体育场)', type: 'scenic', rating: 4.6, duration: 90, price: 100, desc: '2008年北京奥运会主体育场，建筑奇观' }
        ],
        '上海': [
            { name: '外滩', type: 'scenic', rating: 4.8, duration: 120, price: 0, desc: '上海标志性景观，万国建筑博览群，夜景璀璨' },
            { name: '东方明珠', type: 'scenic', rating: 4.6, duration: 90, price: 199, desc: '上海地标建筑，登塔俯瞰浦江两岸风光' },
            { name: '豫园', type: 'culture', rating: 4.5, duration: 120, price: 40, desc: '江南古典园林，明代私家园林代表作' },
            { name: '南京路步行街', type: 'shopping', rating: 4.5, duration: 150, price: 0, desc: '中华商业第一街，购物天堂' },
            { name: '田子坊', type: 'shopping', rating: 4.4, duration: 90, price: 0, desc: '文艺气息浓厚的创意园区，特色小店林立' },
            { name: '上海迪士尼', type: 'entertainment', rating: 4.8, duration: 480, price: 475, desc: '中国大陆首座迪士尼主题乐园，梦幻之旅' },
            { name: '城隍庙', type: 'food', rating: 4.4, duration: 90, price: 0, desc: '上海道教正一派主要道观，周边美食云集' },
            { name: '新天地', type: 'nightlife', rating: 4.6, duration: 120, price: 0, desc: '石库门建筑群改造的时尚休闲区，夜生活丰富' }
        ]
    };
    
    // 获取对应城市的景点，如果没有则使用默认数据
    let baseAttractions = cityAttractions[destination];
    if (!baseAttractions) {
        baseAttractions = [
            { name: `${destination}古城`, type: 'culture', rating: 4.5, duration: 120, price: 30, desc: `${destination}的历史文化名片，古韵悠然` },
            { name: `${destination}国家森林公园`, type: 'nature', rating: 4.8, duration: 180, price: 50, desc: `自然风光秀丽，是${destination}的绿色明珠` },
            { name: `${destination}美食街`, type: 'food', rating: 4.3, duration: 90, price: 0, desc: `汇聚${destination}特色美食，吃货天堂` },
            { name: `${destination}博物馆`, type: 'culture', rating: 4.4, duration: 120, price: 0, desc: `了解${destination}历史文化的最佳去处` },
            { name: `${destination}湖滨公园`, type: 'nature', rating: 4.6, duration: 90, price: 0, desc: `市民休闲好去处，湖光山色美不胜收` },
            { name: `${destination}购物中心`, type: 'shopping', rating: 4.2, duration: 150, price: 0, desc: `购物娱乐一站式体验` },
            { name: `${destination}夜市`, type: 'nightlife', rating: 4.4, duration: 120, price: 0, desc: `夜生活精彩纷呈，美食小吃琳琅满目` },
            { name: `${destination}寺庙`, type: 'culture', rating: 4.5, duration: 90, price: 20, desc: `千年古刹，香火鼎盛` }
        ];
    }
    
    return baseAttractions.map((attr, index) => ({
        id: index + 1,
        name: attr.name,
        description: attr.desc || `${attr.name}是${destination}的著名景点，拥有独特的风景和丰富的文化内涵，是游客必去的打卡地之一。`,
        type: attr.type,
        city: destination,
        address: `${destination}市${['西湖区', '上城区', '拱墅区', '滨江区', '萧山区'][index % 5]}路${index + 1}号`,
        rating: attr.rating,
        recommended_duration: attr.duration || [60, 90, 120, 150, 180][index % 5],
        price: attr.price !== undefined ? attr.price : [0, 30, 50, 80, 100, 150][index % 6],
        image_url: `https://picsum.photos/400/250?random=${index + 10}`,
        tags: [attr.type, 'popular', destination],
        suitable_for_family: ['nature', 'culture', 'entertainment'].includes(attr.type),
        suitable_for_elderly: ['culture', 'scenic', 'relax'].includes(attr.type),
        suitable_for_couple: ['scenic', 'nature', 'nightlife'].includes(attr.type),
        open_time: '09:00-18:00',
        best_visit_time: ['早晨', '下午', '傍晚'][index % 3]
    }));
}

// 渲染景点列表
function renderAttractions(attractions) {
    const container = document.getElementById('attractions-container');
    if (!container) return;
    
    if (attractions.length === 0) {
        container.innerHTML = '<div class="no-data">暂无推荐景点</div>';
        return;
    }
    
    container.innerHTML = attractions.map((attr, index) => `
        <div class="attraction-card ${isSelected(attr.id) ? 'selected' : ''}" data-id="${attr.id}">
            <div class="attraction-image">
                <img src="${attr.image_url || 'https://picsum.photos/400/250?random=' + attr.id}" alt="${attr.name}" />
                <div class="match-score">
                    <span class="score-value">${attr.matchScore}%</span>
                    <span class="score-label">匹配度</span>
                </div>
                ${isSelected(attr.id) ? '<div class="selected-badge">✓ 已选</div>' : ''}
            </div>
            <div class="attraction-content">
                <div class="attraction-header">
                    <h3>${attr.name}</h3>
                    <div class="rating">
                        <span class="stars">${'★'.repeat(Math.floor(attr.rating || 4))}</span>
                        <span class="rating-value">${attr.rating || 4.0}</span>
                    </div>
                </div>
                <p class="attraction-desc">${attr.description}</p>
                <div class="attraction-tags">
                    ${renderAttractionTags(attr)}
                </div>
                <div class="match-reasons">
                    ${attr.matchReasons.map(reason => `<span class="reason-tag">${reason}</span>`).join('')}
                </div>
                <div class="attraction-info">
                    <span class="info-item">⏱️ ${attr.recommended_duration || 120}分钟</span>
                    <span class="info-item">💰 ${attr.price === 0 ? '免费' : '¥' + attr.price}</span>
                    <span class="info-item">📍 ${attr.address || attr.city}</span>
                </div>
                <div class="attraction-actions">
                    <button class="btn-toggle-select" onclick="toggleAttraction(${attr.id})">
                        ${isSelected(attr.id) ? '移除' : '添加到行程'}
                    </button>
                    <button class="btn-view-detail" onclick="viewAttractionDetail(${attr.id})">查看详情</button>
                </div>
            </div>
        </div>
    `).join('');
}

// 渲染景点标签
function renderAttractionTags(attraction) {
    const typeMap = {
        'nature': '🌲 自然风光',
        'culture': '🏛️ 人文历史',
        'food': '🍜 美食',
        'relax': '🏖️ 休闲',
        'adventure': '🧗 探险',
        'shopping': '🛍️ 购物',
        'scenic': '📸 拍照',
        'entertainment': '🎢 娱乐',
        'nightlife': '🌃 夜生活'
    };
    
    let tags = [];
    if (attraction.type) {
        tags.push(typeMap[attraction.type] || attraction.type);
    }
    if (attraction.tags) {
        attraction.tags.slice(0, 2).forEach(tag => {
            if (typeMap[tag] && !tags.includes(typeMap[tag])) {
                tags.push(typeMap[tag]);
            }
        });
    }
    return tags.map(tag => `<span class="tag">${tag}</span>`).join('');
}

// 检查景点是否已选择
function isSelected(attractionId) {
    return currentRecommendations.selectedAttractions.some(a => a.id === attractionId);
}

// 切换景点选择状态
function toggleAttraction(attractionId) {
    const attraction = currentRecommendations.attractions.find(a => a.id === attractionId);
    if (!attraction) return;
    
    const index = currentRecommendations.selectedAttractions.findIndex(a => a.id === attractionId);
    if (index > -1) {
        currentRecommendations.selectedAttractions.splice(index, 1);
    } else {
        currentRecommendations.selectedAttractions.push(attraction);
    }
    
    renderAttractions(currentRecommendations.attractions);
    renderRoutePreview();
}

// 渲染路线预览
function renderRoutePreview() {
    const container = document.getElementById('route-timeline');
    if (!container) return;
    
    const selected = currentRecommendations.selectedAttractions;
    const params = currentRecommendations.searchParams;
    
    if (selected.length === 0) {
        container.innerHTML = '<div class="no-selection">请选择至少一个景点生成行程</div>';
        return;
    }
    
    // 根据天数分组
    const daysRange = params?.days || '1-3';
    let totalDays = 3;
    if (daysRange === '1-3') totalDays = 2;
    else if (daysRange === '4-7') totalDays = 5;
    else if (daysRange === '8-15') totalDays = 7;
    else if (daysRange === '15+') totalDays = 10;
    
    const attractionsPerDay = Math.ceil(selected.length / totalDays);
    
    let html = '';
    for (let day = 1; day <= totalDays && (day - 1) * attractionsPerDay < selected.length; day++) {
        const dayAttractions = selected.slice((day - 1) * attractionsPerDay, day * attractionsPerDay);
        
        html += `
            <div class="day-card">
                <div class="day-header">
                    <span class="day-number">第${day}天</span>
                    <span class="day-date">${getDayDate(day)}</span>
                </div>
                <div class="day-attractions">
                    ${dayAttractions.map((attr, idx) => `
                        <div class="timeline-item">
                            <div class="timeline-time">${getTimeSlot(idx)}</div>
                            <div class="timeline-content">
                                <div class="timeline-dot"></div>
                                <div class="attraction-brief">
                                    <img src="${attr.image_url || 'https://picsum.photos/100/100?random=' + attr.id}" alt="${attr.name}" />
                                    <div class="brief-info">
                                        <h4>${attr.name}</h4>
                                        <p>⏱️ ${attr.recommended_duration || 120}分钟</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }
    
    container.innerHTML = html;
}

// 获取日期字符串
function getDayDate(dayOffset) {
    const date = new Date();
    date.setDate(date.getDate() + dayOffset);
    return `${date.getMonth() + 1}月${date.getDate()}日`;
}

// 获取时间段
function getTimeSlot(index) {
    const slots = ['09:00', '10:30', '14:00', '15:30', '17:00', '19:00'];
    return slots[index % slots.length];
}

// 查看景点详情
function viewAttractionDetail(attractionId) {
    const attraction = currentRecommendations.attractions.find(a => a.id === attractionId);
    if (!attraction) return;
    
    // 创建模态框显示详情
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content">
            <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">×</button>
            <img src="${attraction.image_url || 'https://picsum.photos/600/300?random=' + attraction.id}" alt="${attraction.name}" />
            <h2>${attraction.name}</h2>
            <div class="modal-body">
                <p class="modal-desc">${attraction.description}</p>
                <div class="modal-info">
                    <p><strong>📍 地址：</strong>${attraction.address || attraction.city}</p>
                    <p><strong>⏰ 开放时间：</strong>${attraction.open_time || '09:00-18:00'}</p>
                    <p><strong>⏱️ 建议游览：</strong>${attraction.recommended_duration || 120}分钟</p>
                    <p><strong>💰 门票：</strong>${attraction.price === 0 ? '免费' : '¥' + attraction.price}</p>
                    <p><strong>⭐ 评分：</strong>${attraction.rating || 4.0}/5.0</p>
                    <p><strong>🎯 匹配度：</strong>${attraction.matchScore}%</p>
                </div>
                <div class="modal-reasons">
                    <h4>推荐理由</h4>
                    ${attraction.matchReasons.map(r => `<span class="reason-tag">${r}</span>`).join('')}
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    
    // 点击遮罩关闭
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.remove();
    });
}

// 显示错误信息
function showError(message) {
    const container = document.getElementById('attractions-container');
    if (container) {
        container.innerHTML = `<div class="error-message">${message}</div>`;
    }
}

// 返回首页修改条件
function goBackToHome() {
    window.location.href = './home.html';
}

// 重新推荐
function refreshRecommendations() {
    loadRecommendations();
    showNotification('🔄 已重新生成推荐', 'info');
}

// 确认生成最终行程
function confirmRoute() {
    const selected = currentRecommendations.selectedAttractions;
    if (selected.length === 0) {
        showNotification('⚠️ 请至少选择一个景点', 'warning');
        return;
    }

    // 保存选择的景点到 localStorage
    localStorage.setItem('travel_selected_attractions', JSON.stringify(selected));
    localStorage.setItem('travel_route_params', JSON.stringify(currentRecommendations.searchParams));

    // 完成路线选择步骤
    if (window.SidebarAPI) {
        window.SidebarAPI.completeStep('route');
    }

    showNotification('✅ 正在生成最终行程...', 'success');

    // 跳转到行程详情页
    setTimeout(() => {
        window.location.href = './itinerary.html';
    }, 800);
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
