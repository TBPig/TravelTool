# 旅行工具 (TravelTool)

一个基于 HTML + CSS + Node.js + PostgreSQL 构建的旅游路线助手平台，提供旅游路线浏览、景点查询、路线规划等功能。

## 项目简介

旅游路线助手致力于为旅行者提供优质的旅游路线规划服务，包括热门路线推荐、景点信息查询、个性化路线筛选等功能模块。项目采用前后端分离架构，前端为静态页面，后端提供 RESTful API 服务。

## 技术栈

### 前端
- **HTML5** - 页面结构
- **CSS3** - 样式设计
- **原生 JavaScript** - 交互逻辑

### 后端
- **Node.js** - 运行环境
- **Express** - Web 框架
- **PostgreSQL** - 数据库
- **node-postgres (pg)** - PostgreSQL 客户端

## 环境要求

- Node.js 14.0 或更高版本
- PostgreSQL 12.0 或更高版本
- npm 或 yarn 包管理器

## 快速开始

### 1. 克隆项目

```bash
git clone <项目仓库地址>
cd TravelTool
```

### 2. 配置数据库

#### 2.1 安装 PostgreSQL

- **Windows**: 下载安装包 https://www.postgresql.org/download/windows/
- **macOS**: `brew install postgresql`
- **Linux**: `sudo apt-get install postgresql`

#### 2.2 创建数据库

```bash
# 登录 PostgreSQL
psql -U postgres

# 创建数据库
CREATE DATABASE traveltool;

# 退出
\q
```

#### 2.3 初始化数据表

```bash
# 执行初始化脚本
psql -U postgres -d traveltool -f backend/init.sql
```

### 3. 配置后端环境变量

添加并编辑 `backend/.env` 文件，根据你的数据库配置修改：

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=traveltool
DB_USER=postgres
DB_PASSWORD=你的数据库密码
PORT=3000
```

### 4. 安装依赖并启动后端服务

```bash
# 进入后端目录
cd backend

# 安装依赖
npm install

# 启动开发服务器（支持热重载）
npm run dev

# 或启动生产服务器
npm start
```

后端服务启动后，访问 http://localhost:3000/api/health 检查是否正常运行。

### 5. 访问前端页面

#### 方式一：直接打开
直接在浏览器中打开 `index.html` 文件即可访问网站。

#### 方式二：使用本地服务器（推荐）

```bash
# 在项目根目录下，使用 Python 启动本地服务器
python -m http.server 8080

# 或使用 Node.js 的 http-server
npx http-server -p 8080
```

然后在浏览器中访问 http://localhost:8080

## API 接口说明

### 健康检查
- **GET** `/api/health` - 检查服务器状态

### 路线相关
- **GET** `/api/routes` - 获取所有路线
  - 查询参数: `departure`, `destination`, `days`, `preference`
- **GET** `/api/routes/:id` - 获取路线详情
- **POST** `/api/routes` - 创建新路线

### 景点相关

- **GET** `/api/attractions` - 获取所有景点
  - 查询参数: `city`, `type`

## 开发说明

- 所有页面共享统一的头部导航和页脚设计
- 样式文件按功能独立拆分，便于维护
- 后端 API 使用 RESTful 风格设计
- 数据库使用 PostgreSQL，支持复杂查询
- 图片资源使用外部占位图服务

## 常见问题

### 1. 数据库连接失败
- 检查 PostgreSQL 服务是否已启动
- 确认 `.env` 文件中的数据库配置正确
- 检查数据库用户权限

### 2. 端口被占用
- 修改 `.env` 文件中的 `PORT` 变量
- 或关闭占用 3000 端口的其他程序

### 3. 跨域问题
- 后端已配置 CORS，允许所有来源访问
- 如需限制特定域名，请修改 `backend/server.js` 中的 CORS 配置

## 许可证

[LICENSE](LICENSE)
