<template>
  <div class="page-container" :class="{ 'page-with-footer': showFooter }">
    <!-- 页面头部 -->
    <div v-if="showHeader" class="page-header">
      <div class="page-header-main">
        <!-- 标题区域 -->
        <div class="page-title">
          <div class="title-content">
            <h2 v-if="title" class="title-text">{{ title }}</h2>
            <div v-if="subTitle" class="sub-title">{{ subTitle }}</div>
          </div>

          <div v-if="showBack" class="back-button" @click="handleBack">
            <el-icon><ArrowLeft /></el-icon>
            返回
          </div>
        </div>

        <!-- 操作区域 -->
        <div v-if="showExtra" class="page-extra">
          <slot name="extra">
            <el-space>
              <el-button
                v-for="(item, index) in extra"
                :key="index"
                :type="item.type || 'default'"
                :icon="item.icon"
                :loading="item.loading"
                :disabled="item.disabled"
                @click="item.onClick"
              >
                {{ item.text }}
              </el-button>
            </el-space>
          </slot>
        </div>
      </div>

      <!-- 标签页 -->
      <div v-if="showTabs" class="page-tabs">
        <slot name="tabs">
          <el-tabs v-model="activeTab" type="card" @tab-click="handleTabClick">
            <el-tab-pane
              v-for="tab in tabs"
              :key="tab.key"
              :label="tab.title"
              :name="tab.key"
              :disabled="tab.disabled"
            />
          </el-tabs>
        </slot>
      </div>
    </div>

    <!-- 内容区域 -->
    <div class="page-content">
      <el-skeleton v-if="loading" animated class="page-skeleton">
        <template #template>
          <el-skeleton-item variant="h3" style="width: 30%" />
          <el-skeleton-item variant="text" style="width: 60%; margin-top: 16px" />
          <el-skeleton-item variant="text" style="width: 50%; margin-top: 8px" />
          <div style="margin-top: 32px">
            <el-skeleton-item variant="rect" style="width: 100%; height: 200px" />
          </div>
        </template>
      </el-skeleton>

      <div v-else class="page-content-inner">
        <slot />
      </div>
    </div>

    <!-- 底部区域 -->
    <div v-if="showFooter" class="page-footer">
      <slot name="footer">
        <div class="footer-actions">
          <el-space>
            <el-button
              v-for="(item, index) in footer"
              :key="index"
              :type="item.type || 'primary'"
              :icon="item.icon"
              :loading="item.loading"
              :disabled="item.disabled"
              @click="item.onClick"
            >
              {{ item.text }}
            </el-button>
          </el-space>
        </div>
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft } from '@element-plus/icons-vue'

// Props
interface Props {
  title?: string
  subTitle?: string
  loading?: boolean
  showHeader?: boolean
  showBack?: boolean
  showExtra?: boolean
  showTabs?: boolean
  showFooter?: boolean
  extra?: ActionItem[]
  tabs?: TabItem[]
  footer?: ActionItem[]
  activeKey?: string
}

interface ActionItem {
  text: string
  type?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'text' | 'default'
  icon?: any
  loading?: boolean
  disabled?: boolean
  onClick?: () => void
}

interface TabItem {
  key: string
  title: string
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  showHeader: true,
  showBack: false,
  showExtra: true,
  showTabs: false,
  showFooter: false,
  extra: () => [],
  tabs: () => [],
  footer: () => [],
  activeKey: '',
})

const router = useRouter()

// 状态
const activeTab = ref(props.activeKey || props.tabs[0]?.key || '')

// 事件
const emit = defineEmits(['back', 'tab-change'])

// 方法
const handleBack = () => {
  emit('back')
  router.back()
}

const handleTabClick = (tab: any) => {
  activeTab.value = tab.props.name
  emit('tab-change', tab.props.name)
}
</script>

<style scoped lang="scss">
// .page-container {
//   display: flex;
//   flex-direction: column;
//   min-height: 100%;
//   background: var(--content-bg-color);
//   border-radius: 4px;

//   &.page-with-footer {
//     min-height: calc(
//       100vh - var(--header-height) - var(--footer-height) - var(--tags-view-height) - 32px
//     );
//   }
// }

// .page-header {
//   background: var(--content-bg-color);
//   padding: 16px 24px;
//   border-bottom: 1px solid var(--border-color);
// }

// .page-header-main {
//   display: flex;
//   justify-content: space-between;
//   align-items: flex-start;
//   margin-bottom: 16px;
// }

// .page-title {
//   flex: 1;
//   display: flex;
//   align-items: center;
//   flex-wrap: wrap;
//   gap: 12px;
// }

// .title-content {
//   flex: 1;
//   min-width: 0;
// }

// .title-text {
//   margin: 0;
//   font-size: 20px;
//   font-weight: 600;
//   color: rgba(0, 0, 0, 0.88);
//   line-height: 32px;
// }

// .sub-title {
//   color: rgba(0, 0, 0, 0.45);
//   font-size: 14px;
//   line-height: 22px;
//   margin-top: 4px;
// }

// .back-button {
//   display: flex;
//   align-items: center;
//   color: var(--el-color-primary);
//   font-size: 14px;
//   cursor: pointer;
//   transition: color 0.3s;
//   white-space: nowrap;

//   &:hover {
//     color: color-mix(in srgb, var(--el-color-primary) 80%, transparent);
//   }

//   .el-icon {
//     margin-right: 4px;
//   }
// }

// .page-extra {
//   margin-left: 16px;
//   flex-shrink: 0;
// }

// .page-tabs {
//   margin-top: -8px;

//   :deep(.el-tabs__nav-wrap) {
//     &::after {
//       height: 1px;
//       background-color: var(--border-color);
//     }
//   }

//   :deep(.el-tabs__item) {
//     height: 36px;
//     line-height: 36px;
//   }
// }

// .page-content {
//   flex: 1;
//   padding: 24px;
//   min-height: 280px;
// }

// .page-skeleton {
//   width: 100%;

//   :deep(.el-skeleton__item) {
//     background: linear-gradient(90deg, #f2f2f2 25%, #e6e6e6 37%, #f2f2f2 63%);
//     animation: skeleton-loading 1.4s ease infinite;
//   }
// }

// @keyframes skeleton-loading {
//   0% {
//     background-position: 100% 50%;
//   }
//   100% {
//     background-position: 0 50%;
//   }
// }

// .page-content-inner {
//   min-height: 200px;
// }

// .page-footer {
//   padding: 16px 24px;
//   border-top: 1px solid var(--border-color);
//   background: var(--content-bg-color);
//   border-radius: 0 0 4px 4px;
// }

// .footer-actions {
//   display: flex;
//   justify-content: flex-end;
// }
</style>
