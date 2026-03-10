# 全栈博客系统

一个现代化、高性能、容器化的全栈博客系统，使用 Next.js 14 和 Nest.js 构建。

## 🚀 技术栈

### 前端
- **Next.js 14** - React 框架 (App Router, SSR)
- **TypeScript** - 类型安全
- **Tailwind CSS** - 原子化 CSS
- **Zustand** - 状态管理
- **React Markdown** - Markdown 渲染

### 后端
- **Nest.js** - Node.js 企业级框架
- **TypeScript** - 全栈类型安全
- **Prisma** - 类型安全的 ORM
- **PostgreSQL 16** - 关系型数据库
- **Redis 7** - 缓存
- **JWT** - 认证

### 部署
- **Docker Compose** - 容器编排
- **Nginx** - 反向代理

## 📁 项目结构

```
blog-fullstack/
├── backend/          # Nest.js 后端
├── frontend/         # Next.js 前端
├── nginx/            # Nginx 配置
├── docs/             # 文档
└── docker-compose.yml
```

## 🏃 快速开始

### 开发环境

```bash
# 启动所有服务
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
```

### 访问地址

| 服务 | 地址 |
|------|------|
| 前端 | http://localhost |
| 后端 API | http://localhost/api |
| 数据库 | localhost:5432 |
| Redis | localhost:6379 |

## 📖 文档

- [设计文档](docs/superpowers/specs/2026-03-10-blog-system-design.md)
- [实施计划](IMPLEMENTATION_PLAN.md)

## 🎯 功能特性

- ✅ 博客 CRUD
- ✅ Markdown 编辑器
- ✅ 标签系统
- ✅ 全文搜索
- ✅ 评论系统
- ✅ 点赞功能
- ✅ 访问统计
- ✅ JWT 认证
- ✅ 管理后台
- ✅ 响应式设计

## 📝 API 文档

### 认证
- `POST /api/auth/login` - 登录
- `POST /api/auth/logout` - 登出
- `GET /api/auth/profile` - 获取用户信息

### 博客
- `GET /api/posts` - 获取博客列表
- `GET /api/posts/:slug` - 获取博客详情
- `POST /api/posts` - 创建博客 (需认证)
- `PUT /api/posts/:id` - 更新博客 (需认证)
- `DELETE /api/posts/:id` - 删除博客 (需认证)

### 标签
- `GET /api/tags` - 获取所有标签
- `GET /api/tags/:slug` - 获取标签详情

### 评论
- `GET /api/comments?postId=xxx` - 获取评论
- `POST /api/comments` - 创建评论

## 🛠️ 开发

### 后端开发

```bash
cd backend
npm install
npm run start:dev
```

### 前端开发

```bash
cd frontend
npm install
npm run dev
```

## 📊 数据库

使用 Prisma 管理数据库迁移：

```bash
cd backend
npx prisma migrate dev
npx prisma studio
```

## 🔒 安全

- 密码 bcrypt 加密
- JWT 认证
- SQL 注入防护 (Prisma 参数化)
- XSS 防护
- 速率限制

## 📈 性能

- Redis 缓存 (博客列表、热门文章)
- PostgreSQL 全文搜索 (GIN 索引)
- Next.js SSR 渲染
- Nginx 静态资源缓存

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License
