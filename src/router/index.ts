import { createRouter, createWebHashHistory, type RouteRecordRaw } from 'vue-router'
import BasicLayout from '@/layouts/BasicLayout.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: BasicLayout,
    children: [
      {
        path: '/dashboard',
        name: 'Dashboard',
        component: () => import('@/views/Dashboard.vue'),
        meta: { title: '仪表板', icon: 'Dashboard' },
      },
      {
        path: '/examples',
        name: 'Examples',
        redirect: '/examples/bar',
        meta: { title: '组件展示', icon: 'Tickets' },
        children: [
          {
            path: '/examples/bar',
            name: 'EchartBar',
            component: () => import('@/views/examples/bar.vue'),
            meta: { title: '柱状图' },
          },
          {
            path: '/examples/editor',
            name: 'Editor',
            component: () => import('@/views/examples/editor.vue'),
            meta: { title: '富文本编辑器' },
          },
        ],
      },
      {
        path: '/exception',
        name: 'Exception',
        redirect: '/exception/403',
        meta: { title: '异常页', icon: 'Warning' },
        children: [
          {
            path: '/exception/403',
            name: 'Exception403',
            component: () => import('@/views/exception/403.vue'),
            meta: { title: '403' },
          },
          {
            path: '/exception/404',
            name: 'Exception404',
            component: () => import('@/views/exception/404.vue'),
            meta: { title: '404' },
          },
          {
            path: '/exception/500',
            name: 'Exception500',
            component: () => import('@/views/exception/500.vue'),
            meta: { title: '500' },
          },
        ],
      },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/exception/404.vue'),
    meta: { title: '404', hideInMenu: true },
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

export default router
