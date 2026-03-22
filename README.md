# TravelTool — 旅行路线助手

智能旅游路线规划平台，基于 **Start Bootstrap Agency** 设计风格，提供路线浏览、景点推荐、行程规划等功能。

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | HTML5 + CSS3 + Vanilla JS |
| 样式 | Bootstrap 5 + Agency Theme |
| 后端 | Node.js + Express |
| 数据库 | PostgreSQL |
| 字体 | Montserrat / Roboto Slab |

## 页面结构

| 页面 | 说明 |
|------|------|
| `pages/home.html` | 首页 — Masthead Hero + 路线规划表单 + 精选路线 |
| `pages/recommend.html` | 路线推荐 — 景点卡片网格 + 智能匹配 |
| `pages/itinerary.html` | 行程详情 — 时间轴 + 统计卡片 + 地图 |
| `pages/trip.html` | 出行助手 — 实时状态 + 三栏面板 + 聊天 |
| `pages/login.html` | 登录 |
| `pages/register.html` | 注册 |
| `pages/user.html` | 个人中心 |

## 快速启动

```bash
# 1. 安装后端依赖
cd backend && npm install

# 2. 配置数据库 (.env)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=traveltool
DB_USER=postgres
DB_PASSWORD=your_password

# 3. 初始化数据库
psql -U postgres -d traveltool -f backend/init.sql

# 4. 启动后端 (端口 3000)
npm run dev

# 5. 启动前端 (端口 8081)
npx http-server -p 8081 -c-1
```

或使用一键脚本：
```bash
powershell -ExecutionPolicy Bypass -File start-local.ps1
```

访问 `http://localhost:8081`

## API 接口

- `GET /api/health` — 健康检查
- `GET /api/routes` — 路线列表
- `GET /api/routes/:id` — 路线详情
- `GET /api/attractions` — 景点查询

## 设计风格

采用 [Start Bootstrap Agency](https://startbootstrap.com/theme/agency) 设计语言：
- 主色调：金色 `#ffc800` + 深色 `#212529`
- 导航栏：首页透明 → 滚动变暗，其他页始终深色
- 排版：Montserrat（标题）+ Roboto Slab（正文）

## License

MIT
