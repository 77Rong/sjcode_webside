import { AppRouteRecord } from '@/types/router'
import { dashboardRoutes } from './dashboard'
import {
  productPortalRoutes,
  helpPortalRoutes,
  contactPortalRoutes,
  heroPortalRoutes
} from './portal'
import { systemRoutes } from './system'
import { helpRoutes } from './help'

/**
 * 导出所有模块化路由
 *
 * 菜单顺序（与设计图一致）：
 *   首页焦点管理 / 首页 / 产品 / 帮助 / 联系 / 系统管理
 *
 * 注：template / widgets / examples / article / result / exception / safeguard
 *     等演示型路由暂不注册，避免污染后台菜单。
 */
export const routeModules: AppRouteRecord[] = [
  heroPortalRoutes,
  dashboardRoutes,
  productPortalRoutes,
  helpPortalRoutes,
  contactPortalRoutes,
  systemRoutes,
  ...helpRoutes
]
