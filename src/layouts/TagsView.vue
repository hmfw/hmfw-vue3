<template>
  <div class="tags-view-container">
    <!-- 滚动容器 -->
    <div ref="scrollContainer" class="tags-view-wrapper" @wheel.prevent="handleScroll">
      <!-- 标签列表 -->
      <div
        ref="tagsViewContent"
        class="tags-view-content"
        :style="{ transform: `translateX(${translateX}px)` }"
      >
        <!-- 标签项 -->
        <router-link
          v-for="tag in visitedViews"
          ref="tag"
          :key="tag.path"
          :class="['tags-view-item', isActive(tag) ? 'active' : '', tag.meta?.affix ? 'affix' : '']"
          :to="{ path: tag.path, query: tag.query }"
          @contextmenu.prevent="openMenu(tag, $event)"
        >
          <span class="tag-title">{{ tag.meta?.title || tag.name }}</span>
          <el-icon
            v-if="!tag.meta?.affix"
            class="tag-close"
            @click.prevent.stop="closeSelectedTag(tag)"
          >
            <Close />
          </el-icon>
        </router-link>
      </div>
    </div>

    <!-- 右侧操作按钮 -->
    <div class="tags-view-actions">
      <el-dropdown trigger="click" @command="handleTagAction">
        <el-icon class="action-icon">
          <ArrowDown />
        </el-icon>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="refresh">
              <el-icon><Refresh /></el-icon>
              刷新当前页
            </el-dropdown-item>
            <el-dropdown-item command="closeCurrent">
              <el-icon><Close /></el-icon>
              关闭当前页
            </el-dropdown-item>
            <el-dropdown-item command="closeOther">
              <el-icon><CircleClose /></el-icon>
              关闭其他页
            </el-dropdown-item>
            <el-dropdown-item command="closeAll">
              <el-icon><FolderDelete /></el-icon>
              关闭所有页
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>

    <!-- 右键菜单 -->
    <ul v-show="visible" :style="{ left: left + 'px', top: top + 'px' }" class="contextmenu">
      <li @click="refreshSelectedTag(selectedTag)">
        <el-icon><Refresh /></el-icon>
        刷新
      </li>
      <li
        v-if="!(selectedTag && selectedTag.meta && selectedTag.meta.affix)"
        @click="closeSelectedTag(selectedTag)"
      >
        <el-icon><Close /></el-icon>
        关闭
      </li>
      <li @click="closeOthersTags">
        <el-icon><CircleClose /></el-icon>
        关闭其他
      </li>
      <li @click="closeAllTags(selectedTag)">
        <el-icon><FolderDelete /></el-icon>
        关闭所有
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
// import { useLayoutStore } from '@/stores/layout'
import { Close, ArrowDown, Refresh, CircleClose, FolderDelete } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
// const layout = useLayoutStore()

// 状态
const visible = ref(false)
const selectedTag = ref<any>(null)
const left = ref(0)
const top = ref(0)
const translateX = ref(0)
const scrollContainer = ref<HTMLElement | null>(null)
const tagsViewContent = ref<HTMLElement | null>(null)
const tag = ref<HTMLElement[]>([])

// 已访问的视图
const visitedViews = ref<any[]>([])
const cachedViews = ref<Set<string>>(new Set())

// 计算属性
// const affixTags = computed(() => {
//   return visitedViews.value.filter(tag => tag.meta?.affix)
// })

// 监听与生命周期顺序调整：放置在相关方法声明之后

// 初始化标签
const initTags = () => {
  const savedTags = localStorage.getItem('tags-view')
  if (savedTags) {
    visitedViews.value = JSON.parse(savedTags)
  }
}

// 添加固定标签
const addAffixTags = () => {
  const affixRoutes = router.getRoutes().filter(route => route.meta?.affix)
  for (const route of affixRoutes) {
    if (route.name) {
      visitedViews.value.push({
        fullPath: route.path,
        path: route.path,
        name: route.name,
        meta: { ...route.meta, affix: true },
      })
    }
  }
}

// 添加标签
const addTags = () => {
  const { name } = route
  if (!name) return

  // 检查标签是否已存在
  const existingTag = visitedViews.value.find(tag => tag.name === name)
  if (existingTag) {
    existingTag.query = route.query
    existingTag.fullPath = route.fullPath
    return
  }

  // 添加新标签
  visitedViews.value.push({
    name: route.name,
    path: route.path,
    fullPath: route.fullPath,
    query: route.query,
    meta: { ...route.meta },
  })

  // 更新缓存
  if (route.meta?.noCache !== true && name) {
    cachedViews.value.add(name as string)
  }

  // 保存到本地存储
  localStorage.setItem('tags-view', JSON.stringify(visitedViews.value))
}

// 是否激活
const isActive = (tag: any) => {
  return tag.path === route.path
}

// 移动到当前标签
const moveToCurrentTag = async () => {
  await nextTick()
  for (const item of tag.value) {
    if ((item as any).to.path === route.path) {
      scrollToTag(item)
      break
    }
  }
}

// 滚动到标签
const scrollToTag = (target: HTMLElement) => {
  if (!scrollContainer.value || !tagsViewContent.value) return

  const containerWidth = scrollContainer.value.offsetWidth
  const contentWidth = tagsViewContent.value.scrollWidth
  const targetLeft = target.offsetLeft
  const targetWidth = target.offsetWidth

  // 如果标签在可视区域外，滚动到合适位置
  if (targetLeft < -translateX.value) {
    translateX.value = -targetLeft + 5
  } else if (targetLeft + targetWidth > -translateX.value + containerWidth) {
    translateX.value = -(targetLeft + targetWidth - containerWidth + 5)
  }

  // 确保不滚动过头
  const maxTranslateX = Math.min(0, containerWidth - contentWidth)
  translateX.value = Math.max(translateX.value, maxTranslateX)
  translateX.value = Math.min(translateX.value, 0)
}

// 处理鼠标滚动
const handleScroll = (e: WheelEvent) => {
  if (!scrollContainer.value || !tagsViewContent.value) return

  const containerWidth = scrollContainer.value.offsetWidth
  const contentWidth = tagsViewContent.value.scrollWidth
  const delta = e.deltaY || e.deltaX

  let newTranslateX = translateX.value + delta

  const maxTranslateX = Math.min(0, containerWidth - contentWidth)
  newTranslateX = Math.max(newTranslateX, maxTranslateX)
  newTranslateX = Math.min(newTranslateX, 0)

  translateX.value = newTranslateX
}

// 打开右键菜单
const openMenu = (tag: any, e: MouseEvent) => {
  const menuMinWidth = 105
  const offsetLeft = scrollContainer.value?.getBoundingClientRect().left || 0

  left.value = e.clientX - offsetLeft + 15
  top.value = e.clientY - 55

  visible.value = true
  selectedTag.value = tag

  const containerWidth = scrollContainer.value?.offsetWidth || 0
  const maxLeft = containerWidth - menuMinWidth
  if (left.value > maxLeft) {
    left.value = maxLeft
  }
}

// 关闭右键菜单
const closeMenu = () => {
  visible.value = false
}

// 刷新标签
const refreshSelectedTag = (view?: any) => {
  if (!view) return

  cachedViews.value.delete(view.name)

  const { fullPath } = view
  nextTick(() => {
    router.replace({ path: '/redirect' + fullPath })
  })

  closeMenu()
}

// 关闭标签
const closeSelectedTag = (view?: any) => {
  if (!view) return

  if (view.meta?.affix) return

  const index = visitedViews.value.findIndex(v => v.path === view.path)
  if (index === -1) return

  visitedViews.value.splice(index, 1)

  if (view.name) {
    cachedViews.value.delete(view.name)
  }

  if (isActive(view)) {
    const latestView = visitedViews.value.slice(-1)[0]
    if (latestView) {
      router.push(latestView)
    } else {
      router.push('/')
    }
  }

  localStorage.setItem('tags-view', JSON.stringify(visitedViews.value))
  closeMenu()
}

// 关闭其他标签
const closeOthersTags = () => {
  if (!selectedTag.value) return

  visitedViews.value = visitedViews.value.filter(
    tag => tag.meta?.affix || tag.path === selectedTag.value.path
  )

  const newCachedViews = new Set<string>()
  for (const tag of visitedViews.value) {
    if (tag.name && tag.meta?.noCache !== true) {
      newCachedViews.add(tag.name)
    }
  }
  cachedViews.value = newCachedViews

  if (!isActive(selectedTag.value)) {
    router.push(selectedTag.value)
  }

  localStorage.setItem('tags-view', JSON.stringify(visitedViews.value))
  closeMenu()
}

// 关闭所有标签
const closeAllTags = (view?: any) => {
  console.log('closeAllTags called', view)
  visitedViews.value = visitedViews.value.filter(tag => tag.meta?.affix)

  const newCachedViews = new Set<string>()
  for (const tag of visitedViews.value) {
    if (tag.name && tag.meta?.noCache !== true) {
      newCachedViews.add(tag.name)
    }
  }
  cachedViews.value = newCachedViews

  const firstAffixTag = visitedViews.value[0]
  if (firstAffixTag) {
    router.push(firstAffixTag)
  } else {
    router.push('/')
  }

  localStorage.setItem('tags-view', JSON.stringify(visitedViews.value))
  closeMenu()
}

// 处理标签操作
const handleTagAction = (command: string) => {
  switch (command) {
    case 'refresh':
      refreshSelectedTag(route)
      break
    case 'closeCurrent':
      closeSelectedTag({
        path: route.path,
        name: route.name,
        meta: route.meta,
      })
      break
    case 'closeOther':
      closeOthersTags()
      break
    case 'closeAll':
      closeAllTags()
      break
  }
}

// 监听路由变化（需在 addTags/moveToCurrentTag 声明之后）
watch(
  () => route.path,
  () => {
    addTags()
    moveToCurrentTag()
  },
  { immediate: true }
)

// 生命周期（引用的方法已在上方声明）
onMounted(() => {
  initTags()
  addAffixTags()
  document.addEventListener('click', closeMenu)
})

onUnmounted(() => {
  document.removeEventListener('click', closeMenu)
})

// 暴露方法给父组件
defineExpose({
  visitedViews,
  cachedViews,
  refreshSelectedTag,
  closeSelectedTag,
  closeOthersTags,
  closeAllTags,
})
</script>

<style scoped lang="scss">
// .tags-view-container {
//   display: flex;
//   align-items: center;
//   height: var(--tags-view-height);
//   background: var(--content-bg-color);
//   border-bottom: 1px solid var(--border-color);
//   box-shadow:
//     0 1px 3px 0 rgba(0, 0, 0, 0.12),
//     0 0 3px 0 rgba(0, 0, 0, 0.04);
//   position: relative;

//   .tags-view-wrapper {
//     flex: 1;
//     overflow: hidden;
//     position: relative;
//     height: 100%;

//     .tags-view-content {
//       display: flex;
//       align-items: center;
//       height: 100%;
//       padding: 0 5px;
//       white-space: nowrap;
//       transition: transform 0.3s ease;

//       .tags-view-item {
//         display: flex;
//         align-items: center;
//         height: 26px;
//         line-height: 26px;
//         border: 1px solid var(--border-color);
//         color: #495060;
//         background: var(--content-bg-color);
//         padding: 0 8px;
//         font-size: 12px;
//         margin-left: 5px;
//         margin-top: 4px;
//         border-radius: 3px;
//         text-decoration: none;
//         transition: all 0.3s;
//         position: relative;

//         &:first-of-type {
//           margin-left: 15px;
//         }

//         &:last-of-type {
//           margin-right: 15px;
//         }

//         &:hover {
//           color: var(--el-color-primary);
//           border-color: color-mix(in srgb, var(--el-color-primary) 30%, transparent);
//           background-color: color-mix(in srgb, var(--el-color-primary) 5%, transparent);

//           .tag-close {
//             opacity: 1;
//           }
//         }

//         &.active {
//           color: #fff;
//           background-color: var(--el-color-primary);
//           border-color: var(--el-color-primary);

//           &::before {
//             content: '';
//             background: #fff;
//             display: inline-block;
//             width: 8px;
//             height: 8px;
//             border-radius: 50%;
//             position: relative;
//             margin-right: 2px;
//           }

//           .tag-close {
//             color: #fff;

//             &:hover {
//               background-color: rgba(255, 255, 255, 0.2);
//             }
//           }
//         }

//         &.affix {
//           padding-right: 20px;
//         }

//         .tag-title {
//           overflow: hidden;
//           text-overflow: ellipsis;
//           white-space: nowrap;
//           max-width: 120px;
//         }

//         .tag-close {
//           width: 16px;
//           height: 16px;
//           border-radius: 50%;
//           text-align: center;
//           line-height: 16px;
//           transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
//           transform-origin: 100% 50%;
//           opacity: 0;
//           margin-left: 4px;
//           font-size: 12px;
//           cursor: pointer;

//           &:hover {
//             background-color: #b4bccc;
//             color: #fff;
//           }
//         }
//       }
//     }
//   }

//   .tags-view-actions {
//     display: flex;
//     align-items: center;
//     padding: 0 8px;
//     height: 100%;
//     background: var(--content-bg-color);
//     border-left: 1px solid var(--border-color);

//     .action-icon {
//       font-size: 16px;
//       color: #495060;
//       cursor: pointer;
//       padding: 4px;
//       border-radius: 3px;

//       &:hover {
//         background-color: #f5f7fa;
//         color: var(--el-color-primary);
//       }
//     }
//   }

//   .contextmenu {
//     margin: 0;
//     background: #fff;
//     z-index: 3000;
//     position: absolute;
//     list-style-type: none;
//     padding: 5px 0;
//     border-radius: 4px;
//     font-size: 12px;
//     font-weight: 400;
//     color: #333;
//     box-shadow: 2px 2px 3px 0 rgba(0, 0, 0, 0.3);

//     li {
//       margin: 0;
//       padding: 7px 16px;
//       cursor: pointer;
//       display: flex;
//       align-items: center;

//       &:hover {
//         background: #eee;
//       }

//       .el-icon {
//         margin-right: 5px;
//         font-size: 14px;
//       }
//     }
//   }
// }

// // 滚动条样式
// .tags-view-wrapper::-webkit-scrollbar {
//   display: none;
// }
</style>
