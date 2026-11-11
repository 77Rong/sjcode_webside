import { AppRouteRecord } from '@/types/router'

/**
 * 「首页」一级菜单
 * 点击直接进入 console（访问数据 dashboard）
 */
export const dashboardRoutes: AppRouteRecord = {
  name: 'Dashboard',
  path: '/dashboard/console',
  component: '/dashboard/console',
  meta: {
    title: 'menus.dashboard.console',
    icon: 'ri:home-line',
    roles: ['R_SUPER', 'R_ADMIN'],
    keepAlive: false,
    fixedTab: true
  }
}
