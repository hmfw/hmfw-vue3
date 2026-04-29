# Vue 3 后台管理系统

基于 Vue 3 + TypeScript + Vite 构建的现代化后台管理系统模板，集成 Element Plus UI 库，提供灵活的布局系统和丰富的功能组件。

## ✨ 特性

- 🚀 **Vue 3** - 使用 Composition API 和 `<script setup>` 语法
- 💪 **TypeScript** - 完整的类型支持
- ⚡️ **Vite** - 极速的开发体验
- 🎨 **Element Plus** - 企业级 UI 组件库
- 🎭 **多主题** - 支持 light/dark/realDark 三种主题模式
- 📐 **灵活布局** - 侧边栏/顶部/混合菜单三种布局模式
- 🔥 **自动导入** - 组件和 API 自动按需导入
- 🎯 **Pinia** - 轻量级状态管理
- 🛣️ **Vue Router** - 基于文件的路由系统
- 🎨 **Tailwind CSS v4** - 原子化 CSS 框架
- 📊 **ECharts** - 强大的数据可视化
- 📝 **富文本编辑器** - 基于 TipTap 的编辑器组件

## 📦 技术栈

### 核心依赖

- **Vue 3.5** - 渐进式 JavaScript 框架
- **TypeScript 5.9** - JavaScript 的超集
- **Vite 7.3** - 下一代前端构建工具
- **Element Plus 2.13** - Vue 3 组件库
- **Vue Router 4.6** - 官方路由管理器
- **Pinia 3.0** - Vue 状态管理库
- **Axios 1.15** - HTTP 客户端
- **ECharts 6.0** - 数据可视化库
- **Tailwind CSS 4.2** - CSS 框架
- **Lodash 4.18** - JavaScript 工具库
- **Day.js 1.11** - 日期处理库

### 开发工具

- **unplugin-auto-import** - API 自动导入
- **unplugin-vue-components** - 组件自动注册
- **vite-svg-loader** - SVG 组件化
- **ESLint + Prettier** - 代码规范
- **rollup-plugin-visualizer** - 打包分析

## 🚀 快速开始

### 环境要求

- Node.js >= 18
- pnpm >= 8 (推荐使用 pnpm)

### 安装依赖

```bash
pnpm install
```

### 开发

```bash
pnpm dev
```

访问 http://localhost:3000

### 构建

```bash
pnpm build
```

### 预览

```bash
pnpm preview
```

## 📁 项目结构

```
hmfw-vue3/
├── src/
│   ├── assets/          # 静态资源（图片、字体等）
│   ├── components/      # 公共组件
│   ├── hooks/           # 组合式函数
│   │   ├── useEcharts.ts
│   │   └── useResizeObserver.ts
│   ├── layouts/         # 布局组件
│   │   ├── BasicLayout.vue       # 基础布局
│   │   ├── GlobalHeader.vue      # 全局头部
│   │   ├── GlobalSider.vue       # 侧边栏
│   │   ├── TagsView.vue          # 标签页导航
│   │   ├── PageContainer.vue     # 页面容器
│   │   ├── HeaderRight.vue       # 头部右侧
│   │   ├── HeaderNotification.vue # 通知中心
│   │   └── GlobalFooter.vue      # 全局页脚
│   ├── router/          # 路由配置
│   │   └── index.ts
│   ├── stores/          # 状态管理
│   │   ├── layout.ts    # 布局配置
│   │   └── menu.ts      # 菜单数据
│   ├── styles/          # 全局样式
│   │   └── element.scss # Element Plus 主题
│   ├── utils/           # 工具函数
│   │   ├── request.ts   # Axios 封装
│   │   └── icons.ts     # 图标管理
│   ├── views/           # 页面组件
│   │   ├── Dashboard.vue
│   │   ├── examples/    # 示例页面
│   │   └── exception/   # 错误页面
│   ├── App.vue
│   └── main.ts
├── public/              # 公共资源
├── vite.config.ts       # Vite 配置
├── tsconfig.json        # TypeScript 配置
└── package.json
```

## 🎨 布局系统

### 布局模式

- **sidemenu** - 侧边栏菜单（默认）
- **topmenu** - 顶部菜单
- **mixmenu** - 混合菜单

### 主题模式

- **light** - 浅色主题
- **dark** - 深色主题
- **realDark** - 真·深色主题

### 内容宽度

- **Fluid** - 流式布局（默认）
- **Fixed** - 固定宽度

### 可配置项

- 固定头部
- 固定侧边栏
- 面包屑导航
- 标签页视图
- 页脚显示

所有配置通过 `stores/layout.ts` 管理，并持久化到 localStorage。

## 🔌 核心功能

### 自动导入

项目配置了自动导入，无需手动导入常用 API 和组件：

```typescript
// ✅ 无需导入，直接使用
const count = ref(0)
const doubled = computed(() => count.value * 2)

// ✅ Element Plus 组件自动注册
<el-button type="primary">按钮</el-button>
```

### 路径别名

使用 `@/` 作为 `src/` 目录的别名：

```typescript
import { useLayoutStore } from '@/stores/layout'
import Logo from '@/assets/logo.png'
```

### HTTP 请求

`src/utils/request.ts` 提供了配置好的 Axios 实例：

```typescript
import request from '@/utils/request'

// GET 请求
const data = await request.get<UserInfo>('/api/user')

// POST 请求
const result = await request.post<Result>('/api/login', { username, password })
```

**特性：**
- 自动请求去重
- 响应数据解包
- 统一错误处理
- 认证拦截
- TypeScript 类型支持

### SVG 组件

SVG 文件可以作为 Vue 组件导入：

```typescript
import IconName from '@/assets/icon.svg'

// 在模板中使用
<IconName class="w-6 h-6" />
```

## 🛠️ 开发指南

### 代码规范

项目使用 ESLint + Prettier 进行代码规范检查：

```bash
# 代码检查
npx eslint src/

# 代码格式化
npx prettier --write src/
```

### 类型检查

构建前会自动运行类型检查：

```bash
vue-tsc -b
```

### 打包分析

构建后会生成 `stats.html` 文件，用于分析打包体积：

```bash
pnpm build
# 查看 stats.html
```

### API 代理

开发环境下，`/api/*` 请求会被代理到 `http://localhost:8080/*`：

```typescript
// vite.config.ts
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:8080',
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/api/, '')
    }
  }
}
```

## 📝 常见问题

### 如何添加新页面？

1. 在 `src/views/` 下创建页面组件
2. 在 `src/router/index.ts` 中添加路由配置
3. 菜单会自动从路由生成

### 如何修改主题？

编辑 `src/styles/element.scss` 文件，修改 Element Plus 的 SCSS 变量。

### 如何添加全局组件？

将组件放在 `src/components/` 目录下，会自动注册为全局组件。

## 📄 License

MIT

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！
