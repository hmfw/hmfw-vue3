<template>
  <el-aside :class="['global-sider', { collapsed }]" :style="siderStyle">
    <div class="sider-logo flex-center" @click="handleLogoClick">
      <img :src="layout.config.logo" alt="logo" class="logo-img" />
      <h1 v-show="!collapsed" class="logo-text">
        {{ layout.config.title }}
      </h1>
    </div>

    <!-- 菜单 -->
    <el-menu
      :default-active="activeMenu"
      :default-openeds="openedMenus"
      :collapse="collapsed"
      class="sider-menu"
      @select="handleMenuSelect"
    >
      <template v-for="item in processedMenuData" :key="item.key">
        <!-- 有子菜单 -->
        <el-sub-menu v-if="item.children && item.children.length > 0" :index="item.key">
          <template #title>
            <el-icon v-if="item.icon">
              <component :is="item.icon" />
            </el-icon>
            <span>{{ item.title }}</span>
          </template>

          <el-menu-item v-for="child in item.children" :key="child.key" :index="child.key">
            <span>{{ child.title }}</span>
          </el-menu-item>
        </el-sub-menu>

        <!-- 无子菜单 -->
        <el-menu-item v-else :index="item.key">
          <el-icon v-if="item.icon">
            <component :is="item.icon" />
          </el-icon>
          <template #title>{{ item.title }}</template>
        </el-menu-item>
      </template>
    </el-menu>
  </el-aside>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useLayoutStore } from '@/stores/layout'
import { useMenuStore, type MenuItem } from '@/stores/menu'
import { getIconComponent } from '@/utils/icons'

const emit = defineEmits(['update:collapsed'])

// Store & Router
const layout = useLayoutStore()
const menuStore = useMenuStore()
const route = useRoute()
const router = useRouter()

const collapsed = computed(() => layout.config.collapsed)

// 状态
const activeMenu = ref('')
const openedMenus = ref<string[]>([])

const siderStyle = computed(() => ({
  backgroundColor: '#001529',
  width: collapsed.value ? `48px` : `208px`,
}))

// 处理菜单数据
const processedMenuData = computed(() => {
  return menuStore.menuData.map(item => ({
    ...item,
    icon: getIconComponent(item.icon),
  }))
})

// 方法
// const toggleCollapsed = () => {
//   collapsed.value = !collapsed.value
// }

const handleMenuSelect = (key: string) => {
  const menuItem = findMenuItem(key)
  if (menuItem?.path) {
    router.push(menuItem.path)
  }
}

const handleLogoClick = () => {
  router.push('/')
}

const findMenuItem = (key: string): MenuItem | null => {
  const findItem = (items: MenuItem[]): MenuItem | null => {
    for (const item of items) {
      if (item.key === key) return item
      if (item.children) {
        const child = findItem(item.children)
        if (child) return child
      }
    }
    return null
  }
  return findItem(menuStore.menuData)
}

const updateActiveMenu = (path: string) => {
  const findKey = (items: MenuItem[]): string | null => {
    for (const item of items) {
      if (item.path === path) {
        return item.key
      }
      if (item.children) {
        const childKey = findKey(item.children)
        if (childKey) {
          // 如果有父菜单，将其打开
          if (!openedMenus.value.includes(item.key)) {
            openedMenus.value.push(item.key)
          }
          return childKey
        }
      }
    }
    return null
  }

  const key = findKey(menuStore.menuData)
  if (key) {
    activeMenu.value = key
  }
}

// 监听路由变化
watch(
  () => route.path,
  path => {
    updateActiveMenu(path)
  },
  { immediate: true }
)
</script>

<style lang="scss">
.global-sider {
  height: 100vh;
  display: flex;
  // padding: 0 8px;
  flex-direction: column;
  //   overflow: hidden;
  //   position: relative;
  transition: width 0.3s;
  //   box-shadow: 2px 0 8px 0 rgba(29, 35, 41, 0.05);
  //   z-index: 1000;

  //   &.sider-fixed {
  //     position: fixed;
  //     left: 0;
  //     top: 0;
  //     bottom: 0;
  //   }

  //   &.sider-dark {
  //     background-color: #001529;
  //   }

  //   &.sider-light {
  //     background-color: #ffffff;
  //   }
  //   // }

  .sider-logo {
    // height: 60px;
    // display: flex;
    // align-items: center;
    // justify-content: center;
    // border-bottom: 1px solid;
    cursor: pointer;
    transition: all 0.3s;
    padding: 16px;
    line-height: 32px;

    // &:hover {
    //   background-color: rgba(0, 0, 0, 0.03);
    // }
  }

  .logo-img {
    width: 32px;
    height: 32px;
    margin-right: 12px;
    transition: margin-right 0.3s;
  }

  .logo-text {
    margin: 0;
    color: #ffffff;
    font-size: 18px;
    font-weight: 600;
    white-space: nowrap;
    opacity: 1;
    transition: opacity 0.3s;
    overflow: hidden;
  }

  // }

  //   .sider-collapse {
  //     height: 40px;
  //     display: flex;
  //     align-items: center;
  //     justify-content: center;
  //     cursor: pointer;
  //     border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  //     color: #909399;
  //     transition: all 0.3s;

  //     &:hover {
  //       color: var(--el-color-primary);
  //       background-color: rgba(64, 158, 255, 0.1);
  //     }

  //     .el-icon {
  //       font-size: 20px;
  //     }
  //   }

  .sider-menu {
    --el-menu-item-height: 40px;
    --el-menu-sub-item-height: 40px;
    --el-menu-bg-color: #001529;
    // --el-menu-hover-bg-color: var(--el-color-primary);
    --el-menu-text-color: rgba(255, 255, 255, 0.65);
    --el-menu-active-color: #ffffff;

    flex: 1 1 auto;
    border-right: none;
    overflow-y: auto;
    overflow-x: hidden;

    .el-menu-item:hover,
    .el-sub-menu__title:hover {
      background-color: transparent;
      color: var(--el-menu-active-color);
    }
    .el-sub-menu.is-active > .el-sub-menu__title {
      color: var(--el-menu-active-color);
    }

    .el-menu-item {
      margin: 4px 8px;
      border-radius: 6px;
    }
    > .el-menu-item {
      padding-left: 12px !important;
    }

    .el-menu-item.is-active {
      background-color: var(--el-color-primary);
    }

    .el-sub-menu > .el-menu--inline {
      background: #000c17;
    }
    //     transition: width 0.3s;

    //     &:not(.el-menu--collapse) {
    //       width: 100%;
    //     }

    //     &.el-menu--collapse {
    //       width: 100%;
    //     }

    //     // 滚动条样式
    //     &::-webkit-scrollbar {
    //       width: 6px;
    //     }

    //     &::-webkit-scrollbar-track {
    //       background: transparent;
    //     }

    //     &::-webkit-scrollbar-thumb {
    //       background: rgba(0, 0, 0, 0.1);
    //       border-radius: 3px;
    //     }
  }

  //   // 暗色主题菜单样式
  //   .sider-dark {
  //     .sider-menu {
  //       background-color: #001529;

  //       :deep(.el-sub-menu__title),
  //       :deep(.el-menu-item) {
  //         &:hover {
  //           background-color: rgba(255, 255, 255, 0.03) !important;
  //         }
  //       }

  //       :deep(.el-menu-item.is-active) {
  //         background-color: rgba(24, 144, 255, 0.2) !important;
  //       }
  //     }
  //   }
  &.collapsed {
    .sider-logo {
      padding: 16px 0;
    }
    .logo-img {
      margin-right: 0;
    }

    .logo-text {
      opacity: 0;
      width: 0;
    }
    .el-menu--collapse {
      --el-menu-base-level-padding: 12px;
    }
  }
}
</style>
