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

// 启动服务器
app.listen(PORT, () => {
    console.log(`服务器运行在 http://localhost:${PORT}`);
});
