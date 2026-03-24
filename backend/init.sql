-- 创建数据库（如果不存在）
-- CREATE DATABASE traveltool;
-- $env:PGCLIENTENCODING="UTF8"; psql -U postgres -d traveltool -f backend/init.sql

-- 使用数据库
-- \c traveltool;

-- 清空路线景点关联表数据（先清空外键关联表）
TRUNCATE TABLE route_attractions CASCADE;

-- 清空路线表数据
TRUNCATE TABLE routes CASCADE;

-- 清空景点表数据
TRUNCATE TABLE attractions CASCADE;

-- 创建路线表
CREATE TABLE IF NOT EXISTS routes (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    departure_city VARCHAR(100),
    destination_city VARCHAR(100),
    days INTEGER,
    budget_level VARCHAR(50), -- 低/中/高
    preference VARCHAR(100), -- 自然风光/人文历史/美食探索/休闲度假/户外探险
    image_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建景点表
CREATE TABLE IF NOT EXISTS attractions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    city VARCHAR(100),
    type VARCHAR(100), -- 景点类型: nature, culture, food, relax, adventure, shopping, scenic, entertainment, nightlife
    address VARCHAR(255),
    rating DECIMAL(2,1) DEFAULT 4.0,
    price DECIMAL(10,2) DEFAULT 0,
    recommended_duration INTEGER DEFAULT 120, -- 建议游览时长(分钟)
    image_url VARCHAR(500),
    tags TEXT, -- 标签，逗号分隔
    open_time VARCHAR(100),
    best_visit_time VARCHAR(100),
    suitable_for_family BOOLEAN DEFAULT true,
    suitable_for_elderly BOOLEAN DEFAULT true,
    suitable_for_couple BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建路线景点关联表
CREATE TABLE IF NOT EXISTS route_attractions (
    id SERIAL PRIMARY KEY,
    route_id INTEGER REFERENCES routes(id) ON DELETE CASCADE,
    attraction_id INTEGER REFERENCES attractions(id) ON DELETE CASCADE,
    day_number INTEGER, -- 第几天的行程
    order_index INTEGER, -- 当天顺序
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 插入示例路线数据（使用 ON CONFLICT 防止重复插入）
INSERT INTO routes (id, title, description, departure_city, destination_city, days, budget_level, preference, image_url) VALUES
(1, '云南经典7日游', '昆明 → 大理 → 丽江 → 香格里拉，体验云南多元文化与绝美风景', '昆明', '香格里拉', 7, '中等', 'nature,culture', 'https://picsum.photos/400/250?random=1'),
(2, '川西秘境环线', '成都 → 四姑娘山 → 丹巴 → 新都桥 → 稻城亚丁，探索川西高原', '成都', '稻城', 10, '较高', 'adventure,nature', 'https://picsum.photos/400/250?random=2'),
(3, '江南水乡慢游', '苏州 → 乌镇 → 杭州 → 绍兴，感受江南烟雨与古镇风情', '苏州', '绍兴', 5, '中等', 'relax,culture', 'https://picsum.photos/400/250?random=3')
ON CONFLICT (id) DO NOTHING;

-- 创建用户表
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    nickname VARCHAR(50),
    avatar_url VARCHAR(500),
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 插入示例景点数据（带完整字段，使用 ON CONFLICT 防止重复插入）
INSERT INTO attractions (id, name, description, city, type, address, rating, price, recommended_duration, image_url, tags, open_time, best_visit_time, suitable_for_family, suitable_for_elderly, suitable_for_couple) VALUES
(1, '滇池', '云南最大的淡水湖，冬季可观红嘴鸥', '昆明', 'nature', '昆明市西山区滇池路', 4.5, 0, 120, 'https://picsum.photos/400/250?random=10', 'nature,scenic,lake', '全天开放', '冬季', true, true, true),
(2, '大理古城', '历史悠久的古城，白族文化聚集地', '大理', 'culture', '大理市古城区', 4.6, 0, 180, 'https://picsum.photos/400/250?random=11', 'culture,history,ancient', '全天开放', '傍晚', true, true, true),
(3, '洱海', '高原湖泊，风景如画', '大理', 'nature', '大理市洱海周边', 4.8, 0, 240, 'https://picsum.photos/400/250?random=12', 'nature,scenic,lake,photo', '全天开放', '日出日落', true, true, true),
(4, '丽江古城', '世界文化遗产，纳西族文化', '丽江', 'culture', '丽江市古城区', 4.5, 50, 180, 'https://picsum.photos/400/250?random=13', 'culture,history,ancient,nightlife', '全天开放', '夜晚', true, true, true),
(5, '玉龙雪山', '纳西族神山，冰川公园', '丽江', 'nature', '丽江市玉龙纳西族自治县', 4.7, 130, 300, 'https://picsum.photos/400/250?random=14', 'nature,mountain,adventure,scenic', '08:00-17:00', '上午', true, false, true),
(6, '束河古镇', '宁静古朴的纳西族古镇', '丽江', 'culture', '丽江市古城区束河路', 4.4, 0, 120, 'https://picsum.photos/400/250?random=15', 'culture,relax,ancient', '全天开放', '下午', true, true, true),
(7, '拉市海', '湿地公园，骑马划船', '丽江', 'nature', '丽江市玉龙纳西族自治县', 4.2, 80, 180, 'https://picsum.photos/400/250?random=16', 'nature,lake,adventure', '08:00-18:00', '全天', true, true, true),
(8, '蓝月谷', '雪山脚下的蓝色湖泊', '丽江', 'nature', '玉龙雪山景区内', 4.6, 0, 90, 'https://picsum.photos/400/250?random=17', 'nature,scenic,photo,lake', '09:00-16:00', '中午', true, true, true),
(9, '木府', '丽江土司府邸，建筑精美', '丽江', 'culture', '丽江古城内', 4.3, 40, 90, 'https://picsum.photos/400/250?random=18', 'culture,history,museum', '08:30-17:30', '上午', true, true, true),
(10, '黑龙潭公园', '观赏玉龙雪山倒影的最佳地点', '丽江', 'nature', '丽江市古城区民主路', 4.4, 0, 60, 'https://picsum.photos/400/250?random=19', 'nature,park,scenic,photo', '07:00-20:00', '早晨', true, true, true),
(11, '白沙古镇', '纳西族文化发源地', '丽江', 'culture', '丽江市玉龙纳西族自治县', 4.2, 0, 120, 'https://picsum.photos/400/250?random=20', 'culture,ancient,art', '全天开放', '下午', true, true, true),
(12, '狮子山', '俯瞰丽江古城全景', '丽江', 'scenic', '丽江古城内', 4.1, 15, 60, 'https://picsum.photos/400/250?random=21', 'scenic,view,photo', '08:00-19:00', '傍晚', true, false, true),
(13, '四方街', '丽江古城中心，美食购物', '丽江', 'food', '丽江古城中心', 4.3, 0, 90, 'https://picsum.photos/400/250?random=22', 'food,shopping,nightlife', '全天开放', '夜晚', true, true, true),
(14, '茶马古道', '体验古代商贸通道', '丽江', 'adventure', '丽江市周边', 4.0, 200, 360, 'https://picsum.photos/400/250?random=23', 'adventure,history,outdoor', '08:00-18:00', '全天', true, false, true),
(15, '玉水寨', '纳西族东巴文化圣地', '丽江', 'culture', '丽江市玉龙纳西族自治县', 4.2, 35, 90, 'https://picsum.photos/400/250?random=24', 'culture,temple,scenic', '08:00-18:00', '上午', true, true, true)
ON CONFLICT (id) DO NOTHING;
