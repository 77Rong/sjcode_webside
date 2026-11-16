# AGENT.md — 项目导航与开发规范

> 本文件供 AI 助手（Agent）与开发者快速了解项目全貌。**修改代码前请先阅读本文件，遵守其中的 Git 提交规范。**

## 一、项目简介

这是一个教育类 SaaS 门户项目（"校园通"），包含三个子项目：

| 子项目 | 技术栈 | 角色 |
|---|---|---|
| `frond_end/modern-web-agency-portfolio-main` | Next.js 13 (App Router) + React 18 + Tailwind CSS | **官网门户**（前台） |
| `back_end_api/art-design-pro-main` | Vue 3 + TypeScript + Element Plus + Vite | **管理后台**（路径 `/admin`） |
| `back_end_api/back-end-mock` | Node.js + Express | **后端 API 服务**（Mock 持久化 + Supabase） |

## 二、项目结构

```
sjcode_web/
├── agent.md                      # 本文件（项目导航 + 规范）
├── backup.ps1                    # 一键 git 备份脚本
├── .gitignore                    # 排除 node_modules / .next / logs / .env 等
│
├── frond_end/                    # 前台
│   └── modern-web-agency-portfolio-main/   # Next.js 13 官网门户
│       ├── app/                  # App Router 页面
│       │   ├── page.tsx          # 首页（Hero 轮播图）
│       │   ├── about/  services/  products/  portfolio/  contact/  help/  auth/
│       │   └── layout.tsx  globals.css  error.tsx  global-error.tsx
│       ├── components/           # 组件
│       │   ├── hero-carousel.tsx  hero-section.tsx   # 首页轮播（调 /api/hero/*）
│       │   ├── navbar.tsx  footer.tsx  logo.tsx
│       │   └── ui/  auth/        # shadcn/ui 基础组件、登录组件
│       ├── lib/                  # API 客户端与工具
│       │   ├── hero-api.ts       # 首页焦点图 API
│       │   ├── brand-api.ts      # 品牌（页脚版权/备案）API
│       │   ├── user-api.ts  auth-context.tsx  brand-context.tsx
│       │   └── network-guard.ts  access-log-reporter.tsx（访问日志上报）
│       ├── public/images  public/products    # 静态图片
│       └── ecosystem.config.cjs  # pm2 配置（应用名 srweb，next dev）
│
├── back_end_api/
│   ├── back-end-mock/            # Express 后端 API（端口 3100）
│   │   ├── server.js             # 全部接口定义（约 790 行）
│   │   ├── supabase.js           # Supabase 客户端封装（hero_slides 表）
│   │   ├── data.json             # 文件数据库（品牌/用户/访问日志 Mock 数据）
│   │   └── .env / .env.example   # Supabase 凭证（.env 不提交）
│   │
│   └── art-design-pro-main/      # Vue3 管理后台（基于 art-design-pro 模板）
│       ├── src/api/              # auth / brand / dashboard / hero / system-manage
│       ├── src/views/  src/store/  src/router/  src/components/
│       ├── .env.development      # 开发：Vite 代理到 http://localhost:3100
│       └── .env.production       # 生产：VITE_API_URL（Apifox Mock 地址）
```

## 三、数据库信息

### 1. Supabase（PostgreSQL 云数据库）— 首页焦点图

- **配置位置**：`back_end_api/back-end-mock/.env`
  - `SUPABASE_URL`：形如 `https://xxxx.supabase.co`
  - `SUPABASE_SERVICE_ROLE_KEY`：service_role 密钥（**仅后端使用，严禁提交 / 暴露到前端**）
- **数据表**：`public.hero_slides`

| 列 | 类型 | 说明 | API 字段（camelCase） |
|---|---|---|---|
| `id` | 自增主键 | | `id` |
| `title` | text | 标题 | `title` |
| `subtitle` | text | 副标题 | `subtitle` |
| `badge` | text | 角标 | `badge` |
| `image_url` | text | 图片公开 URL | `imageUrl` |
| `image_alt` | text | 图片替代文本 | `imageAlt` |
| `link_url` | text | 跳转链接 | `linkUrl` |
| `enabled` | boolean | 是否启用（默认 true） | `enabled` |
| `sort_order` | int | 排序 | `sortOrder` |
| `created_at` / `updated_at` | timestamptz | 时间戳 | `createTime` / `updateTime` |

- **存储桶**：`hero-images`（公开读；后端首次上传时自动创建）
- **代码位置**：`back_end_api/back-end-mock/supabase.js`（表名常量 `HERO_TABLE`、桶名 `BUCKET_NAME`、行/字段映射 `toHeroApi` / `toHeroRow`）
- 未配置 Supabase 凭证时，hero 相关接口返回友好提示，其余接口不受影响。

### 2. 文件数据库（data.json）— 其余 Mock 数据

- **位置**：`back_end_api/back-end-mock/data.json`，由 `server.js` 读写，无需额外数据库。
- **集合**：
  - `accessLogs`：访问日志（id、ip、region、time、path、userAgent）
  - `brands`：品牌（name、logo、copyright、icp、enabled）— 控制前台页脚版权与备案
  - `users`：后台用户（userName、nickName、userRoles、status，内置账号 `admin` 等）
- 注意：`data.json` 属于运行时数据，改代码时不要把测试产生的脏数据提交进去（如无必要不要改它）。

### 3. 账号相关

- 登录接口为 Mock 实现（`POST /api/auth/login`），非真实鉴权体系；生产环境用的是 Apifox Mock（见 `.env.production`）。

## 四、后端 API 一览（back-end-mock，默认端口 3100）

| 方法 | 路径 | 说明 |
|---|---|---|
| GET | `/api/dashboard/visits` | 仪表盘访问统计（折线图） |
| GET / POST / DELETE | `/api/access-logs`、`POST /api/access-log` | 访问日志 |
| GET | `/api/brand/list`、`/api/brand/active` | 品牌列表 / 当前启用品牌 |
| POST / PUT / DELETE | `/api/brand`、`/api/brand/:id` | 品牌增改删 |
| GET / POST / PUT / DELETE | `/api/user/*`、`/api/users/:id` | 用户管理与改密 |
| POST | `/api/auth/login` | 登录 |
| GET | `/api/user/info` | 当前用户信息 |
| GET | `/api/hero/list`、`/api/hero/active` | 焦点图列表 / 前台启用项（Supabase） |
| POST / PUT / DELETE | `/api/hero`、`/api/hero/:id` | 焦点图增改删（Supabase） |
| POST | `/api/hero/:id/image` | 上传焦点图（multer，字段名 `file`） |

- 端口：环境变量 `MOCK_PORT`，默认 `3100`（`npm start` 或 `npm run dev`）。

## 五、常用命令

```bash
# 官网门户（http://localhost:3000）
cd frond_end/modern-web-agency-portfolio-main
npm run dev          # 开发
npm run build        # 构建
pm2 start ecosystem.config.cjs   # pm2 方式运行（应用名 srweb）

# 后端 API（http://localhost:3100）
cd back_end_api/back-end-mock
npm start

# 管理后台（开发时 Vite 代理 /api 到 3100）
cd back_end_api/art-design-main
npm run dev
```

## 六、Git 规范（必须遵守）

> ⚠️ **每次修改代码都必须做 git 提交**，这是硬性要求。小改动可以和相关的上一个改动合并为一次提交，但绝不允许积压大量未提交的修改。

1. **环境说明**：本机未全局安装 Git，使用便携版：

   ```powershell
   $git = "$env:LOCALAPPDATA\Temp\opencode\PortableGit\cmd\git.exe"
   ```

   该仓库已配置好：远程 origin（含 Token）、代理 `127.0.0.1:7897`、TLS 后端 schannel、分支跟踪 `origin/main`。

2. **每次修改后的标准流程**：

   ```powershell
   & $git add -A
   & $git commit -m "类型: 简要说明"
   & $git push origin main        # 有网络/代理时推送；失败可稍后再推
   ```

   或直接用一键脚本（在项目根目录）：

   ```powershell
   powershell -ExecutionPolicy Bypass -File backup.ps1 "改了什么"
   ```

3. **提交信息格式**：`类型: 描述`（中文描述即可），常用类型：
   - `feat:` 新功能
   - `fix:` 修复问题
   - `docs:` 仅文档改动
   - `style:` 样式调整
   - `refactor:` 重构
   - `chore:` 配置 / 依赖 / 杂项

   示例：`feat: 首页轮播图支持拖拽排序`、`fix: 页脚品牌版权未刷新`、`docs: 更新 agent.md`

4. **禁止提交的内容**（`.gitignore` 已配置）：
   - `node_modules/`、`.next/`、`dist/`、`logs/`、`*.tsbuildinfo`
   - `.env` 等任何含密钥的文件（Supabase service_role key 绝对不能进仓库）
   - `data.json` 中的测试脏数据（正常情况下它已随首次提交入库，仅在小心核对 diff 后才提交它的变更）

5. **远程仓库**：`https://github.com/77Rong/sjcode_webside`（分支 `main`）。
   注意是 **sjcode_webside**。若推送报 401/403，说明 Token 过期，到 https://github.com/settings/tokens 重新生成后执行：

   ```powershell
   & $git remote set-url origin "https://77Rong:新TOKEN@github.com/77Rong/sjcode_webside.git"
   ```

## 七、开发注意事项

- 目录名 **frond_end**（拼写如此）不是 front_end，写脚本/文档时保持一致，不要顺手改名。
- 前台与后台共用同一后端（3100），前台关注 hero/brand/access-log，后台管理 user/brand/hero/dashboard。
- `art-design-pro-main` 是开源模板改造，升级模板时注意保留 `src/api`、`.env.*`、`public/images` 等定制内容。
- Supabase 的 `SUPABASE_SERVICE_ROLE_KEY` 权限极高：只允许出现在 `back-end-mock/.env` 与后端代码中，出现异常立刻到 Supabase Dashboard 轮换密钥。
