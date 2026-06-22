const demoTrip = {
    destination: '北京',
    startTime: new Date().toISOString(),
    stops: [
        {
            id: 1,
            time: '09:00',
            name: '天安门广场',
            duration: '45 分钟',
            note: '从北京中轴线南段出发，广场视野开阔，适合作为一天行程的开场。',
            eta: '步行 10 分钟',
            distance: '0.8 km',
            ticket: '免费',
            openTime: '全天开放，升旗需提前查询时间',
            photo: '人民英雄纪念碑东侧、广场中轴线取景',
            food: '前门大街可补早餐和咖啡',
            restroom: '广场周边安检区外公共卫生间',
            imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/66/200401-beijing-tianan-square-overview.jpg/960px-200401-beijing-tianan-square-overview.jpg',
            lat: 39.9055,
            lng: 116.3914
        },
        {
            id: 2,
            time: '10:00',
            name: '故宫博物院',
            duration: '2.5 小时',
            note: '沿午门进入宫城，依次游览太和殿、中和殿、保和殿，也可按兴趣加入珍宝馆或钟表馆。',
            eta: '步行 8 分钟',
            distance: '0.6 km',
            ticket: '旺季 60 元，淡季 40 元，需预约',
            openTime: '通常 08:30-17:00，周一闭馆',
            photo: '太和殿广场、角楼、神武门外',
            food: '故宫内轻食为主，午餐建议放到景山或什刹海附近',
            restroom: '午门、太和门、御花园附近均有卫生间',
            imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Forbidden_city_06.jpg/960px-Forbidden_city_06.jpg',
            lat: 39.9163,
            lng: 116.3972
        },
        {
            id: 3,
            time: '13:30',
            name: '景山公园',
            duration: '1 小时',
            note: '登万春亭俯瞰故宫全景，是路线里的高光视角。',
            eta: '步行 12 分钟',
            distance: '0.9 km',
            ticket: '约 2 元',
            openTime: '06:00-21:00 左右，季节会调整',
            photo: '万春亭向南拍故宫全景',
            food: '景山东门外有简餐，建议轻量补给',
            restroom: '公园东西门和主路附近',
            imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/Jingshan_park.jpg/960px-Jingshan_park.jpg',
            lat: 39.9236,
            lng: 116.3979
        },
        {
            id: 4,
            time: '15:00',
            name: '北海公园',
            duration: '1.5 小时',
            note: '加入湖面和皇家园林场景，让行程从文化参观切到休闲漫步。',
            eta: '骑行 9 分钟',
            distance: '1.4 km',
            ticket: '约 10 元，联票另计',
            openTime: '06:30-20:00 左右',
            photo: '白塔、九龙壁、湖边步道',
            food: '北海北门外可衔接什刹海餐饮',
            restroom: '南门、北门、白塔附近',
            imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/62/Beihai_park%2C_beijing%2C_china.jpg/960px-Beihai_park%2C_beijing%2C_china.jpg',
            lat: 39.9242,
            lng: 116.3857
        },
        {
            id: 5,
            time: '17:00',
            name: '什刹海',
            duration: '1 小时',
            note: '傍晚沿湖散步，银锭桥和后海水岸适合慢游，也方便安排晚餐。',
            eta: '步行 15 分钟',
            distance: '1.2 km',
            ticket: '街区免费，游船另计',
            openTime: '全天开放，夜景更适合展示',
            photo: '银锭桥、后海水岸、胡同口',
            food: '烤肉季、爆肚、糖葫芦、咖啡酒吧',
            restroom: '银锭桥和荷花市场附近',
            imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Beijing_Shichahai.jpg/960px-Beijing_Shichahai.jpg',
            lat: 39.9372,
            lng: 116.3863
        },
        {
            id: 6,
            time: '19:00',
            name: '南锣鼓巷',
            duration: '1 小时',
            note: '胡同街区适合轻松收尾，可以逛小店、吃小吃，也能从支巷感受老北京街巷尺度。',
            eta: '步行 11 分钟',
            distance: '1.0 km',
            ticket: '免费',
            openTime: '街区全天，店铺多为 10:00-22:00',
            photo: '主街牌楼、胡同支巷、特色门脸',
            food: '文宇奶酪、炸酱面、小吃和伴手礼店',
            restroom: '主街游客服务点附近',
            imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/74/Beijing_Nanluoguxiang_%E5%8D%97%E9%94%A3%E9%BC%93%E5%B7%B7_-_panoramio.jpg/960px-Beijing_Nanluoguxiang_%E5%8D%97%E9%94%A3%E9%BC%93%E5%B7%B7_-_panoramio.jpg',
            lat: 39.9362,
            lng: 116.4032
        }
    ]
};

const mapLandmarks = [
    { name: '人民大会堂', icon: '🏛', lat: 39.9049, lng: 116.3866 },
    { name: '国家博物馆', icon: '🏛', lat: 39.9048, lng: 116.4014 },
    { name: '午门', icon: '🚪', lat: 39.9112, lng: 116.3972 },
    { name: '太和殿', icon: '🏯', lat: 39.9175, lng: 116.3972 },
    { name: '神武门', icon: '🚪', lat: 39.9240, lng: 116.3972 },
    { name: '白塔', icon: '🗼', lat: 39.9257, lng: 116.3864 },
    { name: '银锭桥', icon: '🌉', lat: 39.9380, lng: 116.3885 },
    { name: '鼓楼', icon: '🥁', lat: 39.9405, lng: 116.3956 }
];

const mapConfig = {
    centerLat: 39.9225,
    centerLng: 116.3942,
    zoom: 14,
    tileSize: 256
};

const routeKnowledge = {
    overview: '这是一条北京中轴线一日路线：天安门广场 -> 故宫 -> 景山 -> 北海 -> 什刹海 -> 南锣鼓巷。上午看城市地标和宫城，下午加入园林与湖岸，晚上到胡同街区收尾。',
    route: '推荐顺序是从南向北走，上午看天安门和故宫，中午到景山看全景，下午北海和什刹海放松，晚上南锣鼓巷收尾。全程约 8.6 km，适合步行加短途骑行。',
    budget: '预算可以按三档展示：省钱版约 80-120 元，标准版约 180-260 元，含故宫门票、北海门票、简餐和小吃；舒适版可加入打车和正餐，约 350 元以上。',
    ticket: '门票重点：故宫需提前预约，旺季约 60 元、淡季约 40 元；景山约 2 元；北海约 10 元；天安门、什刹海、南锣鼓巷街区免费。',
    opening: '故宫通常 08:30 开放，周一闭馆；景山和北海开放时间更长，但会随季节调整，出发前建议再确认预约页面和景区公告。',
    food: '美食推荐可以放在三段：前门早餐、什刹海晚餐、南锣鼓巷小吃和伴手礼。中午不建议在故宫里安排太久用餐，把时间留给主线参观更舒服。',
    restroom: '卫生间提示：故宫午门/御花园附近、景山门区、北海南北门、什刹海银锭桥、南锣鼓巷游客服务点附近都可以提前标注。',
    photo: '拍照点建议：天安门中轴线、故宫太和殿、景山万春亭俯瞰故宫、北海白塔、什刹海银锭桥、南锣鼓巷胡同门脸。',
    transport: '交通策略：前半段以步行为主，北海到什刹海可步行或骑行，体力不足时可以从北海北门打车到南锣鼓巷。'
};

let tripState = {
    stops: [],
    startTime: null,
    currentIndex: 0,
    timer: null
};

document.addEventListener('DOMContentLoaded', function() {
    checkUserLogin();
    loadTripData();
    bindChatInput();
});

function loadTripData() {
    const saved = localStorage.getItem('travel_current_trip');
    const normalized = saved ? normalizeSavedTrip(saved) : null;

    tripState.stops = normalized?.stops?.length ? normalized.stops : demoTrip.stops;
    tripState.startTime = new Date(normalized?.startTime || demoTrip.startTime);
    tripState.currentIndex = normalized?.currentIndex || 0;

    renderTrip();
    startTripTimer();
    sendSystemIntro();
}

function normalizeSavedTrip(saved) {
    try {
        const parsed = JSON.parse(saved);
        const attractions = parsed.attractions || [];
        return {
            startTime: parsed.startTime,
            currentIndex: parsed.currentAttractionIndex || 0,
            stops: attractions.map((item, index) => ({
                id: item.id || index + 1,
                time: ['09:00', '10:30', '13:30', '15:00', '17:00', '19:00'][index] || '全天',
                name: item.name || `景点 ${index + 1}`,
                duration: `${item.recommended_duration || 90} 分钟`,
                note: item.description || '根据您的偏好加入路线，可继续补充门票、开放时间和附近推荐。',
                eta: index === 0 ? '准备出发' : '约 15 分钟',
                distance: index === 0 ? '--' : `${(0.8 + index * 0.4).toFixed(1)} km`,
                ticket: item.price === 0 ? '免费' : `约 ${item.price || 50} 元`,
                openTime: item.open_time || '09:00-18:00',
                photo: '可结合景点特色生成拍照点',
                food: '附近可安排简餐、咖啡或特色小吃',
                restroom: '景区入口和游客服务点附近通常更容易找到卫生间',
                imageUrl: item.image_url || 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Forbidden_city_06.jpg/960px-Forbidden_city_06.jpg',
                lat: 39.905 + index * 0.006,
                lng: 116.391 + index * 0.003
            }))
        };
    } catch (error) {
        console.error('加载行程数据失败:', error);
        return null;
    }
}

function renderTrip() {
    renderWeather();
    renderMap();
    renderCurrentAttraction();
    renderTimeline();
    updateNavigation();
    updateProgress();
}

function renderWeather() {
    setText('weather-temp', '26°C');
}

function renderTileLayer(center, width, height) {
    const tileSize = mapConfig.tileSize;
    const centerTileX = Math.floor(center.x / tileSize);
    const centerTileY = Math.floor(center.y / tileSize);
    const radiusX = Math.ceil(width / tileSize / 2) + 1;
    const radiusY = Math.ceil(height / tileSize / 2) + 1;
    let html = '';

    for (let x = centerTileX - radiusX; x <= centerTileX + radiusX; x++) {
        for (let y = centerTileY - radiusY; y <= centerTileY + radiusY; y++) {
            const left = Math.round(width / 2 + x * tileSize - center.x);
            const top = Math.round(height / 2 + y * tileSize - center.y);
            html += `<img class="map-tile" src="https://tile.openstreetmap.org/${mapConfig.zoom}/${x}/${y}.png" alt=""
                style="position:absolute;left:${left}px;top:${top}px;width:${tileSize}px;height:${tileSize}px" />`;
        }
    }

    return html;
}

function lngLatToScreen(lng, lat, center, width, height) {
    const point = lngLatToWorld(lng, lat, mapConfig.zoom);
    return {
        x: Math.round(width / 2 + point.x - center.x),
        y: Math.round(height / 2 + point.y - center.y)
    };
}

function lngLatToWorld(lng, lat, zoom) {
    const sinLat = Math.sin((lat * Math.PI) / 180);
    const scale = mapConfig.tileSize * Math.pow(2, zoom);
    return {
        x: ((lng + 180) / 360) * scale,
        y: (0.5 - Math.log((1 + sinLat) / (1 - sinLat)) / (4 * Math.PI)) * scale
    };
}

function renderMap() {
    const mapView = document.getElementById('map-view');
    if (!mapView) return;

    mapView.style.display = 'block';
    const width = mapView.clientWidth || 520;
    const height = mapView.clientHeight || 420;
    const center = lngLatToWorld(mapConfig.centerLng, mapConfig.centerLat, mapConfig.zoom);
    const stopPoints = tripState.stops.map((stop) => lngLatToScreen(stop.lng, stop.lat, center, width, height));
    const landmarkPoints = mapLandmarks.map((landmark) => ({
        ...landmark,
        ...lngLatToScreen(landmark.lng, landmark.lat, center, width, height)
    }));
    const tileLayer = renderTileLayer(center, width, height);

    mapView.innerHTML = `
        <div class="map-tile-layer" style="position:absolute;inset:0;border-radius:8px;overflow:hidden;background:#e8eef2">${tileLayer}</div>
        <div style="position:absolute;inset:0;border-radius:8px;background:rgba(255,255,255,.18);pointer-events:none"></div>
        ${landmarkPoints.map((landmark) => `
            <div class="map-landmark" title="${landmark.name}" style="position:absolute;left:${landmark.x}px;top:${landmark.y}px;
                transform:translate(-50%,-50%);z-index:1;text-align:center">
                <div style="width:28px;height:28px;border-radius:8px;background:#fff;border:1px solid #e2e8f0;
                    display:flex;align-items:center;justify-content:center;box-shadow:0 8px 18px rgba(15,23,42,.12)">${landmark.icon}</div>
                <div style="margin-top:2px;background:rgba(255,255,255,.88);border-radius:6px;padding:2px 5px;font-size:10px;font-weight:700;white-space:nowrap">${landmark.name}</div>
            </div>
        `).join('')}
        <svg viewBox="0 0 ${width} ${height}" preserveAspectRatio="none" style="position:absolute;inset:0;width:100%;height:100%;z-index:2;pointer-events:none">
            <polyline points="${stopPoints.map((point) => `${point.x},${point.y}`).join(' ')}"
                fill="none" stroke="rgba(255,255,255,.9)" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" />
            <polyline points="${stopPoints.map((point) => `${point.x},${point.y}`).join(' ')}"
                fill="none" stroke="#2563eb" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
        ${tripState.stops.map((stop, index) => {
            const point = stopPoints[index];
            return `
            <button type="button" onclick="selectStop(${index})"
                style="position:absolute;left:${point.x}px;top:${point.y}px;transform:translate(-50%,-50%);
                width:34px;height:34px;border-radius:50%;border:3px solid #fff;background:${index === tripState.currentIndex ? '#ffc800' : '#2563eb'};
                color:${index === tripState.currentIndex ? '#212529' : '#fff'};font-weight:800;box-shadow:0 10px 24px rgba(15,23,42,.22);z-index:3">
                ${index + 1}
            </button>
            <div style="position:absolute;left:${point.x + 18}px;top:${point.y - 28}px;background:#fff;border:1px solid #e5e7eb;
                border-radius:8px;padding:6px 9px;font-size:12px;font-weight:700;box-shadow:0 8px 20px rgba(15,23,42,.14);white-space:nowrap;z-index:3">
                ${stop.name}
            </div>
        `;
        }).join('')}
        <div style="position:absolute;right:8px;bottom:6px;z-index:4;background:rgba(255,255,255,.86);font-size:10px;color:#64748b;padding:2px 6px;border-radius:6px">
            地图 © OpenStreetMap
        </div>
    `;
}

function renderCurrentAttraction() {
    const container = document.getElementById('current-attraction');
    const stop = getCurrentStop();
    if (!container || !stop) return;

    container.innerHTML = `
        <div style="height:180px;border-radius:8px;position:relative;overflow:hidden;margin-bottom:18px;background:#e2e8f0">
            <img class="attraction-card-image" src="${stop.imageUrl}" alt="${stop.name}" loading="lazy"
                style="width:100%;height:100%;object-fit:cover;display:block" />
            <div style="position:absolute;left:0;right:0;bottom:0;padding:12px 14px;background:linear-gradient(180deg,transparent,rgba(15,23,42,.72));color:#fff;font-weight:700">
                ${stop.time} · ${stop.duration}
            </div>
        </div>
        <h3 style="font-size:22px;font-weight:800;margin-bottom:8px">${stop.name}</h3>
        <p style="color:#64748b;line-height:1.7;margin-bottom:16px">${stop.note}</p>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:12px">
            <div style="background:#f8fafc;border-radius:8px;padding:12px"><small class="text-muted">建议停留</small><br><b>${stop.duration}</b></div>
            <div style="background:#f8fafc;border-radius:8px;padding:12px"><small class="text-muted">下一段</small><br><b>${stop.eta}</b></div>
            <div style="background:#f8fafc;border-radius:8px;padding:12px"><small class="text-muted">门票</small><br><b>${stop.ticket}</b></div>
            <div style="background:#f8fafc;border-radius:8px;padding:12px"><small class="text-muted">开放</small><br><b>${stop.openTime}</b></div>
        </div>
        <button class="btn btn-warning btn-sm text-uppercase" onclick="goToNextStop()" style="background:#ffc800;border-color:#ffc800;color:#212529">
            ${tripState.currentIndex >= tripState.stops.length - 1 ? '完成行程' : '到下一站'}
        </button>
    `;
}

function renderTimeline() {
    const container = document.getElementById('timeline-horizontal');
    if (!container) return;

    container.innerHTML = tripState.stops.map((stop, index) => {
        const status = index < tripState.currentIndex ? 'done' : index === tripState.currentIndex ? 'current' : 'pending';
        return `
            <div class="timeline-item-h ${status === 'current' ? 'active' : ''} ${status === 'done' ? 'completed' : ''}" onclick="selectStop(${index})">
                <div class="item-time">${stop.time}</div>
                <div class="item-name">${stop.name}</div>
                <span class="item-status ${status}">${getStatusText(status)}</span>
            </div>
        `;
    }).join('');
}

function updateNavigation() {
    const stop = getCurrentStop();
    if (!stop) return;

    setText('next-stop', stop.name);
    setText('eta', stop.eta);
    setText('distance', stop.distance);
    setText('attraction-status', tripState.currentIndex === 0 ? '准备出发' : '行程中');
}

function updateProgress() {
    const total = tripState.stops.length || 1;
    const percent = Math.round(((tripState.currentIndex + 1) / total) * 100);
    setText('progress-percent', `${percent}%`);
    const fill = document.getElementById('progress-fill');
    if (fill) fill.style.width = `${percent}%`;
}

function startTripTimer() {
    updateTripTimer();
    if (tripState.timer) clearInterval(tripState.timer);
    tripState.timer = setInterval(updateTripTimer, 1000);
}

function updateTripTimer() {
    const elapsed = Date.now() - tripState.startTime.getTime();
    const hours = Math.max(0, Math.floor(elapsed / 3600000));
    const minutes = Math.max(0, Math.floor((elapsed % 3600000) / 60000));
    const seconds = Math.max(0, Math.floor((elapsed % 60000) / 1000));
    setText('trip-timer', `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`);
}

function selectStop(index) {
    tripState.currentIndex = index;
    renderTrip();
    addMessage(`已切换到第 ${index + 1} 站：${getCurrentStop().name}。你可以问我“这里门票多少”“附近吃什么”“拍照点在哪”。`, 'assistant');
}

function goToNextStop() {
    if (tripState.currentIndex < tripState.stops.length - 1) {
        tripState.currentIndex += 1;
        renderTrip();
        addMessage(`下一站是 ${getCurrentStop().name}，预计 ${getCurrentStop().eta}。`, 'assistant');
        return;
    }

    addMessage('本次北京中轴线行程已完成。可以回看路线、整理照片，也可以收藏喜欢的景点下次再来。', 'assistant');
}

function sendMessage() {
    const input = document.getElementById('chat-input');
    const message = input?.value.trim();
    if (!message) return;

    addMessage(message, 'user');
    input.value = '';

    setTimeout(() => {
        addMessage(answerTripQuestion(message), 'assistant');
    }, 250);
}

function answerTripQuestion(rawMessage) {
    const message = rawMessage.toLowerCase();
    const stop = findMentionedStop(rawMessage) || getCurrentStop();
    const replies = [];

    if (message.includes('故宫几点') || message.includes('开放') || message.includes('闭馆') || message.includes('时间')) {
        replies.push(`${stop.name} 开放时间：${stop.openTime}。故宫开放时间和闭馆安排以预约页面为准，出发前建议再确认一次。`);
    }
    if (message.includes('门票') || message.includes('多少钱') || message.includes('价格') || message.includes('费用')) {
        replies.push(`${stop.name} 门票/费用：${stop.ticket}。整条路线预算建议：${routeKnowledge.budget}`);
    }
    if (message.includes('厕所') || message.includes('卫生间') || message.includes('洗手间')) {
        replies.push(`${stop.name} 卫生间提示：${stop.restroom}。${routeKnowledge.restroom}`);
    }
    if (message.includes('拍照') || message.includes('打卡') || message.includes('机位')) {
        replies.push(`${stop.name} 推荐拍照点：${stop.photo}。整条路线高光：${routeKnowledge.photo}`);
    }
    if (message.includes('吃') || message.includes('美食') || message.includes('餐厅') || message.includes('午饭') || message.includes('晚饭')) {
        replies.push(`${stop.name} 附近建议：${stop.food}。${routeKnowledge.food}`);
    }
    if (message.includes('路线') || message.includes('顺序') || message.includes('怎么走') || message.includes('地图')) {
        replies.push(routeKnowledge.route);
    }
    if (message.includes('预算')) {
        replies.push(routeKnowledge.budget);
    }
    if (message.includes('交通') || message.includes('地铁') || message.includes('骑行') || message.includes('打车')) {
        replies.push(routeKnowledge.transport);
    }
    if (message.includes('介绍') || message.includes('总结') || message.includes('这条')) {
        replies.push(routeKnowledge.overview);
    }

    if (replies.length > 0) {
        return replies.join('\n\n');
    }

    return `我现在可以回答这条北京中轴线行程里的问题，比如“故宫几点开门”“门票多少钱”“哪里拍照”“附近吃什么”“厕所在哪”“预算多少”“怎么走”。当前站是 ${stop.name}，你也可以直接问这个站。`;
}

function findMentionedStop(message) {
    return tripState.stops.find((stop) => message.includes(stop.name.replace('博物院', '').replace('广场', '').replace('公园', '')) || message.includes(stop.name));
}

function sendSystemIntro() {
    const messages = document.getElementById('chat-messages');
    if (!messages || messages.dataset.demoReady === 'true') return;
    messages.dataset.demoReady = 'true';
    addMessage('我已加载北京中轴线行程信息。可以问：故宫几点开门、门票多少钱、哪里拍照、附近吃什么、厕所在哪、预算多少、怎么走。', 'assistant');
}

function bindChatInput() {
    const input = document.getElementById('chat-input');
    if (!input) return;
    input.addEventListener('keydown', function(event) {
        if (event.key === 'Enter') sendMessage();
    });
}

function addMessage(content, type) {
    const container = document.getElementById('chat-messages');
    if (!container) return;

    const message = document.createElement('div');
    message.className = `chat-msg ${type === 'user' ? 'user' : 'assistant'}`;
    message.textContent = content;
    container.appendChild(message);
    container.scrollTop = container.scrollHeight;
}

function endTrip() {
    localStorage.removeItem('travel_current_trip');
    window.location.href = './home.html';
}

function getCurrentStop() {
    return tripState.stops[tripState.currentIndex];
}

function getStatusText(status) {
    return {
        pending: '待游览',
        current: '当前站',
        done: '已完成'
    }[status] || status;
}

function setText(id, value) {
    const element = document.getElementById(id);
    if (element) element.textContent = value;
}

function pad(number) {
    return String(number).padStart(2, '0');
}
