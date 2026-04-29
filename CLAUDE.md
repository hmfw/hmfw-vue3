# CLAUDE.md

本文件为 Claude Code (claude.ai/code) 在此仓库中工作时提供指导。

## 项目概述

基于 Vue 3 + TypeScript + Vite 的后台管理系统模板，使用 Element Plus UI 库。具有灵活的布局系统，支持侧边栏/顶部/混合菜单模式、主题切换（light/dark/realDark）以及常用的管理后台组件。

## 开发命令

```bash
# 启动开发服务器（运行在 http://localhost:3000）
pnpm dev

# 类型检查并构建生产版本
pnpm build

# 预览生产构建
pnpm preview

# 代码检查（ESLint 已配置但没有显式脚本）
npx eslint src/

# 代码格式化（Prettier 已配置但没有显式脚本）
npx prettier --write src/
```

## 架构

### 核心技术栈
- **Vue 3** 使用 `<script setup>` SFC 语法
- **TypeScript** 启用严格类型检查
- **Vite** 构建工具
- **Pinia** 状态管理
- **Vue Router** 使用 hash 历史模式
- **Element Plus** 支持自动导入（组件 + API）
- **Tailwind CSS** v4 样式框架
- **Axios** HTTP 请求，带自定义拦截器

### 关键插件与特性
- **unplugin-auto-import**: 自动导入 Vue API 和 Element Plus 组件
- **unplugin-vue-components**: 自动注册组件（生成 `components.d.ts`）
- **vite-svg-loader**: 将 SVG 作为 Vue 组件导入
- **rollup-plugin-visualizer**: 打包分析（构建时运行）
- **@mario9/tiptap-editor**: 基于 TipTap 的富文本编辑器组件（Vue 3 + Element Plus）
- **ECharts**: 数据可视化
- **dayjs**: 日期处理
- **lodash**: 工具函数库

### 目录结构

```
src/
├── assets/          # 静态资源（图片、字体）
├── components/      # 可复用组件（如 EchartBar.vue）
├── hooks/           # 组合式函数（useEcharts、useResizeObserver）
├── layouts/         # 布局组件（BasicLayout、GlobalHeader、GlobalSider 等）
├── router/          # Vue Router 配置
├── stores/          # Pinia 状态管理（layout、menu）
├── styles/          # 全局样式（包含 element.scss 用于 Element Plus 主题）
├── utils/           # 工具函数（request.ts 为 axios 实例，icons.ts）
├── views/           # 页面组件
│   ├── examples/    # 示例页面（柱状图、编辑器）
│   └── exception/   # 错误页面（403、404、500）
├── App.vue
└── main.ts          # 应用入口
```

### 布局系统

应用使用由 `stores/layout.ts` 管理的灵活布局系统：

- **布局模式**: `sidemenu`（默认）、`topmenu`、`mixmenu`
- **主题模式**: `light`、`dark`、`realDark`
- **内容宽度**: `Fluid` 或 `Fixed`
- **可配置功能**: 固定头部/侧边栏、面包屑、标签页视图、页脚
- **持久化**: 布局配置保存到 localStorage

`src/layouts/` 中的布局组件：
- `BasicLayout.vue`: 主布局容器
- `GlobalHeader.vue`: 顶部导航栏
- `GlobalSider.vue`: 侧边栏菜单（7.2K - 复杂组件）
- `TagsView.vue`: 面包屑式导航标签（14.1K - 复杂组件）
- `PageContainer.vue`: 内容区域容器
- `HeaderRight.vue`: 头部右侧操作区
- `HeaderNotification.vue`: 通知下拉菜单
- `GlobalFooter.vue`: 页脚组件

### 路由

路由定义在 `src/router/index.ts`：
- 使用 hash 历史模式（`createWebHashHistory`）
- 在 `/` 路径下的 `BasicLayout` 中嵌套路由
- 路由 meta 包含 `title`、`icon`、`hideInMenu`、`hideChildrenInMenu`
- 菜单通过 `stores/menu.ts` 从路由自动生成

### HTTP 客户端

`src/utils/request.ts` 提供配置好的 axios 实例：
- 基础 URL: `/api`（开发环境代理到 `http://localhost:8080`）
- 自动请求去重（取消重复的待处理请求）
- 响应解包：直接返回 `response.data.data`
- 认证处理：检查 code 为 `-1` 时跳转登录
- 错误处理：为常见 HTTP 错误显示 Element Plus 消息提示
- TypeScript: 自定义接口使 `.get<T>()` 和 `.post<T>()` 返回 `Promise<T>`

### 状态管理

`src/stores/` 中的 Pinia 状态：
- `layout.ts`: 布局配置（主题、布局模式、尺寸、功能开关）
- `menu.ts`: 从路由配置派生的菜单数据

## 重要模式

### 自动导入
Element Plus 组件和 Vue API 自动导入，无需手动导入：
- Vue API: `ref`、`computed`、`watch` 等
- Element Plus: `ElMessage`、`ElButton` 等
- 生成的类型在 `auto-imports.d.ts` 和 `components.d.ts` 中

### 路径别名
使用 `@/` 引用 `src/` 目录：
```typescript
import { useLayoutStore } from '@/stores/layout'
import Logo from '@/assets/logo.png'
```

### SCSS 与 Element Plus
Element Plus 使用 SASS。全局 SCSS 文件 `@/styles/element.scss` 通过 Vite 配置自动注入到所有 SCSS 文件中。

### SVG 组件
SVG 可以作为 Vue 组件导入：
```typescript
import IconName from '@/assets/icon.svg'
// 使用 <IconName />
```

### 打包分割
生产构建分割为多个 chunk：
- `vue-vendor`: Vue 核心（vue、vue-router、pinia）
- `element-plus-vendor`: Element Plus + 图标
- `echarts`: ECharts 库
- `lodash`: Lodash 工具库

## 开发注意事项

### 开发服务器
- 运行在 3000 端口，启用 host 模式
- API 代理: `/api/*` → `http://localhost:8080/*`（去除 `/api` 前缀）

### 类型检查
- 构建前运行 `vue-tsc -b` 确保类型安全
- TypeScript 配置分离: `tsconfig.json`（基础）、`tsconfig.app.json`（应用）、`tsconfig.node.json`（Vite 配置）

### 代码质量
- ESLint 配置了 Vue 3、TypeScript 和 Prettier
- 自定义规则: 禁用多词组件名检查，忽略 `_` 前缀的未使用变量
- Prettier 配置用于代码格式化

### 构建分析
运行 `pnpm build` 通过 rollup-plugin-visualizer 生成 `stats.html` 打包可视化分析。
