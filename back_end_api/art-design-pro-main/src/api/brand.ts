import request from '@/utils/http'

/** 品牌配置项 */
export interface BrandListItem {
  /** 品牌 ID */
  id: number
  /** 品牌名称 */
  name: string
  /** 品牌 logo（base64 dataURL 或图片地址） */
  logo: string
  /** 版权信息 */
  copyright: string
  /** 备案号 */
  icp: string
  /** 是否启用 */
  enabled: boolean
  /** 创建时间 */
  createTime: string
  /** 更新时间 */
  updateTime: string
}

/** 获取当前启用的品牌（前台站点使用的品牌） */
export function fetchGetActiveBrand() {
  return request.get<BrandListItem | null>({
    url: '/api/brand/active'
  })
}

/** 新增品牌 */
export function fetchCreateBrand(data: Partial<BrandListItem>) {
  return request.post<BrandListItem>({
    url: '/api/brand',
    data
  })
}

/** 更新品牌 */
export function fetchUpdateBrand(id: number, data: Partial<BrandListItem>) {
  return request.put<BrandListItem>({
    url: `/api/brand/${id}`,
    data
  })
}
