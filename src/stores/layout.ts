import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'

import LogoIcon from '@/assets/logo.png'

// 类型定义
export type ThemeType = 'light' | 'dark' | 'realDark'
export type LayoutType = 'sidemenu' | 'topmenu' | 'mixmenu'
export type ContentWidthType = 'Fluid' | 'Fixed'
export type MenuModeType = 'vertical' | 'horizontal' | 'inline'

export interface LayoutConfig {
  // 基础配置
  // name: string
  logo: string
  title: string
  navTheme: ThemeType
  primaryColor: string
  layout: LayoutType
  contentWidth: ContentWidthType
  fixedHeader: boolean
  fixSiderbar: boolean

  // 功能配置
  menuMode: MenuModeType
  showBreadcrumb: boolean
  showTagsView: boolean
  showFooter: boolean
  showSettings: boolean
  showBreadcrumbIcon: boolean
  splitMenus: boolean

  // 尺寸配置
  collapsed: boolean
  siderWidth: number
  collapsedWidth: number
  headerHeight: number
  // footerHeight: number
  tagsViewHeight: number
}

export const useLayoutStore = defineStore('layout', () => {
  // 默认配置
  const defaultConfig: LayoutConfig = {
    // 基础配置
    // name: 'Admin Pro',
    logo: LogoIcon,
    title: 'Admin Pro',
    navTheme: 'dark',
    primaryColor: '#1890ff',
    layout: 'sidemenu',
    contentWidth: 'Fluid',
    fixedHeader: false,
    fixSiderbar: false,

    // 功能配置
    menuMode: 'vertical',
    showBreadcrumb: true,
    showTagsView: true,
    showFooter: true,
    showSettings: true,
    showBreadcrumbIcon: true,
    splitMenus: false,

    // 尺寸配置
    collapsed: false,
    siderWidth: 208,
    collapsedWidth: 48,
    headerHeight: 56,
    // footerHeight: 40,
    tagsViewHeight: 34,
  }

  // 从 localStorage 读取配置
  const loadConfigFromStorage = (): LayoutConfig => {
    try {
      const stored = localStorage.getItem('layout-config')
      if (stored) {
        const parsed = JSON.parse(stored)
        // 合并默认配置和存储的配置，确保新字段有默认值
        return { ...defaultConfig, ...parsed }
      }
    } catch (error) {
      console.error('Failed to load layout config from localStorage:', error)
    }
    return defaultConfig
  }

  // 保存配置到 localStorage
  const saveConfigToStorage = (config: LayoutConfig) => {
    try {
      localStorage.setItem('layout-config', JSON.stringify(config))
    } catch (error) {
      console.error('Failed to save layout config to localStorage:', error)
    }
  }

  // 创建响应式配置
  const config = ref<LayoutConfig>(loadConfigFromStorage())

  // 监听配置变化并保存到 localStorage
  watch(
    config,
    newConfig => {
      saveConfigToStorage(newConfig)
    },
    { deep: true }
  )

  // 计算属性
  const isDarkTheme = computed(
    () => config.value.navTheme === 'dark' || config.value.navTheme === 'realDark'
  )
  const isLightTheme = computed(() => config.value.navTheme === 'light')
  const isRealDarkTheme = computed(() => config.value.navTheme === 'realDark')

  const isSidemenuLayout = computed(() => config.value.layout === 'sidemenu')
  const isTopmenuLayout = computed(() => config.value.layout === 'topmenu')
  const isMixmenuLayout = computed(() => config.value.layout === 'mixmenu')

  const isFluidContent = computed(() => config.value.contentWidth === 'Fluid')
  const isFixedContent = computed(() => config.value.contentWidth === 'Fixed')

  const isVerticalMenu = computed(() => config.value.menuMode === 'vertical')
  const isHorizontalMenu = computed(() => config.value.menuMode === 'horizontal')
  const isInlineMenu = computed(() => config.value.menuMode === 'inline')

  // CSS 变量
  // const cssVars = computed(() => {
  //   const vars: Record<string, string> = {
  //     // 主题色
  //     '--el-color-primary': config.value.primaryColor,
  //     '--success-color': '#52c41a',
  //     '--warning-color': '#faad14',
  //     '--error-color': '#ff4d4f',
  //     '--info-color': '#1890ff',

  //     // 布局尺寸
  //     '--sider-width': `${config.value.siderWidth}px`,
  //     '--sider-collapsed-width': `${config.value.collapsedWidth}px`,
  //     '--header-height': `${config.value.headerHeight}px`,
  //     // '--footer-height': `${config.value.footerHeight}px`,
  //     '--tags-view-height': `${config.value.showTagsView ? config.value.tagsViewHeight : 0}px`,

  //     // 颜色
  //     '--menu-bg-color': isDarkTheme.value ? '#001529' : '#ffffff',
  //     '--menu-text-color': isDarkTheme.value ? 'rgba(255, 255, 255, 0.65)' : 'rgba(0, 0, 0, 0.88)',
  //     '--menu-active-bg-color': isDarkTheme.value ? 'rgba(24, 144, 255, 0.2)' : '#e6f4ff',
  //     '--header-bg-color': isDarkTheme.value ? '#001529' : '#ffffff',
  //     '--header-text-color': isDarkTheme.value ? '#ffffff' : 'rgba(0, 0, 0, 0.88)',
  //     '--border-color': isRealDarkTheme.value ? '#303030' : '#f0f0f0',
  //   }

  //   // 暗黑主题特殊处理
  //   if (isRealDarkTheme.value) {
  //     vars['--body-bg-color'] = '#000000'
  //     vars['--content-bg-color'] = '#141414'
  //     vars['--card-bg-color'] = '#1f1f1f'
  //   } else if (isDarkTheme.value) {
  //     vars['--body-bg-color'] = '#f0f2f5'
  //     vars['--content-bg-color'] = '#ffffff'
  //     vars['--card-bg-color'] = '#ffffff'
  //   } else {
  //     vars['--body-bg-color'] = '#f0f2f5'
  //     vars['--content-bg-color'] = '#ffffff'
  //     vars['--card-bg-color'] = '#ffffff'
  //   }

  //   return vars
  // })

  // Layout 样式类
  const layoutClasses = computed(() => {
    const classes: string[] = []

    classes.push(`theme-${config.value.navTheme}`)
    classes.push(`layout-${config.value.layout}`)
    classes.push(`content-${config.value.contentWidth.toLowerCase()}`)

    if (config.value.fixedHeader) classes.push('fixed-header')
    if (config.value.fixSiderbar) classes.push('fixed-siderbar')
    if (config.value.collapsed) classes.push('sider-collapsed')

    return classes.join(' ')
  })

  // 方法
  const updateConfig = (newConfig: Partial<LayoutConfig>) => {
    config.value = { ...config.value, ...newConfig }
    // applySpecialEffects()
  }

  const resetConfig = () => {
    config.value = defaultConfig
    // applySpecialEffects()
  }

  const toggleCollapsed = () => {
    config.value.collapsed = !config.value.collapsed
  }

  const toggleTheme = () => {
    const themes: ThemeType[] = ['light', 'dark', 'realDark']
    const currentIndex = themes.indexOf(config.value.navTheme)
    const nextIndex = (currentIndex + 1) % themes.length
    config.value.navTheme = themes[nextIndex] as ThemeType
  }

  const toggleLayout = () => {
    const layouts: LayoutType[] = ['sidemenu', 'topmenu', 'mixmenu']
    const currentIndex = layouts.indexOf(config.value.layout)
    const nextIndex = (currentIndex + 1) % layouts.length
    config.value.layout = layouts[nextIndex] as LayoutType

    // 根据布局自动调整其他配置
    if (layouts[nextIndex] === 'topmenu') {
      config.value.menuMode = 'horizontal'
      config.value.splitMenus = false
    } else {
      config.value.menuMode = 'vertical'
    }
  }

  const toggleFixedHeader = () => {
    config.value.fixedHeader = !config.value.fixedHeader
  }

  const toggleFixSiderbar = () => {
    config.value.fixSiderbar = !config.value.fixSiderbar
  }

  const toggleContentWidth = () => {
    config.value.contentWidth = config.value.contentWidth === 'Fluid' ? 'Fixed' : 'Fluid'
  }

  return {
    // 状态
    config,

    // 计算属性
    isDarkTheme,
    isLightTheme,
    isRealDarkTheme,
    isSidemenuLayout,
    isTopmenuLayout,
    isMixmenuLayout,
    isFluidContent,
    isFixedContent,
    isVerticalMenu,
    isHorizontalMenu,
    isInlineMenu,
    // cssVars,
    layoutClasses,

    // 方法
    updateConfig,
    resetConfig,
    toggleCollapsed,
    toggleTheme,
    toggleLayout,
    toggleFixedHeader,
    toggleFixSiderbar,
    toggleContentWidth,
  }
})
