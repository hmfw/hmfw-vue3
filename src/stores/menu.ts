import { ref } from 'vue'
import { defineStore } from 'pinia'
import { useRouter, type RouteRecordRaw } from 'vue-router'

// 菜单数据
export interface MenuItem {
  key: string
  path: string
  title: string
  icon?: string
  children?: MenuItem[]
  hideInMenu?: boolean
  hideChildrenInMenu?: boolean
}

// 路由转换为菜单
const RoutesToMenu = (routes: RouteRecordRaw[]): MenuItem[] => {
  return routes.map(route => {
    const { title, icon } = route.meta || {}
    const menuItem: MenuItem = {
      key: route.name as string,
      path: route.path,
      title: typeof title === 'string' ? title : '',
      icon: typeof icon === 'string' ? icon : undefined,
      children: route.children ? RoutesToMenu(route.children) : [],
    }
    return menuItem
  })
}

export const useMenuStore = defineStore('menu', () => {
  const router = useRouter()
  const menus = router.options.routes.find(r => r.path === '/')?.children || []
  // console.log('Current Route:', router.options.routes)
  const menuData = ref<MenuItem[]>(RoutesToMenu(menus))

  return {
    menuData,
  }
})
