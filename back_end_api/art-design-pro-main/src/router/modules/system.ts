import { AppRouteRecord } from '@/types/router'

/**
 * 「系统管理」菜单
 * 仅暴露「用户管理」和「品牌管理」两项
 */
export const systemRoutes: AppRouteRecord = {
  path: '/system',
  name: 'System',
  component: '/index/index',
  meta: {
    title: 'menus.system.title',
    icon: 'ri:settings-3-line',
    roles: ['R_SUPER', 'R_ADMIN']
  },
  children: [
    {
      path: 'user',
      name: 'User',
      component: '/system/user',
      meta: {
        title: 'menus.system.user',
        icon: 'ri:user-line',
        keepAlive: true,
        roles: ['R_SUPER', 'R_ADMIN']
      }
    },
    {
      path: 'brand',
      name: 'Brand',
      component: '/system/brand',
      meta: {
        title: 'menus.system.brand',
        icon: 'ri:price-tag-3-line',
        keepAlive: true,
        roles: ['R_SUPER', 'R_ADMIN']
      }
    }
  ]
}
