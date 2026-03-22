-- 创建数据库（如果不存在）
-- CREATE DATABASE traveltool;
-- $env:PGCLIENTENCODING="UTF8"; psql -U postgres -d traveltool -f backend/init.sql

-- 使用数据库
-- \c traveltool;

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
    type VARCHAR(100), -- 景点类型
    image_url VARCHAR(500),
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

-- 插入示例路线数据
INSERT INTO routes (title, description, departure_city, destination_city, days, budget_level, preference, image_url) VALUES
('云南经典7日游', '昆明 → 大理 → 丽江 → 香格里拉，体验云南多元文化与绝美风景', '昆明', '香格里拉', 7, '中等', 'nature,culture', 'https://picsum.photos/400/250?random=1'),
('川西秘境环线', '成都 → 四姑娘山 → 丹巴 → 新都桥 → 稻城亚丁，探索川西高原', '成都', '稻城', 10, '较高', 'adventure,nature', 'https://picsum.photos/400/250?random=2'),
('江南水乡慢游', '苏州 → 乌镇 → 杭州 → 绍兴，感受江南烟雨与古镇风情', '苏州', '绍兴', 5, '中等', 'relax,culture', 'https://picsum.photos/400/250?random=3'),
('西北大环线', '西宁 → 青海湖 → 茶卡盐湖 → 敦煌 → 张掖，穿越西北壮美风光', '西宁', '张掖', 8, '中等', 'nature,adventure', 'https://picsum.photos/400/250?random=4');

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

-- 插入示例景点数据
INSERT INTO attractions (name, description, city, type) VALUES
('滇池', '云南最大的淡水湖，冬季可观红嘴鸥', '昆明', '自然风光'),
('大理古城', '历史悠久的古城，白族文化聚集地', '大理', '人文历史'),
('洱海', '高原湖泊，风景如画', '大理', '自然风光'),
('丽江古城', '世界文化遗产，纳西族文化', '丽江', '人文历史'),
('玉龙雪山', '纳西族神山，冰川公园', '丽江', '自然风光'),
('四姑娘山', '蜀山皇后，登山胜地', '阿坝', '自然风光'),
('稻城亚丁', '蓝色星球上的最后一片净土', '稻城', '自然风光'),
('乌镇', '江南水乡古镇代表', '嘉兴', '人文历史'),
('西湖', '杭州名片，人间天堂', '杭州', '自然风光'),
('青海湖', '中国最大的内陆咸水湖', '青海湖', '自然风光'),
('茶卡盐湖', '天空之镜，摄影圣地', '茶卡', '自然风光'),
('莫高窟', '世界文化遗产，佛教艺术宝库', '敦煌', '人文历史');
