const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
require('dotenv').config();

const pool = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(express.json());

// 密码加密函数
function hashPassword(password) {
    return crypto.createHash('sha256').update(password).digest('hex');
}

// 生成简单token
function generateToken(userId) {
    return crypto.randomBytes(32).toString('hex') + '_' + userId;
}

// 内存中存储token (生产环境应使用Redis)
const tokenStore = new Map();

// 健康检查
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: '服务器运行正常' });
});

// ========== 路线相关 API ==========

// 获取所有路线
app.get('/api/routes', async (req, res) => {
    try {
        const { departure, destination, days, preference } = req.query;
        let query = 'SELECT * FROM routes WHERE 1=1';
        const params = [];
        let paramIndex = 1;

        if (departure) {
            query += ` AND departure_city ILIKE $${paramIndex}`;
            params.push(`%${departure}%`);
            paramIndex++;
        }
        if (destination) {
            query += ` AND destination_city ILIKE $${paramIndex}`;
            params.push(`%${destination}%`);
            paramIndex++;
        }
        if (days) {
            query += ` AND days = $${paramIndex}`;
            params.push(days);
            paramIndex++;
        }
        if (preference) {
            query += ` AND preference ILIKE $${paramIndex}`;
            params.push(`%${preference}%`);
            paramIndex++;
        }

        query += ' ORDER BY created_at DESC';

        const result = await pool.query(query, params);
        res.json({ success: true, data: result.rows });
    } catch (err) {
        console.error('获取路线列表失败:', err);
        res.status(500).json({ success: false, message: '获取路线列表失败' });
    }
});

// 获取路线详情
app.get('/api/routes/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const routeResult = await pool.query('SELECT * FROM routes WHERE id = $1', [id]);
        
        if (routeResult.rows.length === 0) {
            return res.status(404).json({ success: false, message: '路线不存在' });
        }

        // 获取路线关联的景点
        const attractionsResult = await pool.query(`
            SELECT a.*, ra.day_number, ra.order_index 
            FROM attractions a
            JOIN route_attractions ra ON a.id = ra.attraction_id
            WHERE ra.route_id = $1
            ORDER BY ra.day_number, ra.order_index
        `, [id]);

        const route = routeResult.rows[0];
        route.attractions = attractionsResult.rows;

        res.json({ success: true, data: route });
    } catch (err) {
        console.error('获取路线详情失败:', err);
        res.status(500).json({ success: false, message: '获取路线详情失败' });
    }
});

// 创建路线
app.post('/api/routes', async (req, res) => {
    try {
        const { title, description, departure_city, destination_city, days, budget_level, preference, image_url } = req.body;
        
        const result = await pool.query(`
            INSERT INTO routes (title, description, departure_city, destination_city, days, budget_level, preference, image_url)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *
        `, [title, description, departure_city, destination_city, days, budget_level, preference, image_url]);

        res.status(201).json({ success: true, data: result.rows[0] });
    } catch (err) {
        console.error('创建路线失败:', err);
        res.status(500).json({ success: false, message: '创建路线失败' });
    }
});

// ========== 景点相关 API ==========

// 获取所有景点
app.get('/api/attractions', async (req, res) => {
    try {
        const { city, type } = req.query;
        let query = 'SELECT * FROM attractions WHERE 1=1';
        const params = [];
        let paramIndex = 1;

        if (city) {
            query += ` AND city ILIKE $${paramIndex}`;
            params.push(`%${city}%`);
            paramIndex++;
        }
        if (type) {
            query += ` AND (type = $${paramIndex} OR tags ILIKE $${paramIndex + 1})`;
            params.push(type, `%${type}%`);
            paramIndex += 2;
        }

        query += ' ORDER BY rating DESC, created_at DESC';

        const result = await pool.query(query, params);
        res.json({ success: true, data: result.rows });
    } catch (err) {
        console.error('获取景点列表失败:', err);
        res.status(500).json({ success: false, message: '获取景点列表失败' });
    }
});

// 获取推荐景点（根据用户偏好）
app.get('/api/recommendations', async (req, res) => {
    try {
        const { city, interests, intensity, companion } = req.query;
        
        let query = 'SELECT * FROM attractions WHERE 1=1';
        const params = [];
        let paramIndex = 1;

        // 城市筛选
        if (city) {
            query += ` AND city ILIKE $${paramIndex}`;
            params.push(`%${city}%`);
            paramIndex++;
        }

        // 兴趣标签筛选
        if (interests) {
            const interestList = interests.split(',');
            const interestConditions = interestList.map((_, idx) => 
                `(type ILIKE $${paramIndex + idx} OR tags ILIKE $${paramIndex + idx})`
            ).join(' OR ');
            query += ` AND (${interestConditions})`;
            interestList.forEach(interest => params.push(`%${interest}%`));
            paramIndex += interestList.length;
        }

        // 同行人筛选
        if (companion) {
            const companionField = {
                'family': 'suitable_for_family',
                'elderly': 'suitable_for_elderly',
                'couple': 'suitable_for_couple'
            }[companion];
            if (companionField) {
                query += ` AND ${companionField} = true`;
            }
        }

        query += ' ORDER BY rating DESC, recommended_duration ASC';

        const result = await pool.query(query, params);
        
        // 计算匹配度
        const attractionsWithScore = result.rows.map(attraction => {
            let score = 50; // 基础分
            
            // 根据兴趣匹配加分
            if (interests) {
                const interestList = interests.split(',');
                interestList.forEach(interest => {
                    if (attraction.type === interest || 
                        (attraction.tags && attraction.tags.includes(interest))) {
                        score += 15;
                    }
                });
            }
            
            // 根据评分加分
            if (attraction.rating) {
                score += (attraction.rating - 3) * 5;
            }
            
            // 根据游玩强度调整
            if (intensity) {
                const duration = attraction.recommended_duration || 120;
                if (intensity === 'relaxed' && duration <= 90) {
                    score += 10;
                } else if (intensity === 'intensive' && duration >= 180) {
                    score += 10;
                }
            }
            
            return {
                ...attraction,
                match_score: Math.min(100, Math.max(0, Math.round(score)))
            };
        });
        
        // 按匹配度排序
        attractionsWithScore.sort((a, b) => b.match_score - a.match_score);
        
        res.json({ success: true, data: attractionsWithScore });
    } catch (err) {
        console.error('获取推荐景点失败:', err);
        res.status(500).json({ success: false, message: '获取推荐景点失败' });
    }
});

// ========== 用户相关 API ==========

// 用户注册
app.post('/api/auth/register', async (req, res) => {
    try {
        const { username, email, password, nickname, phone } = req.body;

        // 验证必填字段
        if (!username || !email || !password) {
            return res.status(400).json({ success: false, message: '用户名、邮箱和密码为必填项' });
        }

        // 检查用户名是否已存在
        const existingUser = await pool.query('SELECT * FROM users WHERE username = $1 OR email = $2', [username, email]);
        if (existingUser.rows.length > 0) {
            return res.status(409).json({ success: false, message: '用户名或邮箱已存在' });
        }

        // 加密密码
        const passwordHash = hashPassword(password);

        // 创建用户
        const result = await pool.query(
            `INSERT INTO users (username, email, password_hash, nickname, phone) 
             VALUES ($1, $2, $3, $4, $5) RETURNING id, username, email, nickname, phone, created_at`,
            [username, email, passwordHash, nickname || username, phone]
        );

        const user = result.rows[0];
        const token = generateToken(user.id);
        tokenStore.set(token, { userId: user.id, username: user.username });

        res.status(201).json({
            success: true,
            message: '注册成功',
            data: {
                user: user,
                token: token
            }
        });
    } catch (err) {
        console.error('用户注册失败:', err);
        res.status(500).json({ success: false, message: '注册失败，请稍后重试' });
    }
});

// 用户登录
app.post('/api/auth/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ success: false, message: '用户名和密码为必填项' });
        }

        // 查找用户
        const result = await pool.query(
            'SELECT id, username, email, password_hash, nickname, phone, avatar_url, created_at FROM users WHERE username = $1 OR email = $1',
            [username]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({ success: false, message: '用户名或密码错误' });
        }

        const user = result.rows[0];
        const passwordHash = hashPassword(password);

        // 验证密码
        if (user.password_hash !== passwordHash) {
            return res.status(401).json({ success: false, message: '用户名或密码错误' });
        }

        // 生成token
        const token = generateToken(user.id);
        tokenStore.set(token, { userId: user.id, username: user.username });

        // 删除敏感信息
        delete user.password_hash;

        res.json({
            success: true,
            message: '登录成功',
            data: {
                user: user,
                token: token
            }
        });
    } catch (err) {
        console.error('用户登录失败:', err);
        res.status(500).json({ success: false, message: '登录失败，请稍后重试' });
    }
});

// 获取当前用户信息
app.get('/api/auth/me', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ success: false, message: '未提供认证令牌' });
        }

        const token = authHeader.substring(7);
        const tokenData = tokenStore.get(token);

        if (!tokenData) {
            return res.status(401).json({ success: false, message: '令牌无效或已过期' });
        }

        const result = await pool.query(
            'SELECT id, username, email, nickname, phone, avatar_url, created_at FROM users WHERE id = $1',
            [tokenData.userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: '用户不存在' });
        }

        res.json({ success: true, data: result.rows[0] });
    } catch (err) {
        console.error('获取用户信息失败:', err);
        res.status(500).json({ success: false, message: '获取用户信息失败' });
    }
});

// 用户登出
app.post('/api/auth/logout', (req, res) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        tokenStore.delete(token);
    }
    res.json({ success: true, message: '登出成功' });
});


// ========== AI路线生成 (Prompt Engineering) ==========

const DOUBAO_API_KEY = "ark-09cfb367-2c27-461a-9d4b-61c5b90d4d8f-00d37";
const DOUBAO_API_URL = "https://ark.cn-beijing.volces.com/api/v3/chat/completions";
const DOUBAO_MODEL = "doubao-seed-2-0-pro-260215";

// 同行人类型映射
const companionMap = {
    "solo": "独自一人",
    "couple": "情侣出游",
    "family": "亲子家庭",
    "friends": "朋友结伴",
    "elderly": "长辈同行"
};

// 兴趣标签映射
const interestMap = {
    "photo": "拍照打卡",
    "food": "美食探索",
    "culture": "人文历史",
    "nature": "自然风光",
    "shopping": "购物血拼",
    "adventure": "户外探险",
    "relax": "休闲度假"
};

// 强度映射
const intensityMap = {
    "relaxed": "低强度",
    "moderate": "中强度",
    "intensive": "高强度"
};

// 系统提示词
function buildSystemPrompt() {
    return `你是资深旅游规划师，擅长根据用户需求定制个性化旅行路线。
请严格遵守以下规则：
1. 完全基于用户给出的【出发地、目的地、兴趣标签、出行天数、游玩强度、同行人类型】生成路线
2. 游玩强度严格匹配：低强度日均景点≤3，中强度日均≤4，高强度日均≤6，行程节奏符合要求
3. 同行人适配：亲子路线需儿童友好，老人路线需低强度少步行，情侣路线需氛围感
4. 景点必须真实存在，交通路线合理，每日行程不跨城市
5. 每日行程按时间顺序排列，从上午到晚上
6. 严格以JSON格式输出，字段完全匹配给定的Schema，不要输出任何解释文字、markdown格式、多余对话`;
}

// 用户提示词模板
function buildUserPrompt(params) {
    const interestsText = params.interests && params.interests.length > 0
        ? params.interests.map(i => interestMap[i] || i).join('、')
        : '未指定';
    const intensityText = intensityMap[params.intensity] || '中强度';
    const companionText = companionMap[params.companion] || '朋友结伴';

    return `请根据以下参数生成旅游路线：
出发地：${params.departure}
目的地：${params.destination}
兴趣标签：${interestsText}
出行天数：${params.days}天
游玩强度：${intensityText}
同行人类型：${companionText}

请严格按照以下JSON Schema输出：

{
  "destination": "${params.destination}",
  "departure": "${params.departure}",
  "days": ${params.days || 3},
  "dailyPlan": [
    {
      "day": 1,
      "date": "第1天日期",
      "theme": "当日主题",
      "attractions": [
        {
          "name": "景点名称",
          "order": 1,
          "timeSlot": "上午",
          "estimatedHours": 2,
          "highlights": "亮点描述",
          "tips": "游玩提示"
        }
      ],
      "meals": ["推荐餐厅或美食"],
      "transport": "当日交通建议"
    }
  ],
  "overview": {
    "totalAttractions": 0,
    "style": "路线风格",
    "budgetEstimate": "预估人均预算（元）",
    "bestSeason": "最佳游玩季节",
    "notes": ["注意事项"]
  }
}`;
}

// AI路线生成
app.post('/api/generate-route', async (req, res) => {
    try {
        const { departure, destination, days, intensity, interests, companion } = req.body;

        if (!destination) {
            return res.status(400).json({ success: false, message: '请输入目的地' });
        }

        const systemPrompt = buildSystemPrompt();
        const userPrompt = buildUserPrompt({ departure, destination, days, intensity, interests, companion });

        // 调用豆包API（带超时控制）
        let routeData;
        let aiSucceeded = false;

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 8000); // 8秒超时

            const response = await fetch(DOUBAO_API_URL, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${DOUBAO_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: DOUBAO_MODEL,
                    max_tokens: 4096,
                    messages: [
                        { role: "system", content: systemPrompt },
                        { role: "user", content: userPrompt }
                    ]
                }),
                signal: controller.signal
            });
            clearTimeout(timeoutId);

            const aiResult = await response.json();

            if (!response.ok) {
                console.error('豆包API调用失败:', aiResult);
                throw new Error(aiResult.error?.message || 'AI服务调用失败');
            }

            const aiText = aiResult.output?.[0]?.content?.[0]?.text || aiResult.choices?.[0]?.message?.content || '';
            const cleanJson = aiText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
            routeData = JSON.parse(cleanJson);
            aiSucceeded = true;
        } catch (aiErr) {
            console.error('AI调用失败，使用数据库兜底方案:', aiErr.message);
        }

        // AI失败时使用数据库兜底方案
        if (!aiSucceeded) {
            routeData = await generateFallbackRoute({ departure, destination, days: parseInt(days) || 3, intensity, interests, companion });
        }

        routeData.generated = true;
        routeData.timestamp = new Date().toISOString();

        // 保存到数据库
        try {
            const interestsStr = interests ? interests.join(',') : '';
            await pool.query(
                `INSERT INTO routes (title, description, departure_city, destination_city, days, budget_level, preference)
                 VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                [
                    `${routeData.destination}${routeData.days}日游`,
                    routeData.overview?.style || `${routeData.departure || departure}到${routeData.destination}的${routeData.days}日深度游`,
                    departure || '',
                    routeData.destination,
                    String(routeData.days || days) + '天',
                    routeData.overview?.budgetEstimate || '中等',
                    interestsStr
                ]
            );
        } catch (dbErr) {
            console.error('保存路线到数据库失败:', dbErr.message);
        }

        res.json({ success: true, data: routeData });

    } catch (err) {
        console.error('生成路线失败:', err.message);
        res.status(500).json({ success: false, message: err.message || '路线生成失败，请稍后重试' });
    }
});

// AI调用失败时的兜底方案：从数据库现有景点生成路线
async function generateFallbackRoute(params) {
    const { departure, destination, days, intensity, interests, companion } = params;
    const numDays = Math.min(Math.max(days || 3, 1), 7);

    // 查询目的地的景点
    const result = await pool.query(
        `SELECT * FROM attractions WHERE city ILIKE $1 ORDER BY rating DESC`,
        [`%${destination}%`]
    );
    let attractions = result.rows;

    // 如果没有完全匹配的景点，按类型标签筛选
    if (attractions.length === 0 && interests && interests.length > 0) {
        const typeResult = await pool.query(
            `SELECT * FROM attractions WHERE type = ANY($1) ORDER BY rating DESC`,
            [interests]
        );
        attractions = typeResult.rows;
    }

    // 如果还是没有景点，创建一些通用景点
    if (attractions.length === 0) {
        attractions = [
            { id: 1, name: `${destination}市中心广场`, type: 'scenic', description: `${destination}的地标中心`, rating: '4.3', recommended_duration: 60 },
            { id: 2, name: `${destination}文化博物馆`, type: 'culture', description: `了解${destination}历史文化的好去处`, rating: '4.5', recommended_duration: 120 },
            { id: 3, name: `${destination}美食街`, type: 'food', description: `品尝${destination}特色美食`, rating: '4.4', recommended_duration: 90 },
            { id: 4, name: `${destination}公园`, type: 'nature', description: `${destination}市区休闲公园`, rating: '4.2', recommended_duration: 60 },
        ];
    }

    // 按强度分配每天景点数
    const intensityMap = { relaxed: 2, moderate: 3, intensive: 5 };
    const perDay = intensityMap[intensity] || 3;
    const themes = ['文化探索', '自然风光', '休闲漫步', '深度体验', '美食之旅', '城市观光', '人文之旅'];
    const timeSlots = ['上午', '下午', '晚上'];

    // 构建 dailyPlan（每天至少1个景点，如果不够则循环使用）
    const dailyPlan = [];
    for (let d = 1; d <= numDays; d++) {
        const dayAttractions = [];
        for (let a = 0; a < perDay; a++) {
            const idx = (d - 1) * perDay + a;
            const attr = attractions[idx % attractions.length];
            dayAttractions.push({
                name: attr.name,
                order: a + 1,
                timeSlot: timeSlots[a % 3],
                estimatedHours: Math.ceil((attr.recommended_duration || 60) / 60),
                highlights: attr.description || `${attr.name}精彩体验`,
                tips: `建议游玩${Math.ceil((attr.recommended_duration || 60) / 60)}小时`
            });
        }
        dailyPlan.push({
            day: d,
            date: `第${d}天`,
            theme: themes[(d - 1) % themes.length],
            attractions: dayAttractions,
            meals: [`当地特色餐厅`, `风味小吃街`],
            transport: d === 1 ? `从${departure || '出发地'}前往${destination}` : `市内交通`
        });
    }

    // 去重统计实际不同景点数
    const uniqueNames = new Set(attractions.map(a => a.name));
    const totalAttractions = Math.min(numDays * perDay, uniqueNames.size);

    return {
        destination: destination,
        departure: departure || '未知',
        days: numDays,
        totalAttractions: totalAttractions,
        destinationCoords: { lat: 39.9042, lng: 116.4074 },
        dailyPlan: dailyPlan,
        overview: {
            totalAttractions: totalAttractions,
            style: `${destination}${numDays}日${['休闲游', '经典游', '深度游'][Math.min(numDays, 3) - 1]}`,
            budgetEstimate: ['经济型', '中等', '舒适型'][Math.min(numDays, 3) - 1],
            bestSeason: '全年皆宜',
            notes: ['建议提前预订酒店', '注意查看当地天气', '准备好舒适的运动鞋']
        }
    };
}

// 启动服务器
app.listen(PORT, () => {
    console.log(`服务器运行在 http://localhost:${PORT}`);
});
