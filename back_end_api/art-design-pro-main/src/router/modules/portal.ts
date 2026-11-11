import { AppRouteRecord } from '@/types/router'

/**
 * 产品（portal/products）
 *
 * 路由结构：
 * - /portal/products 父路由携带 Layout（/index/index）
 * - 唯一可见子项 path='' 渲染列表页（isHide: true 隐藏在侧边栏）
 * - 子项 edit/:id? 渲染富文本编辑页（isHide: true 隐藏在侧边栏）
 *
 * 菜单行为：
 * - 侧边栏只显示「产品」一个菜单项（无二级列表）
 * - 点击「产品」 → 直接进入 /portal/products 渲染列表
 * - 「正本编辑」 → 跳到 /portal/products/edit/:id 富文本编辑页
 */
export const productPortalRoutes: AppRouteRecord = {
  path: '/portal/products',
  name: 'PortalProducts',
  component: '/index/index',
  meta: {
    title: 'menus.portal.products',
    icon: 'ri:apps-2-line',
    roles: ['R_SUPER', 'R_ADMIN', 'R_USER'],
    keepAlive: true
  },
  children: [
    {
      // /portal/products 列表页
      path: '',
      name: 'PortalProductList',
      component: '/portal/product',
      meta: {
        title: 'menus.portal.products',
        icon: 'ri:apps-2-line',
        roles: ['R_SUPER', 'R_ADMIN', 'R_USER'],
        // 隐藏在侧边栏，只显示父级「产品」
        isHide: true,
        keepAlive: true
      }
    },
    {
      // /portal/products/edit/:id? 富文本编辑页
      path: 'edit/:id?',
      name: 'PortalProductEdit',
      component: '/portal/product/edit',
      meta: {
        title: '产品正文编辑',
        roles: ['R_SUPER', 'R_ADMIN', 'R_USER'],
        isHide: true,
        // 高亮父级「产品」菜单
        activePath: '/portal/products',
        keepAlive: false
      }
    }
  ]
}

/**
 * 帮助（portal/help）
 *
 * - /portal/help         文档列表页（isHide，只显示父级「帮助」菜单）
 * - /portal/help/edit/:id? 正本编辑页（isHide，ArtWangEditor 富文本）
 */
export const helpPortalRoutes: AppRouteRecord = {
  path: '/portal/help',
  name: 'PortalHelp',
  component: '/index/index',
  meta: {
    title: 'menus.portal.help',
    icon: 'ri:question-line',
    roles: ['R_SUPER', 'R_ADMIN', 'R_USER'],
    keepAlive: true
  },
  children: [
    {
      path: '',
      name: 'PortalHelpList',
      component: '/portal/help',
      meta: {
        title: 'menus.portal.help',
        icon: 'ri:question-line',
        roles: ['R_SUPER', 'R_ADMIN', 'R_USER'],
        isHide: true,
        keepAlive: true
      }
    },
    {
      // /portal/help/edit/:id? 帮助正本编辑页（富文本编辑器）
      path: 'edit/:id?',
      name: 'PortalHelpEdit',
      component: '/portal/help/edit',
      meta: {
        title: '帮助正本编辑',
        roles: ['R_SUPER', 'R_ADMIN', 'R_USER'],
        isHide: true,
        // 高亮父级「帮助」菜单
        activePath: '/portal/help',
        keepAlive: false
      }
    }
  ]
}

/**
 * 联系（portal/contact）—— 单页管理页
 */
export const contactPortalRoutes: AppRouteRecord = {
  path: '/portal/contact',
  name: 'PortalContact',
  component: '/index/index',
  meta: {
    title: 'menus.portal.contact',
    icon: 'ri:mail-line',
    roles: ['R_SUPER', 'R_ADMIN', 'R_USER'],
    keepAlive: true
  },
  children: [
    {
      path: '',
      name: 'PortalContactList',
      component: '/portal/contact',
      meta: {
        title: 'menus.portal.contact',
        icon: 'ri:mail-line',
        roles: ['R_SUPER', 'R_ADMIN', 'R_USER'],
        isHide: true,
        keepAlive: true
      }
    }
  ]
}

/**
 * 首页焦点管理（portal/hero）
 * 首页 Hero 轮播的 CRUD 管理页
 */
export const heroPortalRoutes: AppRouteRecord = {
  path: '/portal/hero',
  name: 'PortalHero',
  component: '/index/index',
  meta: {
    title: 'menus.portal.hero',
    icon: 'ri:image-2-line',
    roles: ['R_SUPER', 'R_ADMIN', 'R_USER'],
    keepAlive: true
  },
  children: [
    {
      path: '',
      name: 'PortalHeroList',
      component: '/portal/hero',
      meta: {
        title: 'menus.portal.hero',
        icon: 'ri:image-2-line',
        roles: ['R_SUPER', 'R_ADMIN', 'R_USER'],
        isHide: true,
        keepAlive: true
      }
    }
  ]
}