import request from '@/utils/http'

/** 前台「联系我们」留言记录 */
export interface ContactItem {
  /** ID */
  id: number
  /** 姓名 */
  name: string
  /** 邮箱 */
  email: string
  /** 电话（列表脱敏展示） */
  phone: string
  /** 电话原始值（详情展示） */
  rawPhone: string
  /** 留言内容 */
  message: string
  /** 处理状态：pending 未处理 / processed 已处理 */
  status: 'pending' | 'processed'
  /** 处理备注 */
  reply: string
  /** 提交时间 */
  createdAt: string
}

/** 留言列表响应（服务端分页） */
export interface ContactList {
  records: ContactItem[]
  current: number
  size: number
  total: number
}

/** 留言列表查询参数 */
export interface ContactSearchParams {
  current: number
  size: number
  keyword?: string
  status?: string
}

/** 获取留言列表（分页 + 关键词 + 处理状态过滤） */
export function fetchGetContactList(params: ContactSearchParams) {
  return request.get<ContactList>({
    url: '/api/contact/list',
    params
  })
}

/** 更新留言（处理状态 / 备注） */
export function fetchUpdateContact(id: number, data: Partial<ContactItem>) {
  return request.put<ContactItem>({
    url: `/api/contact/${id}`,
    data
  })
}

/** 删除留言 */
export function fetchDeleteContact(id: number) {
  return request.del({
    url: `/api/contact/${id}`
  })
}
