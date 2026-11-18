import request from '@/utils/http'

/** 产品管理（products 表）每条记录 */
export interface ProductItem {
  /** ID（Supabase 自增主键） */
  id: number
  /** 产品名称 */
  name: string
  /** 二级标题 / 营销标语 */
  subTitle: string
  /** 产品分类（教育/建站/管理/其它） */
  category: string
  /** 一句话简介 */
  summary: string
  /** 产品正本（WangEditor 富文本 HTML） */
  content: string
  /** 是否启用 */
  enabled: boolean
  /** 排序值（小的在前） */
  sortOrder: number
  /** 创建时间 */
  createTime: string
  /** 更新时间 */
  updateTime: string
}

/** 获取产品列表（后台管理，支持关键词 + 分类 + 启用状态过滤） */
export function fetchGetProductList(params?: {
  keyword?: string
  category?: string
  enabled?: string
}) {
  return request.get<ProductItem[]>({
    url: '/api/product/list',
    params
  })
}

/** 获取启用中的产品（前台数据源） */
export function fetchGetActiveProductList() {
  return request.get<ProductItem[]>({
    url: '/api/product/active'
  })
}

/** 获取产品详情（正本编辑页使用） */
export function fetchGetProduct(id: number) {
  return request.get<ProductItem>({
    url: `/api/product/${id}`
  })
}

/** 新增产品 */
export function fetchCreateProduct(data: Partial<ProductItem>) {
  return request.post<ProductItem>({
    url: '/api/product',
    data
  })
}

/** 更新产品（局部字段） */
export function fetchUpdateProduct(id: number, data: Partial<ProductItem>) {
  return request.put<ProductItem>({
    url: `/api/product/${id}`,
    data
  })
}

/** 删除产品 */
export function fetchDeleteProduct(id: number) {
  return request.del<ProductItem>({
    url: `/api/product/${id}`
  })
}
