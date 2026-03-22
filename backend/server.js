const express = require('express');
const cors = require('cors');
require('dotenv').config();

const pool = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(express.json());

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
            query += ` AND type = $${paramIndex}`;
            params.push(type);
            paramIndex++;
        }

        const result = await pool.query(query, params);
        res.json({ success: true, data: result.rows });
    } catch (err) {
        console.error('获取景点列表失败:', err);
        res.status(500).json({ success: false, message: '获取景点列表失败' });
    }
});

// 启动服务器
app.listen(PORT, () => {
    console.log(`服务器运行在 http://localhost:${PORT}`);
});
