import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import { markRaw } from 'vue'

// 获取图标组件
export function getIconComponent(iconName?: string): any {
  if (!iconName) return undefined

  // 规范化图标名称
  const normalizedName = iconName.toLowerCase().trim()

  // 特殊处理常见的图标名称
  const iconMap: Record<string, string> = {
    dashboard: 'DataBoard',
    document: 'Document',
    tickets: 'Tickets',
    user: 'User',
    circlecheck: 'CircleCheck',
    warning: 'Warning',
    message: 'Message',
    infofilled: 'InfoFilled',
    search: 'Search',
    fullscreen: 'FullScreen',
    aim: 'Aim',
    refresh: 'Refresh',
    sunny: 'Sunny',
    moon: 'Moon',
    grid: 'Grid',
    bell: 'Bell',
    arrowdown: 'ArrowDown',
    setting: 'Setting',
    switchbutton: 'SwitchButton',
    fold: 'Fold',
    expand: 'Expand',
  }

  const mappedName =
    iconMap[normalizedName] || normalizedName.charAt(0).toUpperCase() + normalizedName.slice(1)

  // 在 Element Plus 图标库中查找
  const iconComponent = ElementPlusIconsVue[mappedName as keyof typeof ElementPlusIconsVue]

  if (iconComponent) {
    return markRaw(iconComponent)
  }

  console.warn(`Icon "${iconName}" not found, using default icon`)
  return markRaw(ElementPlusIconsVue.QuestionFilled || ElementPlusIconsVue.Warning)
}

// 常用的图标映射
export const commonIcons = {
  DataBoard: markRaw(ElementPlusIconsVue.DataBoard),
  Document: markRaw(ElementPlusIconsVue.Document),
  Tickets: markRaw(ElementPlusIconsVue.Tickets),
  User: markRaw(ElementPlusIconsVue.User),
  CircleCheck: markRaw(ElementPlusIconsVue.CircleCheck),
  Warning: markRaw(ElementPlusIconsVue.Warning),
  Setting: markRaw(ElementPlusIconsVue.Setting),
  Search: markRaw(ElementPlusIconsVue.Search),
}
