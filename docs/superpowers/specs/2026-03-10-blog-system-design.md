# 博客系统设计文档

**日期**: 2026-03-10  
**版本**: 1.0  
**状态**: 已批准

---

## 1. 概述

### 1.1 项目目标
将现有的静态 GitHub 博客升级为全栈动态博客系统，展示现代 Web 开发技术栈，提升简历竞争力。

### 1.2 技术选型

| 层次 | 技术 | 理由 |
|------|------|------|
| 前端 | Next.js 14 + TypeScript | SSR 渲染、SEO 友好、类型安全 |
| 后端 | Nest.js + TypeScript | 企业级框架、依赖注入、装饰器 |
| 数据库 | PostgreSQL 16 | 全文搜索、事务支持、强大功能 |
| 缓存 | Redis 7 | 高性能缓存、会话管理 |
| ORM | Prisma | 类型安全、自动迁移 |
| 部署 | Docker Compose + Nginx | 容器化、一键部署 |

---

## 2. 系统架构

### 2.1 架构图

```
┌─────────────────────────────────────────────────────────┐
│                      用户浏览器                          │
└─────────────────────┬───────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│              Nginx 反向代理 (容器 1, 端口 80)            │
│  - 路由分发                                              │
│  - 静态资源缓存                                          │
│  - HTTPS 终止                                            │
└──────────────┬────────────────────┬─────────────────────┘
               │                    │
               ▼                    ▼
    ┌──────────────────┐  ┌──────────────────┐
    │   Next.js 前端   │  │  Nest.js 后端 API │
    │   (容器 2, 3000) │  │  (容器 3, 4000)   │
    │   - SSR 渲染      │  │  - 业务逻辑       │
    │   - 路由          │  │  - JWT 认证       │
    │   - 状态管理      │  │  - 数据验证       │
    └──────────────────┘  └─────────┬────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    │               │               │
                    ▼               ▼               ▼
           ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
           │ PostgreSQL  │ │    Redis    │ │   MinIO     │
           │ (容器 4)     │ │ (容器 5)     │ │ (可选)      │
           │ - 博客数据  │ │ - 缓存      │ │ - 图片存储  │
           │ - 用户数据  │ │ - 会话      │ │             │
           │ - 评论数据  │ │             │ │             │
           └─────────────┘ └─────────────┘ └─────────────┘
```

### 2.2 容器清单

| 容器 | 镜像 | 端口 | 说明 |
|------|------|------|------|
| nginx | nginx:alpine | 80/443 | 反向代理 |
| frontend | node:20-alpine | 3000 | Next.js 前端 |
| backend | node:20-alpine | 4000 | Nest.js 后端 |
| postgres | postgres:16-alpine | 5432 | 数据库 |
| redis | redis:7-alpine | 6379 | 缓存 |

---

## 3. 数据库设计

### 3.1 ER 图

```
┌─────────────────┐       ┌─────────────────┐
│     users       │       │      tags       │
├─────────────────┤       ├─────────────────┤
│ id (PK)         │       │ id (PK)         │
│ username        │       │ name            │
│ email           │       │ slug            │
│ password        │       │ color           │
│ role            │       │ created_at      │
│ avatar          │       └────────┬────────┘
│ created_at      │                │
│ updated_at      │                │
└────────┬────────┘                │
         │                         │
         │ 1:N                     │ N:M
         │                         │
         ▼                         │
┌─────────────────┐               │
│     posts       │               │
├─────────────────┤               │
│ id (PK)         │◄──────────────┘
│ title           │
│ slug            │      ┌─────────────────┐
│ content         │      │   post_tags     │
│ excerpt         │      ├─────────────────┤
│ cover_image     │─────►│ post_id (FK)    │
│ author_id (FK)  │      │ tag_id (FK)     │
│ status          │      └─────────────────┘
│ view_count      │
│ like_count      │
│ search_vector   │      ┌─────────────────┐
│ created_at      │      │   comments      │
│ updated_at      │      ├─────────────────┤
│ published_at    │      │ id (PK)         │
└─────────────────┘      │ post_id (FK)    │
                         │ author_name     │
                         │ author_email    │
                         │ content         │
                         │ parent_id (FK)  │
                         │ status          │
                         │ created_at      │
                         └─────────────────┘
```

### 3.2 表结构详情

#### users 表
| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | UUID | PRIMARY KEY | 用户 ID |
| username | VARCHAR(50) | UNIQUE NOT NULL | 用户名 |
| email | VARCHAR(100) | UNIQUE NOT NULL | 邮箱 |
| password | VARCHAR(255) | NOT NULL | 密码 (bcrypt) |
| role | ENUM | DEFAULT 'user' | 角色 (admin/user) |
| avatar | VARCHAR(255) | NULL | 头像 URL |
| created_at | TIMESTAMP | DEFAULT NOW() | 创建时间 |
| updated_at | TIMESTAMP | DEFAULT NOW() | 更新时间 |

#### posts 表
| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | UUID | PRIMARY KEY | 文章 ID |
| title | VARCHAR(200) | NOT NULL | 标题 |
| slug | VARCHAR(200) | UNIQUE NOT NULL | URL 友好 slug |
| content | TEXT | NOT NULL | 内容 (Markdown) |
| excerpt | VARCHAR(500) | NULL | 摘要 |
| cover_image | VARCHAR(255) | NULL | 封面图 |
| author_id | UUID | FK → users.id | 作者 ID |
| status | ENUM | DEFAULT 'draft' | 状态 (draft/published) |
| view_count | INTEGER | DEFAULT 0 | 浏览量 |
| like_count | INTEGER | DEFAULT 0 | 点赞数 |
| search_vector | TSVECTOR | NULL | 全文搜索向量 |
| created_at | TIMESTAMP | DEFAULT NOW() | 创建时间 |
| updated_at | TIMESTAMP | DEFAULT NOW() | 更新时间 |
| published_at | TIMESTAMP | NULL | 发布时间 |

#### tags 表
| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | UUID | PRIMARY KEY | 标签 ID |
| name | VARCHAR(50) | UNIQUE NOT NULL | 标签名 |
| slug | VARCHAR(50) | UNIQUE NOT NULL | URL 友好 slug |
| color | VARCHAR(7) | DEFAULT '#8b5cf6' | 标签颜色 |
| created_at | TIMESTAMP | DEFAULT NOW() | 创建时间 |

#### post_tags 表
| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| post_id | UUID | PK, FK → posts.id | 文章 ID |
| tag_id | UUID | PK, FK → tags.id | 标签 ID |

#### comments 表
| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | UUID | PRIMARY KEY | 评论 ID |
| post_id | UUID | FK → posts.id | 文章 ID |
| author_name | VARCHAR(50) | NOT NULL | 作者名 |
| author_email | VARCHAR(100) | NOT NULL | 作者邮箱 |
| content | TEXT | NOT NULL | 评论内容 |
| parent_id | UUID | FK → comments.id | 父评论 ID (支持回复) |
| status | ENUM | DEFAULT 'pending' | 状态 (pending/approved/spam) |
| created_at | TIMESTAMP | DEFAULT NOW() | 创建时间 |

### 3.3 索引设计

```sql
-- 唯一索引
CREATE UNIQUE INDEX idx_posts_slug ON posts(slug);
CREATE UNIQUE INDEX idx_tags_slug ON tags(slug);
CREATE UNIQUE INDEX idx_users_email ON users(email);
CREATE UNIQUE INDEX idx_users_username ON users(username);

-- 普通索引
CREATE INDEX idx_posts_author_id ON posts(author_id);
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX idx_posts_status ON posts(status);
CREATE INDEX idx_comments_post_id ON comments(post_id);
CREATE INDEX idx_post_tags_post_id ON post_tags(post_id);
CREATE INDEX idx_post_tags_tag_id ON post_tags(tag_id);

-- 全文搜索索引 (GIN)
CREATE INDEX idx_posts_search_vector ON posts USING GIN(search_vector);
```

---

## 4. API 设计

### 4.1 认证模块 (/api/auth)

| 方法 | 端点 | 认证 | 说明 |
|------|------|------|------|
| POST | /api/auth/login | ❌ | 用户登录 |
| POST | /api/auth/logout | ✅ | 用户登出 |
| GET | /api/auth/profile | ✅ | 获取当前用户信息 |

### 4.2 博客模块 (/api/posts)

| 方法 | 端点 | 认证 | 说明 |
|------|------|------|------|
| GET | /api/posts | ❌ | 获取博客列表 (分页/筛选/搜索) |
| GET | /api/posts/:slug | ❌ | 获取博客详情 |
| POST | /api/posts | ✅ admin | 创建博客 |
| PUT | /api/posts/:id | ✅ admin | 更新博客 |
| DELETE | /api/posts/:id | ✅ admin | 删除博客 |
| POST | /api/posts/:id/like | ❌ | 点赞博客 |
| GET | /api/posts/:id/related | ❌ | 相关博客推荐 |

### 4.3 标签模块 (/api/tags)

| 方法 | 端点 | 认证 | 说明 |
|------|------|------|------|
| GET | /api/tags | ❌ | 获取所有标签 |
| GET | /api/tags/:slug | ❌ | 获取标签详情 |
| POST | /api/tags | ✅ admin | 创建标签 |
| PUT | /api/tags/:id | ✅ admin | 更新标签 |
| DELETE | /api/tags/:id | ✅ admin | 删除标签 |

### 4.4 评论模块 (/api/comments)

| 方法 | 端点 | 认证 | 说明 |
|------|------|------|------|
| GET | /api/comments?postId=xxx | ❌ | 获取评论列表 |
| POST | /api/comments | ❌ | 创建评论 |
| PUT | /api/comments/:id/approve | ✅ admin | 审核评论 |
| DELETE | /api/comments/:id | ✅ admin | 删除评论 |

### 4.5 统计模块 (/api/stats)

| 方法 | 端点 | 认证 | 说明 |
|------|------|------|------|
| GET | /api/stats/overview | ❌ | 总体统计 |
| GET | /api/stats/popular | ❌ | 热门文章 Top 10 |

### 4.6 响应格式

**成功响应:**
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

**错误响应:**
```json
{
  "success": false,
  "error": {
    "code": "POST_NOT_FOUND",
    "message": "文章不存在",
    "details": {
      "slug": "invalid-slug"
    }
  }
}
```

---

## 5. 认证流程

### 5.1 JWT 配置

```typescript
{
  algorithm: 'HS256',
  expiresIn: '7d',           // 7 天有效期
  issuer: 'blog-api',
  audience: 'blog-client'
}
```

### 5.2 JWT Payload

```typescript
{
  sub: "user-uuid",           // 用户 ID
  username: "admin",          // 用户名
  email: "admin@example.com", // 邮箱
  role: "admin",              // 角色
  iat: 1234567890,            // 签发时间
  exp: 1234567890 + 604800    // 过期时间
}
```

### 5.3 登录流程

```
1. 用户输入账号密码
        ↓
2. 前端 → POST /api/auth/login
        ↓
3. 后端验证用户名密码 (bcrypt 比对)
        ↓
4. 生成 JWT token
        ↓
5. 返回 { token, user }
        ↓
6. 前端存储 token 到 localStorage
        ↓
7. 后续请求 Header: Authorization: Bearer <token>
```

### 5.4 登出流程

```
1. 用户点击登出
        ↓
2. 前端 → POST /api/auth/logout
        ↓
3. 后端将 token 加入 Redis 黑名单
        ↓
4. 前端清除 localStorage
        ↓
5. 重定向到首页
```

---

## 6. 前端设计

### 6.1 页面路由

```
/                       首页 (博客列表)
/posts/[slug]           博客详情
/tags/[slug]            标签筛选页
/about                  关于页面
/login                  登录页
/dashboard              管理后台首页
/dashboard/posts        文章管理
/dashboard/posts/new    新建文章
/dashboard/posts/[id]/edit  编辑文章
/dashboard/comments     评论管理
/dashboard/tags         标签管理
```

### 6.2 核心组件

**公共组件:**
- Header (导航栏)
- Footer (页脚)
- PostCard (博客卡片)
- PostContent (Markdown 渲染)
- CommentList (评论列表)
- CommentForm (评论表单)
- SearchBar (搜索框)
- TagBadge (标签徽章)
- Pagination (分页)
- ThemeToggle (主题切换)

**管理后台组件:**
- AdminLayout (后台布局)
- MarkdownEditor (Markdown 编辑器)
- PostForm (文章表单)
- TagManager (标签管理)
- CommentModeration (评论审核)

### 6.3 状态管理 (Zustand)

```typescript
// Auth Store
interface AuthState {
  user: User | null;
  token: string | null;
  login: (credentials) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

// Post Store
interface PostState {
  posts: Post[];
  currentPost: Post | null;
  loading: boolean;
  fetchPosts: (params) => Promise<void>;
  fetchPostBySlug: (slug) => Promise<void>;
}
```

---

## 7. 部署设计

### 7.1 Docker Compose 配置

```yaml
version: '3.8'
services:
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
    depends_on:
      - frontend
      - backend

  frontend:
    build: ./frontend
    environment:
      - NEXT_PUBLIC_API_URL=http://backend:4000
    expose:
      - "3000"

  backend:
    build: ./backend
    environment:
      - DATABASE_URL=postgresql://postgres:password@postgres:5432/blog
      - REDIS_URL=redis://redis:6379
      - JWT_SECRET=${JWT_SECRET}
    expose:
      - "4000"

  postgres:
    image: postgres:16-alpine
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=blog
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data
```

### 7.2 部署命令

```bash
# 1. 克隆代码
git clone <repo> /home/ustcb/blog

# 2. 配置环境变量
cp .env.example .env
vim .env

# 3. 启动服务
docker-compose up -d

# 4. 查看日志
docker-compose logs -f

# 5. 重新构建
docker-compose up -d --build
```

---

## 8. 测试策略

### 8.1 后端测试 (Jest)

- 单元测试：Service 层 (80%+覆盖率)
- 集成测试：API 端点 E2E 测试
- 数据库测试：使用测试数据库

### 8.2 前端测试

- 组件单元测试 (Jest + React Testing Library)
- 页面集成测试
- E2E 测试 (Playwright)

---

## 9. 错误处理

### 9.1 后端异常类型

| 异常 | HTTP 状态码 | 说明 |
|------|-----------|------|
| BadRequestException | 400 | 请求参数错误 |
| UnauthorizedException | 401 | 未授权 |
| ForbiddenException | 403 | 禁止访问 |
| NotFoundException | 404 | 资源不存在 |
| ConflictException | 409 | 资源冲突 |
| InternalServerErrorException | 500 | 服务器内部错误 |

### 9.2 前端错误处理

- Error Boundary 捕获组件错误
- Axios Interceptor 处理 API 错误
- Toast 通知展示错误信息
- 自定义 404/500 错误页面

---

## 10. 安全考虑

### 10.1 密码安全
- 使用 bcrypt 加密 (cost: 10)
- 最小长度 8 位
- 密码强度验证

### 10.2 JWT 安全
- 强密钥 (32+字符)
- 短期有效期 (7 天)
- Token 黑名单机制

### 10.3 API 安全
- 输入验证 (class-validator)
- SQL 注入防护 (Prisma 参数化)
- XSS 防护 (内容转义)
- CSRF 防护
- 速率限制 (Rate Limiter)

### 10.4 数据库安全
- 外键约束
- 事务支持
- 备份策略

---

## 11. 性能优化

### 11.1 缓存策略

| 内容 | 缓存位置 | TTL |
|------|---------|-----|
| 博客列表 | Redis | 5 分钟 |
| 热门文章 | Redis | 1 小时 |
| 博客详情 | Redis | 10 分钟 |
| 标签列表 | Redis | 30 分钟 |
| 静态资源 | Nginx | 1 年 |

### 11.2 数据库优化
- 全文搜索 (tsvector + GIN 索引)
- 分页查询 (LIMIT/OFFSET)
- 预加载关联 (Prisma include)

### 11.3 前端优化
- SSR 渲染
- 图片懒加载
- 代码分割
- 静态资源 CDN

---

## 12. 里程碑

### Phase 1: 基础设施 (Week 1)
- [ ] 项目初始化
- [ ] Docker Compose 配置
- [ ] 数据库设计和迁移
- [ ] JWT 认证模块

### Phase 2: 博客核心 (Week 2)
- [ ] 博客 CRUD API
- [ ] 标签系统
- [ ] 全文搜索
- [ ] 前端博客列表/详情页

### Phase 3: 管理后台 (Week 3)
- [ ] 管理后台布局
- [ ] Markdown 编辑器
- [ ] 文章管理功能
- [ ] 标签管理功能

### Phase 4: 增强功能 (Week 4)
- [ ] 评论系统
- [ ] 点赞功能
- [ ] 统计功能
- [ ] SEO 优化

### Phase 5: 部署上线 (Week 5)
- [ ] 服务器部署
- [ ] HTTPS 配置
- [ ] 性能测试
- [ ] 监控日志

---

## 13. 风险评估

| 风险 | 影响 | 概率 | 缓解措施 |
|------|------|------|----------|
| 服务器资源不足 | 中 | 低 | 监控资源，及时扩容 |
| 数据库性能问题 | 中 | 中 | 添加索引，优化查询 |
| 安全问题 | 高 | 低 | 严格验证，定期审计 |
| 部署失败 | 中 | 低 | 回滚机制，灰度发布 |

---

## 14. 后续扩展

### 14.1 短期扩展
- OAuth 登录 (GitHub/Google)
- 图片上传 (MinIO)
- RSS 订阅
- 邮件通知

### 14.2 长期扩展
- 多用户支持
- 博客主题定制
- 数据分析仪表板
- API Rate Limiting
- CDN 集成

---

## 15. 参考文档

- [Next.js 文档](https://nextjs.org/docs)
- [Nest.js 文档](https://docs.nestjs.com)
- [Prisma 文档](https://www.prisma.io/docs)
- [PostgreSQL 文档](https://www.postgresql.org/docs)
- [Redis 文档](https://redis.io/docs)
- [Docker 文档](https://docs.docker.com)
