import request from '@/utils/http'

/** 首页焦点图（HeroCarousel）每条记录 */
export interface HeroItem {
  /** ID（Supabase 自增主键） */
  id: number
  /** 主标题（轮播大字） */
  title: string
  /** 副标题 / 营销描述 */
  subtitle: string
  /** 顶部小标签（badge） */
  badge: string
  /** 背景图 URL（Supabase Storage 外链或本地路径） */
  imageUrl: string
  /** 图片替代文本 */
  imageAlt: string
  /** 点击跳转链接（空 → 不跳转） */
  linkUrl: string
  /** 是否启用（仅启用的会显示在前台轮播） */
  enabled: boolean
  /** 排序值（小的在前） */
  sortOrder: number
  /** 创建时间 */
  createTime: string
  /** 更新时间 */
  updateTime: string
}

/** 获取焦点图列表（后台管理，支持关键词 + 启用状态过滤） */
export function fetchGetHeroList(params?: { keyword?: string; enabled?: string }) {
  return request.get<HeroItem[]>({
    url: '/api/hero/list',
    params
  })
}

/** 获取启用中的焦点图（前台轮播数据源） */
export function fetchGetActiveHeroList() {
  return request.get<HeroItem[]>({
    url: '/api/hero/active'
  })
}

/** 新增焦点图 */
export function fetchCreateHero(data: Partial<HeroItem>) {
  return request.post<HeroItem>({
    url: '/api/hero',
    data
  })
}

/** 更新焦点图（局部字段） */
export function fetchUpdateHero(id: number, data: Partial<HeroItem>) {
  return request.put<HeroItem>({
    url: `/api/hero/${id}`,
    data
  })
}

/** 删除焦点图 */
export function fetchDeleteHero(id: number) {
  return request.del<HeroItem>({
    url: `/api/hero/${id}`
  })
}

/**
 * 上传/替换焦点图图片（multipart/form-data）
 * @param id 焦点图 ID
 * @param file 本地图片文件
 */
export function fetchUploadHeroImage(id: number, file: File) {
  const formData = new FormData()
  formData.append('file', file)
  return request.post<HeroItem>({
    url: `/api/hero/${id}/image`,
    data: formData
  })
}
